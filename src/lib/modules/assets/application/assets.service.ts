import path from "node:path";
import type { AssetCreateDirectoryPayload, AssetRenamePayload, AssetUploadPayload } from "../types";
import type { AssetsMediaRepositoryPort, AssetsRepositoryPort } from "./ports";
import { withRollback } from "@/lib/utils/with-rollback";

type AssetsServiceDeps = {
  assetsRepo: AssetsRepositoryPort;
  mediaRepo: AssetsMediaRepositoryPort;
  log?: Pick<typeof console, "error">;
};

export const makeAssetsService = ({ assetsRepo, mediaRepo, log = console }: AssetsServiceDeps) => {
  const listAssetsAdmin = (directory?: string) => assetsRepo.listByDirectory(directory);

  const uploadAssetAdmin = (payload: AssetUploadPayload) => assetsRepo.uploadToDirectory(payload);

  const createAssetDirectoryAdmin = (payload: AssetCreateDirectoryPayload) =>
    assetsRepo.createDirectory(payload);

  const renameAssetAdmin = async (payload: AssetRenamePayload) => {
    const renamed = await assetsRepo.renameByPath(payload);

    await withRollback(
      async () => {
        await mediaRepo.renameReferences(renamed);
        return renamed;
      },
      async () => {
        await assetsRepo.renameByPath({
          path: renamed.path,
          name: path.posix.basename(renamed.previousPath),
        });
      },
      {
        onRollbackError: (rollbackError) => {
          log.error("Rollback rename asset impossible:", rollbackError);
        },
      },
    );

    return renamed;
  };

  const deleteAssetAdmin = async (assetPath: string) => {
    const target = await assetsRepo.getByPathInfo(assetPath);
    const tempName = `__pending_delete_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${target.kind}`;
    const staged = await assetsRepo.renameByPath({
      path: assetPath,
      name: tempName,
    });

    return withRollback(
      async () => {
        await mediaRepo.cleanupReferences(target);
        return assetsRepo.deleteByPath(staged.path);
      },
      async () => {
        await assetsRepo.renameByPath({
          path: staged.path,
          name: path.posix.basename(target.path),
        });
      },
      {
        onRollbackError: (rollbackError) => {
          log.error("Rollback delete asset impossible:", rollbackError);
        },
      },
    );
  };

  return {
    listAssetsAdmin,
    uploadAssetAdmin,
    createAssetDirectoryAdmin,
    renameAssetAdmin,
    deleteAssetAdmin,
  };
};

export type AssetsService = ReturnType<typeof makeAssetsService>;
