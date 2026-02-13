import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const checkRateLimitMock = vi.fn();
const generateAuthTokenMock = vi.fn();

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/utils/auth", () => ({
  generateAuthToken: generateAuthTokenMock,
}));

const buildRequest = (body: Record<string, unknown>, headers?: Record<string, string>) =>
  new NextRequest("http://localhost/api/authenticate", {
    method: "POST",
    headers: { "content-type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });

describe("POST/DELETE /api/authenticate", () => {
  beforeEach(() => {
    vi.resetModules();
    checkRateLimitMock.mockReset();
    generateAuthTokenMock.mockReset();
    process.env.NODE_ENV = "test";
    process.env.ADMIN_PASSWORD = "super-secret";
    delete process.env.PAGE_ACCESS_PASSWORD;
  });

  it("retourne 200 et set le cookie auth quand le mot de passe est correct", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });
    generateAuthTokenMock.mockResolvedValueOnce("signed-token");

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(
      buildRequest({ password: "super-secret" }, { "x-forwarded-for": "1.2.3.4, 5.6.7.8" }),
    );

    expect(response.status).toBe(200);
    expect(checkRateLimitMock).toHaveBeenCalledWith({
      key: "auth:1.2.3.4",
      maxRequests: 5,
      windowSeconds: 60,
    });
    expect(generateAuthTokenMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ success: true });

    const cookie = response.headers.get("Set-Cookie");
    expect(cookie).toContain("authToken=signed-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
  });

  it("retourne 401 quand le mot de passe est incorrect", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(buildRequest({ password: "wrong-password" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: "Incorrect password",
    });
  });

  it("retourne 400 quand le payload est invalide", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(buildRequest({}));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Données invalides");
    expect(body.details).toBeUndefined();
  });

  it("retourne 500 quand aucun mot de passe admin n'est configuré", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });
    delete process.env.ADMIN_PASSWORD;
    delete process.env.PAGE_ACCESS_PASSWORD;

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(buildRequest({ password: "super-secret" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({
      success: false,
      error: "Internal server error",
    });
  });

  it("retourne 429 quand le rate-limit est atteint (x-real-ip)", async () => {
    const resetAt = Date.now() + 15_000;
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt,
    });

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    const response = await POST(
      buildRequest({ password: "wrong-password" }, { "x-real-ip": "9.9.9.9" }),
    );

    expect(checkRateLimitMock).toHaveBeenCalledWith({
      key: "auth:9.9.9.9",
      maxRequests: 5,
      windowSeconds: 60,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("15");
  });

  it("utilise l'IP 'unknown' quand aucun header IP n'est fourni", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000,
    });

    const { POST } = await import("@/app/(api)/api/authenticate/route");
    await POST(buildRequest({ password: "wrong-password" }));

    expect(checkRateLimitMock).toHaveBeenCalledWith({
      key: "auth:unknown",
      maxRequests: 5,
      windowSeconds: 60,
    });
  });

  it("DELETE supprime le cookie et applique Secure en production", async () => {
    process.env.NODE_ENV = "production";
    const { DELETE } = await import("@/app/(api)/api/authenticate/route");
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, message: "Logged out" });

    const cookie = response.headers.get("Set-Cookie");
    expect(cookie).toContain("authToken=");
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("Secure");
  });
});
