import type {
  AssetCreateDirectoryPayload,
  AssetDeleteResult,
  AssetListResult,
  AssetRenamePayload,
  AssetRenameResult,
  AssetUploadPayload,
} from "../types";

export interface AssetsRepositoryPort {
  listByDirectory(directory?: string): Promise<AssetListResult>;
  uploadToDirectory(payload: AssetUploadPayload): Promise<{ path: string; name: string }>;
  createDirectory(payload: AssetCreateDirectoryPayload): Promise<{ path: string; name: string }>;
  renameByPath(payload: AssetRenamePayload): Promise<AssetRenameResult>;
  deleteByPath(assetPath: string): Promise<AssetDeleteResult>;
  getByPathInfo(assetPath: string): Promise<AssetDeleteResult>;
}

export interface AssetsMediaRepositoryPort {
  renameReferences(renameResult: AssetRenameResult): Promise<void>;
  cleanupReferences(asset: AssetDeleteResult): Promise<void>;
}
