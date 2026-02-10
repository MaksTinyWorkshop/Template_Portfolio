import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateMDXStatus, readMDXFile, CONTENT_PATHS } from "@/utils/mdx-admin";
import { commitAndPushViaAPI, generateCommitMessage } from "@/utils/git-github";
import type { ApiResponse } from "@/types/admin.types";
import { revalidatePath } from "next/cache";
import path from "node:path";
import { checkAuthAPI } from "@/utils/auth";

/**
 * POST - Publier un contenu (mettre le status à "published" et commit Git)
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

    // Parser le body
    const body = await request.json();
    const {
      slug,
      type,
      commitMessage: customCommitMessage,
    } = body as {
      slug: string;
      type: "project" | "post";
      commitMessage?: string;
    };

    // Validation
    if (!slug || !type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Slug et type requis" },
        { status: 400 },
      );
    }

    if (!["project", "post"].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Type invalide (project ou post)" },
        { status: 400 },
      );
    }

    // Lire le fichier pour obtenir le titre (pour le message de commit)
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;
    const filePath = path.join(dirPath, `${slug}.mdx`);
    const fileResult = await readMDXFile(filePath);

    if (!fileResult.success || !fileResult.data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Fichier introuvable" },
        { status: 404 },
      );
    }

    const { title } = fileResult.data.metadata;

    // Sauvegarder l'ancien status pour rollback potentiel
    const oldStatus = fileResult.data.metadata.status as "draft" | "scheduled" | "published";

    // Mettre à jour le status à "published"
    const statusResult = await updateMDXStatus(type, slug, "published");

    if (!statusResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: statusResult.error },
        { status: 500 },
      );
    }

    // Vérifier que filePath existe avant de continuer
    if (!statusResult.filePath) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Erreur: chemin de fichier manquant" },
        { status: 500 },
      );
    }

    // Générer le message de commit
    const commitMessage = customCommitMessage || generateCommitMessage("publish", type, title);

    // Commit et push vers GitHub via API
    const gitResult = await commitAndPushViaAPI(statusResult.filePath, commitMessage);

    if (!gitResult.success) {
      // ROLLBACK: Restaurer l'ancien status en cas d'échec Git
      console.error("Échec Git, rollback du status...");
      const rollbackResult = await updateMDXStatus(type, slug, oldStatus);

      if (!rollbackResult.success) {
        console.error("Échec du rollback:", rollbackResult.error);
      }

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Échec de la publication Git: ${gitResult.error}. Le status a été restauré à "${oldStatus}".`,
        },
        { status: 500 },
      );
    }

    // Revalider les pages concernées pour Next.js
    try {
      if (type === "project") {
        revalidatePath("/work");
        revalidatePath(`/work/${slug}`);
      } else {
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);
      }
    } catch (revalidateError) {
      console.error("Erreur revalidation:", revalidateError);
      // Ne pas bloquer la publication si la revalidation échoue
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Contenu publié avec succès et poussé vers Git",
      data: {
        slug,
        type,
        filePath: statusResult.filePath,
        gitMessage: gitResult.message,
      },
    });
  } catch (error) {
    console.error("Erreur POST /api/admin/publish:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
