import { NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/lib/contracts/openapi";
import { checkAuthAPI } from "@/lib/utils/auth";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { ApiError } from "@/lib/http/errors";

export const GET = withApiErrorHandling(async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }

  const document = await buildOpenApiDocument();
  return NextResponse.json(document);
});
