import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createMDXFile,
  updateMDXFile,
  deleteMDXFile,
  listMDXFiles,
  generateSlug,
} from "@/utils/mdx-admin";
import { ProjectMetadata, ApiResponse } from "@/types/admin.types";
import { checkAuthAPI } from "@/utils/auth";

/**
 * GET - Liste tous les projets (y compris les drafts)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer la liste des projets
    const result = await listMDXFiles("project");

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Erreur GET /api/admin/projects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * POST - Créer un nouveau projet
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
    const { metadata, content } = body as {
      metadata: ProjectMetadata;
      content: string;
    };

    // Validation basique
    if (!metadata.title || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Titre et contenu requis" },
        { status: 400 },
      );
    }

    // Générer le slug si non fourni
    const slug = metadata.slug || generateSlug(metadata.title);

    // Définir le status par défaut
    if (!metadata.status) {
      metadata.status = "draft";
    }

    // Créer le fichier MDX
    const result = await createMDXFile("project", slug, metadata, content);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages des projets pour afficher le nouveau projet
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Projet créé avec succès",
        data: { slug, filePath: result.filePath },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur POST /api/admin/projects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * PUT - Mettre à jour un projet existant
 */
export async function PUT(request: NextRequest) {
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
    const { slug, oldSlug, metadata, content } = body as {
      slug: string;
      oldSlug?: string;
      metadata: ProjectMetadata;
      content: string;
    };

    // Validation
    if (!slug || !metadata.title || !content) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Slug, titre et contenu requis" },
        { status: 400 },
      );
    }

    // Mettre à jour le fichier
    const result = await updateMDXFile("project", slug, metadata, content, oldSlug);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages des projets
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);
    if (oldSlug && oldSlug !== slug) {
      revalidatePath(`/work/${oldSlug}`); // Revalider l'ancien slug aussi
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: result.message,
      data: { slug, filePath: result.filePath },
    });
  } catch (error) {
    console.error("Erreur PUT /api/admin/projects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Supprimer un projet
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le slug depuis les query params
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Slug requis" },
        { status: 400 },
      );
    }

    // Supprimer le fichier
    const result = await deleteMDXFile("project", slug);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages des projets pour retirer le projet supprimé
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Projet supprimé avec succès",
      data: { slug, filePath: result.filePath },
    });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/projects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
