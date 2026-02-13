import { ApiError } from "@/lib/http/errors";
import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildRequest = () => new NextRequest("http://localhost/api/projects");

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("neurit un ApiError via withApiErrorHandling et expose la structure attendue", async () => {
    const error = new ApiError("Service indisponible", 503);
    vi.doMock("@/lib/modules/projects", () => ({
      listProjects: () => {
        throw error;
      },
    }));

    const { GET: getProjects } = await import("@/app/(api)/api/projects/route");
    const response = await getProjects(buildRequest());
    expect(response.status).toBe(503);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "Service indisponible" });
  });

  it("retourne la liste des projets quand le service fonctionne", async () => {
    const expectedProjects = [{ slug: "alpha", title: "Alpha" }];
    vi.doMock("@/lib/modules/projects", () => ({
      listProjects: () => Promise.resolve(expectedProjects),
    }));

    const { GET: getProjects } = await import("@/app/(api)/api/projects/route");
    const response = await getProjects(buildRequest());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ projects: expectedProjects });
  });
});
