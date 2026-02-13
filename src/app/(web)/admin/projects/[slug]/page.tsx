import { Flex, Heading } from "@once-ui-system/core";
import { ProjectForm } from "@/web/components/admin/ProjectForm";
import { getProjectForAdmin } from "@/lib/modules/projects";
import { notFound } from "next/navigation";
import type { ProjectMetadata } from "@/web/types";

// Désactiver le prerendering pour cette page admin
export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;

  let project;
  try {
    project = await getProjectForAdmin(slug);
  } catch (error) {
    console.error("Projet introuvable", error);
    notFound();
  }

  const initialData = {
    ...project.metadata,
    slug: project.slug,
    content: project.content,
  } as ProjectMetadata & { content: string };

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1200px" }}>
      <Heading as="h1" variant="display-strong-l">
        ✏️ Éditer: {project.metadata.title}
      </Heading>

      <ProjectForm mode="edit" initialData={initialData} />
    </Flex>
  );
}
