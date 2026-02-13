"use server";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { respondSuccess } from "@/lib/http/response";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { handleContactRequest } from "@/lib/modules/person";
import { contactSchema } from "@/lib/schemas/contact.schema";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const handlePostContact = async (request: NextRequest) => {
  // Rate limiting : max 3 messages par IP toutes les 5 minutes
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResult = await checkRateLimit({
    key: `contact:${ip}`,
    maxRequests: 3,
    windowSeconds: 300, // 5 minutes
  });

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Trop de messages envoyés. Veuillez patienter avant de réessayer.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
        },
      },
    );
  }

  const body = await request.json();
  const validatedData = contactSchema.parse(body);
  await handleContactRequest(validatedData);

  return respondSuccess({ status: "queued" }, 201);
};

export const POST = withApiErrorHandling(handlePostContact);
