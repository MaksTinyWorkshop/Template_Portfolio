import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { ProjectMetadata, PostMetadata } from "@/types/admin.types";

/**
 * Chemins des répertoires de contenu
 */
export const CONTENT_PATHS = {
  projects: path.join(process.cwd(), "data", "projects"),
  posts: path.join(process.cwd(), "data", "posts"),
} as const;

/**
 * Génère un slug à partir d'un titre
 *
 * @param title - Titre à slugifier
 * @returns Slug formaté
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, ""); // Retirer les tirets au début et à la fin
}

/**
 * Génère le contenu d'un fichier MDX avec frontmatter
 *
 * @param metadata - Métadonnées du contenu
 * @param content - Contenu Markdown
 * @returns Contenu MDX complet avec frontmatter
 */
export function generateMDXContent(
  metadata: ProjectMetadata | PostMetadata,
  content: string,
): string {
  // Retirer le slug des métadonnées (ne doit pas apparaître dans le frontmatter)
  const { slug, ...metadataWithoutSlug } = metadata as any;

  // Générer le frontmatter YAML
  const frontmatter = matter.stringify("", metadataWithoutSlug);

  // Combiner frontmatter et contenu
  return `${frontmatter}${content}`;
}

/**
 * Lit un fichier MDX et extrait les métadonnées et le contenu
 *
 * @param filePath - Chemin du fichier MDX
 * @returns Métadonnées et contenu
 */
