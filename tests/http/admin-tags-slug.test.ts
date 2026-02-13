import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildSlugParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

const buildJsonRequest = (method: string, body?: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/tags/web", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("API admin/tags/[slug] route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/tags", () => ({
      getTagForAdmin: vi.fn(),
      updateTagAdmin: vi.fn(),
      deleteTagAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await GET({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(401);
  });

  it("retourne un tag quand auth ok", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.getTagForAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t-1", slug: "web" });

    const { GET } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await GET({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: { slug: "web" } });
  });

  it("renvoie 404 si tag absent", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.getTagForAdmin as ReturnType<typeof vi.fn>).mockRejectedValue({
      statusCode: 404,
      message: "Aucun tag trouvé",
    });

    const { GET } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await GET({} as NextRequest, buildSlugParams("missing"));
    expect(response.status).toBe(404);
  });

  it("renvoie 500 en GET si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.getTagForAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom tag get"));

    const { GET } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await GET({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom tag get" });
  });

  it("refuse PUT sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { PUT } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await PUT(buildJsonRequest("PUT", { name: "Web" }), buildSlugParams("web"));
    expect(response.status).toBe(401);
  });

  it("refuse PUT invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { PUT } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await PUT(buildJsonRequest("PUT", { color: "bad" }), buildSlugParams("web"));
    expect(response.status).toBe(400);
  });

  it("met à jour et revalide les chemins admin", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.updateTagAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t-1", slug: "web" });

    const { PUT } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await PUT(buildJsonRequest("PUT", { name: "Web" }), buildSlugParams("web"));
    expect(response.status).toBe(200);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("renvoie 500 en PUT si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.updateTagAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom tag put"));

    const { PUT } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await PUT(buildJsonRequest("PUT", { name: "Web" }), buildSlugParams("web"));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom tag put" });
  });

  it("refuse DELETE sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { DELETE } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await DELETE({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(401);
  });

  it("supprime et revalide les chemins admin", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.deleteTagAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await DELETE({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(200);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("renvoie 500 en DELETE si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.deleteTagAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom tag delete"),
    );

    const { DELETE } = await import("@/app/(api)/api/admin/tags/[slug]/route");
    const response = await DELETE({} as NextRequest, buildSlugParams("web"));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom tag delete" });
  });
});
