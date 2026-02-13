import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("checkRateLimit util", () => {
  const deleteMany = vi.fn();
  const updateMany = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();
  const del = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-08T12:00:00.000Z"));

    deleteMany.mockReset();
    updateMany.mockReset();
    findUnique.mockReset();
    create.mockReset();
    del.mockReset();

    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        rateLimit: {
          deleteMany,
          updateMany,
          findUnique,
          create,
          delete: del,
        },
      },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unmock("@/lib/prisma");
  });

  it("crée une entrée quand aucune n'existe", async () => {
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ key: "contact:1.2.3.4", count: 1 });

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "contact:1.2.3.4",
      maxRequests: 3,
      windowSeconds: 300,
    });

    expect(deleteMany).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetAt).toBe(Date.now() + 300_000);

    const createdArgs = create.mock.calls[0]?.[0] as { data: { expiresAt: Date } };
    expect(createdArgs.data.expiresAt.getTime()).toBe(Date.now() + 300_000);
  });

  it("bloque quand la limite est déjà atteinte", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce({
      key: "auth:9.9.9.9",
      count: 5,
      expiresAt,
    });

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "auth:9.9.9.9",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(create).not.toHaveBeenCalled();
    expect(result).toEqual({
      allowed: false,
      remaining: 0,
      resetAt: expiresAt.getTime(),
    });
  });

  it("retry quand create rencontre un conflit P2002 (race)", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce({ code: "P2002" });

    updateMany.mockResolvedValueOnce({ count: 1 });
    findUnique.mockResolvedValueOnce({
      key: "auth:9.9.9.9",
      count: 2,
      expiresAt,
    });

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "auth:9.9.9.9",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      allowed: true,
      remaining: 3,
      resetAt: expiresAt.getTime(),
    });
  });

  it("fail-open si updateMany=1 mais findUnique retourne null", async () => {
    updateMany.mockResolvedValueOnce({ count: 1 });
    findUnique.mockResolvedValueOnce(null);

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "auth:1.1.1.1",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it("fail-open si create echoue avec une erreur non P2002", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce(new Error("db unavailable"));

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "auth:2.2.2.2",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("cleanupExpiredRateLimits retourne 0 en cas d'erreur", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    deleteMany.mockRejectedValueOnce(new Error("cleanup failed"));

    const { cleanupExpiredRateLimits } = await import("@/lib/utils/rate-limit");
    const count = await cleanupExpiredRateLimits();

    expect(count).toBe(0);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("cleanupExpiredRateLimits retourne le nombre d'entrees supprimees", async () => {
    deleteMany.mockResolvedValueOnce({ count: 7 });
    const { cleanupExpiredRateLimits } = await import("@/lib/utils/rate-limit");
    const count = await cleanupExpiredRateLimits();
    expect(count).toBe(7);
  });

  it("fail-open sur fallback si les 2 tentatives create rencontrent P2002", async () => {
    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce({ code: "P2002" });

    updateMany.mockResolvedValueOnce({ count: 0 });
    findUnique.mockResolvedValueOnce(null);
    create.mockRejectedValueOnce({ code: "P2002" });

    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    const result = await checkRateLimit({
      key: "auth:5.5.5.5",
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it("resetRateLimit log les erreurs hors P2025", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    del.mockRejectedValueOnce({ code: "P2003" });

    const { resetRateLimit } = await import("@/lib/utils/rate-limit");
    await expect(resetRateLimit("auth:3.3.3.3")).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("resetRateLimit ignore l'erreur P2025", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    del.mockRejectedValueOnce({ code: "P2025" });

    const { resetRateLimit } = await import("@/lib/utils/rate-limit");
    await expect(resetRateLimit("auth:4.4.4.4")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
