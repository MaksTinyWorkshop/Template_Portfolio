import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/http/errors";
import { ProjectNotFoundError } from "@/lib/modules/projects/domain/project.errors";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const payload = {
  title: "Super Project",
  summary: "Résumé",
  publishedAt: "2025-01-01",
  status: "draft",
  typeProjectTag: [],
  images: [],
  team: [],
  content: "Contenu",
  slug: "",
  link: null,
  repository: null,
};

const createTx = () => ({
  media: {
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "media-1" }),
  },
  person: {
    findFirst: vi.fn().mockResolvedValue(null),
  },
});

const createdProject = {
  slug: "super-project",
  title: "Super Project",
  summary: null,
  publishedAt: new Date("2025-01-01"),
  status: "draft",
  gallery: [],
  persons: [],
  tags: [],
  link: null,
  repository: null,
  content: "Contenu",
};

describe("projects service - createProjectAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const buildRepo = () => ({
    findProjectBySlug: vi.fn(),
    findProjectBySlugTx: vi.fn(),
    listProjects: vi.fn(),
    listProjectTags: vi.fn(),
    runProjectTransaction: vi.fn(),
    projectSlugExists: vi.fn(),
    clearProjectRelations: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProjectTx: vi.fn(),
  });

  it("crée un projet avec gallery/team/tags quand fournis", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue({ id: "media-1" }),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/person", () => ({
      ensurePerson: vi.fn().mockResolvedValue({ id: "person-2" }),
    }));

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue({ id: "owner-1", role: "Owner" }),
    }));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    const result = await createProjectAdmin({
      ...payload,
      title: "Super Project",
      slug: "",
      typeProjectTag: ["Web", "Web"],
      featuredImage: "https://example.com/cover.png",
      images: ["https://example.com/cover.png", "https://example.com/2.png"],
      team: [{ name: "Alice", role: "Dev", avatar: null }],
      content: "Contenu",
      link: "https://example.com",
      repository: "https://github.com/x/y",
    } as any);

    expect(mockRepo.createProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          gallery: { create: expect.any(Array) },
          persons: { create: expect.any(Array) },
          tags: { create: expect.any(Array) },
        }),
      }),
    );
    expect(result.slug).toBe("super-project");
  });

  it("gère la gallery avec media manquant et un membre d'equipe par personId", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi
          .fn()
          .mockResolvedValueOnce({ id: "media-cover" })
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: "media-2" }),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      publishedAt: undefined,
      typeProjectTag: ["Web"],
      images: [
        "https://example.com/cover.png",
        "https://example.com/missing.png",
        "https://example.com/2.png",
      ],
      featuredImage: "https://example.com/cover.png",
      team: [{ name: "Alice", role: "Dev", avatar: null, personId: "person-1" }],
      content: "Contenu",
      link: "",
      repository: "",
    } as any);

    expect(mockRepo.createProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          publishedAt: null,
          gallery: { create: expect.any(Array) },
          persons: { create: expect.any(Array) },
        }),
      }),
    );
  });

  it("nettoie les socials d'equipe avant d'appeler ensurePerson", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    const ensurePerson = vi.fn().mockResolvedValue({ id: "person-2" });
    vi.doMock("@/lib/modules/person", () => ({
      ensurePerson,
    }));

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue(null),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      typeProjectTag: ["Web"],
      images: [],
      team: [
        {
          name: "Alice",
          role: "Dev",
          avatar: null,
          linkedIn: "   ",
          socials: [
            { name: "   ", url: "https://example.com" },
            { name: "", url: "https://example.com" },
            { name: "GitHub", url: "" },
            { name: " GitHub ", url: " https://github.com/alice " },
          ],
        },
      ],
      content: "Contenu",
      link: "",
      repository: "",
    } as any);

    expect(ensurePerson).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        profileData: { contacts: { github: "https://github.com/alice" } },
      }),
    );
  });

  it("inclut linkedIn dans profileData quand il est present", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    const ensurePerson = vi.fn().mockResolvedValue({ id: "person-2" });
    vi.doMock("@/lib/modules/person", () => ({
      ensurePerson,
    }));

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue(null),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      typeProjectTag: ["Web"],
      images: [],
      team: [
        {
          name: "Alice",
          role: "Dev",
          avatar: null,
          linkedIn: " https://linkedin.com/in/alice ",
        },
      ],
    } as any);

    expect(ensurePerson).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        profileData: { contacts: { linkedin: "https://linkedin.com/in/alice" } },
      }),
    );
  });

  it("ne cherche pas de site owner par defaut si un membre est deja marque isSiteOwner", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    const ensurePerson = vi.fn().mockResolvedValue({ id: "person-owner" });
    vi.doMock("@/lib/modules/person", () => ({
      ensurePerson,
    }));

    const findSiteOwnerTx = vi.fn(() => {
      throw new Error("should not be called");
    });
    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx,
    }));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue(null),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      typeProjectTag: ["Web"],
      team: [{ name: "Owner", role: "", avatar: null, isSiteOwner: true }],
      images: [],
      content: "Contenu",
      link: "",
      repository: "",
    } as any);

    expect(findSiteOwnerTx).not.toHaveBeenCalled();
    expect(ensurePerson).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        role: null,
      }),
    );
  });

  it("cree un projet meme si featuredImage n'a pas de media et publishedAt est invalide", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    const ensurePerson = vi.fn().mockResolvedValue({ id: "person-2" });
    vi.doMock("@/lib/modules/person", () => ({
      ensurePerson,
    }));

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue({ id: "owner-1", role: undefined }),
    }));

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue(null),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      publishedAt: "not-a-date",
      featuredImage: "https://example.com/cover.png",
      images: [],
      typeProjectTag: ["Web"],
      team: [
        { name: "Alice", role: "", avatar: "", personId: "person-1" },
        { name: "Bob", role: "", avatar: null },
      ],
      content: "Contenu",
      link: "",
      repository: "",
    } as any);

    expect(mockRepo.createProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          publishedAt: null,
          gallery: undefined,
          persons: { create: expect.arrayContaining([expect.objectContaining({ role: null })]) },
        }),
      }),
    );
    expect(ensurePerson).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({ role: null, avatar: null }),
    );
  });

  it("couvre mapSlug(title ?? '') quand title est absent", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue(null),
    }));
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await createProjectAdmin({
      ...payload,
      title: undefined,
      slug: "custom",
      typeProjectTag: ["Web"],
      images: [],
      team: [],
    } as any);

    expect(mockRepo.projectSlugExists).toHaveBeenCalledWith(tx, "custom");
  });

  it("rejette quand le slug existe déjà", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(true);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await expect(createProjectAdmin(payload as any)).rejects.toMatchObject({
      statusCode: 422,
      message: "Un projet existe déjà avec ce slug",
    });
    expect(mockRepo.runProjectTransaction).toHaveBeenCalled();
    expect(mockRepo.projectSlugExists).toHaveBeenCalledWith(tx, "super-project");
  });

  it("créé un projet quand le slug est libre", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.createProject.mockResolvedValue(createdProject);
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { createProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    const result = await createProjectAdmin(payload as any);
    expect(mockRepo.createProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "super-project",
          title: payload.title,
        }),
      }),
    );
    expect(result.metadata.title).toBe("Super Project");
  });
});

