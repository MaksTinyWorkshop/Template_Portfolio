import simpleGit, { SimpleGit } from "simple-git";
import path from "path";

/**
 * Instance Git configurée pour le repository du portfolio
 */
const git: SimpleGit = simpleGit({
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
});

/**
 * Configuration Git pour les commits automatiques
 */
const GIT_CONFIG = {
  author: {
    name: process.env.GIT_AUTHOR_NAME || "Portfolio Admin",
    email: process.env.GIT_AUTHOR_EMAIL || "admin@portfolio.local",
  },
  remote: "origin",
  branch: "main",
};

/**
 * Commit et push un fichier vers le repository
 *
 * @param filePath - Chemin du fichier relatif au projet
 * @param commitMessage - Message de commit
 * @param push - Si true, pousse vers le remote (défaut: true)
 * @returns Promise avec le résultat de l'opération
 */
export async function commitAndPush(
  filePath: string,
  commitMessage: string,
  push: boolean = true,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Vérifier que Git est initialisé
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error("Le répertoire n'est pas un repository Git");
    }

    // Ajouter le fichier à l'index
    await git.add(filePath);

    // Commit avec l'auteur configuré
    await git.commit(commitMessage, filePath, {
      "--author": `${GIT_CONFIG.author.name} <${GIT_CONFIG.author.email}>`,
    });

    // Push vers le remote si demandé
    if (push) {
      await git.push(GIT_CONFIG.remote, GIT_CONFIG.branch);
      return {
        success: true,
        message: `Fichier committé et poussé: ${filePath}`,
      };
    }

    return {
      success: true,
      message: `Fichier committé localement: ${filePath}`,
    };
  } catch (error) {
    console.error("Erreur Git:", error);
    return {
      success: false,
      message: "Erreur lors de l'opération Git",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Commit et push la suppression d'un fichier
 *
 * @param filePath - Chemin du fichier à supprimer
 * @param commitMessage - Message de commit
 * @param push - Si true, pousse vers le remote (défaut: true)
 * @returns Promise avec le résultat de l'opération
 */
export async function commitDelete(
  filePath: string,
  commitMessage: string,
  push: boolean = true,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error("Le répertoire n'est pas un repository Git");
    }

    // Supprimer le fichier de l'index
    await git.rm(filePath);

    // Commit la suppression
    await git.commit(commitMessage, filePath, {
      "--author": `${GIT_CONFIG.author.name} <${GIT_CONFIG.author.email}>`,
    });

    // Push vers le remote si demandé
    if (push) {
      await git.push(GIT_CONFIG.remote, GIT_CONFIG.branch);
      return {
        success: true,
        message: `Fichier supprimé et poussé: ${filePath}`,
      };
    }

    return {
      success: true,
      message: `Fichier supprimé localement: ${filePath}`,
    };
  } catch (error) {
    console.error("Erreur Git:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression Git",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Récupère le statut Git du repository
 *
 * @returns Promise avec le statut Git
 */
export async function getGitStatus() {
  try {
    const status = await git.status();
    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error("Erreur Git status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Récupère l'historique des commits pour un fichier
 *
 * @param filePath - Chemin du fichier
 * @param maxCount - Nombre maximum de commits à récupérer (défaut: 10)
 * @returns Promise avec l'historique des commits
 */
export async function getFileHistory(filePath: string, maxCount: number = 10) {
  try {
    const log = await git.log({
      file: filePath,
      maxCount,
    });
    return {
      success: true,
      data: log,
    };
  } catch (error) {
    console.error("Erreur Git log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Vérifie si le repository a des changements non committés
 *
 * @returns Promise avec true si des changements existent
 */
export async function hasUncommittedChanges(): Promise<boolean> {
  try {
    const status = await git.status();
    return !status.isClean();
  } catch (error) {
    console.error("Erreur vérification Git:", error);
    return false;
  }
}

/**
 * Génère un message de commit formaté pour une opération admin
 *
 * @param action - Action effectuée (create, update, delete, publish)
 * @param type - Type de contenu (project, post)
 * @param title - Titre du contenu
 * @returns Message de commit formaté
 */
export function generateCommitMessage(
  action: "create" | "update" | "delete" | "publish",
  type: "project" | "post",
  title: string,
): string {
  const actionLabels = {
    create: "Créer",
    update: "Mettre à jour",
    delete: "Supprimer",
    publish: "Publier",
  };

  const typeLabels = {
    project: "le projet",
    post: "l'article",
  };

  return `${actionLabels[action]} ${typeLabels[type]}: "${title}"

Co-Authored-By: Portfolio Admin <admin@portfolio.local>`;
}
