import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import {
  createArticleAdmin,
  deleteArticleAdmin,
  listArticlesAdmin,
  updateArticleAdmin,
  type ArticleAdminPayload,
  type ArticleAdminMetadata,
} from "@/lib/modules/articles";
import { articleAdminPayloadSchema, updateArticleSchema, deleteArticleSchema } from "@/lib/schemas/article.schema";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    const posts = await listArticlesAdmin();
    return NextResponse.json<ApiResponse>({ success: true, data: posts });
  } catch (error) {
    console.error("Erreur GET /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Parser et valider le body avec Zod
    const body = await request.json();
    const validatedData = articleAdminPayloadSchema.parse(body);

    const created = await createArticleAdmin(validatedData);

    revalidatePath("/blog");
    revalidatePath(`/blog/${created.slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Article créé avec succès",
      data: { slug: created.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur POST /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthAPI();
    if (!isAuthenticated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Parser et valider le body avec Zod
    const body = await request.json();
    const validatedData = updateArticleSchema.parse(body);
    const { slug, oldSlug, ...payload } = validatedData;

    const targetSlug = oldSlug ?? slug;
    const updated = await updateArticleAdmin(targetSlug, { ...payload, slug });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/admin");
    if (targetSlug !== updated.slug) {
      revalidatePath(`/blog/${targetSlug}`);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Article mis à jour avec succès",
      data: { slug: updated.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur PUT /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
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
    const slug = searchParams.get("slug");
    const validatedData = deleteArticleSchema.parse({ slug });

    await deleteArticleAdmin(validatedData.slug);

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Article supprimé avec succès",
      data: { slug: validatedData.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur DELETE /api/admin/posts:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
