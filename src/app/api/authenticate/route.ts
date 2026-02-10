import * as cookie from "cookie";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateAuthToken } from "@/utils/auth";
import { COOKIE_MAX_AGE_SECONDS } from "@/utils/auth-constants";

/**
 * Comparaison de strings à temps constant pour éviter les timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;
  const correctPassword = process.env.ADMIN_PASSWORD || process.env.PAGE_ACCESS_PASSWORD;

  if (!correctPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Comparaison à temps constant pour éviter timing attacks
  if (timingSafeEqual(password, correctPassword)) {
    // Générer un token signé sécurisé avec HMAC
    const token = await generateAuthToken();

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.headers.set(
      "Set-Cookie",
      cookie.serialize("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE_SECONDS,
        sameSite: "strict",
        path: "/",
      }),
    );

    return response;
  }

  return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });

  response.headers.set(
    "Set-Cookie",
    cookie.serialize("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire immédiatement
      sameSite: "strict",
      path: "/",
    }),
  );

  return response;
}
