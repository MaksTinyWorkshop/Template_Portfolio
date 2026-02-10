import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/web/types";
import { revalidatePath } from "next/cache";
import { checkAuthAPI } from "@/lib/utils/auth";
import { setProjectStatus } from "@/lib/modules/projects";
import { setArticleStatus } from "@/lib/modules/articles";
import { publishContentSchema } from "@/lib/schemas/publish.schema";
import { ZodError } from "zod";

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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }
    console.error("Erreur POST /api/admin/publish:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
