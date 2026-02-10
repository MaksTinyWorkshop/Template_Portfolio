import { z } from "zod";

/**
 * Schema Zod pour le statut de disponibilité
 */
export const availabilityStatusSchema = z.enum(["available", "soon", "unavailable"], {
  message: "Le statut doit être 'available', 'soon' ou 'unavailable'",
});

/**
 * Schema Zod pour la création d'un log de disponibilité
 */
export const createAvailabilityLogSchema = z.object({
  personId: z.string().uuid({ message: "L'ID de la personne doit être un UUID valide" }),
  status: availabilityStatusSchema,
});

/**
 * Schema Zod pour la mise à jour de disponibilité (depuis le frontend)
 */
export const updateAvailabilitySchema = z.object({
  status: availabilityStatusSchema,
});

/**
 * Schema Zod pour la réponse de disponibilité
 */
export const availabilityResponseSchema = z.object({
  status: availabilityStatusSchema,
  lastUpdated: z.string().datetime(),
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
export type CreateAvailabilityLog = z.infer<typeof createAvailabilityLogSchema>;
export type UpdateAvailability = z.infer<typeof updateAvailabilitySchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
