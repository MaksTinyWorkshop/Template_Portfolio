import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createMDXFile,
  updateMDXFile,
  deleteMDXFile,
  listMDXFiles,
  generateSlug,
} from "@/utils/mdx-admin";
import { PostMetadata, ApiResponse } from "@/types/admin.types";
import { checkAuthAPI } from "@/utils/auth";

/**
 * GET - Liste tous les articles (y compris les drafts)
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

    // Récupérer la liste des articles
    const result = await listMDXFiles("post");

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
    console.error("Erreur GET /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * POST - Créer un nouvel article
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
      metadata: PostMetadata;
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
    const result = await createMDXFile("post", slug, metadata, content);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages du blog pour afficher le nouvel article
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Article créé avec succès",
        data: { slug, filePath: result.filePath },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur POST /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * PUT - Mettre à jour un article existant
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
      metadata: PostMetadata;
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
    const result = await updateMDXFile("post", slug, metadata, content, oldSlug);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages du blog
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    if (oldSlug && oldSlug !== slug) {
      revalidatePath(`/blog/${oldSlug}`); // Revalider l'ancien slug aussi
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: result.message,
      data: { slug, filePath: result.filePath },
    });
  } catch (error) {
    console.error("Erreur PUT /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Supprimer un article
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
    const result = await deleteMDXFile("post", slug);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    // Revalider les pages du blog pour retirer l'article supprimé
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Article supprimé avec succès",
      data: { slug, filePath: result.filePath },
    });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
