import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { updateTagBodySchema } from "@/lib/schemas/tag.schema";
import { deleteTagAdmin, getTagForAdmin, updateTagAdmin } from "@/lib/modules/tags";

/**
 * GET - Récupère un tag par slug
 */
const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(
  async (_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    await requireAuth();
    const { slug } = await params;
    const tag = await getTagForAdmin(slug);
    return NextResponse.json<ApiResponse>({ success: true, data: tag });
  },
);

/**
 * PUT - Met à jour un tag
 */
export const PUT = withApiErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    await requireAuth();
    const { slug } = await params;
    const body = await request.json();
    const updateData = updateTagBodySchema.parse(body);
    const updated = await updateTagAdmin(slug, updateData);

    revalidatePath("/admin/tags");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Tag mis à jour avec succès",
      data: { id: updated.id, slug: updated.slug },
    });
  },
);

/**
 * DELETE - Supprime un tag (avec cascade sur les relations)
 */
export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    await requireAuth();
    const { slug } = await params;
    await deleteTagAdmin(slug);

    revalidatePath("/admin/tags");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Tag supprimé avec succès",
      data: { slug },
    });
  },
);
