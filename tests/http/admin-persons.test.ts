import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildJsonRequest = (method: string, body?: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/persons", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("API admin/persons route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/person", () => ({
      listPersonsAdmin: vi.fn(),
      createPersonAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/persons/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("retourne les personnes quand auth ok", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.listPersonsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "p-1" }]);

    const { GET } = await import("@/app/(api)/api/admin/persons/route");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [{ id: "p-1" }] });
  });

  it("retourne 500 si la liste echoue en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.listPersonsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom get persons"),
    );

    const { GET } = await import("@/app/(api)/api/admin/persons/route");
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom get persons" });
  });

  it("mappe les erreurs metier en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.listPersonsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue({
      statusCode: 404,
      message: "Not found",
    });

    const { GET } = await import("@/app/(api)/api/admin/persons/route");
    const response = await GET();
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Not found" });
  });

  it("refuse POST sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { POST } = await import("@/app/(api)/api/admin/persons/route");
    const response = await POST(buildJsonRequest("POST", { firstName: "Max", lastName: "Dupont" }));
    expect(response.status).toBe(401);
  });

  it("refuse POST invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST } = await import("@/app/(api)/api/admin/persons/route");
    const response = await POST(buildJsonRequest("POST", { firstName: "", lastName: "" }));
    expect(response.status).toBe(400);
  });

  it("cree une personne et revalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.createPersonAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "p-1" });

    const { POST } = await import("@/app/(api)/api/admin/persons/route");
    const response = await POST(buildJsonRequest("POST", { firstName: "Max", lastName: "Dupont" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: { id: "p-1" } });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/persons");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 si la creation echoue en POST", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.createPersonAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom post persons"),
    );

    const { POST } = await import("@/app/(api)/api/admin/persons/route");
    const response = await POST(buildJsonRequest("POST", { firstName: "Max", lastName: "Dupont" }));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom post persons" });
  });
});
