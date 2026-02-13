import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const baseTag = () => ({
  id: "t-1",
  slug: "opinion-tech",
  name: "Opinion Tech",
  category: "article",
  description: null,
  color: "#0EA5E9",
  _count: { articleTags: 0, projectTags: 0 },
});

describe("tags service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("listTagsAdmin renvoie les tags du repo", async () => {
    const repo = {
      listTags: vi.fn().mockResolvedValue([baseTag()]),
      getTagBySlug: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { listTagsAdmin } = await import("@/lib/modules/tags/application/tags.service");
    const tags = await listTagsAdmin();

    expect(repo.listTags).toHaveBeenCalledOnce();
    expect(tags).toMatchObject([{ slug: "opinion-tech" }]);
  });

  it("getTagForAdmin renvoie le tag (admin detail)", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(baseTag()),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { getTagForAdmin } = await import("@/lib/modules/tags/application/tags.service");
    const tag = await getTagForAdmin("opinion-tech");

    expect(repo.getTagBySlug).toHaveBeenCalledWith("opinion-tech");
    expect(tag).toMatchObject({ id: "t-1", slug: "opinion-tech", name: "Opinion Tech" });
    expect("_count" in tag).toBe(false);
  });

  it("getTagForAdmin throw TagNotFoundError si absent", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(null),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { getTagForAdmin } = await import("@/lib/modules/tags/application/tags.service");
    await expect(getTagForAdmin("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getTagForAdmin normalise description/color undefined en null", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue({
        ...baseTag(),
        description: undefined,
        color: undefined,
      }),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { getTagForAdmin } = await import("@/lib/modules/tags/application/tags.service");
    const tag = await getTagForAdmin("opinion-tech");
    expect(tag.description).toBeNull();
    expect(tag.color).toBeNull();
  });

  it("createTagAdmin refuse un nom vide", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { createTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    await expect(createTagAdmin({ name: "   ", category: "global" } as any)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("createTagAdmin cree un tag via le repo", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn(),
      createTag: vi.fn().mockResolvedValue({ id: "t-2", slug: "web", name: "Web" }),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { createTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    const created = await createTagAdmin({
      name: "Web",
      category: "project",
      description: "tag web",
      color: "#fff",
    } as any);

    expect(repo.createTag).toHaveBeenCalledWith({
      name: "Web",
      category: "project",
      description: "tag web",
      color: "#fff",
    });
    expect(created).toMatchObject({ slug: "web", name: "Web" });
  });

  it("updateTagAdmin update par id interne", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(baseTag()),
      createTag: vi.fn(),
      updateTag: vi.fn().mockResolvedValue({ id: "t-1", slug: "opinion-tech" }),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { updateTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    const updated = await updateTagAdmin("opinion-tech", { name: "Opinion, Tech" });

    expect(repo.updateTag).toHaveBeenCalledWith("t-1", { name: "Opinion, Tech" });
    expect(updated).toMatchObject({ slug: "opinion-tech" });
  });

  it("updateTagAdmin throw TagNotFoundError si le slug n'existe pas", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(null),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { updateTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    await expect(updateTagAdmin("missing", { name: "New" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deleteTagAdmin delete par id interne", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(baseTag()),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn().mockResolvedValue(undefined),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { deleteTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    await deleteTagAdmin("opinion-tech");

    expect(repo.deleteTag).toHaveBeenCalledWith("t-1");
  });

  it("deleteTagAdmin throw TagNotFoundError si le slug n'existe pas", async () => {
    const repo = {
      listTags: vi.fn(),
      getTagBySlug: vi.fn().mockResolvedValue(null),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
    };
    vi.doMock("@/lib/modules/tags/infrastructure/tags.repo", () => repo);

    const { deleteTagAdmin } = await import("@/lib/modules/tags/application/tags.service");
    await expect(deleteTagAdmin("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});
