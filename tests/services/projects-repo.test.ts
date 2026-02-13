import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

describe("projects repo - prisma wrappers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("listProjects applique le filtre published quand onlyPublished=true", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        project: { findMany },
      },
    }));

    const { listProjects } = await import("@/lib/modules/projects/infrastructure/projects.repo");
    await listProjects({ onlyPublished: true });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "published" },
      }),
    );
  });

  it("listProjects n'applique pas de filtre quand onlyPublished est absent", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        project: { findMany },
      },
    }));

    const { listProjects } = await import("@/lib/modules/projects/infrastructure/projects.repo");
    await listProjects();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
      }),
    );
  });

  it("findProjectBySlug transmet le slug et inclut les relations", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        project: { findFirst },
      },
    }));

    const { findProjectBySlug } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );
    await findProjectBySlug("alpha");
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: "alpha" } }));
  });

  it("findProjectBySlugTx transmet le slug et inclut les relations", async () => {
    const tx = { project: { findFirst: vi.fn().mockResolvedValue(null) } };
    const { findProjectBySlugTx } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );
    await findProjectBySlugTx(tx as any, "alpha");
    expect(tx.project.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "alpha" } }),
    );
  });

  it("runProjectTransaction appelle prisma.$transaction", async () => {
    const $transaction = vi
      .fn()
      .mockImplementation(async (work: (tx: any) => any) => work({ tx: true }));
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        $transaction,
      },
    }));

    const { runProjectTransaction } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );
    const result = await runProjectTransaction(async (tx) => tx.tx);
    expect(result).toBe(true);
    expect($transaction).toHaveBeenCalledTimes(1);
  });

  it("projectSlugExists retourne true si count > 0", async () => {
    const tx = { project: { count: vi.fn().mockResolvedValue(2) } };
    const { projectSlugExists } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );
    const exists = await projectSlugExists(tx as any, "alpha");
    expect(exists).toBe(true);
  });

  it("clearProjectRelations supprime gallery/persons/tags", async () => {
    const tx = {
      projectImage: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      projectPerson: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      projectTag: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    const { clearProjectRelations } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );
    await clearProjectRelations(tx as any, "p-1");
    expect(tx.projectImage.deleteMany).toHaveBeenCalledWith({ where: { projectId: "p-1" } });
    expect(tx.projectPerson.deleteMany).toHaveBeenCalledWith({ where: { projectId: "p-1" } });
    expect(tx.projectTag.deleteMany).toHaveBeenCalledWith({ where: { projectId: "p-1" } });
  });

  it("deleteProjectTx appelle tx.project.delete", async () => {
    const tx = { project: { delete: vi.fn().mockResolvedValue(undefined) } };
    const { deleteProjectTx } = await import("@/lib/modules/projects/infrastructure/projects.repo");
    await deleteProjectTx(tx as any, { id: "p-1" } as any);
    expect(tx.project.delete).toHaveBeenCalledWith({ where: { id: "p-1" } });
  });

  it("createProject et updateProject incluent les relations", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const update = vi.fn().mockResolvedValue(null);
    const tx = { project: { create, update } };
    const { createProject, updateProject } = await import(
      "@/lib/modules/projects/infrastructure/projects.repo"
    );

    await createProject(tx as any, { data: { slug: "alpha" } } as any);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ include: expect.any(Object) }));

    await updateProject(tx as any, { where: { slug: "alpha" }, data: {} } as any);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ include: expect.any(Object) }));
  });

  it("deleteProject appelle prisma.project.delete", async () => {
    const del = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        project: { delete: del },
      },
    }));

    const { deleteProject } = await import("@/lib/modules/projects/infrastructure/projects.repo");
    await deleteProject("alpha");
    expect(del).toHaveBeenCalledWith({ where: { slug: "alpha" } });
  });

  it("listProjectTags filtre les categories project et global", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        tag: { findMany },
      },
    }));

    const { listProjectTags } = await import("@/lib/modules/projects/infrastructure/projects.repo");
    await listProjectTags();
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: { in: ["project", "global"] } },
      }),
    );
  });
});
