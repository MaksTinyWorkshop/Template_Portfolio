export const dynamic = "force-dynamic";

import { listProjectsAdmin } from "@/lib/modules/projects";
import { Button, Flex, Heading } from "@once-ui-system/core";
import dynamicImport from "next/dynamic";
import Link from "next/link";

// Lazy load du composant ProjectsList pour améliorer les performances
const ProjectsList = dynamicImport(
  () =>
    import("@/web/components/admin/ProjectsList").then(
      (mod) => mod.ProjectsList,
    ),
  {
    loading: () => (
      <Flex direction="column" gap="16" fillWidth>
        <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
          Chargement des projets...
        </div>
      </Flex>
    ),
  },
);

interface ProjectListItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: "draft" | "scheduled" | "published";
  typeProjectTag: string[];
}

/**
 * Page liste des projets (admin)
 */
export default async function AdminProjectsPage() {
  const projects = await listProjectsAdmin();

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1400px" }}>
      <Flex horizontal="between" vertical="center" fillWidth>
        <Heading as="h1" variant="display-strong-l">
          📁 Projets
        </Heading>

        <Link href="/admin/projects/new">
          <Button variant="primary" size="m">
            ➕ Nouveau projet
          </Button>
        </Link>
      </Flex>

      <ProjectsList initialProjects={projects} />
    </Flex>
  );
}
