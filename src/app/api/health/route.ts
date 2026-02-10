import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Used by Docker healthcheck and monitoring systems
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 },
  );
}
