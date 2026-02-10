import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createProjectAdmin,
  deleteProjectAdmin,
  listProjectsAdmin,
  updateProjectAdmin,
} from "@/lib/modules/projects";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import {
  projectAdminRequestSchema,
  updateProjectRequestSchema,
  deleteProjectSchema,
} from "@/lib/schemas/project.schema";
import { ZodError } from "zod";

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
    const projects = await listProjectsAdmin();
    return NextResponse.json<ApiResponse>({ success: true, data: projects });
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

    // Parser et valider le body avec Zod
    const body = await request.json();
    const validatedData = projectAdminRequestSchema.parse(body);
    const { metadata, content, slug } = validatedData;
    const payload = {
      ...metadata,
      content,
      slug,
    };

    const created = await createProjectAdmin(payload);

    revalidatePath("/work");
    revalidatePath(`/work/${created.slug}`);
    revalidatePath("/admin/projects");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Projet créé avec succès",
      data: { slug: created.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Zod POST /api/admin/projects:", error.issues);
      const message = error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 400 });
    }
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

    // Parser et valider le body avec Zod
    const body = await request.json();
    const validatedData = updateProjectRequestSchema.parse(body);
    const { metadata, content, slug, oldSlug } = validatedData;
    const payload = {
      ...metadata,
      content,
      slug,
    };

    const targetSlug = oldSlug ?? slug;
    const updated = await updateProjectAdmin(targetSlug, payload);

    revalidatePath("/work");
    revalidatePath(`/work/${updated.slug}`);
    revalidatePath("/admin/projects");
    revalidatePath("/admin");
    if (targetSlug !== updated.slug) {
      revalidatePath(`/work/${targetSlug}`);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Projet mis à jour avec succès",
      data: { slug: updated.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Zod PUT /api/admin/projects:", error.issues);
      const message = error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 400 });
    }
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

    // Parser et valider les paramètres avec Zod
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const validatedData = deleteProjectSchema.parse({ slug });

    await deleteProjectAdmin(validatedData.slug);

    // Revalider les pages des projets pour retirer le projet supprimé
    revalidatePath("/work");
    revalidatePath(`/work/${validatedData.slug}`);
    revalidatePath("/admin/projects");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Projet supprimé avec succès",
      data: { slug: validatedData.slug },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur DELETE /api/admin/projects:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
