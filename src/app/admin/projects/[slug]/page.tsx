import { Flex, Heading } from "@once-ui-system/core";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { readMDXFile, CONTENT_PATHS } from "@/utils/mdx-admin";
import { notFound } from "next/navigation";
import path from "node:path";
import type { ProjectMetadata } from "@/types/admin.types";

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Page d'édition d'un projet existant
 */
export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;

  // Lire le fichier MDX
  const filePath = path.join(CONTENT_PATHS.projects, `${slug}.mdx`);
  const result = await readMDXFile(filePath);

  if (!result.success || !result.data) {
    notFound();
  }

  const { metadata, content } = result.data;

  // Préparer les données pour le formulaire
  const initialData = {
    ...metadata,
    slug,
    content,
  } as ProjectMetadata & { content: string };

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1200px" }}>
      <Heading as="h1" variant="display-strong-l">
        ✏️ Éditer: {metadata.title}
      </Heading>

      <ProjectForm mode="edit" initialData={initialData} />
    </Flex>
  );
}
