import { describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildTx = () => ({
  media: {
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "media-1" }),
  },
});

describe("ensurePerson service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("create une nouvelle personne quand elle n'existe pas et connecte l'avatar", async () => {
    const createPerson = vi.fn().mockResolvedValue({ id: "person-1" });
    const updatePerson = vi.fn();
    const findPerson = vi.fn().mockResolvedValue(null);

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      createPerson,
      updatePerson,
      findPersonByFullNameTx: findPerson,
    }));

    const { ensurePerson } = await import("@/lib/modules/person/application/person.service");

    const tx = buildTx();
    const payload = {
      fullName: "  Super Person  ",
      firstName: "Super",
      lastName: "Person",
      pseudo: "super",
      role: "developer",
      bio: "Bio here",
      email: "super@example.com",
      avatar: "  /images/super.png  ",
      profileData: { foo: "bar" },
      siteOwner: true,
    };

    const result = await ensurePerson(tx as any, payload);
    expect(result).toBeDefined();
    expect(createPerson).toHaveBeenCalledWith(tx, {
      data: expect.objectContaining({
        fullName: "Super Person",
        avatarMedia: { connect: { id: "media-1" } },
      }),
    });
    expect(findPerson).toHaveBeenCalledWith(tx, "Super Person");
    expect(tx.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ url: "/images/super.png" }),
    });
    expect(updatePerson).not.toHaveBeenCalled();
  });

  it("met à jour la personne existante sans recréer l'avatar si déjà présent", async () => {
    const createPerson = vi.fn();
    const updatePerson = vi.fn().mockResolvedValue({ id: "person-2" });
    const findPerson = vi.fn().mockResolvedValue({ id: "person-1", fullName: "Super Person" });

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      createPerson,
      updatePerson,
      findPersonByFullNameTx: findPerson,
    }));

    const { ensurePerson } = await import("@/lib/modules/person/application/person.service");

    const tx = buildTx();
    tx.media.findFirst = vi.fn().mockResolvedValue({ id: "media-existing" });

    const payload = {
      fullName: "Super Person",
      role: "product owner",
      avatar: "  /images/super.png  ",
    };

    const result = await ensurePerson(tx as any, payload as any);
    expect(result).toBeDefined();
    expect(updatePerson).toHaveBeenCalledWith(tx, {
      where: { id: "person-1" },
      data: expect.objectContaining({
        role: { set: "product owner" },
        avatarMedia: { connect: { id: "media-existing" } },
      }),
    });
    expect(createPerson).not.toHaveBeenCalled();
  });

  it("rejette quand fullName est vide", async () => {
    const createPerson = vi.fn();
    const updatePerson = vi.fn();
    const findPerson = vi.fn();

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      createPerson,
      updatePerson,
      findPersonByFullNameTx: findPerson,
    }));

    const { ensurePerson } = await import("@/lib/modules/person/application/person.service");

    await expect(
      ensurePerson(
        { media: { findFirst: vi.fn(), create: vi.fn() } } as any,
        {
          fullName: "   ",
        } as any,
      ),
    ).rejects.toThrow("fullName is required");
  });

  it("create une personne sans avatar quand avatar est absent", async () => {
    const createPerson = vi.fn().mockResolvedValue({ id: "person-1" });
    const updatePerson = vi.fn();
    const findPerson = vi.fn().mockResolvedValue(null);

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      createPerson,
      updatePerson,
      findPersonByFullNameTx: findPerson,
    }));

    const { ensurePerson } = await import("@/lib/modules/person/application/person.service");

    const tx = buildTx();
    const payload = {
      fullName: "Super Person",
      role: "developer",
    };

    await ensurePerson(tx as any, payload as any);
    expect(tx.media.findFirst).not.toHaveBeenCalled();
    expect(tx.media.create).not.toHaveBeenCalled();
    expect(createPerson).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.not.objectContaining({
          avatarMedia: expect.anything(),
        }),
      }),
    );
    expect(updatePerson).not.toHaveBeenCalled();
  });

  it("create une personne sans avatar quand avatar est vide", async () => {
    const createPerson = vi.fn().mockResolvedValue({ id: "person-1" });
    const updatePerson = vi.fn();
    const findPerson = vi.fn().mockResolvedValue(null);

    vi.doMock("@/lib/modules/person/infrastructure/person.repo", () => ({
      createPerson,
      updatePerson,
      findPersonByFullNameTx: findPerson,
    }));

    const { ensurePerson } = await import("@/lib/modules/person/application/person.service");

    const tx = buildTx();
    const payload = {
      fullName: "Super Person",
      avatar: "   ",
    };

    await ensurePerson(tx as any, payload as any);
    expect(tx.media.findFirst).not.toHaveBeenCalled();
    expect(tx.media.create).not.toHaveBeenCalled();
    expect(createPerson).toHaveBeenCalled();
    expect(updatePerson).not.toHaveBeenCalled();
  });
});
