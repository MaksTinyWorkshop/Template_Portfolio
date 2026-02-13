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
    expect(payload).toMatchObject({ success: false, error: "Champs requis" });
    expect(payload.details).toBeUndefined();
  });

  it("expose details when EXPOSE_API_ERROR_DETAILS=1", async () => {
    const previous = process.env.EXPOSE_API_ERROR_DETAILS;
    process.env.EXPOSE_API_ERROR_DETAILS = "1";

    const handler = withApiErrorHandling(async () => {
      throw new ValidationError("Champs requis", ["name"]);
    });

    const response = await handler(new NextRequest("http://localhost/api/test"));
    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload).toMatchObject({
      success: false,
      error: "Champs requis",
      details: ["name"],
    });

    if (previous === undefined) delete process.env.EXPOSE_API_ERROR_DETAILS;
    else process.env.EXPOSE_API_ERROR_DETAILS = previous;
  });

  it("defaults to 500 for unknown errors", async () => {
    const handler = withApiErrorHandling(async () => {
      throw new Error("Impossible de traiter la requête");
    });

    const response = await handler(new NextRequest("http://localhost/api/test"));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "Impossible de traiter la requête" });
    expect(payload.details).toBeUndefined();
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

  it("accepte un slug dynamique sous forme de tableau", async () => {
    vi.doMock("@/lib/modules/projects", () => ({
      getProjectBySlug: vi.fn(),
    }));

    const projects = await import("@/lib/modules/projects");
    (projects.getProjectBySlug as ReturnType<typeof vi.fn>).mockResolvedValue({
      slug: "nested/alpha",
    });

    const { GET } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await GET(new NextRequest("http://localhost/api/projects/nested/alpha"), {
      params: { slug: ["nested", "alpha"] },
    } as Parameters<typeof GET>[1]);

    expect(projects.getProjectBySlug).toHaveBeenCalledWith("nested/alpha");
    expect(response.status).toBe(200);
  });

  it("renvoie une erreur structurée pour un slug vide après trim", async () => {
    const { GET } = await import("@/app/(api)/api/projects/[slug]/route");
    const response = await GET(new NextRequest("http://localhost/api/projects/%20"), {
      params: { slug: "   " },
    } as Parameters<typeof GET>[1]);

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("Slug manquant");
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
    expect(payload).toMatchObject({ success: false, error: "boom" });
    expect(payload.details).toBeUndefined();
  });

  it("n'expose pas de handler PATCH", async () => {
    const routeModule = await import("@/app/(api)/api/projects/[slug]/route");
    expect(routeModule).not.toHaveProperty("PATCH");
  });

  it("n'expose pas de handler DELETE", async () => {
    const routeModule = await import("@/app/(api)/api/projects/[slug]/route");
    expect(routeModule).not.toHaveProperty("DELETE");
  });
});
