import { beforeEach, describe, expect, it, vi } from "vitest";

describe("prisma singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { prisma?: unknown }).prisma;
  });

  it("utilise les logs verbeux en development", async () => {
    const prismaClientMock = vi.fn(function PrismaClientMock() {
      return { __kind: "new-client" };
    });
    const poolMock = vi.fn(function PoolMock() {
      return { __kind: "pool" };
    });
    const adapterMock = vi.fn(function PrismaPgMock() {
      return { __kind: "adapter" };
    });

    vi.doMock("@/lib/env", () => ({
      env: {
        DATABASE_URL: "postgresql://test:test@localhost:5432/portfolio_test",
        NODE_ENV: "development",
      },
    }));
    vi.doMock("pg", () => ({ Pool: poolMock }));
    vi.doMock("@prisma/adapter-pg", () => ({ PrismaPg: adapterMock }));
    vi.doMock("@prisma/client", () => ({ PrismaClient: prismaClientMock }));

    const { prisma } = await import("@/lib/prisma");

    expect(poolMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: "postgresql://test:test@localhost:5432/portfolio_test",
      }),
    );
    expect(adapterMock).toHaveBeenCalledOnce();
    expect(prismaClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ log: ["query", "warn", "error"] }),
    );
    expect(prisma).toEqual({ __kind: "new-client" });
  });

  it("réutilise globalThis.prisma si déjà défini", async () => {
    const existing = { __kind: "existing-client" };
    (globalThis as { prisma?: unknown }).prisma = existing;

    const prismaClientMock = vi.fn(function PrismaClientMock() {
      return { __kind: "new-client" };
    });
    vi.doMock("@/lib/env", () => ({
      env: {
        DATABASE_URL: "postgresql://test:test@localhost:5432/portfolio_test",
        NODE_ENV: "test",
      },
    }));
    vi.doMock("pg", () => ({
      Pool: vi.fn(function PoolMock() {
        return {};
      }),
    }));
    vi.doMock("@prisma/adapter-pg", () => ({
      PrismaPg: vi.fn(function PrismaPgMock() {
        return {};
      }),
    }));
    vi.doMock("@prisma/client", () => ({ PrismaClient: prismaClientMock }));

    const { prisma } = await import("@/lib/prisma");

    expect(prismaClientMock).toHaveBeenCalledWith(expect.objectContaining({ log: ["error"] }));
    expect(prisma).toBe(existing);
  });
});
