import path from "node:path";
import { fileValidationSchema, uploadParamsSchema } from "@/lib/schemas/upload.schema";
import { checkAuthAPI } from "@/lib/utils/auth";
import { getAssetDirectoryFromType } from "@/lib/modules/assets/constants";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import type { ApiResponse } from "@/web/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { uploadAssetAdmin } from "@/lib/modules/assets";
import { prisma } from "@/lib/prisma";
import { ensureMediaRecord } from "@/lib/utils/content-normalizers";

/**
 * Génère un nom de fichier sécurisé
 * @param customName - Nom personnalisé fourni par l'utilisateur (optionnel)
 * @param originalName - Nom original du fichier (fallback)
 * @param addTimestamp - Ajouter timestamp pour unicité
 */
function generateFilename(
  customName: string | null,
  originalName: string,
  addTimestamp = true,
  extensionOverride?: string,
): string {
  const extension = path.extname(originalName);
  const baseName = customName || path.basename(originalName, extension);

  // Sanitize: garder seulement alphanumériques, tirets et underscores
  const sanitized = baseName
    .toLowerCase()
    .normalize("NFD")
    // Retirer les accents
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9_-]/g, "-") // Remplacer caractères spéciaux par tirets
    .replace(/-+/g, "-") // Éviter tirets multiples
    .replace(/^-|-$/g, ""); // Retirer tirets début/fin

  const finalExtension = extensionOverride || extension;

  if (addTimestamp) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `${sanitized}-${timestamp}-${randomStr}${finalExtension}`;
  }

  return `${sanitized}${finalExtension}`;
}

/**
 * POST - Upload une image
 */
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }

  // Parser et valider le form-data avec Zod
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ApiError("Aucun fichier fourni", 400);
  }

  // Valider les paramètres du formulaire
  const params = uploadParamsSchema.parse({
    type: formData.get("type"),
    customName: formData.get("customName"),
    includeTimestamp: formData.get("includeTimestamp"),
    quality: formData.get("quality"),
    previewOnly: formData.get("previewOnly"),
  });

  // Valider le fichier (type MIME et taille)
  fileValidationSchema.parse({
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const { type, customName, includeTimestamp, quality, previewOnly } = params;

  // Déterminer le sous-dossier selon le type
  const subFolder = getAssetDirectoryFromType(type);

  // Générer un nom de fichier (personnalisé ou auto-généré)
  const filename = generateFilename(customName ?? null, file.name, includeTimestamp, ".webp");

  // Convertir le fichier en buffer (et éventuellement sauvegarder)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const transformed = await sharp(buffer).webp({ quality }).toBuffer();

  // Retourner l'URL relative via le proxy (meilleure cohérence en prod après upload).
  const imageUrl = `/api/assets/${subFolder}/${filename}`;

  // Preview only: ne persiste rien (ni fichier, ni DB).
  if (previewOnly) {
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Prévisualisation générée",
      data: {
        mediaId: null,
        url: null,
        filename,
        size: file.size,
        transformedSize: transformed.length,
        quality,
        type: file.type,
      },
    });
  }

  // Persistance: le stockage passe par le module assets (1 seule pipeline).
  // On réutilise ensuite l'URL canonique pour assurer une seule source de vérité en DB.
  // `sharp().toBuffer()` returns a Node.js Buffer which is typed as `ArrayBufferLike`.
  // Convert to a plain Uint8Array to satisfy the DOM `BlobPart` typing used by `File`.
  const webpFile = new File([new Uint8Array(transformed)], filename, { type: "image/webp" });

  await uploadAssetAdmin({
    directory: subFolder,
    file: webpFile,
    overwrite: false,
  });

  const media = await ensureMediaRecord(prisma, imageUrl, {
    kind: "image",
    storageProvider: "local",
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Image uploadée avec succès",
    data: {
      mediaId: media?.id ?? null,
      url: imageUrl,
      filename,
      size: file.size,
      transformedSize: transformed.length,
      quality,
      type: file.type,
    },
  });
});
