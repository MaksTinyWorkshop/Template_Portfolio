import { respondSuccess } from "@/lib/http/response";

export async function GET() {
  return respondSuccess({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
