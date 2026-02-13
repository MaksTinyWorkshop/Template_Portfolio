import { z } from "zod";

const optionalPath = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value ?? undefined);

export const listAssetsQuerySchema = z.object({
  directory: optionalPath,
});

export const uploadAssetFormSchema = z.object({
  directory: optionalPath,
  overwrite: z
    .string()
    .optional()
    .nullable()
    .default("false")
    .transform((value) => value === "true"),
});

export const createAssetDirectorySchema = z.object({
  directory: optionalPath,
  name: z.string().min(1, "Le nom du dossier est requis").max(120, "Nom trop long"),
});

export const renameAssetSchema = z.object({
  path: z.string().min(1, "Le chemin est requis"),
  name: z.string().min(1, "Le nouveau nom est requis").max(255, "Nom trop long"),
});

export const deleteAssetQuerySchema = z.object({
  path: z.string().min(1, "Le chemin est requis"),
});
