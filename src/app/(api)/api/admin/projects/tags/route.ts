import { listProjectTagNames } from "@/lib/modules/projects";
import { checkAuthAPI } from "@/lib/utils/auth";
import type { ApiResponse } from "@/web/types";
import { NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { ApiError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

export const GET = withApiErrorHandling(async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }

  const tags = await listProjectTagNames();
  return NextResponse.json<ApiResponse>(
    { success: true, data: tags },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
});
