import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import {
  createAssetDirectorySchema,
  deleteAssetQuerySchema,
  listAssetsQuerySchema,
  renameAssetSchema,
  uploadAssetFormSchema,
} from "@/lib/schemas/asset.schema";
import {
  createAssetDirectoryAdmin,
  deleteAssetAdmin,
  listAssetsAdmin,
  renameAssetAdmin,
  uploadAssetAdmin,
} from "@/lib/modules/assets";

const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const { searchParams } = new URL(request.url);
  const { directory } = listAssetsQuerySchema.parse({
    directory: searchParams.get("directory"),
  });
  const result = await listAssetsAdmin(directory);
  return NextResponse.json<ApiResponse>({ success: true, data: result });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("Fichier requis", 400);
    }

    const { directory, overwrite } = uploadAssetFormSchema.parse({
      directory: formData.get("directory"),
      overwrite: formData.get("overwrite"),
    });
    const saved = await uploadAssetAdmin({
      directory,
      file,
      overwrite,
    });
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Asset uploadé avec succès",
      data: saved,
    });
  }

  const body = await request.json();
  const payload = createAssetDirectorySchema.parse(body);
  const created = await createAssetDirectoryAdmin(payload);
  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Dossier créé avec succès",
    data: created,
  });
});

export const PUT = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const body = await request.json();
  const payload = renameAssetSchema.parse(body);
  const renamed = await renameAssetAdmin(payload);
  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Asset renommé avec succès",
    data: renamed,
  });
});

export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const { searchParams } = new URL(request.url);
  const { path } = deleteAssetQuerySchema.parse({
    path: searchParams.get("path"),
  });
  await deleteAssetAdmin(path);
  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Asset supprimé avec succès",
  });
});
