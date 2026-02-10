import { z } from "zod";

/**
 * Schema Zod pour le statut d'un article
 */
export const articleStatusSchema = z.enum(["draft", "scheduled", "published"], {
  message: "Le statut doit être 'draft', 'scheduled' ou 'published'",
});

/**
 * Schema Zod pour les métadonnées d'un article (admin)
 */
export const articleAdminMetadataSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  summary: z.string().min(1, { message: "Le résumé est requis" }),
  publishedAt: z.string().datetime({ message: "Date de publication invalide" }),
  status: articleStatusSchema,
  tags: z.array(z.string()).min(1, { message: "Au moins un tag est requis" }),
  image: z.string().optional(),
});

/**
 * Schema Zod pour la création/modification d'un article (admin)
 */
export const articleAdminPayloadSchema = articleAdminMetadataSchema.extend({
  slug: z.string().optional(),
  content: z.string().min(1, { message: "Le contenu est requis" }),
});

/**
 * Schema Zod pour la mise à jour d'un article avec ancien slug
 */
export const updateArticleSchema = articleAdminPayloadSchema.extend({
  slug: z.string().min(1, { message: "Le slug est requis" }),
  oldSlug: z.string().optional(),
});

/**
 * Schema Zod pour la suppression d'un article
 */
export const deleteArticleSchema = z.object({
  slug: z.string().min(1, { message: "Le slug est requis" }),
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type ArticleStatus = z.infer<typeof articleStatusSchema>;
export type ArticleAdminMetadata = z.infer<typeof articleAdminMetadataSchema>;
export type ArticleAdminPayload = z.infer<typeof articleAdminPayloadSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type DeleteArticle = z.infer<typeof deleteArticleSchema>;
