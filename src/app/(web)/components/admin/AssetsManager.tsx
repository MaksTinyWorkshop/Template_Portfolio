"use client";

import { ConfirmModal } from "@/web/components/ui/ConfirmModal";
import { useToastService } from "@/web/components/utils/ToastService";
import { IMAGE_ASSET_EXTENSIONS } from "@/lib/modules/assets/constants";
import { Button, Card, Flex, Text } from "@once-ui-system/core";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AssetsManager.module.scss";

type AssetKind = "file" | "directory";

interface AssetListItem {
  path: string;
  name: string;
  kind: AssetKind;
  size: number | null;
  extension: string | null;
  updatedAt: string;
}

interface AssetListResult {
  directory: string;
  parentDirectory: string | null;
  items: AssetListItem[];
}

const IMAGE_EXTENSIONS: Set<string> = new Set(IMAGE_ASSET_EXTENSIONS);

const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const fileKindLabel = (item: AssetListItem) => {
  if (item.kind === "directory") return "Dossier";
  if (!item.extension) return "Fichier";
  return item.extension.replace(".", "").toUpperCase();
};

export function AssetsManager() {
  const { notify } = useToastService();
  const [directory, setDirectory] = useState("");
  const [data, setData] = useState<AssetListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs = useMemo(() => {
    const parts = directory ? directory.split("/") : [];
    const mapped = [{ label: "images", value: "" }];
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      mapped.push({ label: part, value: current });
    }
    return mapped;
  }, [directory]);

  const reload = useCallback(
    async (nextDirectory: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/assets?directory=${encodeURIComponent(nextDirectory)}`,
          { credentials: "include" },
        );
        const json = (await response.json()) as {
          success: boolean;
          error?: string;
          data?: AssetListResult;
        };
        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.error ?? "Impossible de charger les assets");
        }
        setData(json.data);
        setDirectory(json.data.directory);
      } catch (error) {
        notify({
          message: error instanceof Error ? error.message : "Erreur de chargement",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    void reload("");
  }, [reload]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setBusyPath("create-folder");
    try {
      const response = await fetch("/api/admin/assets", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          directory,
          name: folderName.trim(),
        }),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Création du dossier impossible");
      }
      setFolderName("");
      notify({ message: "Dossier créé", variant: "success" });
      await reload(directory);
    } catch (error) {
      notify({
        message: error instanceof Error ? error.message : "Erreur de création",
        variant: "danger",
      });
    } finally {
      setBusyPath(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setBusyPath("upload");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("directory", directory);
      formData.append("overwrite", overwrite ? "true" : "false");

      const response = await fetch("/api/admin/assets", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Upload impossible");
      }
      notify({ message: "Asset uploadé", variant: "success" });
      setSelectedFile(null);
      setOverwrite(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await reload(directory);
    } catch (error) {
      notify({
        message: error instanceof Error ? error.message : "Erreur upload",
        variant: "danger",
      });
    } finally {
      setBusyPath(null);
    }
  };

  const handleRename = async (item: AssetListItem) => {
    const nextName = prompt(`Nouveau nom pour "${item.name}"`, item.name);
    if (!nextName || nextName === item.name) return;
    setBusyPath(item.path);
    try {
      const response = await fetch("/api/admin/assets", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: item.path,
          name: nextName.trim(),
        }),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Renommage impossible");
      }
      notify({ message: "Asset renommé", variant: "success" });
      await reload(directory);
    } catch (error) {
      notify({
        message: error instanceof Error ? error.message : "Erreur renommage",
        variant: "danger",
      });
    } finally {
      setBusyPath(null);
    }
  };

  const performDelete = async (item: AssetListItem) => {
    setBusyPath(item.path);
    try {
      const response = await fetch(`/api/admin/assets?path=${encodeURIComponent(item.path)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Suppression impossible");
      }
      notify({ message: "Asset supprimé", variant: "success" });
      await reload(directory);
    } catch (error) {
      notify({
        message: error instanceof Error ? error.message : "Erreur suppression",
        variant: "danger",
      });
    } finally {
      setBusyPath(null);
    }
  };

  const requestDelete = (item: AssetListItem) => {
    setConfirmState({
      title: "Supprimer",
      message: `Supprimer ${
        item.kind === "directory" ? "le dossier" : "le fichier"
      } "${item.name}" ?`,
      onConfirm: async () => {
        await performDelete(item);
      },
    });
  };

  return (
    <Flex direction="column" gap="16" fillWidth className={styles.container}>
      <ConfirmModal
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        busy={busyPath !== null}
        onClose={() => setConfirmState(null)}
        onConfirm={async () => {
          if (!confirmState) return;
          const action = confirmState.onConfirm;
          setConfirmState(null);
          await action();
        }}
      />
      <Card
        padding="16"
        border="neutral-medium"
        background="neutral-weak"
        className={styles.toolbarCard}
      >
        <Flex direction="column" gap="12" fillWidth>
          <Flex gap="8" wrap className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <Button
                key={`${crumb.value}-${index}`}
                size="s"
                variant={index === breadcrumbs.length - 1 ? "primary" : "secondary"}
                onClick={() => void reload(crumb.value)}
                disabled={loading}
              >
                {crumb.label}
              </Button>
            ))}
          </Flex>

          <Flex gap="8" wrap vertical="center" className={styles.controlsRow}>
            <input
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Nouveau dossier"
              className={styles.input}
            />
            <Button
              size="s"
              variant="secondary"
              onClick={() => void handleCreateFolder()}
              disabled={busyPath === "create-folder" || !folderName.trim()}
            >
              ➕ Dossier
            </Button>
          </Flex>

          <Flex gap="8" wrap vertical="center" className={styles.controlsRow}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
            <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(event) => setOverwrite(event.target.checked)}
              />
              <Text variant="label-default-s">Écraser si existant</Text>
            </label>
            <Button
              size="s"
              variant="primary"
              onClick={() => void handleUpload()}
              disabled={busyPath === "upload" || !selectedFile}
            >
              📤 Uploader
            </Button>
          </Flex>
          <Text variant="label-default-s" className={styles.helper}>
            Scope limité à <code>/public/images</code> (images, vidéos, dossiers).
          </Text>
        </Flex>
      </Card>

      <Card
        padding="0"
        border="neutral-medium"
        background="neutral-weak"
        className={styles.listCard}
      >
        {loading ? (
          <Flex padding="16" className={styles.empty}>
            <Text>Chargement des assets...</Text>
          </Flex>
        ) : !data || data.items.length === 0 ? (
          <Flex padding="16" className={styles.empty}>
            <Text>Aucun asset dans ce dossier.</Text>
          </Flex>
        ) : (
          <Flex direction="column" fillWidth>
            <div className={styles.listHeader}>
              <Text variant="label-default-m">Nom / Infos</Text>
              <Text variant="label-default-m" align="right">
                Actions
              </Text>
            </div>
            <div className={styles.list}>
              {data.items.map((item) => {
                const assetUrl = `/api/assets/${item.path}`;
                const isImage =
                  item.kind === "file" &&
                  Boolean(item.extension && IMAGE_EXTENSIONS.has(item.extension));

                return (
                  <div key={item.path} className={styles.item}>
                    <div className={styles.main}>
                      <div className={styles.preview}>
                        {item.kind === "directory" ? (
                          "📁"
                        ) : isImage ? (
                          <Image
                            src={assetUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className={styles.previewImage}
                          />
                        ) : (
                          "🎬"
                        )}
                      </div>
                      <div className={styles.nameStack}>
                        {item.kind === "directory" ? (
                          <button
                            type="button"
                            onClick={() => void reload(item.path)}
                            className={styles.nameButton}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <a
                            href={assetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.nameLink}
                          >
                            {item.name}
                          </a>
                        )}
                        <Text variant="label-default-s" className={styles.meta}>
                          {fileKindLabel(item)} • {formatBytes(item.size)} •{" "}
                          {formatDate(item.updatedAt)}
                        </Text>
                      </div>
                    </div>
                    <Flex gap="8" horizontal="end" className={styles.actions}>
                      <Button
                        size="s"
                        variant="secondary"
                        disabled={busyPath === item.path}
                        onClick={() => void handleRename(item)}
                      >
                        ✏️ Renommer
                      </Button>
                      <Button
                        size="s"
                        variant="secondary"
                        disabled={busyPath === item.path}
                        onClick={() => requestDelete(item)}
                      >
                        🗑️ Supprimer
                      </Button>
                    </Flex>
                  </div>
                );
              })}
            </div>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
