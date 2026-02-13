import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const ensureMediaRecordMock = vi.fn();
const normalizeMediaUrlMock = vi.fn((value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = `/${trimmed.replace(/^\/+/, "")}`.replace(/\/+/g, "/");
  if (normalized === "/images") return "/api/assets";
  if (normalized.startsWith("/images/")) {
    return `/api/assets/${normalized.slice("/images/".length)}`;
  }
  if (normalized === "/api/assets" || normalized.startsWith("/api/assets/")) {
    return normalized;
  }
  return trimmed;
});

const basePerson = () => ({
  id: "p-1",
  fullName: "Max Dupont",
  firstName: "Max",
  lastName: "Dupont",
  pseudo: "max",
  role: "Developer",
  bio: null,
  email: "max@example.com",
  avatarMedia: { url: "/api/assets/max.jpg" },
  siteOwner: false,
  profileData: null,
  _count: {
    articles: 2,
    projects: 3,
  },
});

describe("persons admin service", () => {
  beforeEach(() => {
    vi.resetModules();
    ensureMediaRecordMock.mockReset().mockResolvedValue(null);
    normalizeMediaUrlMock.mockClear();
    vi.doMock("@/lib/utils/content-normalizers", () => ({
      ensureMediaRecord: ensureMediaRecordMock,
      normalizeMediaUrl: normalizeMediaUrlMock,
    }));
  });

  it("listPersonsAdmin mappe les champs attendus", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn().mockResolvedValue([basePerson()]),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { listPersonsAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    const rows = await listPersonsAdmin();

    expect(repo.listPersonsForAdmin).toHaveBeenCalledOnce();
    expect(rows[0]).toMatchObject({
      id: "p-1",
      fullName: "Max Dupont",
      avatar: "/api/assets/max.jpg",
      _count: { articles: 2, projects: 3 },
    });
  });

  it("listPersonsAdmin applique les fallback null/false sur les champs optionnels", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn().mockResolvedValue([
        {
          ...basePerson(),
          firstName: null,
          lastName: null,
          pseudo: null,
          role: null,
          bio: null,
          email: null,
          avatarMedia: null,
          profileData: null,
          siteOwner: undefined,
        },
      ]),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { listPersonsAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    const rows = await listPersonsAdmin();

    expect(rows[0]).toMatchObject({
      firstName: null,
      lastName: null,
      pseudo: null,
      role: null,
      bio: null,
      email: null,
      avatar: null,
      profileData: null,
      siteOwner: false,
    });
  });

  it("getPersonForAdmin renvoie 404 si absent", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(null),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { getPersonForAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await expect(getPersonForAdmin("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("getPersonForAdmin retourne la personne mappee", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue({
        ...basePerson(),
        avatarMedia: { url: "/api/assets/avatars/max.webp" },
        firstName: null,
        lastName: null,
      }),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { getPersonForAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    const person = await getPersonForAdmin("p-1");

    expect(person).toMatchObject({
      id: "p-1",
      avatar: "/api/assets/avatars/max.webp",
      firstName: null,
      lastName: null,
    });
  });

  it("createPersonAdmin valide fullName", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { createPersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await expect(
      createPersonAdmin({ firstName: "   ", lastName: " " } as any),
    ).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("createPersonAdmin nettoie les champs et profileData.contacts", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn().mockResolvedValue({ id: "p-1" }),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { createPersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    ensureMediaRecordMock.mockResolvedValueOnce({ id: "m-1" });
    await createPersonAdmin({
      firstName: "  Max  ",
      lastName: " Dupont ",
      pseudo: "   ",
      role: " Dev ",
      bio: null,
      email: "  max@example.com  ",
      avatar: " /images/max.jpg ",
      profileData: {
        contacts: {
          twitter: "https://x.com/max",
          linkedin: "linkedin.com/max", // invalid protocol => ""
          Unknown: "https://example.com/ignored",
          email: "mailto:max@example.com",
        },
      },
    } as any);

    expect(repo.createPersonForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Max Dupont",
        firstName: "Max",
        lastName: "Dupont",
        pseudo: null,
        role: "Dev",
        email: "max@example.com",
        avatarMedia: { connect: { id: "m-1" } },
      }),
    );
    expect(ensureMediaRecordMock).toHaveBeenCalledWith(expect.anything(), "/api/assets/max.jpg");

    const payload = (repo.createPersonForAdmin as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.profileData?.contacts?.x).toBe("https://x.com/max");
    expect(payload.profileData?.contacts?.linkedin).toBe("");
    expect(payload.profileData?.contacts?.email).toBe("mailto:max@example.com");
  });

  it("createPersonAdmin ignore profileData non-object", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn().mockResolvedValue({ id: "p-2" }),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { createPersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await createPersonAdmin({
      firstName: "Jane",
      lastName: "Doe",
      profileData: [] as any,
    } as any);

    expect(repo.createPersonForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ profileData: undefined }),
    );
  });

  it("createPersonAdmin retourne profileData undefined quand profileData est vide", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn().mockResolvedValue({ id: "p-3" }),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { createPersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await createPersonAdmin({
      firstName: "John",
      lastName: "Smith",
      profileData: {},
    } as any);

    expect(repo.createPersonForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ profileData: undefined }),
    );
  });

  it("createPersonAdmin passe profileData undefined quand non fourni", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn(),
      createPersonForAdmin: vi.fn().mockResolvedValue({ id: "p-4" }),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { createPersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await createPersonAdmin({
      firstName: "Alice",
      lastName: "Wonder",
    } as any);

    expect(repo.createPersonForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ profileData: undefined }),
    );
  });

  it("updatePersonAdmin met a jour la personne", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(basePerson()),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn().mockResolvedValue(basePerson()),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { updatePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await updatePersonAdmin("p-1", { role: "Lead Dev" });

    expect(repo.updatePersonForAdmin).toHaveBeenCalledWith(
      "p-1",
      expect.objectContaining({
        role: "Lead Dev",
        fullName: "Max Dupont",
      }),
    );
  });

  it("updatePersonAdmin mappe tous les champs optionnels quand fournis", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(basePerson()),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn().mockResolvedValue(basePerson()),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { updatePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    ensureMediaRecordMock.mockResolvedValueOnce({ id: "m-2" });
    await updatePersonAdmin("p-1", {
      firstName: "  Maxime ",
      lastName: " Dupont ",
      pseudo: " max ",
      role: " Lead ",
      bio: " bio ",
      email: " test@example.com ",
      avatar: " /images/new.jpg ",
      profileData: {
        contacts: {
          github: "https://github.com/max",
        },
      },
    } as any);

    expect(repo.updatePersonForAdmin).toHaveBeenCalledWith(
      "p-1",
      expect.objectContaining({
        fullName: "Maxime Dupont",
        firstName: "Maxime",
        lastName: "Dupont",
        pseudo: "max",
        role: "Lead",
        bio: "bio",
        email: "test@example.com",
        avatarMedia: { connect: { id: "m-2" } },
      }),
    );
    expect(ensureMediaRecordMock).toHaveBeenCalledWith(expect.anything(), "/api/assets/new.jpg");
  });

  it("updatePersonAdmin disconnect avatarMedia quand l'url avatar est fournie mais qu'aucun media n'est trouve", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(basePerson()),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn().mockResolvedValue(basePerson()),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { updatePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );

    ensureMediaRecordMock.mockResolvedValueOnce(null);
    await updatePersonAdmin("p-1", { avatar: "   " } as any);

    expect(repo.updatePersonForAdmin).toHaveBeenCalledWith(
      "p-1",
      expect.objectContaining({
        avatarMedia: { disconnect: true },
      }),
    );
  });

  it("updatePersonAdmin renvoie 404 si personne absente", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(null),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { updatePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await expect(updatePersonAdmin("missing", { role: "X" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deletePersonAdmin refuse la suppression du site owner", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue({
        ...basePerson(),
        siteOwner: true,
      }),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { deletePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await expect(deletePersonAdmin("p-1")).rejects.toMatchObject({ statusCode: 422 });
    expect(repo.deletePersonForAdmin).not.toHaveBeenCalled();
  });

  it("deletePersonAdmin renvoie 404 si absent", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(null),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn(),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { deletePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await expect(deletePersonAdmin("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("deletePersonAdmin supprime une personne standard", async () => {
    const repo = {
      listPersonsForAdmin: vi.fn(),
      findPersonByIdForAdmin: vi.fn().mockResolvedValue(basePerson()),
      createPersonForAdmin: vi.fn(),
      updatePersonForAdmin: vi.fn(),
      deletePersonForAdmin: vi.fn().mockResolvedValue(undefined),
    };
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => repo);

    const { deletePersonAdmin } = await import(
      "@/lib/modules/person/application/persons-admin.service"
    );
    await deletePersonAdmin("p-1");
    expect(repo.deletePersonForAdmin).toHaveBeenCalledWith("p-1");
  });
});