export async function readMDXFile(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      success: true,
      data: {
        metadata: data,
        content: content.trim(),
      },
    };
  } catch (error) {
    console.error("Erreur lecture MDX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Crée un nouveau fichier MDX
 *
 * @param type - Type de contenu (project ou post)
 * @param slug - Slug du fichier
 * @param metadata - Métadonnées du contenu
 * @param content - Contenu Markdown
 * @returns Résultat de l'opération
 */
export async function createMDXFile(
  type: "project" | "post",
  slug: string,
  metadata: ProjectMetadata | PostMetadata,
  content: string,
) {
  try {
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;
    const filePath = path.join(dirPath, `${slug}.mdx`);

    // Vérifier si le fichier existe déjà
    try {
      await fs.access(filePath);
      return {
        success: false,
        error: "Un fichier avec ce slug existe déjà",
      };
    } catch {
      // Le fichier n'existe pas, on peut continuer
    }

    // Ajouter la date de dernière modification
    const metadataWithDate = {
      ...metadata,
      lastModified: new Date().toISOString(),
    };

    // Générer le contenu MDX complet
    const mdxContent = generateMDXContent(metadataWithDate, content);

    // Créer le fichier
    await fs.writeFile(filePath, mdxContent, "utf8");

    return {
      success: true,
      filePath: path.relative(process.cwd(), filePath),
      message: "Fichier créé avec succès",
    };
  } catch (error) {
    console.error("Erreur création MDX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Met à jour un fichier MDX existant
 *
 * @param type - Type de contenu (project ou post)
 * @param slug - Slug du fichier
 * @param metadata - Nouvelles métadonnées
 * @param content - Nouveau contenu
 * @param oldSlug - Ancien slug si renommage
 * @returns Résultat de l'opération
 */
export async function updateMDXFile(
  type: "project" | "post",
  slug: string,
  metadata: ProjectMetadata | PostMetadata,
  content: string,
  oldSlug?: string,
) {
  try {
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;
    const currentSlug = oldSlug || slug;
    const oldFilePath = path.join(dirPath, `${currentSlug}.mdx`);
    const newFilePath = path.join(dirPath, `${slug}.mdx`);

    // Vérifier si le fichier existe
    try {
      await fs.access(oldFilePath);
    } catch {
      return {
        success: false,
        error: "Le fichier n'existe pas",
      };
    }

    // Ajouter/mettre à jour la date de dernière modification
    const metadataWithDate = {
      ...metadata,
      lastModified: new Date().toISOString(),
    };

    // Générer le nouveau contenu MDX
    const mdxContent = generateMDXContent(metadataWithDate, content);

    // Si le slug a changé, renommer le fichier
    if (oldSlug && oldSlug !== slug) {
      await fs.unlink(oldFilePath);
      await fs.writeFile(newFilePath, mdxContent, "utf8");

      return {
        success: true,
        filePath: path.relative(process.cwd(), newFilePath),
        renamed: true,
        message: "Fichier mis à jour et renommé avec succès",
      };
    }

    // Sinon, simplement écraser le fichier
    await fs.writeFile(oldFilePath, mdxContent, "utf8");

    return {
      success: true,
      filePath: path.relative(process.cwd(), oldFilePath),
      message: "Fichier mis à jour avec succès",
    };
  } catch (error) {
    console.error("Erreur mise à jour MDX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Supprime un fichier MDX
 *
 * @param type - Type de contenu (project ou post)
 * @param slug - Slug du fichier à supprimer
 * @returns Résultat de l'opération
 */
export async function deleteMDXFile(type: "project" | "post", slug: string) {
  try {
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;
    const filePath = path.join(dirPath, `${slug}.mdx`);

    // Vérifier si le fichier existe
    try {
      await fs.access(filePath);
    } catch {
      return {
        success: false,
        error: "Le fichier n'existe pas",
      };
    }

    // Supprimer le fichier
    await fs.unlink(filePath);

    return {
      success: true,
      filePath: path.relative(process.cwd(), filePath),
      message: "Fichier supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur suppression MDX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Liste tous les fichiers MDX d'un type
 *
 * @param type - Type de contenu (project ou post)
 * @returns Liste des fichiers avec métadonnées
 */
export async function listMDXFiles(type: "project" | "post") {
  try {
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;

    // Lire tous les fichiers du répertoire
    const files = await fs.readdir(dirPath);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    // Lire les métadonnées de chaque fichier
    const filesWithMetadata = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const slug = file.replace(".mdx", "");

        const result = await readMDXFile(filePath);

        if (result.success && result.data) {
          return {
            slug,
            ...result.data.metadata,
            // Si pas de status défini, considérer comme publié (pour les anciens projets)
            status: result.data.metadata.status || "published",
          };
        }

        return null;
      }),
    );

    // Filtrer les fichiers invalides et trier par date de publication
    interface FileWithMetadata {
      slug: string;
      publishedAt?: string;
      [key: string]: unknown;
    }

    const validFiles = filesWithMetadata
      .filter((file): file is NonNullable<typeof file> => file !== null)
      .sort((a, b) => {
        const fileA = a as FileWithMetadata;
        const fileB = b as FileWithMetadata;
        const dateA = new Date(fileA.publishedAt || 0).getTime();
        const dateB = new Date(fileB.publishedAt || 0).getTime();
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });

    return {
      success: true,
      data: validFiles,
    };
  } catch (error) {
    console.error("Erreur liste MDX:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Met à jour uniquement le status d'un fichier MDX (pour publication)
 *
 * @param type - Type de contenu
 * @param slug - Slug du fichier
 * @param newStatus - Nouveau status
 * @returns Résultat de l'opération
 */
export async function updateMDXStatus(
  type: "project" | "post",
  slug: string,
  newStatus: "draft" | "scheduled" | "published",
) {
  try {
    const dirPath = type === "project" ? CONTENT_PATHS.projects : CONTENT_PATHS.posts;
    const filePath = path.join(dirPath, `${slug}.mdx`);

    // Lire le fichier existant
    const result = await readMDXFile(filePath);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: "Impossible de lire le fichier",
      };
    }

    // Mettre à jour le status et la date de modification
    const updatedMetadata = {
      ...result.data.metadata,
      status: newStatus,
      lastModified: new Date().toISOString(),
    } as ProjectMetadata | PostMetadata;

    // Réécrire le fichier avec le nouveau status
    const mdxContent = generateMDXContent(updatedMetadata, result.data.content);
    await fs.writeFile(filePath, mdxContent, "utf8");

    return {
      success: true,
      filePath: path.relative(process.cwd(), filePath),
      message: `Status mis à jour: ${newStatus}`,
    };
  } catch (error) {
    console.error("Erreur mise à jour status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
