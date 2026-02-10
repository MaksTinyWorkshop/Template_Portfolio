import { NextResponse } from "next/server";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { listProjectTagNames } from "@/lib/modules/projects";

export async function GET() {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  const tags = await listProjectTagNames();
  return NextResponse.json<ApiResponse>({ success: true, data: tags });
}
