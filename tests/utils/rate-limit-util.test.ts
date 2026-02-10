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
});

