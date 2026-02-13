import { z } from "zod";

/**
 * Schema pour la création d'un tag
 */
export const createTagSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  category: z.enum(["article", "project", "global"], { message: "Catégorie invalide" }),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur doit être au format #RRGGBB")
    .optional()
    .default("#3B82F6"),
});

/**
 * Schema pour la mise à jour (body uniquement)
 */
export const updateTagBodySchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagBodySchema>;
