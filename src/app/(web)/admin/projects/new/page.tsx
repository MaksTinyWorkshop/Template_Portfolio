"use client";

import { Flex, Heading } from "@once-ui-system/core";
import dynamic from "next/dynamic";

// Charger le formulaire côté client uniquement pour éviter les erreurs SSR
const ProjectForm = dynamic(
  () => import("@/web/components/admin/ProjectForm").then((mod) => ({ default: mod.ProjectForm })),
  { ssr: false, loading: () => <div>Chargement du formulaire...</div> },
);

/**
 * Page de création d'un nouveau projet
 */
export default function NewProjectPage() {
  return (
    <Flex direction="column" fillWidth gap="24">
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ✨ Nouveau projet
        </Heading>
      </Flex>

      <ProjectForm mode="create" />
    </Flex>
  );
}
