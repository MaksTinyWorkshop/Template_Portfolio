"use client";

import { Flex, Heading, Text } from "@once-ui-system/core";
import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";

const PersonForm = dynamic(
  () =>
    import("@/web/components/admin/PersonForm").then((module) => ({ default: module.PersonForm })),
  {
    ssr: false,
    loading: () => <div>Chargement du formulaire...</div>,
  },
);

interface PersonData {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  role: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  siteOwner: boolean;
  profileData?: unknown;
}

export default function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPerson() {
      try {
        const response = await fetch(`/api/admin/persons/${id}`);
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
          setPerson(data.data);
        } else {
          setError((isJson ? data?.error : null) ?? "Personne non trouvée");
        }
      } catch (fetchError) {
        console.error("Erreur chargement personne:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }

    void loadPerson();
  }, [id]);

  if (loading) {
    return (
      <Flex direction="column" fillWidth gap="24" vertical="center" style={{ marginTop: "40px" }}>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Chargement...
        </Text>
      </Flex>
    );
  }

  if (error || !person) {
    return (
      <Flex direction="column" fillWidth gap="24" vertical="center" style={{ marginTop: "40px" }}>
        <Text variant="heading-strong-l" onBackground="neutral-weak">
          ❌ {error ?? "Personne non trouvée"}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Flex horizontal="center">
        <Heading as="h1" variant="display-strong-l">
          ✏️ Éditer la personne
        </Heading>
      </Flex>
      <PersonForm mode="edit" initialData={person} />
    </Flex>
  );
}
