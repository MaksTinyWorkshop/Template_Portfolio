"use client";

import { useToastService } from "@/web/components/utils/ToastService";
import { Button, Card, Flex, Input, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TagFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    slug: string;
    name: string;
    category: "article" | "project" | "global";
    description: string | null;
    color: string | null;
  };
}

export function TagForm({ mode, initialData }: TagFormProps) {
  const router = useRouter();
  const { notify } = useToastService();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    category: initialData?.category ?? ("global" as "article" | "project" | "global"),
    description: initialData?.description ?? "",
    color: initialData?.color ?? "#3B82F6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifier = initialData?.slug ?? initialData?.id;
      const url = mode === "create" ? "/api/admin/tags" : `/api/admin/tags/${identifier}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        notify({
          message: mode === "create" ? "Tag créé avec succès" : "Tag mis à jour avec succès",
          variant: "success",
        });
        router.push("/admin/tags");
        router.refresh();
      } else {
        notify({
          message: data.error ?? "Erreur lors de l'enregistrement",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Erreur formulaire:", error);
      notify({
        message: "Erreur lors de l'enregistrement",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Card padding="32" border="neutral-medium" background="neutral-weak">
        <Flex direction="column" gap="24" fillWidth>
          {/* Nom */}
          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              Nom du tag *
            </Text>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: React, Design, Backend..."
              required
              maxLength={50}
            />
            <Text variant="label-default-s" onBackground="neutral-weak">
              Le slug sera généré automatiquement
            </Text>
          </Flex>

          {/* Catégorie */}
          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              Catégorie *
            </Text>
            <Flex gap="12">
              {(["article", "project", "global"] as const).map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as "article" | "project" | "global",
                      })
                    }
                    style={{ cursor: "pointer" }}
                  />
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </label>
              ))}
            </Flex>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Article = blog uniquement, Project = projets uniquement, Global = les deux
            </Text>
          </Flex>

          {/* Description */}
          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              Description (optionnelle)
            </Text>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brève description du tag..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--neutral-border-medium)",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                backgroundColor: "var(--neutral-background-weak)",
                color: "var(--neutral-on-background-strong)",
              }}
            />
          </Flex>

          {/* Couleur */}
          <Flex direction="column" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              Couleur
            </Text>
            <Flex gap="12" vertical="center">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: "60px",
                  height: "40px",
                  border: "1px solid var(--neutral-border-medium)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
              <Input
                id="color-text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
                style={{ maxWidth: "120px" }}
              />
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: formData.color,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Aperçu
              </div>
            </Flex>
          </Flex>

          {/* Actions */}
          <Flex gap="12" horizontal="end" fillWidth style={{ marginTop: "16px" }}>
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={() => router.push("/admin/tags")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="m" disabled={loading}>
              {loading ? "Enregistrement..." : mode === "create" ? "Créer le tag" : "Mettre à jour"}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}
