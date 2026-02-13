import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import {
  createArticleAdmin,
  deleteArticleAdmin,
  listArticlesAdmin,
  updateArticleAdmin,
} from "@/lib/modules/articles";
import {
  articleAdminRequestSchema,
  updateArticleRequestSchema,
  deleteArticleSchema,
} from "@/lib/schemas/article.schema";

const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(async (_request: NextRequest) => {
  await requireAuth();
  const posts = await listArticlesAdmin();
  return NextResponse.json<ApiResponse>({ success: true, data: posts });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();

  // Parser et valider le body avec Zod
  const body = await request.json();
  const validatedData = articleAdminRequestSchema.parse(body);
  const { metadata, content, slug } = validatedData;
  const payload = {
    ...metadata,
    content,
    slug,
  };

  const created = await createArticleAdmin(payload);

  revalidatePath("/blog");
  revalidatePath(`/blog/${created.slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin");

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Article créé avec succès",
    data: { slug: created.slug },
  });
});

export const PUT = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();

  // Parser et valider le body avec Zod
  const body = await request.json();
  const validatedData = updateArticleRequestSchema.parse(body);
  const { metadata, content, slug, oldSlug } = validatedData;
  const payload = {
    ...metadata,
    content,
    slug,
  };

  const targetSlug = oldSlug ?? slug;
  const updated = await updateArticleAdmin(targetSlug, payload);

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
});

export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();

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
});
