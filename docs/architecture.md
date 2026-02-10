# Architecture - Portfolio

## Résumé Exécutif

Ce document décrit l'architecture complète du portfolio Portfolio Max, une application web moderne construite avec Next.js 16 et le design system Once UI. L'application combine un site vitrine public avec un système d'administration complet pour gérer le contenu (blog, projets, galerie).

**Type d'application** : Web Application (Monolithe)
**Framework** : Next.js 16 (App Router)
**Pattern architectural** : Component-Based avec SSR/SSG hybride
**Déploiement** : Statique + Serverless Functions

---

## Stack Technologique

### Frontend

| Technologie     | Version | Rôle                              |
| --------------- | ------- | --------------------------------- |
| **React**       | 19.2.0  | Bibliothèque UI principale        |
| **Next.js**     | 16.0.10 | Framework avec SSR/SSG et routing |
| **TypeScript**  | 5.8.3   | Typage statique strict            |
| **Once UI**     | 1.5.6   | Design system et composants       |
| **Sass**        | 1.86.3  | Préprocesseur CSS                 |
| **React Icons** | 5.5.0   | Bibliothèque d'icônes             |

### Gestion de Contenu

| Technologie         | Version | Rôle                      |
| ------------------- | ------- | ------------------------- |
| **MDX**             | 3.1.0   | Markdown enrichi avec JSX |
| **next-mdx-remote** | 5.0.0   | Rendu MDX dynamique       |
| **gray-matter**     | 4.0.3   | Parsing frontmatter YAML  |

### Formulaires et Validation

| Technologie             | Version | Rôle                                   |
| ----------------------- | ------- | -------------------------------------- |
| **React Hook Form**     | 7.71.1  | Gestion de formulaires performante     |
| **Zod**                 | 4.3.6   | Validation de schémas TypeScript-first |
| **@hookform/resolvers** | 5.2.2   | Intégration Zod + RHF                  |

### Authentification

| Technologie           | Version          | Rôle                         |
| --------------------- | ---------------- | ---------------------------- |
| **JWT (custom)**      | -                | Tokens d'authentification    |
| **bcrypt**            | (via cookie lib) | Hash des mots de passe       |
| **Cookies HTTP-only** | -                | Stockage sécurisé des tokens |

### Outils de Développement

| Technologie     | Version | Rôle                       |
| --------------- | ------- | -------------------------- |
| **Biome**       | 1.9.4   | Linter et formatter rapide |
| **ESLint**      | 9.25.0  | Analyse statique du code   |
| **lint-staged** | 16.1.5  | Pre-commit hooks           |

---

## Architecture Pattern

### Next.js App Router

L'application utilise le **App Router** de Next.js 13+, basé sur React Server Components.

**Caractéristiques** :

- File-system based routing
- Server Components par défaut
- Client Components explicites (`'use client'`)
- Layouts imbriqués
- API Routes intégrées

### Component-Based Architecture

**Pattern de composition** :

```
Layout (Server)
  ├─ Header (Server)
  │   └─ ThemeToggle (Client)
  ├─ Page Content (Server/Client mix)
  │   ├─ Display Components (Server)
  │   └─ Interactive Components (Client)
  └─ Footer (Server)
```

**Séparation** :

- **Server Components** : Rendu côté serveur, data fetching, SEO
- **Client Components** : Interactivité, state, événements, hooks

### SSR/SSG Hybride

**Stratégies de rendu** :

1. **Static Site Generation (SSG)**
   - Pages publiques : Home, About, Blog list, Work list
   - Pré-rendues au build time
   - Optimales pour SEO et performance

2. **Server-Side Rendering (SSR)**
   - Pages dynamiques : Blog posts, Project pages
   - Rendu à la demande avec cache
   - Contenu MDX compilé à la volée

3. **Client-Side Rendering (CSR)**
   - Interface admin complète
   - Filtres et interactions
   - Protected routes avec RouteGuard

---

## Architecture des Données

### Système de Contenu MDX

**Structure** :

```
Fichiers MDX (data/posts/*.mdx, data/projects/*.mdx)
  ↓ [Parsing]
Utils (getBlogPosts.ts, getProjects.ts, mdx.ts)
  ↓ [Transform]
Composants (Post, Projects)
  ↓ [Render]
Page finale
```

