"use client";

import { Flex, Heading, Text } from "@once-ui-system/core";
import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";

// Charger le formulaire côté client uniquement
const TagForm = dynamic(
  () => import("@/web/components/admin/TagForm").then((mod) => ({ default: mod.TagForm })),
  { ssr: false, loading: () => <div>Chargement du formulaire...</div> },
);

interface TagData {
  id: string;
  slug: string;
  name: string;
  category: "article" | "project" | "global";
  description: string | null;
  color: string | null;
}

/**
 * Page d'édition d'un tag
 */
export default function EditTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [tag, setTag] = useState<TagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTag() {
      try {
        const response = await fetch(`/api/admin/tags/${slug}`);
        const contentType = response.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const message =
            (data && typeof data === "object" && "error" in data && typeof data.error === "string"
              ? data.error
              : null) ?? `Erreur API (${response.status})`;
          throw new Error(message);
        }

        if (data?.success) {
          setTag(data.data);
        } else {
          const fallback = isJson ? data?.error : "Réponse API invalide (non-JSON)";
          setError(fallback ?? "Tag non trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement tag:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }

    loadTag();
  }, [slug]);

  if (loading) {
    return (
      <Flex direction="column" fillWidth gap="24" vertical="center" style={{ marginTop: "40px" }}>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Chargement...
        </Text>
      </Flex>
    );
  }

  if (error || !tag) {
    return (
      <Flex direction="column" fillWidth gap="24" vertical="center" style={{ marginTop: "40px" }}>
        <Text variant="heading-strong-l" onBackground="neutral-weak">
          ❌ {error || "Tag non trouvé"}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ✏️ Éditer le tag
        </Heading>
      </Flex>

      <TagForm mode="edit" initialData={tag} />
    </Flex>
  );
}
