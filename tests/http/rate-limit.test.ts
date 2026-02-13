import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const buildJsonRequest = (
  url: string,
  method: "POST" | "DELETE",
  body: Record<string, unknown>,
  headers?: Record<string, string>,
) =>
  new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });

describe("Rate limiting headers (routes)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unmock("@/lib/utils/rate-limit");
  });

  it("POST /api/contact renvoie 429 avec headers standard + retryAfter", async () => {
    const now = Date.now();
    const resetAt = now + 90_000; // 90s
    const checkRateLimitMock = vi.fn().mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt,
    });

    vi.doMock("@/lib/utils/rate-limit", () => ({ checkRateLimit: checkRateLimitMock }));

    const { POST } = await import("@/app/(api)/api/contact/route");
    const response = await POST(
      buildJsonRequest(
        "http://localhost/api/contact",
        "POST",
        {
          name: "Test Contact",
          email: "test@example.com",
          subject: "Hello",
          message: "Un message avec suffisamment de caractères.",
        },
        { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      ),
    );

    expect(checkRateLimitMock).toHaveBeenCalledWith({
      key: "contact:1.2.3.4",
      maxRequests: 3,
      windowSeconds: 300,
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("90");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("3");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBe(String(Math.floor(resetAt / 1000)));

    const payload = await response.json();
    expect(payload).toMatchObject({
      error: expect.stringContaining("Trop de messages"),
      retryAfter: 90,
    });
  });

  it("POST /api/authenticate renvoie 429 avec headers standard + retryAfter", async () => {
    const now = Date.now();
    const resetAt = now + 15_000; // 15s
    const checkRateLimitMock = vi.fn().mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt,
    });

    vi.doMock("@/lib/utils/rate-limit", () => ({ checkRateLimit: checkRateLimitMock }));

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(
      buildJsonRequest(
        "http://localhost/api/authenticate",
        "POST",
        { password: "wrong" },
        { "x-real-ip": "9.9.9.9" },
      ),
    );

    expect(checkRateLimitMock).toHaveBeenCalledWith({
      key: "auth:9.9.9.9",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("15");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBe(String(Math.floor(resetAt / 1000)));

    const payload = await response.json();
    expect(payload).toMatchObject({
      error: expect.stringContaining("Trop de tentatives"),
      retryAfter: 15,
    });
  });
});
