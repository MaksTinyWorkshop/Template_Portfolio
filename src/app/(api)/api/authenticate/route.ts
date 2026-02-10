import * as cookie from "cookie";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateAuthToken } from "@/lib/utils/auth";
import { COOKIE_MAX_AGE_SECONDS } from "@/lib/utils/auth-constants";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { ZodError } from "zod";

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
  try {
    // Rate limiting : max 5 tentatives par IP toutes les 60 secondes
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const rateLimitResult = await checkRateLimit({
      key: `auth:${ip}`,
      maxRequests: 5,
      windowSeconds: 60
    });

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
          retryAfter
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000))
          }
        }
      );
    }

    // Parser et valider le body avec Zod
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { password } = validatedData;

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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Données invalides" },
        { status: 400 },
      );
    }
    throw error;
  }
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
