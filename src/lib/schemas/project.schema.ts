import { z } from "zod";

/**
 * Schema Zod pour le statut d'un projet
 */
export const projectStatusSchema = z.enum(["draft", "scheduled", "published"], {
  message: "Le statut doit être 'draft', 'scheduled' ou 'published'",
});

/**
 * Schema Zod pour un membre d'équipe
 */
export const teamMemberInputSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  role: z.string().min(1, { message: "Le rôle est requis" }),
  avatar: z.string().nullable().optional(),
  linkedIn: z.string().url({ message: "URL LinkedIn invalide" }).nullable().optional(),
  email: z.string().email({ message: "Email invalide" }).nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  pseudo: z.string().nullable().optional(),
  socials: z.array(
    z.object({
      name: z.string().min(1, { message: "Le nom du réseau social est requis" }),
      url: z.string().url({ message: "URL invalide" }).nullable().optional(),
    })
  ).optional(),
  personId: z.string().uuid({ message: "L'ID de la personne doit être un UUID valide" }).optional(),
  isSiteOwner: z.boolean().optional(),
});

/**
 * Schema Zod pour les métadonnées d'un projet (admin)
 */
export const projectAdminMetadataSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  summary: z.string().min(1, { message: "Le résumé est requis" }),
  publishedAt: z.string().datetime({ message: "Date de publication invalide" }),
  status: projectStatusSchema,
  typeProjectTag: z.array(z.string()).min(1, { message: "Au moins un tag est requis" }),
  featuredImage: z.string().optional(),
  images: z.array(z.string()).default([]),
  team: z.array(teamMemberInputSchema).default([]),
  link: z.string().url({ message: "URL du lien invalide" }).optional().or(z.literal("")),
  repository: z.string().url({ message: "URL du repository invalide" }).optional().or(z.literal("")),
});

/**
 * Payload attendu par les endpoints admin
 */
const projectAdminRequestBaseSchema = z.object({
  metadata: projectAdminMetadataSchema,
  content: z.string().min(1, { message: "Le contenu est requis" }),
});

/**
 * Schema Zod pour la création d'un projet (admin)
 */
export const projectAdminRequestSchema = projectAdminRequestBaseSchema.extend({
  slug: z.string().optional(),
});

/**
 * Schema Zod pour la mise à jour d'un projet avec ancien slug
 */
export const updateProjectRequestSchema = projectAdminRequestSchema.extend({
  slug: z.string().min(1, { message: "Le slug est requis" }),
  oldSlug: z.string().optional(),
});

/**
 * Schema Zod pour la suppression d'un projet
 */
export const deleteProjectSchema = z.object({
  slug: z.string().min(1, { message: "Le slug est requis" }),
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberInputSchema>;
export type ProjectAdminMetadata = z.infer<typeof projectAdminMetadataSchema>;
export type CreateProject = z.infer<typeof projectAdminRequestSchema>;
export type UpdateProject = z.infer<typeof updateProjectRequestSchema>;
export type DeleteProject = z.infer<typeof deleteProjectSchema>;
