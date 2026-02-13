import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const personFindFirst = vi.fn();
const availabilityFindFirst = vi.fn();
const availabilityCreate = vi.fn();
const checkAuthApiMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    person: {
      findFirst: personFindFirst,
    },
    availabilityLog: {
      findFirst: availabilityFindFirst,
      create: availabilityCreate,
    },
  },
}));

vi.mock("@/lib/utils/auth", () => ({
  checkAuthAPI: checkAuthApiMock,
}));

const buildRequest = (body?: unknown) =>
  ({
    json: async () => body,
  }) as unknown as NextRequest;

describe("availability route", () => {
  beforeEach(() => {
    vi.resetModules();
    personFindFirst.mockReset();
    availabilityFindFirst.mockReset();
    availabilityCreate.mockReset();
    checkAuthApiMock.mockReset();
  });

  it("renvoie la disponibilité par défaut quand aucun log n'existe", async () => {
    personFindFirst.mockResolvedValueOnce({ id: "owner" });
    availabilityFindFirst.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/(api)/api/availability/route");

    const response = await GET({} as NextRequest);
    expect(personFindFirst).toHaveBeenCalled();
    const payload = await response.json();
    expect(payload.status).toBe("unavailable");
    expect(typeof payload.lastUpdated).toBe("string");
  });

  it("renvoie 404 quand aucun proprietaire de site n'existe", async () => {
    personFindFirst.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/(api)/api/availability/route");

    const response = await GET({} as NextRequest);
    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toContain("propriétaire");
  });

  it("renvoie les données du log existant", async () => {
    const createdAt = new Date("2023-05-04T12:00:00Z");
    personFindFirst.mockResolvedValueOnce({ id: "owner" });
    availabilityFindFirst.mockResolvedValueOnce({ status: "soon", createdAt });
    const { GET } = await import("@/app/(api)/api/availability/route");

    const response = await GET({} as NextRequest);
    const payload = await response.json();
    expect(payload).toEqual({
      status: "soon",
      lastUpdated: createdAt.toISOString(),
    });
  });

  it("bloque le POST quand on n'est pas authentifié", async () => {
    checkAuthApiMock.mockResolvedValueOnce(false);
    const { POST } = await import("@/app/(api)/api/availability/route");
    const response = await POST(buildRequest({ status: "available" }));

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toContain("Non autorisé");
  });

  it("renvoie 400 pour un statut invalide", async () => {
    checkAuthApiMock.mockResolvedValueOnce(true);
    const { POST } = await import("@/app/(api)/api/availability/route");
    const response = await POST(buildRequest({ status: "wrong" }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain("Données invalides");

    // Details peuvent être présents ou non selon mapErrorToStatus
    if (payload?.details) {
      expect(Array.isArray(payload.details)).toBe(true);
    }
  });

  it("renvoie 404 en POST quand aucun proprietaire de site n'existe", async () => {
    checkAuthApiMock.mockResolvedValueOnce(true);
    personFindFirst.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/(api)/api/availability/route");

    const response = await POST(buildRequest({ status: "soon" }));
    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toContain("propriétaire");
  });

  it("renvoie 500 quand la creation echoue", async () => {
    checkAuthApiMock.mockResolvedValueOnce(true);
    personFindFirst.mockResolvedValueOnce({ id: "owner" });
    availabilityCreate.mockRejectedValueOnce(new Error("db down"));
    const { POST } = await import("@/app/(api)/api/availability/route");

    const response = await POST(buildRequest({ status: "soon" }));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "db down" });
  });

  it("écrit la disponibilité valide et la retourne", async () => {
    checkAuthApiMock.mockResolvedValueOnce(true);
    personFindFirst.mockResolvedValueOnce({ id: "owner" });
    const createdAt = new Date("2026-02-01T00:00:00Z");
    availabilityFindFirst.mockResolvedValueOnce({ status: "available", createdAt: new Date() });
    availabilityCreate.mockResolvedValueOnce({ status: "soon", createdAt });
    const { POST } = await import("@/app/(api)/api/availability/route");

    const response = await POST(buildRequest({ status: "soon" }));
    expect(personFindFirst).toHaveBeenCalled();
    expect(availabilityCreate).toHaveBeenCalledWith({
      data: {
        personId: "owner",
        status: "soon",
      },
      select: {
        status: true,
        createdAt: true,
      },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      status: "soon",
      lastUpdated: createdAt.toISOString(),
    });
  });
});
