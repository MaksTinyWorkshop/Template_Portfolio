"use client";

import { ConfirmModal } from "@/web/components/ui/ConfirmModal";
import { useToastService } from "@/web/components/utils/ToastService";
import { Button, Card, Flex, Icon, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./TagsList.module.scss";

interface Tag {
  id: string;
  slug: string;
  name: string;
  category: "article" | "project" | "global";
  description: string | null;
  color: string | null;
  _count: {
    articleTags: number;
    projectTags: number;
  };
}

interface TagsListProps {
  initialTags: Tag[];
}

export function TagsList({ initialTags }: TagsListProps) {
  const { notify } = useToastService();
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [loading, setLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "article" | "project" | "global">(
    "all",
  );
  const router = useRouter();

  // Fermer le dropdown si on clique en dehors
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

  const performDelete = async (tag: Pick<Tag, "id" | "slug" | "name">) => {
    setLoading(tag.id);

    try {
      const response = await fetch(`/api/admin/tags/${tag.slug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setTags((previous) => previous.filter((row) => row.id !== tag.id));
        notify({
          message: "Tag supprimé avec succès",
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
      console.error("Erreur suppression:", error);
      notify({
        message: "Erreur lors de la suppression",
        variant: "danger",
      });
    } finally {
      setLoading(null);
    }
  };

  const requestDelete = (tag: Pick<Tag, "id" | "slug" | "name">) => {
    setConfirmState({
      title: "Supprimer le tag",
      message: `Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?`,
      onConfirm: async () => {
        await performDelete(tag);
      },
    });
  };

  const getCategoryBadge = (category: Tag["category"]) => {
    const styles = {
      article: {
        bg: "#dbeafe",
        color: "#1e3a8a",
        label: "Article",
      },
      project: {
        bg: "#fce7f3",
        color: "#831843",
        label: "Projet",
      },
      global: {
        bg: "#f3e8ff",
        color: "#581c87",
        label: "Global",
      },
    };

    const style = styles[category];

    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {style.label}
      </span>
    );
  };

  const filteredTags =
    filterCategory === "all" ? tags : tags.filter((tag) => tag.category === filterCategory);

  const getUsageLabel = (tag: Tag) => {
    if (tag.category === "article") {
      return `📊 Utilisé dans: ${tag._count.articleTags} articles`;
    }

    if (tag.category === "project") {
      return `📊 Utilisé dans: ${tag._count.projectTags} projets`;
    }

    return `📊 Utilisé dans: ${tag._count.articleTags} articles, ${tag._count.projectTags} projets`;
  };

  if (tags.length === 0) {
    return (
      <Card padding="32" border="neutral-medium" background="neutral-weak">
        <Flex direction="column" gap="16" vertical="center">
          <Text variant="heading-default-l" onBackground="neutral-weak">
            Aucun tag
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Créez votre premier tag pour commencer à catégoriser vos contenus.
          </Text>
          <Link href="/admin/tags/new">
            <Button variant="primary" size="m">
              ➕ Nouveau tag
            </Button>
          </Link>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="24" fillWidth align="center">
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
      {/* Filtres */}
      <Flex gap="12" wrap horizontal="center">
        {(["all", "article", "project", "global"] as const).map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "primary" : "secondary"}
            size="s"
            onClick={() => setFilterCategory(cat)}
          >
            {cat === "all" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </Flex>

      {filteredTags.length === 0 ? (
        <Card padding="24" border="neutral-medium" background="neutral-weak">
          <Flex direction="column" gap="8" vertical="center">
            <Text variant="heading-default-m" onBackground="neutral-weak">
              Aucun tag dans cette catégorie
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Changez le filtre pour afficher d'autres tags.
            </Text>
          </Flex>
        </Card>
      ) : null}

      {/* Liste des tags */}
      <div className={styles.tagsGrid}>
        {filteredTags.map((tag) => {
          const totalUsage = tag._count.articleTags + tag._count.projectTags;

          return (
            <Card
              key={tag.id}
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
                  <Flex gap="12" vertical="center" wrap>
                    {/* Pastille de couleur */}
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor: tag.color || "#3B82F6",
                        border: "2px solid rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Text variant="heading-strong-m" onBackground="neutral-weak">
                      {tag.name}
                    </Text>
                    {getCategoryBadge(tag.category)}
                  </Flex>

                  {tag.description && (
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {tag.description}
                    </Text>
                  )}

                  <Flex gap="16" vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {getUsageLabel(tag)}
                    </Text>
                  </Flex>
                </Flex>

                {/* Menu actions */}
                <div style={{ position: "relative" }} data-dropdown>
                  <Button
                    variant="secondary"
                    size="s"
                    aria-label={`Actions pour ${tag.name}`}
                    aria-expanded={openDropdown === tag.id}
                    onClick={() => setOpenDropdown(openDropdown === tag.id ? null : tag.id)}
                    disabled={loading === tag.id}
                    style={{
                      fontSize: "20px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="more" />
                  </Button>

                  {openDropdown === tag.id && (
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
                        minWidth: "160px",
                        overflow: "hidden",
                      }}
                    >
                      <Link
                        href={`/admin/tags/${tag.slug}`}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 16px",
                          textDecoration: "none",
                          fontSize: "14px",
                          color: "#374151",
                          transition: "background-color 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        ✏️ Éditer
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          requestDelete({
                            id: tag.id,
                            slug: tag.slug,
                            name: tag.name,
                          });
                        }}
                        disabled={loading === tag.id}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          cursor: loading === tag.id ? "wait" : "pointer",
                          fontSize: "14px",
                          color: "#dc2626",
                          transition: "background-color 0.15s",
                          borderTop: "1px solid #f3f4f6",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {loading === tag.id ? "⏳ Suppression..." : "🗑️ Supprimer"}
                        {totalUsage > 0 && ` (délie ${totalUsage} contenus)`}
                      </button>
                    </div>
                  )}
                </div>
              </Flex>
            </Card>
          );
        })}
      </div>
    </Flex>
  );
}
