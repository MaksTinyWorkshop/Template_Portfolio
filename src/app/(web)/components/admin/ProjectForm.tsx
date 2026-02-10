"use client";

import { projectSchema, type ProjectFormData } from "@/lib/contracts/validations";
import type { ProjectMetadata, ProjectTeamMember } from "@/web/types";
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
import { Controller, useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { ImageUpload } from "./ImageUpload";
import { TagSelector } from "./TagSelector";
import { useToastService } from "@/web/components/utils/ToastService";
import { KnownTeamMemberField } from "./KnownTeamMemberField";

type AvailablePerson = {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  role?: string | null;
  avatar?: string | null;
  email?: string | null;
  profileData?: {
    contacts?: Record<string, string>;
  };
};

const getLinkedInFromContacts = (contacts?: Record<string, string>) => {
  if (!contacts) return undefined;
  const entry = Object.entries(contacts).find(([key]) => key.toLowerCase() === "linkedin");
  return entry ? entry[1] : undefined;
};

const contactsToSocials = (contacts?: Record<string, string>) => {
  if (!contacts) return [];
  return Object.entries(contacts)
    .filter(([key]) => key.toLowerCase() !== "linkedin")
    .map(([key, value]) => ({
      name: key,
      url: value,
    }));
};

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

// Import dynamique de l'éditeur MDX pour éviter les erreurs SSR
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: (ProjectMetadata & { content: string }) | null;
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  console.log("ProjectForm render:", { mode, initialData });
  const router = useRouter();
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const initialPublishedAt = initialData?.publishedAt ?? todayIso;
  const initialStatus = initialData?.status ?? "draft";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date(initialPublishedAt));
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availablePeople, setAvailablePeople] = useState<AvailablePerson[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");

  // Valeurs par défaut - Inclure Max automatiquement dans l'équipe pour les nouveaux projets
  const defaultValues = useMemo<ProjectFormData>(() => {
    const initialTeam =
      initialData?.team
        ?.filter((member: ProjectTeamMember) => !member.isSiteOwner)
          ?.map((member: ProjectTeamMember) => ({
            ...member,
            linkedIn: member.linkedIn || "",
            firstName: member.firstName ?? "",
            lastName: member.lastName ?? "",
            pseudo: member.pseudo ?? "",
            email: member.email ?? "",
            socials: (member.socials ?? []).map((social) => ({
              name: social.name,
              url: social.url ?? "",
            })),
            avatar: member.avatar ?? "",
          })) ?? [];

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
  }, [initialData, initialPublishedAt, initialStatus]);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/projects/tags");
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          setAvailableTags(json.data);
        }
      } catch (err) {
        console.error("Impossible de récupérer les tags", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/persons", { credentials: "include" });
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          setAvailablePeople(json.data);
        }
      } catch (err) {
        console.error("Impossible de récupérer les membres disponibles", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const selectedPersonIds = useMemo(() => {
    return new Set(
      teamFields.map((field) => field.personId).filter((value): value is string => Boolean(value)),
    );
  }, [teamFields]);

  const selectablePeople = useMemo(
    () => availablePeople.filter((person) => !selectedPersonIds.has(person.id)),
    [availablePeople, selectedPersonIds],
  );

  const personLookup = useMemo(() => {
    const map: Record<string, AvailablePerson> = {};
    availablePeople.forEach((person) => {
      map[person.id] = person;
    });
    return map;
  }, [availablePeople]);

  const handleAddExistingMember = () => {
    if (!selectedPersonId) return;
    const person = availablePeople.find((entry) => entry.id === selectedPersonId);
    if (!person) return;

    const socials = contactsToSocials(person.profileData?.contacts);
    const linkedIn = getLinkedInFromContacts(person.profileData?.contacts);

    appendTeam({
      name: person.pseudo ?? person.fullName,
      role: person.role ?? "",
      avatar: person.avatar ?? "",
      linkedIn: linkedIn ?? "",
      email: person.email ?? "",
      firstName: person.firstName ?? "",
      lastName: person.lastName ?? "",
      pseudo: person.pseudo ?? "",
      socials,
      personId: person.id,
      isSiteOwner: false,
    });
    setSelectedPersonId("");
  };

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

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    setError(null);
    console.log("Données soumises:", data);

    try {
      console.log("Données soumises:", data);
      const endpoint = "/api/admin/projects";
      const method = mode === "create" ? "POST" : "PUT";

      const normalizedPublishedAt = normalizePublishedDate(data.publishedAt);

      const body = {
        metadata: {
          title: data.title,
          summary: data.summary,
          publishedAt: normalizedPublishedAt,
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
        notify({
          message: `Projet ${mode === "create" ? "créé" : "mis à jour"} avec succès !`,
          variant: "success",
        });
        router.push("/admin/projects");
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
                errorMessage={isSubmitted && errors.title ? errors.title.message : undefined}
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
                errorMessage={isSubmitted && errors.link ? errors.link.message : undefined}
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
                  isSubmitted && errors.repository ? errors.repository.message : undefined
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
                <Flex key={image || `carousel-${index}`} direction="column" gap="8">
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
          <Flex direction="column" gap="16" fillWidth>
            <Heading as="h2" variant="heading-strong-l">
              👥 Équipe
            </Heading>

            <Text variant="body-default-s" onBackground="neutral-weak">
              💡 Le propriétaire du site est automatiquement inclus dans l'équipe.
            </Text>

            <Flex gap="12" wrap>
              <Select
                id="existing-member-select"
                label="Ajouter un membre existant"
                value={selectedPersonId}
                options={selectablePeople.map((person) => ({
                  label: `${person.pseudo ?? person.fullName}${
                    person.role ? ` • ${person.role}` : ""
                  }`,
                  value: person.id,
                }))}
                onSelect={(value) => setSelectedPersonId(value)}
              />
              <Button
                type="button"
                variant="secondary"
                size="m"
                disabled={!selectedPersonId}
                onClick={handleAddExistingMember}
              >
                ➕ Ajouter depuis la base
              </Button>
            </Flex>

            {teamFields.map((field, index) => {
              const existingPerson = personLookup[field.personId ?? ""];
              if (existingPerson) {
                return (
                  <KnownTeamMemberField
                    key={field.id}
                    index={index}
                    person={existingPerson}
                    register={register}
                    onRemove={() => removeTeam(index)}
                    errorMessage={errors.team?.[index]?.role?.message}
                  />
                );
              }

              const currentAvatar = watch(`team.${index}.avatar`) || "";
              const socials = watch(`team.${index}.socials`) ?? [];
              const memberErrors = errors.team?.[index];
              const linkedinError = memberErrors?.linkedIn?.message;

              const addSocial = () => {
                const key = `team.${index}.socials` as FieldPath<ProjectFormData>;
                setValue(key, [...socials, { name: "", url: "" }]);
              };

              const removeSocial = (socialIndex: number) => {
                const key = `team.${index}.socials` as FieldPath<ProjectFormData>;
                const next = socials.filter((_, idx) => idx !== socialIndex);
                setValue(key, next);
              };

              return (
                <Card key={field.id} padding="16" border="neutral-medium" style={{ width: "100%" }}>
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
                          label="Nom (affichage)"
                          {...register(`team.${index}.name`)}
                        />
                        {isSubmitted && memberErrors?.name && (
                          <Text variant="label-default-s" onBackground="danger-weak">
                            {memberErrors.name.message}
                          </Text>
                        )}
                      </Flex>
                      <Flex direction="column" gap="4" flex={1}>
                        <Input
                          id={`team-${index}-pseudo`}
                          label="Pseudo"
                          {...register(`team.${index}.pseudo`)}
                        />
                      </Flex>
                    </Flex>

                    <Flex gap="8">
                      <Input
                        id={`team-${index}-firstName`}
                        label="Prénom"
                        {...register(`team.${index}.firstName`)}
                      />
                      <Input
                        id={`team-${index}-lastName`}
                        label="Nom de famille"
                        {...register(`team.${index}.lastName`)}
                      />
                    </Flex>

                    <Flex direction="column" gap="12" fillWidth>
                      <Input
                        id={`team-${index}-email`}
                        label="Email"
                        type="email"
                        {...register(`team.${index}.email`)}
                      />
                      <Input
                        id={`team-${index}-role`}
                        label="Rôle"
                        {...register(`team.${index}.role`)}
                      />
                      {isSubmitted && memberErrors?.role && (
                        <Text variant="label-default-s" onBackground="danger-weak">
                          {memberErrors.role.message}
                        </Text>
                      )}
                    </Flex>

                    <Input
                      id={`team-${index}-linkedin`}
                      label="LinkedIn (obligatoire pour nouvelle fiche)"
                      placeholder="https://www.linkedin.com/in/..."
                      {...register(`team.${index}.linkedIn`)}
                      error={Boolean(isSubmitted && linkedinError)}
                      errorMessage={isSubmitted && linkedinError ? linkedinError : undefined}
                    />

                    <ImageUpload
                      type="avatar"
                      currentUrl={currentAvatar}
                      onUploadComplete={(url) => setValue(`team.${index}.avatar`, url)}
                      label="Avatar du membre"
                    />

                    <Flex direction="column" gap="8">
                      <Text variant="label-strong-s">Autres réseaux</Text>
                      {socials.map((social, socialIndex) => (
                        <Flex key={`${field.id}-social-${socialIndex}`} gap="8" vertical="center">
                          <Input
                            id={`team-${index}-social-${socialIndex}-name`}
                            label="Nom du réseau"
                            {...register(`team.${index}.socials.${socialIndex}.name`)}
                          />
                          <Input
                            id={`team-${index}-social-${socialIndex}-url`}
                            label="URL"
                            {...register(`team.${index}.socials.${socialIndex}.url`)}
                          />
                          <button
                            type="button"
                            onClick={() => removeSocial(socialIndex)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                          >
                            🗑️
                          </button>
                        </Flex>
                      ))}
                      <Button variant="secondary" size="s" type="button" onClick={addSocial}>
                        ➕ Ajouter un réseau
                      </Button>
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
                appendTeam({
                  name: "",
                  role: "",
                  avatar: "",
                  linkedIn: "",
                  email: "",
                  firstName: "",
                  lastName: "",
                  pseudo: "",
                  socials: [],
                })
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

export default ProjectForm;
