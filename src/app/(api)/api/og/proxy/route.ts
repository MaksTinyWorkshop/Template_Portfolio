import { type NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { ApiError } from "@/lib/http/errors";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  // Get the URL parameter
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    throw new ApiError("Missing URL parameter", 400);
  }

  // Fetch the image
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
    },
  });

  if (!response.ok) {
    throw new ApiError(`Failed to fetch image: ${response.status}`, response.status);
  }

  // Get the image data
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const imageData = await response.arrayBuffer();

  // Return the image with appropriate headers
  return new NextResponse(imageData, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});
