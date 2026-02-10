import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

describe("person repo - prisma wrappers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("listPersons inclut avatarMedia", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        person: { findMany },
      },
    }));

    const { listPersons } = await import("@/lib/modules/person/infrastructure/person.repo");
    await listPersons();
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ include: { avatarMedia: true } }));
  });

  it("findPersonByFullName et findSiteOwner filtrent correctement", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        person: { findFirst },
      },
    }));

    const { findPersonByFullName, findSiteOwner } = await import(
      "@/lib/modules/person/infrastructure/person.repo"
    );
    await findPersonByFullName("Max");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { fullName: "Max" } })
    );

    await findSiteOwner();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { siteOwner: true } })
    );
  });

  it("findPersonById appelle findUnique", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        person: { findUnique },
      },
    }));

    const { findPersonById } = await import("@/lib/modules/person/infrastructure/person.repo");
    await findPersonById("p-1");
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "p-1" } }));
  });

  it("tx helpers (findSiteOwnerTx/create/update/delete) appellent les methodes du tx", async () => {
    const tx = {
      person: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "p-1" }),
        update: vi.fn().mockResolvedValue({ id: "p-1" }),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    };
    const {
      findSiteOwnerTx,
      createPerson,
      updatePerson,
      deletePersonById,
    } = await import("@/lib/modules/person/infrastructure/person.repo");

    await findSiteOwnerTx(tx as any);
    expect(tx.person.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { siteOwner: true } })
    );

    await createPerson(tx as any, { data: { fullName: "Max" } } as any);
    expect(tx.person.create).toHaveBeenCalledWith(expect.objectContaining({ include: { avatarMedia: true } }));

    await updatePerson(tx as any, { where: { id: "p-1" }, data: {} } as any);
    expect(tx.person.update).toHaveBeenCalledWith(expect.objectContaining({ include: { avatarMedia: true } }));

    await deletePersonById(tx as any, "p-1");
    expect(tx.person.delete).toHaveBeenCalledWith({ where: { id: "p-1" } });
  });

  it("findPersonByFullNameTx appelle tx.person.findFirst", async () => {
    const tx = {
      person: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const { findPersonByFullNameTx } = await import("@/lib/modules/person/infrastructure/person.repo");
    await findPersonByFullNameTx(tx as any, "Max");
    expect(tx.person.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { fullName: "Max" } }),
    );
  });
});
