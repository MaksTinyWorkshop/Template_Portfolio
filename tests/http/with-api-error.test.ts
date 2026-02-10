import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ValidationError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";

describe("withApiErrorHandling helper", () => {
  it("seralizes ValidationError responses", async () => {
    const handler = withApiErrorHandling(async () => {
      throw new ValidationError("Champs requis", ["name"]);
    });

    const response = await handler(new NextRequest("http://localhost/api/test"));
    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload).toEqual({ error: "Champs requis", details: ["name"] });
  });

  it("defaults to 500 for unknown errors", async () => {
    const handler = withApiErrorHandling(async () => {
      throw new Error("Impossible de traiter la requête");
    });

    const response = await handler(new NextRequest("http://localhost/api/test"));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ error: "Impossible de traiter la requête" });
  });
});

describe("GET /api/projects/[slug]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renvoie une erreur structurée pour un slug manquant", async () => {
    const { GET } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await GET(new NextRequest("http://localhost/api/projects/"), {
      params: { slug: "" },
    } as Parameters<typeof GET>[1]);

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("Slug manquant");
    expect(payload.details).toBeUndefined();
  });

  it("retourne un projet quand le slug est present", async () => {
    vi.doMock("@/lib/modules/projects", () => ({
      getProjectBySlug: vi.fn(),
    }));

    const projects = await import("@/lib/modules/projects");
    (projects.getProjectBySlug as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "alpha" });

    const { GET } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await GET(new NextRequest("http://localhost/api/projects/alpha"), {
      params: { slug: "alpha" },
    } as Parameters<typeof GET>[1]);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ project: { slug: "alpha" } });
  });

  it("renvoie 500 quand le service echoue", async () => {
    vi.doMock("@/lib/modules/projects", () => ({
      getProjectBySlug: vi.fn(),
    }));

    const projects = await import("@/lib/modules/projects");
    (projects.getProjectBySlug as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { GET } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await GET(new NextRequest("http://localhost/api/projects/alpha"), {
      params: { slug: "alpha" },
    } as Parameters<typeof GET>[1]);

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ error: "boom" });
  });

  it("renvoie 405 pour PATCH", async () => {
    const { PATCH } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await PATCH(new NextRequest("http://localhost/api/projects/alpha"), {
      params: { slug: "alpha" },
    } as Parameters<typeof PATCH>[1]);
    expect(response.status).toBe(405);
  });

  it("renvoie 405 pour DELETE", async () => {
    const { DELETE } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await DELETE(new NextRequest("http://localhost/api/projects/alpha"), {
      params: { slug: "alpha" },
    } as Parameters<typeof DELETE>[1]);
    expect(response.status).toBe(405);
  });
});