describe("projects service - update/delete/status", () => {
  const basePayload = { ...payload, title: "New Title" };
  const buildRepo = () => ({
    findProjectBySlug: vi.fn(),
    findProjectBySlugTx: vi.fn(),
    listProjects: vi.fn(),
    listProjectTags: vi.fn(),
    runProjectTransaction: vi.fn(),
    projectSlugExists: vi.fn(),
    clearProjectRelations: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProjectTx: vi.fn(),
  });

  const tx = createTx();

  beforeEach(() => {
    vi.resetModules();
  });

  it("rejette update si un autre projet utilise déjà le slug", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue({
      id: "p-1",
      slug: "super-project",
    });
    mockRepo.projectSlugExists.mockResolvedValue(true);

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { updateProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await expect(updateProjectAdmin("super-project", basePayload as any)).rejects.toMatchObject({
      message: "Un autre projet utilise déjà ce slug",
      statusCode: 422,
    });
    expect(mockRepo.clearProjectRelations).not.toHaveBeenCalled();
  });

  it("rejette la mise à jour quand le projet est introuvable", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue(null);

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { updateProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await expect(updateProjectAdmin("super-project", basePayload as any)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Aucun projet trouvé pour le slug « super-project »",
      }),
    );
  });

  it("réécrit les relations et renvoie le détail mis à jour", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue({
      id: "p-1",
      slug: "super-project",
    });
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.updateProject.mockResolvedValue({
      slug: "super-project",
      title: "New Title",
      summary: null,
      publishedAt: new Date("2025-01-01"),
      status: "draft",
      gallery: [],
      persons: [],
      tags: [],
      link: null,
      repository: null,
      content: "Contenu",
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { updateProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    const result = await updateProjectAdmin("super-project", basePayload as any);
    expect(mockRepo.clearProjectRelations).toHaveBeenCalledWith(tx, "p-1");
    expect(mockRepo.updateProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        where: { id: "p-1" },
        data: expect.objectContaining({ title: "New Title" }),
      }),
    );
    expect(result.slug).toBe("super-project");
  });

  it("updateProjectAdmin envoie gallery/persons/tags quand fournis", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue({
      id: "p-1",
      slug: "super-project",
    });
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.updateProject.mockResolvedValue({
      ...createdProject,
      slug: "super-project",
      title: "New Title",
    });

    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<any>("@/lib/utils/content-normalizers");
      return {
        ...actual,
        ensureMediaRecord: vi.fn().mockResolvedValue({ id: "media-1" }),
        ensureTagForCategory: vi.fn().mockResolvedValue({ id: "tag-1" }),
      };
    });

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      findSiteOwnerTx: vi.fn().mockResolvedValue(null),
    }));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { updateProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await updateProjectAdmin("super-project", {
      ...basePayload,
      typeProjectTag: ["Web"],
      featuredImage: "https://example.com/cover.png",
      images: ["https://example.com/cover.png", "https://example.com/2.png"],
      team: [{ name: "Alice", role: "Dev", avatar: null, personId: "person-1" }],
    } as any);

    expect(mockRepo.updateProject).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          gallery: { create: expect.any(Array) },
          persons: { create: expect.any(Array) },
          tags: { create: expect.any(Array) },
        }),
      }),
    );
  });

  it("ne verifie pas le conflit de slug si le slug ne change pas", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue({
      id: "p-1",
      slug: "alpha",
    });
    mockRepo.projectSlugExists.mockResolvedValue(false);
    mockRepo.updateProject.mockResolvedValue({
      ...createdProject,
      slug: "alpha",
      title: "Alpha",
    });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { updateProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await updateProjectAdmin("alpha", { ...payload, title: "Alpha", slug: "alpha" } as any);
    expect(mockRepo.projectSlugExists).not.toHaveBeenCalled();
    expect(mockRepo.updateProject).toHaveBeenCalled();
  });

  it("supprime un projet existant", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue({ id: "p-1", slug: "super-project" });

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { deleteProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await deleteProjectAdmin("super-project");
    expect(mockRepo.clearProjectRelations).toHaveBeenCalledWith(tx, "p-1");
    expect(mockRepo.deleteProjectTx).toHaveBeenCalledWith(tx, { id: "p-1" });
  });

  it("rejette la suppression lorsqu'aucun projet n'existe pour le slug", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.findProjectBySlugTx.mockResolvedValue(null);

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { deleteProjectAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await expect(deleteProjectAdmin("super-project")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Aucun projet trouvé pour le slug « super-project »",
      }),
    );
  });

  it("met à jour le statut sans transaction explicite", async () => {
    const mockRepo = buildRepo();
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { setProjectStatus } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await setProjectStatus("super-project", "published");
    expect(mockRepo.updateProject).toHaveBeenCalledWith(tx, {
      where: { slug: "super-project" },
      data: { status: "published" },
    });
  });

  it("rejette le changement de statut quand la mise à jour échoue", async () => {
    const mockRepo = buildRepo();
    const expectedError = new ProjectNotFoundError("super-project");
    mockRepo.runProjectTransaction.mockImplementation((work) => work(tx));
    mockRepo.updateProject.mockRejectedValue(expectedError);

    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => mockRepo);

    const { setProjectStatus } = await import(
      "@/lib/modules/projects/application/projects.service"
    );

    await expect(setProjectStatus("super-project", "published")).rejects.toBe(expectedError);
  });
});
