import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as cookie from "cookie";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);

  const token = cookies.authToken;

  // Vérifier que le token existe et est valide
  if (token && (await verifyAuthToken(token))) {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
