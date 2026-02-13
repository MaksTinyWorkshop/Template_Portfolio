import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/http/errors";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildJsonRequest = (method: string, body?: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/assets", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

const buildDeleteRequest = (assetPath: string) =>
  new NextRequest(`http://localhost/api/admin/assets?path=${encodeURIComponent(assetPath)}`, {
    method: "DELETE",
  });

describe("API admin/assets route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/assets", () => ({
      listAssetsAdmin: vi.fn(),
      uploadAssetAdmin: vi.fn(),
      createAssetDirectoryAdmin: vi.fn(),
      renameAssetAdmin: vi.fn(),
      deleteAssetAdmin: vi.fn(),
    }));
  });

  it("refuse GET sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/assets/route");
    const response = await GET(new NextRequest("http://localhost/api/admin/assets"));
    expect(response.status).toBe(401);
  });

  it("liste les assets en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const module = await import("@/lib/modules/assets");
    (module.listAssetsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      directory: "",
      parentDirectory: null,
      items: [{ path: "images", name: "images", kind: "directory", size: null, extension: null }],
    });

    const { GET } = await import("@/app/(api)/api/admin/assets/route");
    const response = await GET(new NextRequest("http://localhost/api/admin/assets"));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { items: [{ path: "images" }] },
    });
  });

  it("retourne 500 si la liste des assets echoue en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.listAssetsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom get"));

    const { GET } = await import("@/app/(api)/api/admin/assets/route");
    const response = await GET(new NextRequest("http://localhost/api/admin/assets"));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom get" });
  });

  it("retourne le status mappe pour une erreur metier en GET", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.listAssetsAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError("Dossier introuvable", 404),
    );

    const { GET } = await import("@/app/(api)/api/admin/assets/route");
    const response = await GET(new NextRequest("http://localhost/api/admin/assets"));

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Dossier introuvable" });
  });

  it("refuse POST sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(buildJsonRequest("POST", { directory: "images", name: "test" }));

    expect(response.status).toBe(401);
  });

  it("cree un dossier en POST json", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.createAssetDirectoryAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: "images/new-folder",
      name: "new-folder",
    });

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(
      buildJsonRequest("POST", {
        directory: "images",
        name: "new-folder",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { path: "images/new-folder" },
    });
  });

  it("cree un dossier en POST json sans header content-type", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.createAssetDirectoryAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: "images/no-ct",
      name: "no-ct",
    });

    const request = new NextRequest("http://localhost/api/admin/assets", {
      method: "POST",
      body: JSON.stringify({ directory: "images", name: "no-ct" }),
    });

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { path: "images/no-ct" },
    });
  });

  it("retourne 500 en POST sans body (content-type absent)", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/assets", { method: "POST" }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: expect.any(String) });
  });

  it("retourne 400 en POST json quand le payload est invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(buildJsonRequest("POST", { directory: "images" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });

  it("retourne 400 en POST multipart quand le fichier manque", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const formData = new FormData();
    formData.set("directory", "images");

    const request = new NextRequest("http://localhost/api/admin/assets", {
      method: "POST",
      body: formData,
    });

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Fichier requis" });
  });

  it("upload un fichier en POST multipart", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.uploadAssetAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: "images/file.png",
      name: "file.png",
      kind: "file",
      size: 12,
      extension: "png",
      mimeType: "image/png",
      url: "/images/file.png",
      directory: "images",
    });

    const formData = new FormData();
    formData.set("directory", "images");
    formData.set("overwrite", "true");
    formData.set("file", new File(["abc"], "file.png", { type: "image/png" }));

    const request = new NextRequest("http://localhost/api/admin/assets", {
      method: "POST",
      body: formData,
    });

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(module.uploadAssetAdmin).toHaveBeenCalled();
    expect(await response.json()).toMatchObject({
      success: true,
      data: { path: "images/file.png" },
    });
  });

  it("retourne 500 si la creation de dossier echoue en POST", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.createAssetDirectoryAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom post"),
    );

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(buildJsonRequest("POST", { directory: "images", name: "x" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom post" });
  });

  it("retourne le status mappe pour une erreur metier en POST", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.createAssetDirectoryAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError("Dossier invalide", 404),
    );

    const { POST } = await import("@/app/(api)/api/admin/assets/route");
    const response = await POST(buildJsonRequest("POST", { directory: "images", name: "x" }));

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: "Dossier invalide" });
  });

  it("refuse PUT sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { PUT } = await import("@/app/(api)/api/admin/assets/route");
    const response = await PUT(buildJsonRequest("PUT", { path: "a", name: "b" }));

    expect(response.status).toBe(401);
  });

  it("renomme un asset en PUT", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.renameAssetAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      path: "images/renamed.png",
      name: "renamed.png",
    });

    const { PUT } = await import("@/app/(api)/api/admin/assets/route");
    const response = await PUT(
      buildJsonRequest("PUT", {
        path: "images/original.png",
        name: "renamed.png",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { path: "images/renamed.png" },
    });
  });

  it("retourne 400 en PUT quand le payload est invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { PUT } = await import("@/app/(api)/api/admin/assets/route");
    const response = await PUT(buildJsonRequest("PUT", { path: "images/file.png" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });

  it("retourne 500 si le renommage echoue en PUT", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.renameAssetAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom put"));

    const { PUT } = await import("@/app/(api)/api/admin/assets/route");
    const response = await PUT(
      buildJsonRequest("PUT", { path: "images/file.png", name: "new.png" }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom put" });
  });

  it("retourne le status mappe pour une erreur metier en PUT", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.renameAssetAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError("Asset introuvable", 404),
    );

    const { PUT } = await import("@/app/(api)/api/admin/assets/route");
    const response = await PUT(
      buildJsonRequest("PUT", { path: "images/file.png", name: "new.png" }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Asset introuvable" });
  });

  it("refuse DELETE sans auth", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { DELETE } = await import("@/app/(api)/api/admin/assets/route");
    const response = await DELETE(buildDeleteRequest("images/foo.png"));

    expect(response.status).toBe(401);
  });

  it("supprime un asset en DELETE", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.deleteAssetAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/(api)/api/admin/assets/route");
    const response = await DELETE(buildDeleteRequest("images/foo.png"));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
    });
  });

  it("retourne 400 en DELETE quand path est manquant", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { DELETE } = await import("@/app/(api)/api/admin/assets/route");
    const response = await DELETE(new NextRequest("http://localhost/api/admin/assets?path="));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });

  it("retourne 500 si la suppression echoue en DELETE", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.deleteAssetAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("boom delete"),
    );

    const { DELETE } = await import("@/app/(api)/api/admin/assets/route");
    const response = await DELETE(buildDeleteRequest("images/foo.png"));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false, error: "boom delete" });
  });

  it("retourne le status mappe pour une erreur metier en DELETE", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const module = await import("@/lib/modules/assets");
    (module.deleteAssetAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError("Asset introuvable", 404),
    );

    const { DELETE } = await import("@/app/(api)/api/admin/assets/route");
    const response = await DELETE(buildDeleteRequest("images/foo.png"));

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, error: "Asset introuvable" });
  });
});
