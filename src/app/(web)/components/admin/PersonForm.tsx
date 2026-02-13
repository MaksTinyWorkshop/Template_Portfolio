"use client";

import {
  SOCIAL_NETWORK_OPTIONS,
  type SocialNetworkKey,
  normalizeSocialNetworkKey,
} from "@/lib/modules/person/domain/social-networks";
import { useToastService } from "@/web/components/utils/ToastService";
import type { IconName } from "@/web/types/content.types";
import { Button, Card, Flex, Icon, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import styles from "./PersonForm.module.scss";

interface PersonFormData {
  firstName: string;
  lastName: string;
  pseudo: string;
  role: string;
  email: string;
  avatar: string;
  bio: string;
}

interface PersonFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    role: string | null;
    email: string | null;
    avatar: string | null;
    bio: string | null;
    profileData?: unknown;
  };
}

const SOCIAL_ICON_MAP: Record<SocialNetworkKey, IconName> = {
  discord: "discord",
  email: "email",
  facebook: "facebook",
  github: "github",
  instagram: "instagram",
  linkedin: "linkedin",
  malt: "malt",
  pinterest: "pinterest",
  reddit: "reddit",
  telegram: "telegram",
  threads: "threads",
  whatsapp: "whatsapp",
  x: "x",
  youtube: "youtube",
};

type ContactsMap = Record<SocialNetworkKey, string>;

const createEmptyContactsMap = (): ContactsMap =>
  Object.fromEntries(SOCIAL_NETWORK_OPTIONS.map((option) => [option.key, ""])) as ContactsMap;

const sanitizeContactValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return "";
  }
  return trimmed;
};

const buildMailtoFromEmail = (email: string) => {
  const normalized = email.trim();
  if (!normalized) {
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "";
  }
  return `mailto:${normalized}`;
};

const toObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const getInitialProfileValues = (profileData?: unknown) => {
  const root = toObjectRecord(profileData);
  const contacts = toObjectRecord(root.contacts);
  const metadata = toObjectRecord(root.metadata);
  const contactsMap = createEmptyContactsMap();
  for (const [key, value] of Object.entries(contacts)) {
    if (typeof value !== "string") {
      continue;
    }
    const normalizedKey = normalizeSocialNetworkKey(key);
    if (!normalizedKey) {
      continue;
    }
    contactsMap[normalizedKey] = value;
  }

  const rootExtras = Object.fromEntries(
    Object.entries(root).filter(([key]) => key !== "contacts" && key !== "metadata"),
  );
  const metadataBase = Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined),
  );

  return {
    contactsMap,
    rootExtras,
    metadataBase,
  };
};

