import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildIdParams = (id: string) => ({ params: Promise.resolve({ id }) });

const buildJsonRequest = (method: string, body?: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/persons/p-1", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("API admin/persons/[id] route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/person", () => ({
      getPersonForAdmin: vi.fn(),
      updatePersonAdmin: vi.fn(),
      deletePersonAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("retourne une personne en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.getPersonForAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "p-1" });

    const { GET } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await GET({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: { id: "p-1" } });
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await GET({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(401);
  });

  it("retourne 500 en GET si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.getPersonForAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom get id"),
    );

    const { GET } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await GET({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom get id" });
  });

  it("mappe les erreurs metier en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.getPersonForAdmin as ReturnType<typeof vi.fn>).mockRejectedValue({
      statusCode: 404,
      message: "Person not found",
    });

    const { GET } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await GET({} as NextRequest, buildIdParams("p-404"));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Person not found" });
  });

  it("refuse PUT invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { PUT } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await PUT(
      buildJsonRequest("PUT", { email: "not-an-email" }),
      buildIdParams("p-1"),
    );
    expect(response.status).toBe(400);
  });

  it("refuse PUT sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { PUT } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await PUT(buildJsonRequest("PUT", { fullName: "Max" }), buildIdParams("p-1"));
    expect(response.status).toBe(401);
  });

  it("met a jour et revalide en PUT", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.updatePersonAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "p-1" });

    const { PUT } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await PUT(
      buildJsonRequest("PUT", { fullName: "Max Dupont", role: "Lead Dev" }),
      buildIdParams("p-1"),
    );
    expect(response.status).toBe(200);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/persons");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 en PUT si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.updatePersonAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom put id"),
    );

    const { PUT } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await PUT(
      buildJsonRequest("PUT", { fullName: "Max Dupont", role: "Lead Dev" }),
      buildIdParams("p-1"),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom put id" });
  });

  it("supprime en DELETE", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.deletePersonAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await DELETE({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(200);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/persons");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("refuse DELETE sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { DELETE } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await DELETE({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(401);
  });

  it("mappe les erreurs metier en DELETE", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.deletePersonAdmin as ReturnType<typeof vi.fn>).mockRejectedValue({
      statusCode: 404,
      message: "Person not found",
    });

    const { DELETE } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await DELETE({} as NextRequest, buildIdParams("p-404"));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Person not found" });
  });

  it("retourne 500 en DELETE si le service echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/person");
    (module.deletePersonAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom delete id"),
    );

    const { DELETE } = await import("@/app/(api)/api/admin/persons/[id]/route");
    const response = await DELETE({} as NextRequest, buildIdParams("p-1"));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom delete id" });
  });
});
