import { describe, expect, it, vi } from "vitest";
import { slugify } from "@/lib/utils/slugify";
import { ValidationError } from "@/lib/http/errors";
import { ArticleNotFoundError } from "@/lib/modules/articles/domain/article.errors";

(globalThis as typeof globalThis & { slugifyValue?: (value?: string) => string }).slugifyValue =
  slugify;

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const basePayload = {
  title: "Super article",
  summary: "Résumé",
  publishedAt: "2025-01-01",
  status: "draft",
  tags: ["Tech"],
  image: "/images/hero.png",
  content: "Contenu",
  slug: "",
};

const createTx = () => ({
  media: {
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "media-1" }),
  },
});

const buildRepo = () => ({
  articleSlugExists: vi.fn(),
  clearArticleTags: vi.fn(),
  runArticleTransaction: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticleTx: vi.fn(),
  findArticleBySlug: vi.fn(),
  findArticleBySlugTx: vi.fn(),
});

describe("articles service - create/update/delete", () => {
  const mockContentNormalizers = async (overrides?: {
    ensureTagForCategory?: ReturnType<typeof vi.fn>;
    ensureMediaRecord?: ReturnType<typeof vi.fn>;
  }) => {
    vi.resetModules();
    vi.doMock("@/lib/utils/content-normalizers", async () => {
      const actual = await vi.importActual<typeof import("@/lib/utils/content-normalizers")>(
        "@/lib/utils/content-normalizers",
      );
      return {
        ...actual,
        ensureTagForCategory:
          overrides?.ensureTagForCategory ?? vi.fn().mockResolvedValue({ id: "tag-1" }),
        ensureMediaRecord:
          overrides?.ensureMediaRecord ?? vi.fn().mockResolvedValue({ id: "media-1" }),
      };
    });
  };

  beforeEach(async () => {
    await mockContentNormalizers();
  });

  afterEach(async () => {
    await mockContentNormalizers();
  });

  it("rejette la creation si le slug existe déjà", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(true);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(createArticleAdmin(basePayload as any)).rejects.toMatchObject({
      message: "Un article existe déjà avec ce slug",
      statusCode: 422,
    });
    expect(mockRepo.runArticleTransaction).toHaveBeenCalled();
  });

  it("crée un article lorsque le slug est libre", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.createArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.findArticleBySlug.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    const result = await createArticleAdmin(basePayload as any);
    expect(mockRepo.createArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "super-article",
          title: basePayload.title,
        }),
      }),
    );
    expect(result.slug).toBe("super-article");
  });

  it("crée un article sans media quand ensureMediaRecord retourne null (et couvre title ?? '')", async () => {
    await mockContentNormalizers({
      ensureMediaRecord: vi.fn().mockResolvedValue(null),
    });

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.createArticle.mockResolvedValue({
      slug: "custom",
      title: "Fallback",
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: null,
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await createArticleAdmin({
      ...basePayload,
      title: undefined,
      slug: "custom",
      image: null,
    } as any);

    expect(mockRepo.createArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "custom",
          media: undefined,
          tags: { create: expect.any(Array) },
        }),
      }),
    );
  });

  it("rejette la création quand ensureTagForCategory échoue", async () => {
    const error = new ValidationError("Tag invalide");
    await mockContentNormalizers({
      ensureTagForCategory: vi.fn().mockRejectedValue(error),
    });

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(createArticleAdmin(basePayload as any)).rejects.toMatchObject({
      statusCode: 422,
      message: "Tag invalide",
    });
  });

  it("rejette la création quand ensureMediaRecord échoue", async () => {
    const error = new ValidationError("Media indisponible");
    await mockContentNormalizers({
      ensureMediaRecord: vi.fn().mockRejectedValue(error),
    });

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(createArticleAdmin(basePayload as any)).rejects.toMatchObject({
      statusCode: 422,
      message: "Media indisponible",
    });
  });

  it("rejette la mise à jour lorsque le nouveau slug est déjà utilisé", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "super-article" });
    mockRepo.articleSlugExists.mockResolvedValue(true);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(
      updateArticleAdmin("super-article", { ...basePayload, slug: "nouveau-slug" } as any),
    ).rejects.toMatchObject({
      statusCode: 422,
      message: "Un autre article utilise déjà ce slug",
    });
  });

  it("met à jour l'article avec des relations rafraîchies", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "super-article" });
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.updateArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    const result = await updateArticleAdmin("super-article", basePayload as any);
    expect(mockRepo.clearArticleTags).toHaveBeenCalledWith(tx, "a-1");
    expect(mockRepo.updateArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        where: { id: "a-1" },
        data: expect.objectContaining({ title: basePayload.title }),
      }),
    );
    expect(result.slug).toBe("super-article");
  });

  it("met a jour l'article en deconnectant le media si aucun media n'est trouve", async () => {
    await mockContentNormalizers({
      ensureMediaRecord: vi.fn().mockResolvedValue(null),
    });

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "super-article" });
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.updateArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: null,
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await updateArticleAdmin("super-article", basePayload as any);
    expect(mockRepo.updateArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          media: { disconnect: true },
        }),
      }),
    );
  });

  it("rejette la creation quand aucun tag n'est fourni", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));
    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(createArticleAdmin({ ...basePayload, tags: [] } as any)).rejects.toMatchObject({
      statusCode: 422,
      message: "Au moins un tag est requis",
    });
  });

  it("deconnecte le media si l'image est absente", async () => {
    await mockContentNormalizers({
      ensureMediaRecord: vi.fn().mockResolvedValue(null),
    });

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "super-article" });
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.updateArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: null,
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await updateArticleAdmin("super-article", { ...basePayload, image: null } as any);
    expect(mockRepo.updateArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          media: { disconnect: true },
        }),
      }),
    );
  });

  it("parse la date invalide en null", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.createArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: null,
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await createArticleAdmin({ ...basePayload, publishedAt: "not-a-date" } as any);
    expect(mockRepo.createArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          publishAt: null,
        }),
      }),
    );
  });

  it("rejette la mise a jour quand l'article est introuvable", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue(null);
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(updateArticleAdmin("super-article", basePayload as any)).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Aucun article trouvé pour le slug « super-article »",
      }),
    );
  });

  it("parse une date absente en null", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.createArticle.mockResolvedValue({
      slug: "super-article",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: null,
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { createArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await createArticleAdmin({ ...basePayload, publishedAt: undefined } as any);
    expect(mockRepo.createArticle).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        data: expect.objectContaining({
          publishAt: null,
        }),
      }),
    );
  });

  it("slugifyValue utilise la fallback slugify() si non injecte", async () => {
    // Cover the fallback branch in slugifyValue initialization.
    delete (globalThis as typeof globalThis & { slugifyValue?: unknown }).slugifyValue;

    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "hello-world" });
    mockRepo.articleSlugExists.mockResolvedValue(false);
    mockRepo.updateArticle.mockResolvedValue({
      slug: "hello-world",
      title: basePayload.title,
      summary: basePayload.summary,
      publishAt: new Date(basePayload.publishedAt),
      status: basePayload.status,
      media: { url: basePayload.image },
      tags: [{ tag: { slug: "tech", name: "Tech", color: null } }],
      content: basePayload.content,
    });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { updateArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await updateArticleAdmin("Hello World", basePayload as any);
    expect(mockRepo.findArticleBySlugTx).toHaveBeenCalledWith(tx, "hello-world");
  });

  it("supprime un article existant", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.findArticleBySlugTx.mockResolvedValue({ id: "a-1", slug: "super-article" });
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { deleteArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await deleteArticleAdmin("super-article");
    expect(mockRepo.clearArticleTags).toHaveBeenCalledWith(tx, "a-1");
    expect(mockRepo.deleteArticleTx).toHaveBeenCalledWith(tx, { id: "a-1" });
  });

  it("met à jour le statut via transaction", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { setArticleStatus } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await setArticleStatus("super-article", "published");
    expect(mockRepo.updateArticle).toHaveBeenCalledWith(tx, {
      where: { slug: "super-article" },
      data: { status: "published" },
    });
  });

  it("rejette la mise à jour du statut quand l'article n'existe pas", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    const expectedError = new ArticleNotFoundError("super-article");
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));
    mockRepo.updateArticle.mockRejectedValue(expectedError);

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { setArticleStatus } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(setArticleStatus("super-article", "published")).rejects.toBe(expectedError);
  });

  it("rejette la suppression lorsque le slug est inconnu", async () => {
    const mockRepo = buildRepo();
    const tx = createTx();
    mockRepo.runArticleTransaction.mockImplementation((work) => work(tx));
    mockRepo.findArticleBySlugTx.mockResolvedValue(null);

    vi.doMock("@/lib/modules/articles/infrastructure/articles.repo", () => mockRepo);

    const { deleteArticleAdmin } = await import(
      "@/lib/modules/articles/application/articles.service"
    );

    await expect(deleteArticleAdmin("super-article")).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: "Aucun article trouvé pour le slug « super-article »",
      }),
    );
  });
});
