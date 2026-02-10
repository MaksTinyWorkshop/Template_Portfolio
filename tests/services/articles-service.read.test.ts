import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const baseArticle = (overrides?: Record<string, unknown>) => ({
  slug: "alpha",
  title: "Alpha",
  summary: null,
  publishAt: new Date("2025-01-01T00:00:00Z"),
  status: "published",
  media: null,
  tags: [{ tag: { name: "Tech" } }],
  content: null,
  ...overrides,
});

describe("articles service - read/list", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("listArticles applique onlyPublished=true par defaut", async () => {
    const repo = {
      listArticles: vi.fn().mockResolvedValue([baseArticle()]),
      findArticleBySlug: vi.fn(),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { listArticles } = await import("@/lib/modules/articles/application/articles.service");
    const rows = await listArticles();

    expect(repo.listArticles).toHaveBeenCalledWith({ onlyPublished: true });
    expect(rows[0]).toMatchObject({
      slug: "alpha",
      publishedAt: "2025-01-01T00:00:00.000Z",
      tags: ["Tech"],
    });
  });

  it("listArticles passe onlyPublished=false quand demande", async () => {
    const repo = {
      listArticles: vi.fn().mockResolvedValue([baseArticle({ status: "draft" })]),
      findArticleBySlug: vi.fn(),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { listArticles } = await import("@/lib/modules/articles/application/articles.service");
    await listArticles({ onlyPublished: false });
    expect(repo.listArticles).toHaveBeenCalledWith({ onlyPublished: false });
  });

  it("getArticleBySlug renvoie un summary quand il existe", async () => {
    const repo = {
      listArticles: vi.fn(),
      findArticleBySlug: vi.fn().mockResolvedValue(
        baseArticle({
          summary: "Resume",
          media: { url: "https://example.com/a.png" },
          content: "Contenu",
          tags: [{ tag: { name: "Tech" } }, { tag: { name: "Tech" } }, { tag: { name: " " } }],
        }),
      ),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { getArticleBySlug } = await import("@/lib/modules/articles/application/articles.service");
    const result = await getArticleBySlug("alpha");
    expect(result).toMatchObject({
      slug: "alpha",
      summary: "Resume",
      image: "https://example.com/a.png",
      content: "Contenu",
      tags: ["Tech", "Tech", " "],
    });
  });

  it("getArticleBySlug throw ArticleNotFoundError quand introuvable", async () => {
    const repo = {
      listArticles: vi.fn(),
      findArticleBySlug: vi.fn().mockResolvedValue(null),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { getArticleBySlug } = await import("@/lib/modules/articles/application/articles.service");
    const { ArticleNotFoundError } = await import("@/lib/modules/articles/domain/article.errors");
    await expect(getArticleBySlug("missing")).rejects.toBeInstanceOf(ArticleNotFoundError);
  });

  it("listArticleSlugs renvoie les slugs publies", async () => {
    const repo = {
      listArticles: vi.fn().mockResolvedValue([baseArticle(), baseArticle({ slug: "beta" })]),
      findArticleBySlug: vi.fn(),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { listArticleSlugs } = await import("@/lib/modules/articles/application/articles.service");
    const slugs = await listArticleSlugs();
    expect(repo.listArticles).toHaveBeenCalledWith({ onlyPublished: true });
    expect(slugs).toEqual(["alpha", "beta"]);
  });

  it("listArticlesAdmin renvoie la liste admin", async () => {
    const repo = {
      listArticles: vi.fn().mockResolvedValue([
        baseArticle({
          status: "draft",
          publishAt: null,
          summary: null,
          tags: [{ tag: { name: "Tech" } }],
        }),
      ]),
      findArticleBySlug: vi.fn(),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { listArticlesAdmin } = await import("@/lib/modules/articles/application/articles.service");
    const rows = await listArticlesAdmin();
    expect(repo.listArticles).toHaveBeenCalledTimes(1);
    expect(repo.listArticles.mock.calls[0]).toEqual([]);
    expect(rows[0]).toMatchObject({
      slug: "alpha",
      status: "draft",
      publishedAt: "",
      tags: ["Tech"],
    });
  });

  it("getArticleForAdmin renvoie le detail admin", async () => {
    const repo = {
      listArticles: vi.fn(),
      findArticleBySlug: vi.fn().mockResolvedValue(
        baseArticle({
          status: "draft",
          publishAt: null,
          media: null,
          tags: [{ tag: { name: "Tech" } }],
          content: null,
        }),
      ),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { getArticleForAdmin } = await import("@/lib/modules/articles/application/articles.service");
    const detail = await getArticleForAdmin("alpha");
    expect(detail).toMatchObject({
      slug: "alpha",
      metadata: {
        status: "draft",
        tags: ["Tech"],
      },
      content: "",
    });
  });

  it("getArticleForAdmin throw ArticleNotFoundError quand introuvable", async () => {
    const repo = {
      listArticles: vi.fn(),
      findArticleBySlug: vi.fn().mockResolvedValue(null),
      findArticleBySlugTx: vi.fn(),
      runArticleTransaction: vi.fn(),
      articleSlugExists: vi.fn(),
      clearArticleTags: vi.fn(),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticleTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => repo);

    const { getArticleForAdmin } = await import("@/lib/modules/articles/application/articles.service");
    const { ArticleNotFoundError } = await import("@/lib/modules/articles/domain/article.errors");
    await expect(getArticleForAdmin("missing")).rejects.toBeInstanceOf(ArticleNotFoundError);
  });
});
