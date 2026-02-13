import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} caractères`)
    .optional()
    .transform((value) => (value && value.length ? value : undefined));

const optionalEmail = z
  .string()
  .trim()
  .email("Email invalide")
  .max(320, "Maximum 320 caractères")
  .optional()
  .transform((value) => (value && value.length ? value : undefined));

export const createPersonSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(80, "Maximum 80 caractères"),
  lastName: z.string().trim().min(1, "Le nom est requis").max(80, "Maximum 80 caractères"),
  pseudo: optionalTrimmedString(80),
  role: optionalTrimmedString(120),
  bio: optionalTrimmedString(600),
  email: optionalEmail,
  avatar: optionalTrimmedString(400),
  profileData: z.unknown().optional(),
});

export const updatePersonSchema = createPersonSchema.partial();

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
