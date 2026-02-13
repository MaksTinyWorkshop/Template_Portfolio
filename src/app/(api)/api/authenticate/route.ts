import * as cookie from "cookie";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateAuthToken } from "@/lib/utils/auth";
import { COOKIE_MAX_AGE_SECONDS } from "@/lib/utils/auth-constants";
import { timingSafeEqual } from "@/lib/utils/timing-safe-equal";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResult = await checkRateLimit({
    key: `auth:${ip}`,
    maxRequests: 5,
    windowSeconds: 60,
  });

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
        },
      },
    );
  }

  const body = await request.json();
  const validatedData = loginSchema.parse(body);
  const { password } = validatedData;

  const correctPassword = process.env.ADMIN_PASSWORD || process.env.PAGE_ACCESS_PASSWORD;
  if (!correctPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    throw new ApiError("Internal server error", 500);
  }

  if (!timingSafeEqual(password, correctPassword)) {
    throw new ApiError("Incorrect password", 401);
  }

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
});

export const DELETE = withApiErrorHandling(async () => {
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
});
