import { z } from "zod";

/**
 * Helper pour valider les URLs optionnelles
 * Accepte: URL valide OU chaîne vide
 */
const isRelativePath = (value: string) => /^(\.\/|\.\.\/|\/)/.test(value);

const optionalUrl = (errorMessage: string) =>
  z.string().refine(
    (val) => {
      if (!val || val === "") return true;
      if (isRelativePath(val)) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: errorMessage },
  );

/**
 * Schéma de validation pour les membres d'équipe
 */
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  role: z.string().min(1, "Le rôle est requis"),
  avatar: z.string().refine(
    (val) => {
      if (!val || val === "") return true;
      if (isRelativePath(val)) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL d'avatar invalide" },
  ),
  linkedIn: z.string().refine(
    (val) => {
      if (!val || val === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL LinkedIn invalide" },
  ),
});

/**
 * Schéma de validation pour un projet
 */
export const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Titre trop long"),
  summary: z
    .string()
    .min(1, "Le résumé est requis")
    .max(300, "Résumé trop long"),
  publishedAt: z.string().min(1, "La date de publication est requise"),
  status: z.enum(["draft", "scheduled", "published"]),
  typeProjectTag: z.array(z.string()).min(1, "Au moins un tag est requis"),
  featuredImage: optionalUrl("URL d'image invalide"),
  images: z.array(z.string()),
  team: z.array(teamMemberSchema),
  link: optionalUrl("URL du projet invalide"),
  repository: optionalUrl("URL du repository invalide"),
  content: z.string().min(1, "Le contenu est requis"),
});

/**
 * Schéma de validation pour un article
 */
export const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Titre trop long"),
  summary: z
    .string()
    .min(1, "Le résumé est requis")
    .max(300, "Résumé trop long"),
  publishedAt: z.string().min(1, "La date de publication est requise"),
  status: z.enum(["draft", "scheduled", "published"]),
  image: optionalUrl("URL d'image invalide"),
  tag: z.string().min(1, "Le tag est requis"),
  content: z.string().min(1, "Le contenu est requis"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type TeamMemberData = z.infer<typeof teamMemberSchema>;
