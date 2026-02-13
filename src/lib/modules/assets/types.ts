export type AssetKind = "file" | "directory";

export interface AssetListItem {
  path: string;
  name: string;
  kind: AssetKind;
  size: number | null;
  extension: string | null;
  updatedAt: string;
}

export interface AssetListResult {
  directory: string;
  parentDirectory: string | null;
  items: AssetListItem[];
}

export interface AssetUploadPayload {
  directory?: string;
  file: File;
  overwrite?: boolean;
}

export interface AssetCreateDirectoryPayload {
  directory?: string;
  name: string;
}

export interface AssetRenamePayload {
  path: string;
  name: string;
}

export interface AssetRenameResult {
  previousPath: string;
  path: string;
  name: string;
  kind: AssetKind;
}

export interface AssetDeleteResult {
  path: string;
  kind: AssetKind;
}
