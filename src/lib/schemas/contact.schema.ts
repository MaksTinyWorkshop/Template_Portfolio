import { z } from "zod";

/**
 * Constantes de validation pour le formulaire de contact
 */
export const CONTACT_NAME_MIN_LENGTH = 2;
export const CONTACT_SUBJECT_MIN_LENGTH = 3;
export const CONTACT_MESSAGE_MIN_LENGTH = 10;

/**
 * Sanitize HTML pour prévenir XSS (defense-in-depth)
 * Supprime toutes les balises HTML et les attributs dangereux
 */
function sanitizeHTML(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Supprime toutes les balises HTML
    .replace(/javascript:/gi, "") // Supprime les protocoles javascript:
    .replace(/on\w+\s*=/gi, ""); // Supprime les attributs d'événements (onclick, onerror, etc.)
}

/**
 * Schema Zod pour le formulaire de contact
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_NAME_MIN_LENGTH, { message: "Le nom est requis (minimum 2 caractères)" })
    .transform(sanitizeHTML),
  email: z.string().trim().email({ message: "Email invalide" }),
  subject: z
    .string()
    .trim()
    .min(CONTACT_SUBJECT_MIN_LENGTH, {
      message: "Le sujet est trop court (minimum 3 caractères)",
    })
    .transform(sanitizeHTML)
    .optional(),
  message: z
    .string()
    .trim()
    .min(CONTACT_MESSAGE_MIN_LENGTH, {
      message: "Le message est trop court (minimum 10 caractères)",
    })
    .transform(sanitizeHTML),
});

/**
 * Type TypeScript inféré depuis le schéma Zod
 */
export type ContactPayload = z.infer<typeof contactSchema>;
