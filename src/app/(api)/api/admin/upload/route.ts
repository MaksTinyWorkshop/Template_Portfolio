import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import {
  uploadParamsSchema,
  fileValidationSchema,
  deleteUploadSchema,
  type ALLOWED_MIME_TYPES,
} from "@/lib/schemas/upload.schema";
import { ZodError } from "zod";

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
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
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
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Parser et valider le form-data avec Zod
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 },
      );
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
      type: file.type as (typeof ALLOWED_MIME_TYPES)[number],
      size: file.size,
    });

    const { type, customName, includeTimestamp, quality, previewOnly } = params;

    // Déterminer le sous-dossier selon le type
    const subFolder = type === "project" ? "projects" : type === "post" ? "articles" : "avatars";

    // Chemin de destination
    const publicDir = path.join(process.cwd(), "public", "images", subFolder);

    // Créer le dossier s'il n'existe pas
    await mkdir(publicDir, { recursive: true });

    // Générer un nom de fichier (personnalisé ou auto-généré)
    const filename = generateFilename(customName ?? null, file.name, includeTimestamp, ".avif");
    const filepath = path.join(publicDir, filename);

    // Convertir le fichier en buffer (et éventuellement sauvegarder)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const transformed = await sharp(buffer).avif({ quality }).toBuffer();
    if (!previewOnly) {
      await writeFile(filepath, transformed);
    }

    // Retourner l'URL relative
    const imageUrl = `/images/${subFolder}/${filename}`;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: previewOnly ? "Prévisualisation générée" : "Image uploadée avec succès",
      data: {
        url: previewOnly ? null : imageUrl,
        filename,
        size: file.size,
        transformedSize: transformed.length,
        quality,
        type: file.type,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur POST /api/admin/upload:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur lors de l'upload" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Parser et valider les paramètres avec Zod
    const { searchParams } = new URL(request.url);
    const validatedData = deleteUploadSchema.parse({
      filename: searchParams.get("filename"),
      type: searchParams.get("type"),
    });

    const { filename, type } = validatedData;

    // Sécurité: vérifier que le filename ne contient pas de path traversal
    if (path.basename(filename) !== filename) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Nom de fichier invalide" },
        { status: 400 },
      );
    }

    const subFolder = type === "project" ? "projects" : type === "post" ? "articles" : "avatars";
    const filePath = path.join(process.cwd(), "public", "images", subFolder, filename);

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Image supprimée",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur DELETE /api/admin/upload:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
