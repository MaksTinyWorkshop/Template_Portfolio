"use client";

import { type PostFormData, postSchema } from "@/lib/contracts/validations";
import { useToastService } from "@/web/components/utils/ToastService";
import type { PostMetadata } from "@/web/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  DateInput,
  Flex,
  Heading,
  Input,
  Row,
  Select,
  Text,
  Textarea,
} from "@once-ui-system/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";
import { TagSelector } from "./TagSelector";

// Import dynamique de l'éditeur MDX pour éviter les erreurs SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const DEFAULT_ARTICLE_TAG_SUGGESTIONS = [
  "Tech",
  "Design",
  "Dev",
  "Product",
  "Business",
  "Tutorial",
  "Opinion",
  "News",
];

function normalizePublishedDate(value: string) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("T")) {
    return trimmed;
  }

  const monthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const [, yearStr, monthStr] = monthMatch;
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const date = new Date(Date.UTC(year, monthIndex, 1));
    return date.toISOString();
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return trimmed;
}

interface PostFormProps {
  mode: "create" | "edit";
  initialData?: PostMetadata & { content: string };
}

export function PostForm({ mode, initialData }: PostFormProps) {
  console.log("PostForm render:", { mode, initialData });
  const router = useRouter();
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const initialPublishedAt = initialData?.publishedAt ?? todayIso;
  const initialStatus = initialData?.status ?? "draft";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date(initialPublishedAt));
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_ARTICLE_TAG_SUGGESTIONS);

  const defaultValues = useMemo<PostFormData>(() => {
    return {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      publishedAt: initialPublishedAt,
      status: initialStatus,
      image: initialData?.image || "",
      tags: initialData?.tags || [],
      content: initialData?.content || "",
    };
  }, [initialData, initialPublishedAt, initialStatus]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
    setDate(new Date(initialPublishedAt));
    setValue("publishedAt", initialPublishedAt);
    setValue("status", initialStatus);
  }, [defaultValues, initialPublishedAt, initialStatus, reset, setValue]);

  useEffect(() => {
    setTags(initialData?.tags ?? []);
  }, [initialData?.tags]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/posts/tags", {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          setAvailableTags(json.data);
        }
      } catch (err) {
        console.error("Impossible de récupérer les tags articles", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentImage = watch("image") || "";
  const currentStatus = watch("status", initialStatus);

  // Handlers stabilisés pour mobile
  const handleDateChange = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      setValue("publishedAt", newDate.toISOString().split("T")[0]);
    },
    [setValue],
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setValue("status", status as "draft" | "scheduled" | "published", {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const { notify } = useToastService();

  const onSubmit = async (data: PostFormData) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = "/api/admin/posts";
      const method = mode === "create" ? "POST" : "PUT";

      const normalizedPublishedAt = normalizePublishedDate(data.publishedAt);

      const body = {
        metadata: {
          title: data.title,
          summary: data.summary,
          publishedAt: normalizedPublishedAt,
          status: data.status,
          image: data.image,
          tags: data.tags,
        },
        content: data.content,
        ...(mode === "edit" && {
          slug: initialData?.slug,
          oldSlug: initialData?.slug,
        }),
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        notify({
          message: `Article ${mode === "create" ? "créé" : "mis à jour"} avec succès !`,
          variant: "success",
        });
        router.push("/admin/blog");
        router.refresh();
      } else {
        const errorMessage = result.error || "Une erreur est survenue";
        setError(errorMessage);
        notify({
          message: errorMessage,
          variant: "danger",
        });
      }
    } catch (err) {
      console.error("Erreur soumission:", err);
      setError("Erreur lors de la soumission du formulaire");
      notify({
        message: "Erreur lors de la soumission du formulaire",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="24" fillWidth>
        {error && (
          <Card padding="16" background="danger-weak" border="danger-medium">
            <Text variant="body-default-m" onBackground="danger-weak">
              ❌ {error}
            </Text>
          </Card>
        )}

        {/* Informations de base */}
        <Card
          padding="24"
          border="neutral-medium"
          background="neutral-weak"
          style={{
            position: "relative",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            paddingTop: "28px",
            paddingBottom: "28px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Flex direction="column" gap="20" fillWidth>
            <Heading as="h2" variant="heading-strong-l">
              📝 Informations générales
            </Heading>

            <Flex direction="column" gap="8">
              <Input
                id="title"
                label="Titre *"
                {...register("title")}
                error={isSubmitted && !!errors.title}
                errorMessage={
                  isSubmitted && errors.title ? (
                    <Row vertical="center" gap="8">
                      {errors.title.message}
                    </Row>
                  ) : undefined
                }
              />
            </Flex>

            <Flex direction="column" gap="8">
              <Textarea
                id="summary"
                label="Résumé *"
                placeholder="Résumé de l'article (affiché sur la page d'accueil du blog)"
                lines={3}
                {...register("summary")}
                error={isSubmitted && !!errors.summary}
                errorMessage={isSubmitted && errors.summary ? errors.summary.message : undefined}
              />
            </Flex>

            <Flex direction="column" gap="8">
              <DateInput
                key={`date-${date?.toISOString()}`}
                id="publishedAt"
                label="Date de publication *"
                value={date}
                onChange={handleDateChange}
                error={isSubmitted && !!errors.publishedAt}
                errorMessage={
                  isSubmitted && errors.publishedAt ? errors.publishedAt.message : undefined
                }
              />
            </Flex>

            <Flex direction="column" gap="8">
              <Select
                key={`status-${currentStatus}`}
                id="status"
                label="Statut *"
                value={currentStatus}
                options={[
                  { label: "Brouillon", value: "draft" },
                  { label: "Planifié", value: "scheduled" },
                  { label: "Publié", value: "published" },
                ]}
                onSelect={handleStatusChange}
              />
            </Flex>

            <Flex direction="column" gap="4">
              <TagSelector
                selectedTags={tags}
                availableTags={availableTags}
                onTagsChange={(newTags) => {
                  setTags(newTags);
                  setValue("tags", newTags, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                label="Tags de l'article *"
                allowCustom={false}
              />
              {isSubmitted && errors.tags && (
                <Text variant="label-default-s" onBackground="danger-weak">
                  {errors.tags.message}
                </Text>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* Image */}
        <Card
          padding="24"
          border="neutral-medium"
          background="neutral-weak"
          fillWidth
          horizontal="center"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="16">
            <Heading as="h2" variant="heading-strong-l">
              🖼️ Image de l'article
            </Heading>

            <ImageUpload
              type="post"
              currentUrl={currentImage}
              onUploadComplete={(url) => setValue("image", url)}
              label="Image principale (optionnelle)"
            />

            {isSubmitted && errors.image && (
              <Text variant="label-default-s" onBackground="danger-weak">
                {errors.image.message}
              </Text>
            )}
          </Flex>
        </Card>

        {/* Contenu MDX */}
        <Card
          padding="24"
          border="neutral-medium"
          background="neutral-weak"
          fillWidth
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            width: "100%",
          }}
        >
          <Flex direction="column" gap="16" fillWidth>
            <Heading as="h2" variant="heading-strong-l">
              📄 Contenu (Markdown/MDX)
            </Heading>

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={(value) => field.onChange(value || "")}
                  height={500}
                  preview="live"
                  style={{ width: "100%" }}
                />
              )}
            />
            {isSubmitted && errors.content && (
              <Text variant="label-default-s" onBackground="danger-weak">
                {errors.content.message}
              </Text>
            )}
          </Flex>
        </Card>

        {/* Actions */}
        <Flex gap="16" horizontal="end">
          <Button
            type="button"
            variant="secondary"
            size="m"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="m" disabled={loading}>
            {loading
              ? "Enregistrement..."
              : mode === "create"
                ? "✨ Créer l'article"
                : "💾 Sauvegarder"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
