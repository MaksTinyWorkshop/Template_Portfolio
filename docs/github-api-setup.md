# Configuration de l'API GitHub pour la Publication Automatique

## Vue d'ensemble

Le système de publication utilise l'API GitHub REST pour créer des commits directement depuis l'interface d'administration, sans nécessiter `git` installé localement. Cela permet de fonctionner en environnement serverless (Vercel, Netlify, etc.).

## Prérequis

1. Un repository GitHub (public ou privé)
2. Un token GitHub avec les permissions appropriées
3. Accès au fichier `.env` pour configurer les variables d'environnement

## Étape 1 : Créer un Token GitHub

### Option A : Personal Access Token (Classique)

1. Allez sur [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez un nom descriptif au token : `Portfolio Admin - Production`
4. Sélectionnez l'expiration : **No expiration** (ou selon votre politique de sécurité)
5. Cochez les permissions suivantes :
   - ✅ **repo** (Full control of private repositories)
     - Inclut : `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Cliquez sur **"Generate token"**
7. **⚠️ IMPORTANT** : Copiez le token immédiatement (il ne sera plus visible après)

### Option B : Fine-grained Personal Access Token (Recommandé)

1. Allez sur [GitHub Settings > Tokens (Fine-grained)](https://github.com/settings/tokens?type=beta)
2. Cliquez sur **"Generate new token"**
3. Configurez le token :
   - **Token name** : `Portfolio Admin - Production`
   - **Expiration** : Custom ou No expiration
   - **Repository access** : Sélectionnez votre repository spécifique
4. Sélectionnez les permissions :
   - **Repository permissions** :
     - ✅ **Contents** : Read and write
     - ✅ **Metadata** : Read-only (automatique)
5. Cliquez sur **"Generate token"**
6. **⚠️ IMPORTANT** : Copiez le token immédiatement

## Étape 2 : Configurer les Variables d'Environnement

### Développement Local

Créez ou modifiez le fichier `.env` à la racine du projet :

```env
# GitHub API Configuration
GITHUB_TOKEN=ghp_votre_token_ici
GITHUB_OWNER=votre_username
GITHUB_REPO=nom_du_repo
GITHUB_BRANCH=main

# Informations de commit
GIT_AUTHOR_NAME=Portfolio Admin
GIT_AUTHOR_EMAIL=admin@portfolio.local
```

### Production (Vercel)

1. Allez dans les **Settings** de votre projet Vercel
2. Section **Environment Variables**
3. Ajoutez les variables suivantes :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `GITHUB_TOKEN` | Votre token GitHub | Production, Preview |
| `GITHUB_OWNER` | Votre username GitHub | Production, Preview |
| `GITHUB_REPO` | Nom du repository | Production, Preview |
| `GITHUB_BRANCH` | `main` (ou votre branche) | Production, Preview |
| `GIT_AUTHOR_NAME` | Portfolio Admin | Production, Preview |
| `GIT_AUTHOR_EMAIL` | admin@portfolio.local | Production, Preview |

4. Cliquez sur **Save**
5. **Redéployez** votre application pour que les variables prennent effet

### Production (Netlify)

1. Allez dans **Site settings > Environment variables**
2. Cliquez sur **Add a variable**
3. Ajoutez chaque variable :
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`
   - `GIT_AUTHOR_NAME`
   - `GIT_AUTHOR_EMAIL`
4. **Redéployez** votre site

## Étape 3 : Tester la Configuration

### Test en Local

1. Assurez-vous que votre `.env` est configuré
2. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
3. Accédez au panel admin : `http://localhost:3000/admin`
4. Créez un brouillon d'article ou de projet
5. Cliquez sur **"Publier"** dans le menu dropdown
6. Vérifiez que :
   - Le message de succès s'affiche
   - Un nouveau commit apparaît sur GitHub
   - Le fichier MDX a été mis à jour avec `status: published`

### Test en Production

1. Déployez votre application avec les variables d'environnement configurées
2. Accédez au panel admin en production
3. Créez et publiez un contenu de test
4. Vérifiez le commit sur GitHub

## Architecture Technique

### Flux de Publication

```
User clique "Publier"
    ↓
ContentList.tsx : handlePublish()
    ↓
POST /api/admin/publish
    ↓
1. Vérification authentification
2. Lecture du fichier MDX actuel
3. Mise à jour du status → "published"
4. Sauvegarde locale du fichier
    ↓
commitAndPushViaAPI() - git-github.ts
    ↓
GitHub API :
  1. Get ref (branche)
  2. Get commit
  3. Read file content (filesystem)
  4. Create blob
  5. Create tree
  6. Create commit
  7. Update ref
    ↓
Succès : Commit visible sur GitHub
```

### Comparaison : simple-git vs GitHub API

| Aspect | simple-git (ancien) | GitHub API (nouveau) |
|--------|-------------------|---------------------|
| Environnement | Nécessite `git` installé | Fonctionne partout |
| Serverless | ❌ Ne fonctionne pas | ✅ Compatible |
| Production | ❌ Erreur ENOENT | ✅ Fonctionne |
| Configuration | Simple | Token GitHub requis |
| Performance | Rapide (local) | Légèrement plus lent (API) |
| Sécurité | Accès filesystem | Token avec permissions |

## Dépannage

### Erreur : "GITHUB_TOKEN manquant"

- Vérifiez que la variable `GITHUB_TOKEN` est définie dans `.env`
- En production, vérifiez les variables d'environnement de votre plateforme
- Redéployez si vous venez d'ajouter la variable

### Erreur : "Bad credentials" ou "401 Unauthorized"

- Le token GitHub est invalide ou expiré
- Vérifiez que le token a les permissions `repo` ou `Contents: Write`
- Générez un nouveau token si nécessaire

### Erreur : "Reference does not exist"

- La branche spécifiée dans `GITHUB_BRANCH` n'existe pas
- Vérifiez le nom de la branche (sensible à la casse)
- Utilisez `main` ou `master` selon votre configuration

### Erreur : "Not Found" ou "404"

- Vérifiez `GITHUB_OWNER` et `GITHUB_REPO`
- Assurez-vous que le token a accès au repository
- Pour les repositories privés, vérifiez les permissions du token

### Le commit n'apparaît pas sur GitHub

- Vérifiez les logs de la console serveur
- Testez avec un repository public d'abord
- Assurez-vous que le fichier existe localement avant le commit

## Sécurité

### Bonnes Pratiques

1. **Ne jamais committer le token** dans le code source
2. Utilisez `.env` pour le développement (déjà dans `.gitignore`)
3. Utilisez des tokens avec le minimum de permissions nécessaires
4. Considérez l'expiration automatique des tokens en production
5. Utilisez des tokens fine-grained pour limiter l'accès à un seul repository

### Rotation des Tokens

1. Créez un nouveau token
2. Mettez à jour la variable d'environnement en production
3. Redéployez l'application
4. Révoquez l'ancien token sur GitHub

## Références

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