**Frontmatter YAML** :

```yaml
---
title: "Titre"
publishedAt: "2026-01-31"
summary: "Résumé"
images:
  - /images/cover.jpg
tags:
  - React
  - Next.js
published: true
---
```

**Parsing** :

- `gray-matter` : Extraction frontmatter
- `next-mdx-remote` : Compilation MDX
- Composants custom : Rendu enrichi

### Gestion de l'État de Publication

**Fichier** : `data/availability.json` (exemple)

```json
{
  "available": true,
  "lastUpdated": "2026-01-31T10:00:00Z"
}
```

**Pattern** :

- Lecture/écriture via API Route
- Cache en mémoire (potentiel)
- Pas de base de données nécessaire

### Pas de Base de Données

**Approche File-Based** :

- Contenu stocké en MDX sur le filesystem
- Métadonnées dans le frontmatter
- État simple dans JSON
- Avantage : Simplicité, versioning Git, déploiement statique

---

## Architecture API

### Routes API (Backend)

**Emplacement** : `src/app/api/`

**Organisation** :

```
/api
├── admin/              # Routes protégées
│   ├── posts/         # CRUD posts
│   ├── projects/      # CRUD projets
│   ├── publish/       # Toggle publication
│   └── upload/        # Upload images
├── authenticate/      # Login
├── check-auth/        # Vérif auth
├── refresh-token/     # Refresh JWT
├── availability/      # Statut dispo
├── rss/               # Flux RSS
└── og/                # Utils Open Graph
    ├── proxy/
    └── fetch/
```

**Pattern RESTful** :

- `GET` : Récupération de données
- `POST` : Création/modification
- Réponses JSON standardisées
- Status codes HTTP appropriés

### Authentification et Sécurité

**Flow d'authentification** :

```
1. User → POST /api/authenticate { password }
2. API vérifie hash bcrypt
3. Si valide → Génère JWT
4. JWT stocké en cookie HTTP-only
5. Middleware vérifie JWT sur routes /api/admin/*
6. Token expire → Refresh via /api/refresh-token
```

**Sécurité** :

- **HTTP-only cookies** : Prévient XSS
- **Secure flag** : HTTPS uniquement en prod
- **SameSite** : Protection CSRF
- **Middleware** : `src/middleware.ts` protège routes admin
- **Validation** : Zod sur toutes les entrées

**Middleware Next.js** :

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Vérifie JWT sur /admin et /api/admin
  // Redirige vers /admin si non authentifié
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

---

## Architecture des Composants

### Hiérarchie

```
App Root (layout.tsx)
├─ Providers (ThemeProvider, ...)
├─ Header
│   ├─ Navigation
│   └─ ThemeToggle
├─ Pages
│   ├─ Public Pages
│   │   ├─ Home (Hero, CTA)
│   │   ├─ About (CV, TableOfContents)
│   │   ├─ Blog (Posts list, Post detail)
│   │   ├─ Work (Projects grid, Project detail)
│   │   └─ Gallery (GalleryView)
│   └─ Admin Pages (Protected)
│       ├─ Dashboard (Stats)
│       ├─ Posts Management (PostsList, PostForm)
│       └─ Projects Management (ProjectsList, ProjectForm)
└─ Footer
```

### Patterns de Composants

#### 1. Container/Presentational

```typescript
// Container (logic)
function PostsContainer() {
  const posts = getBlogPosts();
  return <Posts posts={posts} />;
}

// Presentational (UI)
function Posts({ posts }) {
  return posts.map(post => <PostCard {...post} />);
}
```

#### 2. Compound Components

```typescript
<FilterableProjects projects={projects}>
  <ProjectFilter />
  <ProjectGrid />
</FilterableProjects>
```

#### 3. Render Props / Children

```typescript
<RouteGuard>
  <AdminLayout>
    {/* Protected content */}
  </AdminLayout>
</RouteGuard>
```

### Server vs Client Components

**Règle** : Server par défaut, Client quand nécessaire

**Client Components requis pour** :

