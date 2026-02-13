"use client";

import { Button, Flex, Text } from "@once-ui-system/core";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getAssetDirectoryFromType,
  IMAGE_ASSET_EXTENSIONS,
  UPLOAD_IMAGE_MIME_TYPES,
} from "@/lib/modules/assets/constants";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

interface ImageUploadProps {
  type: "project" | "post" | "avatar";
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  label?: string;
}

interface AssetListItem {
  path: string;
  name: string;
  kind: "file" | "directory";
  extension: string | null;
}

interface AssetListResult {
  directory: string;
  parentDirectory: string | null;
  items: AssetListItem[];
}

const IMAGE_EXTENSIONS: Set<string> = new Set(IMAGE_ASSET_EXTENSIONS);

const isImageAsset = (asset: AssetListItem) =>
  asset.kind === "file" && Boolean(asset.extension && IMAGE_EXTENSIONS.has(asset.extension));

export function ImageUpload({ type, onUploadComplete, currentUrl, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [quality, setQuality] = useState(80);
  const [uploadStats, setUploadStats] = useState<{
    originalSize: number;
    outputSize: number;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showAssetsPicker, setShowAssetsPicker] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<AssetListResult | null>(null);
  const previewControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptValue = UPLOAD_IMAGE_MIME_TYPES.join(",");

  const loadAssets = async (directory?: string) => {
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const targetDirectory = directory ?? assetData?.directory ?? getAssetDirectoryFromType(type);
      const response = await fetch(
        `/api/admin/assets?directory=${encodeURIComponent(targetDirectory)}`,
        {
          credentials: "include",
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: AssetListResult;
      };
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Impossible de charger les assets");
      }
      setAssetData(result.data);
    } catch (err) {
      setAssetsError(err instanceof Error ? err.message : "Impossible de charger les assets");
    } finally {
      setAssetsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification côté client
    if (!UPLOAD_IMAGE_MIME_TYPES.includes(file.type as (typeof UPLOAD_IMAGE_MIME_TYPES)[number])) {
      setError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      setSelectedFile(null);
      setShowNameInput(false);
      setUploadStats(null);
      setPreviewError(null);
      setPreviewUrl(currentUrl || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Fichier trop volumineux. Maximum 5MB.");
      setSelectedFile(null);
      setShowNameInput(false);
      setUploadStats(null);
      setPreviewError(null);
      setPreviewUrl(currentUrl || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setError(null);
    setSelectedFile(file);
    setShowNameInput(true);

    // Créer une preview locale
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!selectedFile) {
      setUploadStats(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    previewControllerRef.current?.abort();
    previewControllerRef.current = controller;
    setPreviewLoading(true);
    setPreviewError(null);

    const fetchPreview = async () => {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", type);
        formData.append("includeTimestamp", includeTimestamp ? "true" : "false");
        formData.append("quality", quality.toString());
        formData.append("previewOnly", "true");

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
          credentials: "include",
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Impossible de préparer la prévisualisation");
        }

        if (controller.signal.aborted) {
          return;
        }

        setUploadStats({
          originalSize: selectedFile.size,
          outputSize: result.data.transformedSize,
        });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setPreviewError(err instanceof Error ? err.message : "Prévisualisation indisponible");
      } finally {
        if (!controller.signal.aborted) {
          setPreviewLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      controller.abort();
    };
  }, [selectedFile, includeTimestamp, quality, type]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(currentUrl || null);
    }
  }, [currentUrl, selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Upload vers l'API
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", type);
      formData.append("includeTimestamp", includeTimestamp ? "true" : "false");
      if (customName.trim()) {
        formData.append("customName", customName.trim());
      }
      formData.append("quality", quality.toString());

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'upload");
      }

      // Notifier le parent avec l'URL
      onUploadComplete(result.data.url);
      setPreviewUrl(result.data.url);
      setShowNameInput(false);
      setCustomName("");
      setSelectedFile(null);
      setIncludeTimestamp(true);
      setQuality(80);
      setUploadStats({
        originalSize: result.data.size,
        outputSize: result.data.transformedSize,
      });
    } catch (err) {
      console.error("Erreur upload:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setPreviewUrl(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePickExistingAsset = (assetPath: string) => {
    const resolvedUrl = `/api/assets/${assetPath}`;
    setPreviewUrl(resolvedUrl);
    onUploadComplete(resolvedUrl);
    setShowAssetsPicker(false);
    setShowNameInput(false);
    setSelectedFile(null);
    setError(null);
    setUploadStats(null);
    setPreviewError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleAssetsPicker = async () => {
    const nextState = !showAssetsPicker;
    setShowAssetsPicker(nextState);
    if (nextState) {
      await loadAssets(getAssetDirectoryFromType(type));
    }
  };

  const handleRemove = async () => {
    // Detach only. Asset lifecycle is managed in /admin/assets.
    setPreviewUrl(null);
    onUploadComplete("");
    setShowNameInput(false);
    setCustomName("");
    setSelectedFile(null);
    setIncludeTimestamp(true);
    setQuality(80);
    setUploadStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setPreviewUrl(currentUrl || null);
    setShowNameInput(false);
    setCustomName("");
    setSelectedFile(null);
    setIncludeTimestamp(true);
    setQuality(80);
    setUploadStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Flex direction="column" gap="12">
      {label && <Text variant="label-default-s">{label}</Text>}

      <input
        ref={fileInputRef}
        id={`file-input-${type}`}
        type="file"
        accept={acceptValue}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        aria-label="Sélectionner une image à uploader"
        aria-describedby={`file-formats-${type}`}
      />

      {previewUrl && (
        <Flex direction="column" gap="8">
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              height: "200px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--neutral-border-medium)",
            }}
          >
            <Image
              src={previewUrl}
              alt={`Prévisualisation de l'image ${type === "project" ? "du projet" : type === "post" ? "de l'article" : "de l'avatar"}`}
              fill
              style={{ objectFit: "cover" }}
              unoptimized={previewUrl.startsWith("data:")}
            />
          </div>

          {showNameInput && (
            <Flex direction="column" gap="8">
              <label htmlFor={`${type}-custom-name`} style={{ fontSize: "14px", fontWeight: 500 }}>
                Nom du fichier (optionnel)
              </label>
              <input
                id={`${type}-custom-name`}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="ex: mon-image"
                aria-describedby={`${type}-name-hint`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--neutral-border-medium)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "var(--neutral-surface-strong)",
                  color: "var(--neutral-on-background-strong)",
                }}
              />
              <Flex gap="8" vertical="center">
                <input
                  id={`${type}-timestamp-toggle`}
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                />
                <label htmlFor={`${type}-timestamp-toggle`} style={{ fontSize: "13px" }}>
                  Ajouter un timestamp automatique au nom de fichier
                </label>
              </Flex>
              <Flex direction="column" gap="4">
                <label htmlFor={`${type}-quality`} style={{ fontSize: "13px", fontWeight: 500 }}>
                  Qualité de compression WebP : {quality}%
                </label>
                <input
                  id={`${type}-quality`}
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number.parseInt(e.target.value, 10))}
                  aria-valuemin={50}
                  aria-valuemax={95}
                  aria-valuenow={quality}
                  aria-valuetext={`${quality} pourcent`}
                  style={{ width: "100%" }}
                />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Min: 50% | Max: 95%
                </Text>
              </Flex>
              {selectedFile && (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Taille sélectionnée : {formatBytes(selectedFile.size)}
                </Text>
              )}
              {previewLoading && (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Calcul de l'estimation WebP...
                </Text>
              )}
              {previewError && (
                <Text
                  variant="body-default-xs"
                  onBackground="danger-weak"
                  role="alert"
                  aria-live="polite"
                >
                  ⚠️ {previewError}
                </Text>
              )}
              <Text id={`${type}-name-hint`} variant="body-default-xs" onBackground="neutral-weak">
                💡 Si vide, un nom unique sera généré automatiquement
              </Text>
              <Flex gap="8">
                <Button
                  type="button"
                  variant="primary"
                  size="s"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "⏳ Upload..." : "✅ Uploader"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="s"
                  onClick={handleCancel}
                  disabled={uploading}
                >
                  ❌ Annuler
                </Button>
              </Flex>
            </Flex>
          )}

          {!showNameInput && (
            <Flex gap="8">
              <Button
                type="button"
                variant="secondary"
                size="s"
                onClick={handleButtonClick}
                disabled={uploading}
              >
                🔄 Changer l'image
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="s"
                onClick={handleRemove}
                disabled={uploading}
              >
                🗑️ Retirer
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      {!previewUrl && (
        <>
          <Flex gap="8" wrap>
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={handleButtonClick}
              disabled={uploading}
              aria-describedby={`file-formats-${type}`}
            >
              {uploading ? "⏳ Upload en cours..." : "📤 Choisir une image"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={() => void toggleAssetsPicker()}
              disabled={uploading}
            >
              🗂️ Asset existant
            </Button>
          </Flex>
          <Text id={`file-formats-${type}`} variant="body-default-xs" onBackground="neutral-weak">
            Formats acceptés : JPEG, PNG, WebP, GIF. Taille maximum : 5MB.
          </Text>
        </>
      )}

      {previewUrl && !showNameInput && (
        <Button
          type="button"
          variant="secondary"
          size="s"
          onClick={() => void toggleAssetsPicker()}
          disabled={uploading}
        >
          {showAssetsPicker ? "📁 Fermer les assets" : "🗂️ Choisir un asset existant"}
        </Button>
      )}

      {showAssetsPicker && (
        <Flex
          direction="column"
          gap="8"
          style={{
            border: "1px solid var(--neutral-border-medium)",
            borderRadius: "8px",
            padding: "10px",
            maxHeight: "280px",
            overflow: "auto",
          }}
        >
          <Flex gap="8" wrap>
            <Button
              type="button"
              variant="secondary"
              size="s"
              onClick={() => void loadAssets("")}
              disabled={assetsLoading}
            >
              images
            </Button>
            {assetData?.parentDirectory && (
              <Button
                type="button"
                variant="secondary"
                size="s"
                onClick={() => void loadAssets(assetData.parentDirectory ?? "")}
                disabled={assetsLoading}
              >
                ⬆️ Parent
              </Button>
            )}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {assetData?.directory ? `/api/assets/${assetData.directory}` : "/api/assets"}
            </Text>
          </Flex>

          {assetsLoading && (
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Chargement des assets...
            </Text>
          )}

          {assetsError && (
            <Text variant="body-default-xs" onBackground="danger-weak">
              ⚠️ {assetsError}
            </Text>
          )}

          {!assetsLoading && !assetsError && (
            <Flex direction="column" gap="8">
              {(assetData?.items ?? []).map((item) =>
                item.kind === "directory" ? (
                  <Button
                    key={item.path}
                    type="button"
                    variant="secondary"
                    size="s"
                    onClick={() => void loadAssets(item.path)}
                    style={{ justifyContent: "flex-start" }}
                  >
                    📁 {item.name}
                  </Button>
                ) : isImageAsset(item) ? (
                  <Button
                    key={item.path}
                    type="button"
                    variant="secondary"
                    size="s"
                    onClick={() => handlePickExistingAsset(item.path)}
                    style={{ justifyContent: "flex-start" }}
                  >
                    🖼️ {item.name}
                  </Button>
                ) : null,
              )}
            </Flex>
          )}
        </Flex>
      )}

      {error && (
        <Text
          variant="body-default-s"
          onBackground="danger-weak"
          role="alert"
          aria-live="assertive"
        >
          ⚠️ {error}
        </Text>
      )}

      {previewUrl && !previewUrl.startsWith("data:") && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          URL : {previewUrl}
        </Text>
      )}

      {uploadStats && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Taille originale : {formatBytes(uploadStats.originalSize)} • Sortie WebP :{" "}
          {formatBytes(uploadStats.outputSize)}
        </Text>
      )}
    </Flex>
  );
}
