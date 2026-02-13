"use client";

import { Flex, Heading } from "@once-ui-system/core";
import dynamic from "next/dynamic";

const PersonForm = dynamic(
  () =>
    import("@/web/components/admin/PersonForm").then((module) => ({ default: module.PersonForm })),
  {
    ssr: false,
    loading: () => <div>Chargement du formulaire...</div>,
  },
);

export default function NewPersonPage() {
  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ➕ Nouvelle personne
        </Heading>
      </Flex>
      <PersonForm mode="create" />
    </Flex>
  );
}
