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
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import {
  projectAdminRequestSchema,
  updateProjectRequestSchema,
  deleteProjectSchema,
} from "@/lib/schemas/project.schema";

/**
 * GET - Liste tous les projets (y compris les drafts)
 */
const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(async (_request: NextRequest) => {
  await requireAuth();
  const projects = await listProjectsAdmin();
  return NextResponse.json<ApiResponse>({ success: true, data: projects });
});

/**
 * POST - Créer un nouveau projet
 */
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
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
});

/**
 * PUT - Mettre à jour un projet existant
 */
export const PUT = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
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
});

/**
 * DELETE - Supprimer un projet
 */
export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const validatedData = deleteProjectSchema.parse({ slug });

  await deleteProjectAdmin(validatedData.slug);

  revalidatePath("/work");
  revalidatePath(`/work/${validatedData.slug}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Projet supprimé avec succès",
    data: { slug: validatedData.slug },
  });
});
