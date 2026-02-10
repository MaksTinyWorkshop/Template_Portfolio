"use client";

import { DEFAULT_TEAM_MEMBER, PROJECT_TAGS } from "@/config/admin-defaults";
import { type ProjectFormData, projectSchema } from "@/lib/validations";
import type { ProjectMetadata } from "@/types/admin.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  DateInput,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
} from "@once-ui-system/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";
import { TagSelector } from "./TagSelector";

// Import dynamique de l'éditeur MDX pour éviter les erreurs SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: ProjectMetadata & { content: string };
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const initialPublishedAt = initialData?.publishedAt ?? todayIso;
  const initialStatus = initialData?.status ?? "draft";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date(initialPublishedAt));

  // Valeurs par défaut - Inclure Max automatiquement dans l'équipe pour les nouveaux projets
  const defaultValues = useMemo<ProjectFormData>(() => {
    const initialTeam =
      initialData?.team?.map((member) => ({
        ...member,
        linkedIn: member.linkedIn || "",
      })) || (mode === "create" ? [DEFAULT_TEAM_MEMBER] : []);

    return {
      title: initialData?.title || "",
      summary: initialData?.summary || "",
      publishedAt: initialPublishedAt,
      status: initialStatus,
      typeProjectTag: initialData?.typeProjectTag || [],
      featuredImage: initialData?.featuredImage || "",
      images: initialData?.images || [],
      team: initialTeam,
      link: initialData?.link || "",
      repository: initialData?.repository || "",
      content: initialData?.content || "",
    };
  }, [initialData, initialPublishedAt, initialStatus, mode]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
    setDate(new Date(initialPublishedAt));
    setValue("publishedAt", initialPublishedAt);
    setValue("status", initialStatus);
  }, [defaultValues, initialPublishedAt, initialStatus, reset, setValue]);

  // Pour les tableaux de strings, utiliser watch + setValue au lieu de useFieldArray
  const tags = watch("typeProjectTag") || [];
  const images = watch("images") || [];
  const featuredImage = watch("featuredImage") || "";
  const currentStatus = watch("status", initialStatus);

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({
    control,
    name: "team",
  });

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

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    setError(null);
    console.log("Données soumises:", data);

    try {
      console.log("Données soumises:", data);
      const endpoint = "/api/admin/projects";
      const method = mode === "create" ? "POST" : "PUT";

      const body = {
        metadata: {
          title: data.title,
          summary: data.summary,
          publishedAt: data.publishedAt,
          status: data.status,
          typeProjectTag: data.typeProjectTag,
          featuredImage: data.featuredImage,
          images: data.images,
          team: data.team,
          link: data.link,
          repository: data.repository,
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
        alert(
          `Projet ${mode === "create" ? "créé" : "mis à jour"} avec succès !`,
        );
        router.push("/admin/projects");
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Erreur soumission:", err);
      setError("Erreur lors de la soumission du formulaire");
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
          fillWidth
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            margin: "0 auto",
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
                  isSubmitted && errors.title ? errors.title.message : undefined
                }
              />
            </Flex>

            <Flex direction="column" gap="8">
              <Textarea
                id="summary"
                label="Résumé *"
                placeholder="Résumé du projet"
                lines={3}
                {...register("summary")}
                error={isSubmitted && !!errors.summary}
                errorMessage={
                  isSubmitted && errors.summary
                    ? errors.summary.message
                    : undefined
                }
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
                  isSubmitted && errors.publishedAt
                    ? errors.publishedAt.message
                    : undefined
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
                availableTags={PROJECT_TAGS}
                onTagsChange={(newTags) => setValue("typeProjectTag", newTags)}
                label="Sélectionnez les tags parmi la liste normée"
                allowCustom={false}
              />

              {isSubmitted && errors.typeProjectTag && (
                <Text variant="label-default-s" onBackground="danger-weak">
                  {errors.typeProjectTag.message}
                </Text>
              )}
            </Flex>

            <Heading as="h3" variant="heading-strong-l">
              🔗 Liens
            </Heading>

            <Flex direction="column" gap="8">
              <Input
                id="link"
                label="Lien du projet (URL)"
                placeholder="https://..."
                {...register("link")}
                error={isSubmitted && !!errors.link}
                errorMessage={
                  isSubmitted && errors.link ? errors.link.message : undefined
                }
              />
            </Flex>

            <Flex direction="column" gap="8">
              <Input
                id="repository"
                label="Repository Git (URL)"
                placeholder="https://github.com/..."
                {...register("repository")}
                error={isSubmitted && !!errors.repository}
                errorMessage={
                  isSubmitted && errors.repository
                    ? errors.repository.message
                    : undefined
                }
              />
            </Flex>
          </Flex>
        </Card>

        {/* Images */}
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
          <Flex direction="column" gap="24">
            <Heading as="h2" variant="heading-strong-l">
              🖼️ Images
            </Heading>

            <ImageUpload
              type="project"
              currentUrl={featuredImage}
              onUploadComplete={(url) => setValue("featuredImage", url)}
              label="Image principale"
            />

            <Flex direction="column" gap="16">
              <Text variant="heading-strong-m">Images du carousel</Text>

              {images.map((image, index) => (
                <Flex
                  key={image || `carousel-${index}`}
                  direction="column"
                  gap="8"
                >
                  <Flex horizontal="between" vertical="center">
                    <Text variant="label-default-s">Image {index + 1}</Text>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        setValue("images", newImages);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      🗑️ Retirer
                    </button>
                  </Flex>
                  <ImageUpload
                    type="project"
                    currentUrl={image}
                    onUploadComplete={(url) => {
                      const newImages = [...images];
                      newImages[index] = url;
                      setValue("images", newImages);
                    }}
                  />
                </Flex>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="m"
                onClick={() => setValue("images", [...images, ""])}
              >
                ➕ Ajouter une image au carousel
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Équipe */}
        <Card
          padding="24"
          border="neutral-medium"
          background="neutral-weak"
          fillWidth
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="16">
            <Heading as="h2" variant="heading-strong-l">
              👥 Équipe
            </Heading>

            <Text variant="body-default-s" onBackground="neutral-weak">
              💡 Max (toi) est automatiquement inclus dans l'équipe.
            </Text>

            {teamFields.map((field, index) => {
              const isMaxDefaultMember = index === 0 && mode === "create";
              const currentAvatar = watch(`team.${index}.avatar`) || "";

              // Ne pas afficher Max dans l'UI
              if (isMaxDefaultMember) {
                return null;
              }

              return (
                <Card key={field.id} padding="16" border="neutral-medium">
                  <Flex direction="column" gap="12">
                    <Flex horizontal="between" vertical="center">
                      <Text variant="label-default-m">Membre {index}</Text>
                      <button
                        type="button"
                        onClick={() => removeTeam(index)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        🗑️ Retirer
                      </button>
                    </Flex>

                    <Flex gap="8">
                      <Flex direction="column" gap="4" flex={1}>
                        <Input
                          id={`team-${index}-name`}
                          label="Nom"
                          {...register(`team.${index}.name`)}
                        />
                      </Flex>
                      <Flex direction="column" gap="4" flex={1}>
                        <Input
                          id={`team-${index}-role`}
                          label="Rôle"
                          {...register(`team.${index}.role`)}
                        />
                      </Flex>
                    </Flex>

                    <ImageUpload
                      type="avatar"
                      currentUrl={currentAvatar}
                      onUploadComplete={(url) =>
                        setValue(`team.${index}.avatar`, url)
                      }
                      label="Avatar du membre"
                    />

                    <Flex direction="column" gap="4">
                      <Input
                        id={`team-${index}-linkedin`}
                        label="LinkedIn (optionnel)"
                        placeholder="https://www.linkedin.com/in/..."
                        {...register(`team.${index}.linkedIn`)}
                      />
                    </Flex>
                  </Flex>
                </Card>
              );
            })}

            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={() =>
                appendTeam({ name: "", role: "", avatar: "", linkedIn: "" })
              }
            >
              ➕ Ajouter un membre
            </Button>
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
                ? "✨ Créer le projet"
                : "💾 Sauvegarder"}
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
