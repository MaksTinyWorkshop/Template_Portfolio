import { Octokit } from "@octokit/rest";

/**
 * Configuration GitHub pour les commits automatiques
 */
const GITHUB_CONFIG = {
  owner: process.env.GITHUB_OWNER || "",
  repo: process.env.GITHUB_REPO || "",
  branch: process.env.GITHUB_BRANCH || "main",
  token: process.env.GITHUB_TOKEN || "",
  author: {
    name: process.env.GIT_AUTHOR_NAME || "Portfolio Admin",
    email: process.env.GIT_AUTHOR_EMAIL || "admin@portfolio.local",
  },
};

/**
 * Instance Octokit pour interagir avec l'API GitHub
 */
let octokit: Octokit | null = null;

function getOctokit(): Octokit {
  if (!octokit) {
    if (!GITHUB_CONFIG.token) {
      throw new Error("GITHUB_TOKEN n'est pas configuré");
    }
    octokit = new Octokit({ auth: GITHUB_CONFIG.token });
  }
  return octokit;
}

/**
 * Vérifie si la configuration GitHub est valide
 */
function validateGitHubConfig(): { valid: boolean; error?: string } {
  if (!GITHUB_CONFIG.token) {
    return { valid: false, error: "GITHUB_TOKEN manquant" };
  }
  if (!GITHUB_CONFIG.owner) {
    return { valid: false, error: "GITHUB_OWNER manquant" };
  }
  if (!GITHUB_CONFIG.repo) {
    return { valid: false, error: "GITHUB_REPO manquant" };
  }
  return { valid: true };
}

/**
 * Commit et push un fichier vers GitHub via l'API REST
 *
 * @param filePath - Chemin du fichier relatif au projet
 * @param commitMessage - Message de commit
 * @returns Promise avec le résultat de l'opération
 */
export async function commitAndPushViaAPI(
  filePath: string,
  commitMessage: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Valider la configuration
    const configCheck = validateGitHubConfig();
    if (!configCheck.valid) {
      return {
        success: false,
        message: "Configuration GitHub invalide",
        error: configCheck.error,
      };
    }

    const client = getOctokit();
    const { owner, repo, branch, author } = GITHUB_CONFIG;

    // 1. Obtenir la référence de la branche
    const refResponse = await client.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const currentCommitSha = refResponse.data.object.sha;

    // 2. Obtenir le commit actuel
    const commitResponse = await client.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    });

    const currentTreeSha = commitResponse.data.tree.sha;

    // 3. Lire le contenu du fichier depuis le filesystem
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), filePath);

    let fileContent: string;
    try {
      fileContent = await fs.readFile(fullPath, "utf-8");
    } catch (error) {
      return {
        success: false,
        message: "Fichier introuvable",
        error: `Impossible de lire ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      };
    }

    // 4. Créer un blob avec le nouveau contenu
    const blobResponse = await client.git.createBlob({
      owner,
      repo,
      content: Buffer.from(fileContent).toString("base64"),
      encoding: "base64",
    });

    // 5. Créer un nouveau tree avec le fichier mis à jour
    const treeResponse = await client.git.createTree({
      owner,
      repo,
      base_tree: currentTreeSha,
      tree: [
        {
          path: filePath,
          mode: "100644",
          type: "blob",
          sha: blobResponse.data.sha,
        },
      ],
    });

    // 6. Créer le nouveau commit
    const newCommitResponse = await client.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: treeResponse.data.sha,
      parents: [currentCommitSha],
      author: {
        name: author.name,
        email: author.email,
      },
    });

    // 7. Mettre à jour la référence de la branche
    await client.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitResponse.data.sha,
    });

    return {
      success: true,
      message: `Fichier committé et poussé via GitHub API: ${filePath}`,
    };
  } catch (error) {
    console.error("Erreur GitHub API:", error);
    return {
      success: false,
      message: "Erreur lors de l'opération GitHub",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Commit et push la suppression d'un fichier via l'API GitHub
 *
 * @param filePath - Chemin du fichier à supprimer
 * @param commitMessage - Message de commit
 * @returns Promise avec le résultat de l'opération
 */
export async function commitDeleteViaAPI(
  filePath: string,
  commitMessage: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Valider la configuration
    const configCheck = validateGitHubConfig();
    if (!configCheck.valid) {
      return {
        success: false,
        message: "Configuration GitHub invalide",
        error: configCheck.error,
      };
    }

    const client = getOctokit();
    const { owner, repo, branch, author } = GITHUB_CONFIG;

    // 1. Obtenir la référence de la branche
    const refResponse = await client.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const currentCommitSha = refResponse.data.object.sha;

    // 2. Obtenir le commit actuel
    const commitResponse = await client.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    });

    const currentTreeSha = commitResponse.data.tree.sha;

    // 3. Obtenir l'arbre actuel
    const treeResponse = await client.git.getTree({
      owner,
      repo,
      tree_sha: currentTreeSha,
      recursive: "true",
    });

    // 4. Créer un nouvel arbre sans le fichier supprimé
    const newTree = treeResponse.data.tree
      .filter((item) => item.path !== filePath)
      .map((item) => ({
        path: item.path!,
        mode: item.mode as "100644" | "100755" | "040000" | "160000" | "120000",
        type: item.type as "blob" | "tree" | "commit",
        sha: item.sha!,
      }));

    const newTreeResponse = await client.git.createTree({
      owner,
      repo,
      tree: newTree,
    });

    // 5. Créer le nouveau commit
    const newCommitResponse = await client.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTreeResponse.data.sha,
      parents: [currentCommitSha],
      author: {
        name: author.name,
        email: author.email,
      },
    });

    // 6. Mettre à jour la référence de la branche
    await client.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitResponse.data.sha,
    });

    return {
      success: true,
      message: `Fichier supprimé et poussé via GitHub API: ${filePath}`,
    };
  } catch (error) {
    console.error("Erreur GitHub API:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression GitHub",
      error: error instanceof Error ? error.message : String(error),
    };
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