- État React (`useState`, `useReducer`)
- Effets (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (localStorage, window)
- Hooks custom qui dépendent des hooks React

**Exemples** :

- ✅ Server : `Header`, `Footer`, `Post` (display)
- ✅ Client : `ThemeToggle`, `ProjectFilter`, `LoginPage`

---

## Routage et Navigation

### Structure des Routes

```
/                       # Home (SSG)
/about                  # CV/About (SSG)
/blog                   # Liste posts (SSG)
/blog/posts/[slug]      # Post détail (SSR)
/work                   # Liste projets (SSG)
/work/projects/[slug]   # Projet détail (SSR)
/gallery                # Galerie (SSG)
/admin                  # Dashboard admin (CSR, protected)
/admin/posts            # Gestion posts (CSR, protected)
/admin/projects         # Gestion projets (CSR, protected)
/api/*                  # API Routes
```

### Routes Dynamiques

**Pattern** : `[slug]` folder

```typescript
// data/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return <Post post={post} />;
}
```

**Avantage** :

- Build time generation des pages statiques
- SEO optimal
- Performance maximale

### Protection des Routes

**Middleware** : `src/middleware.ts`

```typescript
if (pathname.startsWith("/admin") && !isAuthenticated) {
  return NextResponse.redirect("/admin/login");
}
```

**Client-side** : `RouteGuard` component

```typescript
<RouteGuard>
  <AdminContent />
</RouteGuard>
```

---

## Gestion du Thème

### Once UI Theme System

**Configuration** : `src/resources/config/once-ui.config.js`

**Tokens** :

- Colors (brand, neutral, accent)
- Typography (font families, scales)
- Spacing, Radius, Borders
- Effects (shadows, transitions)

**Provider** : `Providers.tsx`

```typescript
<OnceUIProvider theme={themeConfig}>
  {children}
</OnceUIProvider>
```

**Toggle** : `ThemeToggle.tsx`

- Basculer light/dark
- Stockage en localStorage
- SSR-safe

---

## Optimisations

### Images

**Next.js Image Optimization** :

```typescript
import Image from 'next/image'

<Image
  src="/images/photo.jpg"
  width={800}
  height={600}
  alt="Description"
/>
```

**Formats** : AVIF, WebP automatiques
**Features** :

- Lazy loading
- Responsive images
- Placeholder blur
- Cache optimisé

### Code Splitting

**Automatique** :

- Par route (chaque page = chunk séparé)
- Par import dynamique

**Dynamic Import** :

```typescript
import dynamic from "next/dynamic";

const AdminPanel = dynamic(() => import("@/components/admin/AdminPanel"));
```

### Compilation

**Turbopack** (dev) : Bundler ultra-rapide
**Production** :

- Minification JS/CSS
- Tree shaking
- Dead code elimination
- Compression Gzip/Brotli

---

## Déploiement

### Cibles de Déploiement

**Recommandé** : Vercel (créateurs de Next.js)
**Alternatives** : Netlify, AWS Amplify, Railway, Render

### Build Static + Serverless

**Build** :

```bash
npm run build
```

**Outputs** :

- `.next/static/` : Assets statiques
- `.next/server/` : Fonctions serverless
- `.next/standalone/` : Mode standalone (optionnel)

### Variables d'Environnement

**Requises en production** :

- `ADMIN_PASSWORD_HASH`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET` (auto-généré si absent)

**Configuration Vercel/Netlify** :

- Ajout via dashboard
- Ou fichier `.env.production`

---

## Patterns de Test (Recommandés)

### Tests Unitaires

**Framework suggéré** : Jest + React Testing Library

### Tests E2E

**Framework suggéré** : Playwright

### Tests Manuels

Checklist dans [docs/development-guide.md](./development-guide.md)

---

## Considérations de Scalabilité

### Actuel (File-Based)

✅ Adapté pour :

- Portfolios personnels
- Blogs <100 posts
- Projets <50 entrées

### Migration Future (Si Nécessaire)

Vers CMS Headless (Contentful, Sanity, Strapi) si :

- Contenu >1000 entrées
- Multiples contributeurs
- Workflow d'édition complexe
- Recherche full-text requise

---

## Diagrammes

### Architecture Globale

```
┌─────────────────────────────────────────┐
│          Browser (Client)               │
│  ┌──────────────────────────────────┐   │
│  │   React App (Client Components)  │   │
│  │   - Forms, Filters, Admin UI     │   │
│  └──────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │ HTTP/Fetch
              ↓
┌─────────────────────────────────────────┐
│       Next.js Server (Vercel)           │
│  ┌──────────────────────────────────┐   │
│  │  Server Components (SSR/SSG)     │   │
│  │  - Pages, Layouts, Data Fetching │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │      API Routes (Serverless)     │   │
│  │  - Auth, CRUD, File Upload       │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │     Middleware (JWT Verify)      │   │
│  └──────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │ File System Access
              ↓
┌─────────────────────────────────────────┐
│         Filesystem (Static)             │
│  - MDX files (blog, projects)           │
│  - JSON data (availability)             │
│  - Images (public/images/)              │
└─────────────────────────────────────────┘
```

### Flow d'Authentification

```
User                Browser              Server              Filesystem
  │                    │                   │                     │
  │─── Enter password ───→ POST /api/authenticate              │
  │                    │      │                                 │
  │                    │      │─── Verify bcrypt hash ──────────→
  │                    │      │←─── Hash from config ───────────│
  │                    │      │                                 │
  │                    │←─ Set JWT cookie ─│                   │
  │                    │                   │                   │
  │─── Access /admin ─────→ GET /admin    │                   │
  │                    │      │─── Middleware checks JWT       │
  │                    │      │ (if invalid → redirect)        │
  │                    │      │                                │
  │                    │←──── Admin UI ────│                   │
  │                    │                   │                   │
  │─ Create post ─────────→ POST /api/admin/posts             │
  │                    │      │─── Verify JWT (middleware)    │
  │                    │      │                                │
  │                    │      │─── Write MDX file ─────────────→
  │                    │      │←────── Success ────────────────│
  │                    │←──── 200 OK ──────│                   │
```

---

## Décisions Architecturales Clés

### 1. Pourquoi File-Based au lieu de Database ?

**Avantages** :

- ✅ Simplicité : Pas de setup BDD, pas de migrations
- ✅ Versioning : Contenu dans Git (historique, branches, rollback)
- ✅ Performance : Lecture fichier ultra-rapide
- ✅ Déploiement : Tout inclus dans le build statique
- ✅ Coût : Zero infrastructure additionnelle

**Inconvénients** :

- ❌ Scale limité (OK jusqu'à ~100 posts)
- ❌ Pas de recherche full-text native
- ❌ Édition nécessite rebuild/redeploy (mitigé par admin UI)

**Décision** : Adapté pour un portfolio personnel

### 2. Pourquoi Next.js App Router au lieu de Pages Router ?

**Avantages** :

- ✅ React Server Components (performance)
- ✅ Layouts imbriqués (moins de répétition)
- ✅ Data fetching simplifié (async Server Components)
- ✅ Streaming et Suspense natifs
- ✅ Future-proof (direction officielle Next.js)

### 3. Pourquoi JWT au lieu de Session-Based Auth ?

**Avantages** :

- ✅ Stateless (pas de stockage serveur)
- ✅ Compatible serverless (Vercel, Netlify)
- ✅ Scalable horizontalement
- ✅ Simple pour un seul admin

**Inconvénients** :

- ❌ Pas de révocation immédiate (mitigé par expiration courte + refresh)

### 4. Pourquoi Once UI au lieu de TailwindCSS/MUI ?

**Avantages** :

- ✅ Design system cohérent et moderne
- ✅ Tokens configurables
- ✅ Composants accessibles
- ✅ Thème light/dark intégré
- ✅ Optimisé pour Next.js

---

## Maintenance et Évolution

### Mises à Jour

**Dépendances** : Vérifier régulièrement

```bash
npm outdated
npm update
```

**Next.js** : Suivre les releases majeures

- Codemods fournis pour migrations
- Testing approfondi avant upgrade

### Points d'Extension

**Faciles** :

- Ajout de nouveaux composants UI
- Nouveaux posts/projets (MDX)
- Nouveaux endpoints API
- Personnalisation du thème

**Moyens** :

- Ajout de nouvelles pages/sections
- Intégration de services tiers (analytics, CMS)
- Système de commentaires

**Complexes** :

- Migration vers database
- Multi-langue (i18n)
- Mode multi-utilisateurs

---

## Ressources et Références

### Documentation Officielle

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Once UI Documentation](https://once-ui.com/docs)

### Code Source

- Repository : (URL du repository)
- Documentation projet : [docs/](./index.md)

---

**Dernière mise à jour** : 2026-01-31
**Version architecture** : 1.0
