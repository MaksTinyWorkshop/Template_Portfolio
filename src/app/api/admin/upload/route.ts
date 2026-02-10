import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { ApiResponse } from "@/types/admin.types";
import { checkAuthAPI } from "@/utils/auth";

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
    .replace(/[^a-z0-9_-]/g, "-")     // Remplacer caractères spéciaux par tirets
    .replace(/-+/g, "-")              // Éviter tirets multiples
    .replace(/^-|-$/g, "");           // Retirer tirets début/fin

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

    // Parser le form-data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "project" | "post" | "avatar" | null;
    const customName = formData.get("customName") as string | null; // Nom personnalisé optionnel
    const includeTimestampRaw = formData.get("includeTimestamp") as string | null;
    const includeTimestamp = includeTimestampRaw !== "false";
    const qualityRaw = formData.get("quality") as string | null;
    const requestedQuality = Number.parseInt(qualityRaw ?? "", 10);
    const quality = Number.isNaN(requestedQuality)
      ? 80
      : Math.min(100, Math.max(1, requestedQuality));
    const previewOnly = formData.get("previewOnly") === "true";

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    if (!type || !["project", "post", "avatar"].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Type invalide (project, post ou avatar)" },
        { status: 400 },
      );
    }

    // Vérifier le type MIME
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Format d'image non supporté (JPG, PNG, WebP, GIF uniquement)" },
        { status: 400 },
      );
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Fichier trop volumineux (5MB maximum)" },
        { status: 400 },
      );
    }

    // Déterminer le sous-dossier selon le type
    const subFolder = type === "project" ? "projects" : type === "post" ? "articles" : "avatars";

    // Chemin de destination
    const publicDir = path.join(process.cwd(), "public", "images", subFolder);

    // Créer le dossier s'il n'existe pas
    await mkdir(publicDir, { recursive: true });

    // Générer un nom de fichier (personnalisé ou auto-généré)
    const filename = generateFilename(customName, file.name, includeTimestamp, ".avif");
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
      return NextResponse.json<ApiResponse>({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const type = searchParams.get("type");

    if (!filename || !type || !["project", "post", "avatar"].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Paramètres invalides" },
        { status: 400 },
      );
    }

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
    console.error("Erreur DELETE /api/admin/upload:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