export function PersonForm({ mode, initialData }: PersonFormProps) {
  const router = useRouter();
  const { notify } = useToastService();
  const [loading, setLoading] = useState(false);
  const initialProfileValues = getInitialProfileValues(initialData?.profileData);

  const [formData, setFormData] = useState<PersonFormData>({
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    pseudo: initialData?.pseudo ?? "",
    role: initialData?.role ?? "",
    email: initialData?.email ?? "",
    avatar: initialData?.avatar ?? "",
    bio: initialData?.bio ?? "",
  });
  const [contactsMap, setContactsMap] = useState<ContactsMap>(initialProfileValues.contactsMap);
  const [activeNetwork, setActiveNetwork] = useState<SocialNetworkKey | null>(null);
  const emailContactValue = buildMailtoFromEmail(formData.email);
  const activeOption = activeNetwork
    ? SOCIAL_NETWORK_OPTIONS.find((option) => option.key === activeNetwork)
    : null;

  const updateNetworkValue = (network: SocialNetworkKey, value: string) => {
    if (network === "email") {
      return;
    }
    setContactsMap((previous) => ({
      ...previous,
      [network]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const contacts = Object.fromEntries(
        SOCIAL_NETWORK_OPTIONS.map((option) => [
          option.key,
          option.key === "email"
            ? emailContactValue
            : sanitizeContactValue(contactsMap[option.key] ?? ""),
        ]),
      );
      const metadata = initialProfileValues.metadataBase;
      const profileData = {
        ...initialProfileValues.rootExtras,
        contacts,
        ...(Object.keys(metadata).length ? { metadata } : {}),
      };

      const endpoint =
        mode === "create" ? "/api/admin/persons" : `/api/admin/persons/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileData: Object.keys(profileData).length ? profileData : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        notify({
          message:
            mode === "create" ? "Personne créée avec succès" : "Personne mise à jour avec succès",
          variant: "success",
        });
        router.push("/admin/persons");
        router.refresh();
      } else {
        notify({
          message: data.error ?? "Erreur lors de l'enregistrement",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Erreur formulaire personne:", error);
      notify({
        message: "Erreur lors de l'enregistrement",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Card padding="16" border="neutral-medium" background="neutral-weak" className={styles.card}>
        <Flex direction="column" gap="20" fillWidth>
          <div className={styles.twoCols}>
            <Input
              id="firstName"
              label="Prénom"
              value={formData.firstName}
              required
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  firstName: event.target.value,
                }))
              }
            />
            <Input
              id="lastName"
              label="Nom"
              value={formData.lastName}
              required
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  lastName: event.target.value,
                }))
              }
            />
          </div>

          <div className={styles.twoCols}>
            <Input
              id="pseudo"
              label="Pseudo"
              value={formData.pseudo}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  pseudo: event.target.value,
                }))
              }
            />
            <Input
              id="role"
              label="Rôle"
              value={formData.role}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  role: event.target.value,
                }))
              }
            />
          </div>

          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
            placeholder="name@example.com"
          />

          <Flex direction="column" gap="8" horizontal="center">
            <ImageUpload
              type="avatar"
              label="Avatar"
              currentUrl={formData.avatar || undefined}
              onUploadComplete={(url) =>
                setFormData((previous) => ({
                  ...previous,
                  avatar: url,
                }))
              }
            />
          </Flex>

          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak" paddingBottom="4">
              Réseaux sociaux
            </Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Clique sur une icône pour éditer l’adresse du réseau.
            </Text>
            <div className={styles.networkGrid}>
              {SOCIAL_NETWORK_OPTIONS.map((option) => {
                const value =
                  option.key === "email" ? emailContactValue : (contactsMap[option.key] ?? "");
                const isActive = value.trim().length > 0;
                const isSelected = activeNetwork === option.key;
                const accessibilityLabel = `Réseau ${option.label}. ${
                  isActive ? "Valeur renseignée." : "Aucune valeur."
                } ${isSelected ? "Éditeur ouvert." : "Active l’éditeur."}`;
                const tooltipLabel = `${option.label}${isActive ? " • renseigné" : ""}`;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={styles.networkButton}
                    data-active={isActive ? "true" : "false"}
                    data-selected={isSelected ? "true" : "false"}
                    onClick={() =>
                      setActiveNetwork((previous) => (previous === option.key ? null : option.key))
                    }
                    aria-pressed={isSelected}
                    aria-label={accessibilityLabel}
                    title={tooltipLabel}
                    aria-controls="network-editor"
                    aria-expanded={isSelected}
                  >
                    <span className={styles.networkIcon}>
                      <Icon name={SOCIAL_ICON_MAP[option.key]} size="m" />
                    </span>
                  </button>
                );
              })}
            </div>
            {activeNetwork && activeOption ? (
              <>
                <Input
                  id={`network-${activeNetwork}`}
                  label={`Adresse ${activeOption.label}`}
                  value={
                    activeNetwork === "email"
                      ? emailContactValue
                      : (contactsMap[activeNetwork] ?? "")
                  }
                  onChange={(event) => updateNetworkValue(activeNetwork, event.target.value)}
                  placeholder={`${activeOption.label}: https://..., mailto:..., tel:...`}
                  disabled={activeNetwork === "email"}
                />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {activeNetwork === "email"
                    ? "La valeur email est générée automatiquement depuis le champ Email."
                    : ""}
                </Text>
              </>
            ) : (
              <></>
            )}
            <div className={styles.networkSummary}>
              <Text variant="label-default-s" onBackground="neutral-weak">
                {
                  SOCIAL_NETWORK_OPTIONS.map((option) =>
                    option.key === "email" ? emailContactValue : (contactsMap[option.key] ?? ""),
                  ).filter((value) => value.trim().length > 0).length
                }
                /{SOCIAL_NETWORK_OPTIONS.length} réseaux renseignés
              </Text>
            </div>
          </Flex>

          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              Bio
            </Text>
            <textarea
              value={formData.bio}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  bio: event.target.value,
                }))
              }
              rows={4}
              className={styles.bioTextarea}
            />
          </Flex>

          <Flex gap="12" fillWidth className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={() => router.push("/admin/persons")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="m" disabled={loading}>
              {loading
                ? "Enregistrement..."
                : mode === "create"
                  ? "Créer la personne"
                  : "Mettre à jour"}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}
