import { z } from "zod";

/**
 * Constantes de validation pour l'upload d'images
 */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MIN_QUALITY = 1;
export const MAX_QUALITY = 100;
export const DEFAULT_QUALITY = 80;

/**
 * Schema Zod pour le type d'upload
 */
export const uploadTypeSchema = z.enum(["project", "post", "avatar"], {
  message: "Le type doit être 'project', 'post' ou 'avatar'",
});

/**
 * Schema Zod pour les paramètres d'upload (FormData)
 * Note: La validation du fichier File lui-même se fait après extraction du FormData
 */
export const uploadParamsSchema = z.object({
  type: uploadTypeSchema,
  customName: z.string().optional().nullable(),
  includeTimestamp: z
    .string()
    .optional()
    .nullable()
    .default("true")
    .transform((val) => val !== "false"),
  quality: z
    .string()
    .optional()
    .nullable()
    .default(String(DEFAULT_QUALITY))
    .transform((val) => {
      if (!val) return DEFAULT_QUALITY;
      const parsed = Number.parseInt(val, 10);
      if (Number.isNaN(parsed)) return DEFAULT_QUALITY;
      return Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, parsed));
    }),
  previewOnly: z
    .string()
    .optional()
    .nullable()
    .default("false")
    .transform((val) => val === "true"),
});

/**
 * Schema Zod pour valider un fichier File
 */
export const fileValidationSchema = z.object({
  name: z.string(),
  type: z.enum(ALLOWED_MIME_TYPES, {
    message: "Format d'image non supporté (JPG, PNG, WebP, GIF uniquement)",
  }),
  size: z.number().max(MAX_FILE_SIZE, {
    message: "Fichier trop volumineux (5MB maximum)",
  }),
});

/**
 * Schema Zod pour les paramètres de suppression d'upload
 */
export const deleteUploadSchema = z.object({
  filename: z.string().min(1, { message: "Le nom de fichier est requis" }),
  type: uploadTypeSchema,
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type UploadType = z.infer<typeof uploadTypeSchema>;
export type UploadParams = z.infer<typeof uploadParamsSchema>;
export type FileValidation = z.infer<typeof fileValidationSchema>;
export type DeleteUpload = z.infer<typeof deleteUploadSchema>;
