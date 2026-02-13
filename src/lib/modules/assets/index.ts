import {
  createAssetDirectory,
  deleteAssetByPath,
  getAssetByPathInfo,
  listAssetsByDirectory,
  renameAssetByPath,
  uploadAssetToDirectory,
} from "./infrastructure/assets.repo";
import { cleanupAssetReferences, renameAssetReferences } from "./infrastructure/assets.media.repo";
import { makeAssetsService } from "./application/assets.service";

export * from "./application/assets.service";
export * from "./application/ports";
export * from "./types";

const service = makeAssetsService({
  assetsRepo: {
    listByDirectory: listAssetsByDirectory,
    uploadToDirectory: uploadAssetToDirectory,
    createDirectory: createAssetDirectory,
    renameByPath: renameAssetByPath,
    deleteByPath: deleteAssetByPath,
    getByPathInfo: getAssetByPathInfo,
  },
  mediaRepo: {
    renameReferences: renameAssetReferences,
    cleanupReferences: cleanupAssetReferences,
  },
});

export const {
  listAssetsAdmin,
  uploadAssetAdmin,
  createAssetDirectoryAdmin,
  renameAssetAdmin,
  deleteAssetAdmin,
} = service;
