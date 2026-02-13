import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/web/types";
import { revalidatePath } from "next/cache";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { setProjectStatus } from "@/lib/modules/projects";
import { setArticleStatus } from "@/lib/modules/articles";
import { publishContentSchema } from "@/lib/schemas/publish.schema";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }

  const body = await request.json();
  const validatedData = publishContentSchema.parse(body);
  const { slug, type } = validatedData;

  if (type === "project") {
    await setProjectStatus(slug, "published");
    revalidatePath("/work");
    revalidatePath(`/work/${slug}`);
  } else {
    await setArticleStatus(slug, "published");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Contenu publié avec succès",
    data: { slug, type },
  });
});
