"use client";

import { Flex, Heading } from "@once-ui-system/core";
import dynamic from "next/dynamic";

// Charger le formulaire côté client uniquement pour éviter les erreurs SSR
const PostForm = dynamic(
  () => import("@/web/components/admin/PostForm").then((mod) => ({ default: mod.PostForm })),
  { ssr: false, loading: () => <div>Chargement du formulaire...</div> }
);

/**
 * Page de création d'un nouvel article
 */
export default function NewPostPage() {
  return (
    <Flex direction="column" fillWidth gap="24">
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ✍️ Nouvel article
        </Heading>
      </Flex>

      <PostForm mode="create" />
    </Flex>
  );
}
