import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("auth utils - shouldRefreshToken & checkAuthAPI", () => {
  const signPayload = async (payload: string, secret: string) => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    return signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    process.env.AUTH_SECRET = "a".repeat(64);
    process.env.ADMIN_PASSWORD = "fallback-password-strong-enough";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shouldRefreshToken retourne false pour token malformed", async () => {
    const { shouldRefreshToken } = await import("@/lib/utils/auth");
    expect(shouldRefreshToken("invalid-token")).toBe(false);
    expect(shouldRefreshToken(null as unknown as string)).toBe(false);
  });

  it("shouldRefreshToken retourne true quand proche expiration", async () => {
    const constants = await import("@/lib/utils/auth-constants");
    const now = Date.now();
    const nearExpiryTimestamp =
      now - (constants.TOKEN_MAX_AGE_MS - constants.TOKEN_REFRESH_THRESHOLD_MS + 1_000);
    const token = `${nearExpiryTimestamp}.abc.signature`;

    const { shouldRefreshToken } = await import("@/lib/utils/auth");
    expect(shouldRefreshToken(token)).toBe(true);
  });

  it("shouldRefreshToken retourne false quand deja expire", async () => {
    const constants = await import("@/lib/utils/auth-constants");
    const now = Date.now();
    const expiredTimestamp = now - (constants.TOKEN_MAX_AGE_MS + 10_000);
    const token = `${expiredTimestamp}.abc.signature`;

    const { shouldRefreshToken } = await import("@/lib/utils/auth");
    expect(shouldRefreshToken(token)).toBe(false);
  });

  it("checkAuthAPI retourne false sans cookie authToken", async () => {
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      }),
    }));

    const { checkAuthAPI } = await import("@/lib/utils/auth");
    expect(await checkAuthAPI()).toBe(false);
  });

  it("checkAuthAPI retourne false si verifyAuthToken echoue", async () => {
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "bad.token.value" }),
      }),
    }));

    const { checkAuthAPI } = await import("@/lib/utils/auth");
    expect(await checkAuthAPI()).toBe(false);
  });

  it("checkAuthAPI retourne true pour un token valide", async () => {
    const realAuth = await import("@/lib/utils/auth");
    const token = await realAuth.generateAuthToken();

    vi.resetModules();
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: token }),
      }),
    }));

    const { checkAuthAPI } = await import("@/lib/utils/auth");
    expect(await checkAuthAPI()).toBe(true);
  });

  it("verifyAuthToken retourne false si aucun secret n'est configure", async () => {
    delete process.env.AUTH_SECRET;
    delete process.env.ADMIN_PASSWORD;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { verifyAuthToken } = await import("@/lib/utils/auth");
    expect(await verifyAuthToken("1.2.3")).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("verifyAuthToken log 'Token expiré' en non-production pour un token valide expiré", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const oldTimestamp = String(Date.now() - 10_000_000);
    const payload = `${oldTimestamp}.abc`;
    const signature = await signPayload(payload, process.env.AUTH_SECRET!);
    const token = `${payload}.${signature}`;

    const { verifyAuthToken } = await import("@/lib/utils/auth");
    expect(await verifyAuthToken(token)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("⚠️  Token expiré");
  });

  it("verifyAuthToken ne log pas 'Token expiré' en production", async () => {
    process.env.NODE_ENV = "production";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const oldTimestamp = String(Date.now() - 10_000_000);
    const payload = `${oldTimestamp}.abc`;
    const signature = await signPayload(payload, process.env.AUTH_SECRET!);
    const token = `${payload}.${signature}`;

    const { verifyAuthToken } = await import("@/lib/utils/auth");
    expect(await verifyAuthToken(token)).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("verifyAuthToken gère un timestamp NaN signé correctement", async () => {
    const payload = "not-a-number.abc";
    const signature = await signPayload(payload, process.env.AUTH_SECRET!);
    const token = `${payload}.${signature}`;

    const { verifyAuthToken } = await import("@/lib/utils/auth");
    expect(await verifyAuthToken(token)).toBe(false);
  });

  it("verifyAuthToken retourne false si catch déclenché en mode production simulé", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.AUTH_SECRET;
    delete process.env.ADMIN_PASSWORD;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { verifyAuthToken } = await import("@/lib/utils/auth");
    expect(await verifyAuthToken("1.2.3")).toBe(false);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("checkAuthAPI gère les erreurs de cookies() en non-production", async () => {
    process.env.NODE_ENV = "test";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockRejectedValue(new Error("cookie store down")),
    }));

    const { checkAuthAPI } = await import("@/lib/utils/auth");
    expect(await checkAuthAPI()).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("checkAuthAPI retourne false sur erreur cookies() en mode production simulé", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockRejectedValue(new Error("cookie store down")),
    }));

    const { checkAuthAPI } = await import("@/lib/utils/auth");
    expect(await checkAuthAPI()).toBe(false);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
