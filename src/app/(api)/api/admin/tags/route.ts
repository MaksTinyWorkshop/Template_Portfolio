import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { createTagSchema } from "@/lib/schemas/tag.schema";
import { createTagAdmin, listTagsAdmin } from "@/lib/modules/tags";

/**
 * GET - Liste tous les tags
 */
const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(async () => {
  await requireAuth();
  const tags = await listTagsAdmin();
  return NextResponse.json<ApiResponse>({ success: true, data: tags });
});

/**
 * POST - Crée un nouveau tag
 */
export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const body = await request.json();
  const validatedData = createTagSchema.parse(body);
  const created = await createTagAdmin(validatedData);

  revalidatePath("/admin/tags");
  revalidatePath("/admin");

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Tag créé avec succès",
    data: { id: created.id, slug: created.slug },
  });
});
