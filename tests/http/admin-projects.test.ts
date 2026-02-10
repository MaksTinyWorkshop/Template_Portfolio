import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const metadata = {
  title: "Projet test",
  summary: "Résumé",
  publishedAt: "2025-01-01T00:00:00Z",
  status: "draft",
  typeProjectTag: ["Web"],
  featuredImage: "/images/cover.png",
  images: [],
  team: [],
  link: "",
  repository: "",
};

const buildRequest = (method: string, body?: Record<string, unknown>, slug?: string) =>
  new NextRequest(`http://localhost/api/admin/projects${slug ? `?slug=${slug}` : ""}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("API admin/projects route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/projects", () => ({
      createProjectAdmin: vi.fn(),
      updateProjectAdmin: vi.fn(),
      deleteProjectAdmin: vi.fn(),
      listProjectsAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/projects/route");
    const response = await GET(buildRequest("GET"));
    expect(response.status).toBe(401);
  });

  it("retourne la liste des projets quand auth ok", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.listProjectsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue([{ slug: "foo" }]);

    const { GET } = await import("@/app/(api)/api/admin/projects/route");
    const response = await GET(buildRequest("GET"));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: true, data: [{ slug: "foo" }] });
  });

  it("retourne 500 si la liste echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.listProjectsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));

    const { GET } = await import("@/app/(api)/api/admin/projects/route");
    const response = await GET(buildRequest("GET"));
    expect(response.status).toBe(500);
  });

  it("refuse POST sans metadata complet", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST } = await import("@/app/(api)/api/admin/projects/route");
    const response = await POST(buildRequest("POST", {}));
    expect(response.status).toBe(400);
  });

  it("refuse POST non authentifié", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { POST } = await import("@/app/(api)/api/admin/projects/route");
    const response = await POST(
      buildRequest("POST", {
        ...metadata,
        content: "ok",
      }),
    );
    expect(response.status).toBe(401);
  });

  it("crée un projet et revalide /work", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.createProjectAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "alpha" });

    const { POST } = await import("@/app/(api)/api/admin/projects/route");
    const response = await POST(
      buildRequest("POST", {
        ...metadata,
        content: "ok",
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.success).toBe(true);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/work");
    expect(revalidatePath).toHaveBeenCalledWith("/work/alpha");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 si la creation echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.createProjectAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { POST } = await import("@/app/(api)/api/admin/projects/route");
    const response = await POST(
      buildRequest("POST", {
        ...metadata,
        content: "ok",
      }),
    );
    expect(response.status).toBe(500);
  });

  it("refuse PUT non authentifié", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { PUT } = await import("@/app/(api)/api/admin/projects/route");
    const response = await PUT(
      buildRequest("PUT", {
        slug: "alpha",
        ...metadata,
        content: "contenu",
      }),
    );
    expect(response.status).toBe(401);
  });

  it("renvoie 400 quand le payload PUT est invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { PUT } = await import("@/app/(api)/api/admin/projects/route");
    const response = await PUT(buildRequest("PUT", { slug: "" }));
    expect(response.status).toBe(400);
  });

  it("met a jour un projet sans changer le slug", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.updateProjectAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "alpha" });

    const { revalidatePath } = await import("next/cache");
    (revalidatePath as ReturnType<typeof vi.fn>).mockClear();

    const { PUT } = await import("@/app/(api)/api/admin/projects/route");
    const response = await PUT(
      buildRequest("PUT", {
        slug: "alpha",
        ...metadata,
        content: "modifié",
      }),
    );
    expect(response.status).toBe(200);

    const calls = (revalidatePath as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((p) => p === "/work/alpha");
    expect(calls.length).toBe(1);
  });

  it("met à jour un projet et revalide les slugs anciens/nouveaux", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.updateProjectAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "beta" });

    const { PUT } = await import("@/app/(api)/api/admin/projects/route");
    const response = await PUT(
      buildRequest("PUT", {
        slug: "beta",
        oldSlug: "alpha",
        ...metadata,
        content: "modifié",
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.slug).toBe("beta");

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/work");
    expect(revalidatePath).toHaveBeenCalledWith("/work/beta");
    expect(revalidatePath).toHaveBeenCalledWith("/work/alpha");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 si la mise a jour echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.updateProjectAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { PUT } = await import("@/app/(api)/api/admin/projects/route");
    const response = await PUT(
      buildRequest("PUT", {
        slug: "alpha",
        ...metadata,
        content: "modifié",
      }),
    );
    expect(response.status).toBe(500);
  });

  it("refuse DELETE non authentifié", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { DELETE } = await import("@/app/(api)/api/admin/projects/route");
    const response = await DELETE(buildRequest("DELETE", undefined, "alpha"));
    expect(response.status).toBe(401);
  });

  it("supprime un projet avec slug validé", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.deleteProjectAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/(api)/api/admin/projects/route");
    const response = await DELETE(buildRequest("DELETE", undefined, "alpha"));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.slug).toBe("alpha");

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/work");
    expect(revalidatePath).toHaveBeenCalledWith("/work/alpha");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 400 sur DELETE quand le slug est manquant", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { DELETE } = await import("@/app/(api)/api/admin/projects/route");
    const response = await DELETE(buildRequest("DELETE"));
    expect(response.status).toBe(400);
  });

  it("retourne 500 si la suppression echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const projects = await import("@/lib/modules/projects");
    (projects.deleteProjectAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { DELETE } = await import("@/app/(api)/api/admin/projects/route");
    const response = await DELETE(buildRequest("DELETE", undefined, "alpha"));
    expect(response.status).toBe(500);
  });
});
