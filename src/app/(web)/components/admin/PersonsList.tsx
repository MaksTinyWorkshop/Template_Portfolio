"use client";

import { ConfirmModal } from "@/web/components/ui/ConfirmModal";
import { useToastService } from "@/web/components/utils/ToastService";
import { Avatar, Button, Card, Flex, Icon, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PersonListItem {
  id: string;
  fullName: string;
  pseudo: string | null;
  role: string | null;
  email: string | null;
  avatar: string | null;
  siteOwner: boolean;
  _count: {
    articles: number;
    projects: number;
  };
}

interface PersonsListProps {
  initialPersons: PersonListItem[];
}

export function PersonsList({ initialPersons }: PersonsListProps) {
  const router = useRouter();
  const { notify } = useToastService();
  const [persons, setPersons] = useState<PersonListItem[]>(initialPersons);
  const [loading, setLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isDropdownClick = target.closest("[data-dropdown]");
      if (!isDropdownClick) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const performDelete = async (person: PersonListItem) => {
    if (person.siteOwner) {
      notify({
        message: "Le profil propriétaire ne peut pas être supprimé",
        variant: "danger",
      });
      return;
    }

    setLoading(person.id);
    try {
      const response = await fetch(`/api/admin/persons/${person.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setPersons((previous) => previous.filter((item) => item.id !== person.id));
        notify({
          message: "Personne supprimée avec succès",
          variant: "success",
        });
        router.refresh();
      } else {
        notify({
          message: data.error ?? "Erreur lors de la suppression",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Erreur suppression personne:", error);
      notify({
        message: "Erreur lors de la suppression",
        variant: "danger",
      });
    } finally {
      setLoading(null);
    }
  };

  const requestDelete = (person: PersonListItem) => {
    if (person.siteOwner) {
      notify({
        message: "Le profil propriétaire ne peut pas être supprimé",
        variant: "danger",
      });
      return;
    }

    setConfirmState({
      title: "Supprimer la personne",
      message: `Supprimer la personne "${person.fullName}" ?`,
      onConfirm: async () => {
        await performDelete(person);
      },
    });
  };

  if (persons.length === 0) {
    return (
      <Card padding="32" border="neutral-medium" background="neutral-weak">
        <Flex direction="column" gap="16" vertical="center">
          <Text variant="heading-default-l" onBackground="neutral-weak">
            Aucune personne
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Ajoutez votre premier profil pour gérer l'équipe du portfolio.
          </Text>
          <Link href="/admin/persons/new">
            <Button variant="primary" size="m">
              ➕ Nouvelle personne
            </Button>
          </Link>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="16" fillWidth>
      <ConfirmModal
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        busy={loading !== null}
        onClose={() => setConfirmState(null)}
        onConfirm={async () => {
          if (!confirmState) return;
          const action = confirmState.onConfirm;
          setConfirmState(null);
          await action();
        }}
      />
      {persons.map((person) => (
        <Card
          key={person.id}
          data-person-id={person.id}
          padding="16"
          border="neutral-medium"
          background="neutral-weak"
          style={{
            position: "relative",
            borderRadius: "12px",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Flex horizontal="between" vertical="center" fillWidth>
            <Flex direction="column" gap="8" flex={1}>
              <Flex gap="12" vertical="center">
                <Avatar src={person.avatar ?? ""} size="m" />
                <Flex direction="column" gap="4">
                  <Flex gap="8" vertical="center" wrap>
                    <Text variant="heading-strong-m" onBackground="neutral-weak">
                      {person.pseudo ?? person.fullName}
                    </Text>
                    {person.siteOwner ? (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Owner
                      </span>
                    ) : null}
                  </Flex>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {person.fullName}
                    {person.role ? ` • ${person.role}` : ""}
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="16" vertical="center" wrap>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  📊 {person._count.articles} articles, {person._count.projects} projets
                </Text>
                {person.email ? (
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    ✉️ {person.email}
                  </Text>
                ) : null}
              </Flex>
            </Flex>

            <div style={{ position: "relative" }} data-dropdown>
              <Button
                variant="secondary"
                size="s"
                data-testid="person-menu-trigger"
                aria-label={`Actions pour ${person.fullName}`}
                onClick={() => setOpenDropdown(openDropdown === person.id ? null : person.id)}
                disabled={loading === person.id}
                style={{
                  fontSize: "20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Icon name="more" />
              </Button>

              {openDropdown === person.id ? (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    zIndex: 10,
                    minWidth: "170px",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={`/admin/persons/${person.id}`}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 16px",
                      textDecoration: "none",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    ✏️ Éditer
                  </Link>

                  <button
                    type="button"
                    data-testid="person-delete-action"
                    aria-label={`Supprimer ${person.fullName}`}
                    onClick={() => {
                      setOpenDropdown(null);
                      requestDelete(person);
                    }}
                    disabled={loading === person.id || person.siteOwner}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: loading === person.id || person.siteOwner ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      color: person.siteOwner ? "#9ca3af" : "#dc2626",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    {loading === person.id ? "⏳ Suppression..." : "🗑️ Supprimer"}
                  </button>
                </div>
              ) : null}
            </div>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
