import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildJsonRequest = (method: string, body?: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/tags", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("API admin/tags route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/tags", () => ({
      listTagsAdmin: vi.fn(),
      createTagAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/tags/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("retourne les tags quand auth ok", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.listTagsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue([{ slug: "web" }]);

    const { GET } = await import("@/app/(api)/api/admin/tags/route");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [{ slug: "web" }] });
  });

  it("retourne 500 si la liste echoue en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.listTagsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom tags get"));

    const { GET } = await import("@/app/(api)/api/admin/tags/route");
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom tags get" });
  });

  it("refuse POST sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { POST } = await import("@/app/(api)/api/admin/tags/route");
    const response = await POST(buildJsonRequest("POST", { name: "Web", category: "global" }));
    expect(response.status).toBe(401);
  });

  it("refuse POST invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST } = await import("@/app/(api)/api/admin/tags/route");
    const response = await POST(buildJsonRequest("POST", { name: "", category: "global" }));
    expect(response.status).toBe(400);
  });

  it("crée un tag et revalide les chemins admin", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.createTagAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t-1", slug: "web" });

    const { POST } = await import("@/app/(api)/api/admin/tags/route");
    const response = await POST(buildJsonRequest("POST", { name: "Web", category: "global" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { id: "t-1", slug: "web" },
    });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 si la creation echoue en POST", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const tags = await import("@/lib/modules/tags");
    (tags.createTagAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom tags post"),
    );

    const { POST } = await import("@/app/(api)/api/admin/tags/route");
    const response = await POST(buildJsonRequest("POST", { name: "Web", category: "global" }));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom tags post" });
  });
});
