# API Contracts - Portfolio

## Vue d'ensemble

Ce document catalogue toutes les routes API du portfolio. L'application utilise les API Routes de Next.js pour gérer l'authentification, le contenu admin, et les fonctionnalités publiques.

---

## Routes API

### Authentification

#### `POST /api/authenticate`
**Description** : Authentifie l'utilisateur admin avec un mot de passe
**Type** : Authentification
**Requête** : `{ password: string }`
**Réponse** : Cookie JWT + status success/error

#### `GET /api/check-auth`
**Description** : Vérifie si l'utilisateur est authentifié
**Type** : Authentification
**Requête** : Cookie JWT
**Réponse** : `{ authenticated: boolean }`

#### `POST /api/refresh-token`
**Description** : Rafraîchit le token JWT d'authentification
**Type** : Authentification
**Requête** : Cookie JWT
**Réponse** : Nouveau cookie JWT

---

### Gestion de Contenu (Admin)

#### `GET /api/admin/posts`
**Description** : Récupère la liste de tous les posts du blog
**Type** : Admin - Content Management
**Authentification** : Requise (JWT)
**Réponse** : `Array<{ slug, title, date, published }>`

#### `POST /api/admin/posts`
**Description** : Crée ou met à jour un post de blog
**Type** : Admin - Content Management
**Authentification** : Requise (JWT)
**Requête** : Post data (MDX content)
**Réponse** : Success/Error status

#### `GET /api/admin/projects`
**Description** : Récupère la liste de tous les projets
**Type** : Admin - Content Management
**Authentification** : Requise (JWT)
**Réponse** : `Array<{ slug, title, tags, published }>`

#### `POST /api/admin/projects`
**Description** : Crée ou met à jour un projet
**Type** : Admin - Content Management
**Authentification** : Requise (JWT)
**Requête** : Project data (MDX content)
**Réponse** : Success/Error status

#### `POST /api/admin/publish`
**Description** : Publie ou dépublie un post/projet
**Type** : Admin - Content Management
**Authentification** : Requise (JWT)
**Requête** : `{ type: 'post'|'project', slug: string, published: boolean }`
**Réponse** : Success/Error status
**Notes** : La route met à jour le champ `status` dans les tables Prisma `Article`/`Project` et appelle `setProjectStatus`/`setArticleStatus`. Elle déclenche `revalidatePath` pour invalider les caches Next.js et ne crée plus de commits GitHub (voir [Publication via la base de données (variante_BDD)](./github-api-setup.md)).

#### `POST /api/admin/upload`
**Description** : Upload d'images pour le contenu
**Type** : Admin - File Upload
**Authentification** : Requise (JWT)
**Requête** : FormData avec fichier image
**Réponse** : `{ url: string }` - URL de l'image uploadée

---

### Disponibilité

#### `GET /api/availability`
**Description** : Récupère le statut de disponibilité actuel
**Type** : Public
**Réponse** : `{ available: boolean, lastUpdated: string }`

#### `POST /api/availability`
**Description** : Met à jour le statut de disponibilité
**Type** : Admin
**Authentification** : Requise (JWT)
**Requête** : `{ available: boolean }`
**Réponse** : Success/Error status

---

### Utilitaires

#### `GET /api/rss`
**Description** : Génère le flux RSS du blog
**Type** : Public
**Réponse** : XML RSS Feed

#### `GET /api/og/proxy`
**Description** : Proxy pour les images Open Graph
**Type** : Public
**Paramètres** : `?url=<image_url>`
**Réponse** : Image binaire

#### `GET /api/og/fetch`
**Description** : Récupère les métadonnées Open Graph d'une URL
**Type** : Public
**Paramètres** : `?url=<page_url>`
**Réponse** : `{ title, description, image, ... }`

---

## Patterns d'Authentification

**Mécanisme** : JWT stocké en cookie HTTP-only
**Middleware** : Vérification sur toutes les routes `/api/admin/*`
**Expiration** : Token avec durée limitée + refresh token

## Sécurité

- Cookies HTTP-only pour prévenir les attaques XSS
- Validation des entrées avec Zod
- Middleware d'authentification sur routes admin
- Rate limiting recommandé (à implémenter)

## Notes

- Toutes les routes utilisent les API Routes de Next.js (App Router)
- Format de réponse standard JSON
- Gestion d'erreurs cohérente avec status codes HTTP appropriés
