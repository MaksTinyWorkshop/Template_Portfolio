import { Button, Flex, Heading } from "@once-ui-system/core";
import Link from "next/link";
import { listPersonsAdmin } from "@/lib/modules/person";
import { PersonsList } from "@/web/components/admin/PersonsList";

export const dynamic = "force-dynamic";

export default async function AdminPersonsPage() {
  const persons = await listPersonsAdmin();

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1400px" }}>
      <Flex horizontal="between" vertical="center" fillWidth>
        <Heading as="h1" variant="display-strong-l">
          👥 Personnes
        </Heading>

        <Link href="/admin/persons/new">
          <Button variant="primary" size="m">
            ➕ Nouvelle personne
          </Button>
        </Link>
      </Flex>

      <PersonsList initialPersons={persons} />
    </Flex>
  );
}
