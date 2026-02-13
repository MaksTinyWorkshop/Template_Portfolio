"use client";

import { Flex, Heading } from "@once-ui-system/core";
import dynamic from "next/dynamic";

// Charger le formulaire côté client uniquement pour éviter les erreurs SSR
const TagForm = dynamic(
  () => import("@/web/components/admin/TagForm").then((mod) => ({ default: mod.TagForm })),
  { ssr: false, loading: () => <div>Chargement du formulaire...</div> },
);

/**
 * Page de création d'un nouveau tag
 */
export default function NewTagPage() {
  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ➕ Nouveau tag
        </Heading>
      </Flex>

      <TagForm mode="create" />
    </Flex>
  );
}
