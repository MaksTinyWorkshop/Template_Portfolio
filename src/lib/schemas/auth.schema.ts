import { z } from "zod";

/**
 * Schema Zod pour l'authentification
 */
export const loginSchema = z.object({
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

/**
 * Type TypeScript inféré depuis le schéma Zod
 */
export type LoginPayload = z.infer<typeof loginSchema>;
