import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { timingSafeEqual } from "@/lib/utils/timing-safe-equal";

const requireCronAuth = (request: NextRequest) => {
  const secret = env.CRON_SECRET;
  if (!secret) {
    throw new ApiError("CRON_SECRET manquant (configuration serveur)", 500);
  }

  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!timingSafeEqual(authorization, expected)) {
    throw new ApiError("Accès refusé", 403);
  }
};

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  requireCronAuth(request);

  const now = new Date();

  const [articles, projects] = await prisma.$transaction([
    prisma.article.updateMany({
      where: {
        status: "scheduled",
        publishAt: { lte: now },
      },
      data: { status: "published" },
    }),
    prisma.project.updateMany({
      where: {
        status: "scheduled",
        publishedAt: { lte: now },
      },
      data: { status: "published" },
    }),
  ]);

  revalidatePath("/blog");
  revalidatePath("/work");
  revalidatePath("/admin");

  if (
    env.NODE_ENV === "production" &&
    (articles.count > 0 || projects.count > 0)
  ) {
    console.log(
      `[publish-due] published articles=${articles.count} projects=${projects.count} at=${now.toISOString()}`,
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Publication différée exécutée",
    data: {
      articlesPublished: articles.count,
      projectsPublished: projects.count,
      executedAt: now.toISOString(),
    },
  });
});
