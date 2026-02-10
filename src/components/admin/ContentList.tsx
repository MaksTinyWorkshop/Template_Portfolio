"use client";

import { Button, Card, Flex, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Types de base pour le contenu
export interface BaseContentItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: "draft" | "scheduled" | "published";
}

// Configuration pour adapter le composant
export interface ContentConfig<T extends BaseContentItem> {
  type: "project" | "post";
  apiRoute: string;
  editRoute: (slug: string) => string;
  newRoute: string;
  emptyTitle: string;
  emptyMessage: string;
  newButtonLabel: string;
  deleteConfirmMessage: (slug: string) => string;
  publishConfirmMessage: (title: string) => string;
  deleteSuccessMessage: string;
  publishSuccessMessage: string;
  renderTags: (item: T) => React.ReactNode;
}

interface ContentListProps<T extends BaseContentItem> {
  initialItems: T[];
  config: ContentConfig<T>;
}

export function ContentList<T extends BaseContentItem>({
  initialItems,
  config,
}: ContentListProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Vérifier si le clic est en dehors d'un dropdown
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

  const handleDelete = async (slug: string) => {
    if (!confirm(config.deleteConfirmMessage(slug))) {
      return;
    }

    setLoading(slug);

    try {
      const response = await fetch(`${config.apiRoute}?slug=${slug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setItems(items.filter((item) => item.slug !== slug));
        alert(config.deleteSuccessMessage);
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(null);
    }
  };

  const handlePublish = async (slug: string) => {
    const item = items.find((i) => i.slug === slug);
    if (!item) return;

    if (!confirm(config.publishConfirmMessage(item.title))) {
      return;
    }

    setLoading(slug);

    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          type: config.type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(items.map((i) => (i.slug === slug ? ({ ...i, status: "published" } as T) : i)));
        alert(config.publishSuccessMessage);
        router.refresh();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur publication:", error);
      alert("Erreur lors de la publication");
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: BaseContentItem["status"]) => {
    const styles = {
      draft: {
        bg: "#fef3c7",
        color: "#92400e",
        label: "Brouillon",
      },
      scheduled: {
        bg: "#dbeafe",
        color: "#1e3a8a",
        label: "Planifié",
      },
      published: {
        bg: "#d1fae5",
        color: "#065f46",
        label: "Publié",
      },
    };

    const style = styles[status] || styles.draft;

    return (
      <span
        style={{
          position: "absolute",
          top: "-14px",
          left: "16px",
          padding: "6px 14px",
          borderRadius: "16px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
          zIndex: 1,
        }}
      >
        {style.label}
      </span>
    );
  };

  if (items.length === 0) {
    return (
      <Card padding="32" border="neutral-medium" background="neutral-weak">
        <Flex direction="column" gap="16" vertical="center">
          <Text variant="heading-default-l" onBackground="neutral-weak">
            {config.emptyTitle}
          </Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {config.emptyMessage}
          </Text>
          <Link href={config.newRoute}>
            <Button variant="primary" size="m">
              {config.newButtonLabel}
            </Button>
          </Link>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="32" fillWidth>
      {items.map((item) => (
        <Card
          key={item.slug}
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
          }}
        >
          {getStatusBadge(item.status)}
          <Flex direction="column" gap="16" fillWidth>
            <Flex horizontal="between" vertical="start" fillWidth>
              <Flex direction="column" gap="8" flex={1}>
                <Flex direction="row" horizontal="between" vertical="center" fillWidth>
                  <Text variant="heading-strong-l" onBackground="neutral-weak">
                    {item.title}
                  </Text>

                  <div style={{ position: "relative" }} data-dropdown>
                    <Button
                      variant="secondary"
                      size="s"
                      onClick={() => setOpenDropdown(openDropdown === item.slug ? null : item.slug)}
                      disabled={loading === item.slug}
                      style={{
                        fontSize: "20px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      ⋮
                    </Button>

                    {openDropdown === item.slug && (
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
                          href={config.editRoute(item.slug)}
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

                        {item.status !== "published" && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              handlePublish(item.slug);
                            }}
                            disabled={loading === item.slug}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              border: "none",
                              background: "transparent",
                              textAlign: "left",
                              cursor: loading === item.slug ? "wait" : "pointer",
                              fontSize: "14px",
                              color: "#059669",
                              transition: "background-color 0.15s",
                              borderTop: "1px solid #f3f4f6",
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) {
                                e.currentTarget.style.backgroundColor = "#f3f4f6";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            {loading === item.slug ? "⏳ Publication..." : "🚀 Publier"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdown(null);
                            handleDelete(item.slug);
                          }}
                          disabled={loading === item.slug}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            cursor: loading === item.slug ? "wait" : "pointer",
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
                          {loading === item.slug ? "⏳ Suppression..." : "🗑️ Supprimer"}
                        </button>
                      </div>
                    )}
                  </div>
                </Flex>

                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.summary}
                </Text>

                <Flex gap="8" vertical="center" horizontal="around">
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    📅 {new Date(item.publishedAt).toLocaleDateString("fr-FR")}
                  </Text>
                  {config.renderTags(item)}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
