"use client";

import { useState, useRef, useEffect } from "react";
import { Flex, Button, Text } from "@once-ui-system/core";
import Image from "next/image";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

interface ImageUploadProps {
  type: "project" | "post" | "avatar";
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  label?: string;
}

export function ImageUpload({ type, onUploadComplete, currentUrl, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [quality, setQuality] = useState(80);
  const [uploadStats, setUploadStats] = useState<{ originalSize: number; outputSize: number } | null>(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const previewControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification côté client
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Fichier trop volumineux. Maximum 5MB.");
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

  const deleteUploadedFile = async () => {
    if (!uploadedFilename) return;

    try {
      await fetch(
        `/api/admin/upload?filename=${encodeURIComponent(uploadedFilename)}&type=${encodeURIComponent(
          type,
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
    } catch (deleteError) {
      console.error("Erreur suppression image uploadée:", deleteError);
    } finally {
      setUploadedFilename(null);
    }
  };

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
      setUploadedFilename(result.data.filename);
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

  const handleRemove = async () => {
    await deleteUploadedFile();
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
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: "none" }}
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
              alt="Preview"
              fill
              style={{ objectFit: "cover" }}
              unoptimized={previewUrl.startsWith("data:")}
            />
          </div>

          {showNameInput && (
            <Flex direction="column" gap="8">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nom du fichier (optionnel, ex: mon-image)"
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
                <label htmlFor={`${type}-quality`} style={{ fontSize: "13px" }}>
                  Qualité de compression AVIF : {quality}%
                </label>
                <input
                  id={`${type}-quality`}
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number.parseInt(e.target.value, 10))}
                  style={{ width: "100%" }}
                />
              </Flex>
              {selectedFile && (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Taille sélectionnée : {formatBytes(selectedFile.size)}
                </Text>
              )}
              {previewLoading && (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Calcul de l'estimation AVIF...
                </Text>
              )}
              {previewError && (
                <Text variant="body-default-xs" onBackground="danger-weak">
                  ⚠️ {previewError}
                </Text>
              )}
              <Text variant="body-default-xs" onBackground="neutral-weak">
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
        <Button
          type="button"
          variant="secondary"
          size="m"
          onClick={handleButtonClick}
          disabled={uploading}
        >
          {uploading ? "⏳ Upload en cours..." : "📤 Choisir une image"}
        </Button>
      )}

      {error && (
        <Text variant="body-default-s" onBackground="danger-weak">
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
          Taille originale : {formatBytes(uploadStats.originalSize)} • Sortie AVIF :{" "}
          {formatBytes(uploadStats.outputSize)}
        </Text>
      )}
    </Flex>
  );
}
