import { ValidationError } from "@/lib/http/errors";
import {
  ensureMediaRecord,
  ensureTagForCategory,
  normalizeSlugInput,
  normalizeStringList,
} from "@/lib/utils/content-normalizers";
import { slugify } from "@/lib/utils/slugify";
import type { Prisma } from "@prisma/client";
import type { ArticleStatus } from "../domain/article";
import { ArticleNotFoundError } from "../domain/article.errors";
import {
  type ArticleWithRelations,
  articleSlugExists,
  clearArticleTags,
  createArticle,
  deleteArticleTx,
  listArticles as fetchArticles,
  findArticleBySlug,
  findArticleBySlugTx,
  listArticleTags,
  runArticleTransaction,
  updateArticle,
} from "../infrastructure/articles.repo";
import type { ArticleAdminDetail, ArticleAdminListItem, ArticleAdminPayload } from "../types";
import { articleListSchema, articleSummarySchema } from "./articles.dto";

const toArticleSummary = (article: ArticleWithRelations) => ({
  slug: article.slug,
  title: article.title,
  summary: article.summary ?? null,
  subtitle: null,
  publishedAt: article.publishAt?.toISOString() ?? null,
  image: article.media?.url ?? null,
  tags: article.tags.map((relation) => ({
    slug: relation.tag.slug,
    name: relation.tag.name,
    color: relation.tag.color ?? null,
  })),
  content: article.content ?? null,
});

const mapSlug = (slug?: string, title?: string) => normalizeSlugInput(slug, title ?? "");

const slugifyValue =
  (globalThis as typeof globalThis & { slugifyValue?: (value?: string) => string }).slugifyValue ??
  ((value?: string) => slugify(value));

const parseArticleDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildArticleTagEntries = async (tx: Prisma.TransactionClient, tags: string[]) => {
  const uniqueTags = normalizeStringList(tags);
  if (uniqueTags.length === 0) {
    throw new ValidationError("Au moins un tag est requis");
  }

  const entries: Array<Prisma.ArticleTagCreateWithoutArticleInput> = [];
  for (const name of uniqueTags) {
    const tag = await ensureTagForCategory(tx, name, "article");
    entries.push({
      tag: { connect: { id: tag.id } },
    });
  }
  return entries;
};

const ensureArticleMedia = (tx: Prisma.TransactionClient, image?: string | null) =>
  ensureMediaRecord(tx, image);

const collectTagNames = (article: ArticleWithRelations) =>
  normalizeStringList(article.tags.map((relation) => relation.tag.name));

const mapArticleToAdminListItem = (article: ArticleWithRelations): ArticleAdminListItem => ({
  slug: article.slug,
  title: article.title,
  summary: article.summary ?? "",
  publishedAt: article.publishAt?.toISOString() ?? "",
  status: article.status as ArticleStatus,
  tags: collectTagNames(article),
});

const mapArticleToAdminDetail = (article: ArticleWithRelations): ArticleAdminDetail => ({
  slug: article.slug,
  metadata: {
    title: article.title,
    summary: article.summary ?? "",
    publishedAt: article.publishAt?.toISOString() ?? "",
    status: article.status as ArticleStatus,
    tags: collectTagNames(article),
    image: article.media?.url ?? undefined,
  },
  content: article.content ?? "",
});

export const listArticles = async (options?: { onlyPublished?: boolean }) => {
  const rows = await fetchArticles({
    onlyPublished: options?.onlyPublished ?? true,
  });
  return articleListSchema.parse(rows.map(toArticleSummary));
};

export const getArticleBySlug = async (slug: string) => {
  const article = await findArticleBySlug(slug);
  if (!article) {
    throw new ArticleNotFoundError(slug);
  }
  return articleSummarySchema.parse(toArticleSummary(article));
};

export const listArticleSlugs = async () =>
  (await fetchArticles({ onlyPublished: true })).map((article) => article.slug);

export const listArticlesAdmin = async () => {
  const rows = await fetchArticles();
  return rows.map(mapArticleToAdminListItem);
};

export const getArticleForAdmin = async (slug: string) => {
  const article = await findArticleBySlug(slug);
  if (!article) {
    throw new ArticleNotFoundError(slug);
  }
  return mapArticleToAdminDetail(article);
};

export const createArticleAdmin = async (payload: ArticleAdminPayload) => {
  const slug = mapSlug(payload.slug, payload.title);
  return runArticleTransaction(async (tx) => {
    const exists = await articleSlugExists(tx, slug);
    if (exists) {
      throw new ValidationError("Un article existe déjà avec ce slug");
    }

    const tagEntries = await buildArticleTagEntries(tx, payload.tags);
    const media = await ensureArticleMedia(tx, payload.image);

    const created = await createArticle(tx, {
      data: {
        slug,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        status: payload.status,
        publishAt: parseArticleDate(payload.publishedAt),
        media: media ? { connect: { id: media.id } } : undefined,
        tags: { create: tagEntries },
      },
    });

    return mapArticleToAdminDetail(created);
  });
};

export const updateArticleAdmin = async (slug: string, payload: ArticleAdminPayload) => {
  const currentSlug = slugifyValue(slug);
  const newSlug = mapSlug(payload.slug, payload.title);
  return runArticleTransaction(async (tx) => {
    const article = await findArticleBySlugTx(tx, currentSlug);
    if (!article) {
      throw new ArticleNotFoundError(slug);
    }

    if (newSlug !== currentSlug) {
      const conflict = await articleSlugExists(tx, newSlug);
      if (conflict) {
        throw new ValidationError("Un autre article utilise déjà ce slug");
      }
    }

    await clearArticleTags(tx, article.id);

    const tagEntries = await buildArticleTagEntries(tx, payload.tags);
    const media = await ensureArticleMedia(tx, payload.image);

    const updated = await updateArticle(tx, {
      where: { id: article.id },
      data: {
        slug: newSlug,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        status: payload.status,
        publishAt: parseArticleDate(payload.publishedAt),
        media: media ? { connect: { id: media.id } } : { disconnect: true },
        tags: { create: tagEntries },
      },
    });

    return mapArticleToAdminDetail(updated);
  });
};

export const deleteArticleAdmin = async (slug: string) => {
  const targetSlug = slugifyValue(slug);
  return runArticleTransaction(async (tx) => {
    const article = await findArticleBySlugTx(tx, targetSlug);
    if (!article) {
      throw new ArticleNotFoundError(slug);
    }

    await clearArticleTags(tx, article.id);
    await deleteArticleTx(tx, { id: article.id });
  });
};

export const setArticleStatus = async (slug: string, status: ArticleStatus) => {
  return runArticleTransaction((tx) =>
    updateArticle(tx, {
      where: { slug: slugifyValue(slug) },
      data: { status },
    }),
  );
};

export const listArticleTagNames = async () => {
  const rows = await listArticleTags();
  return rows.map((tag) => tag.name);
};
