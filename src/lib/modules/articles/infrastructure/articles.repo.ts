import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const includeRelations = {
  media: true,
  tags: { include: { tag: true } },
};

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof includeRelations;
}>;

export const listArticles = (args?: { onlyPublished?: boolean }) =>
  prisma.article.findMany({
    where: args?.onlyPublished ? { status: "published" } : undefined,
    orderBy: { publishAt: "desc" },
    include: includeRelations,
  });

export const findArticleBySlug = (slug: string) =>
  prisma.article.findFirst({
    where: { slug },
    include: includeRelations,
  });

// Sert uniquement dans le cadre d'une transaction, pas appelée par le service directement
export const findArticleBySlugTx = (tx: Prisma.TransactionClient, slug: string) =>
  tx.article.findFirst({
    where: { slug },
    include: includeRelations,
  });

export const runArticleTransaction = <T>(work: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(work);

export const articleSlugExists = (tx: Prisma.TransactionClient, slug: string) =>
  tx.article.count({ where: { slug } }).then((count) => count > 0);

export const clearArticleTags = (tx: Prisma.TransactionClient, articleId: string) =>
  tx.articleTag.deleteMany({ where: { articleId } });

export const createArticle = (tx: Prisma.TransactionClient, args: Prisma.ArticleCreateArgs) =>
  tx.article.create({
    ...args,
    include: includeRelations,
  });

export const updateArticle = (tx: Prisma.TransactionClient, args: Prisma.ArticleUpdateArgs) =>
  tx.article.update({
    ...args,
    include: includeRelations,
  });

export const deleteArticleTx = (
  tx: Prisma.TransactionClient,
  where: Prisma.ArticleWhereUniqueInput,
) => tx.article.delete({ where });

export const listArticleTags = () =>
  prisma.tag.findMany({
    where: { category: { in: ["article", "global"] } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
