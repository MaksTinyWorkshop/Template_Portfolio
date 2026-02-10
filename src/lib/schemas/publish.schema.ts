import { z } from "zod";

/**
 * Schema Zod pour le type de contenu à publier
 */
export const contentTypeSchema = z.enum(["project", "post"], {
  message: "Le type doit être 'project' ou 'post'",
});

/**
 * Schema Zod pour la publication de contenu
 */
export const publishContentSchema = z.object({
  slug: z.string().min(1, { message: "Le slug est requis" }),
  type: contentTypeSchema,
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type ContentType = z.infer<typeof contentTypeSchema>;
export type PublishContent = z.infer<typeof publishContentSchema>;
