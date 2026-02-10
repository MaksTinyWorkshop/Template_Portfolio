# Architecture - Portfolio (variante_BDD)

> **📌 Note** : Ce document décrit l'architecture de la branche **`variante_BDD`** qui utilise PostgreSQL + Prisma pour la persistance. La branche `main` conserve l'architecture file-based originale (MDX + JSON).

## Résumé Exécutif

Ce document décrit l'architecture complète du portfolio professionnel, une application web moderne construite avec Next.js 16, PostgreSQL/Prisma, et le design system Once UI. L'application combine un site vitrine public avec un système d'administration complet pour gérer le contenu (blog, projets, galerie) stocké en base de données relationnelle.

**Type d'application** : Web Application (Monolithe)
**Framework** : Next.js 16 (App Router)
**Pattern architectural** : Component-Based avec SSR/SSG hybride
**Base de données** : PostgreSQL 16 + Prisma 7 (ORM)
**Déploiement** : Docker + Serverless Functions ou VPS

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

### Base de Données (variante_BDD)

| Technologie    | Version | Rôle                                |
| -------------- | ------- | ----------------------------------- |
| **PostgreSQL** | 16.0+   | Base de données relationnelle       |
| **Prisma**     | 7.0+    | ORM avec migrations et client typé  |
| **@prisma/client** | 7.0+ | Client Prisma auto-généré          |

#### Stratégie de Fallback (Resilience Pattern)

**Objectif** : Garantir la disponibilité du site même en cas d'indisponibilité de PostgreSQL.

**Implémentation** :
- **Source primaire** : PostgreSQL (données runtime via Prisma)
- **Source de secours** : `src/app/(web)/resources/content.tsx` (données statiques hardcodées)
- **Service** : `person-site.service.ts` implémente le pattern fallback automatique

**Flux de données** :
```
1. Requête → getSitePersonData()
2. Tentative lecture PostgreSQL → PersonView
3. Si succès → Données PostgreSQL utilisées
4. Si échec/vide → Fallback vers content.tsx
5. Réponse → PersonSiteData (fusionnée avec fallback si nécessaire)
```

**Cas d'usage du fallback** :
- ✅ Base de données vide (première installation, avant seed)
- ✅ Erreur de connexion PostgreSQL (downtime, config incorrecte)
- ✅ Migration en cours (données temporairement indisponibles)
- ✅ Développement local (DB pas encore configurée)

**Maintenance** :
- ⚠️ Garder `content.tsx` synchronisé avec les données de production courantes
- ⚠️ Le fallback doit contenir les données minimales pour afficher le site (nom, email, réseaux sociaux)

> **Note** : Cette stratégie est particulièrement adaptée aux portfolios freelance où la disponibilité 24/7 est critique pour l'acquisition de prospects.

### Gestion de Contenu

| Technologie         | Version | Rôle                      |
| ------------------- | ------- | ------------------------- |
| **MDX**             | 3.1.0   | Markdown enrichi avec JSX (import initial) |
| **next-mdx-remote** | 5.0.0   | Rendu MDX dynamique       |
| **gray-matter**     | 4.0.3   | Parsing frontmatter YAML (seed) |

> **Note** : Dans variante_BDD, MDX sert uniquement pour l'import initial via seed. La base PostgreSQL devient la source de vérité runtime.

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

### Pipeline MDX → PostgreSQL (Prisma)

Les contenus Markdown (`data/posts/*.mdx`, `data/projects/*.mdx`) sont toujours la source originale, mais la variante_BDD les transforme en données persistées via PostgreSQL. Le script `scripts/seed-data.ts` normalise les slugs, tags, médias et personnes, puis appelle Prisma (`prisma/schema.prisma`) pour peupler les tables `Article`, `Project`, `Person`, `Tag` et `Media`. Les fichiers MDX restent utiles pour l'import initial, mais la base devient la source de vérité runtime.

```
data/{posts,projects}/*.mdx
   ↓ scripts/seed-data.ts (gray-matter → normalize)
Prisma (models Article, Project, Person, Tag, Media)
   ↓ Prisma client (@prisma/client dans src/lib/modules)
API routes (/api/admin/*, /api/public/*) & UI admin
```

Un re-seed (`npm run db:seed`) peut être déclenché pour resynchroniser la base avec les fichiers Markdown sans générer de commits Git.

### Modèles Prisma et Statuts

Les enums définis dans `prisma/schema.prisma` (`Status`, `MediaKind`, `TagCategory`, `MediaPurpose`) structurent la donnée. Les services `setProjectStatus` et `setArticleStatus` (dans `src/lib/modules/projects/application/projects.service.ts` et `src/lib/modules/articles/application/articles.service.ts`) gèrent le champ `status` (`draft`, `scheduled`, `published`), garantissant que chaque passage à l’état `published` est persisté dans la base.

```
Article { id, slug, title, summary, content, status, publishedAt, featured, mediaId, ... }
Project { id, slug, title, status, link, repository, persons, gallery, ... }
```

### Publication et Cache

La route `/api/admin/publish` collecte `{ slug, type }`, vérifie le cookie `authToken` via `checkAuthAPI`, appelle les services de statut, puis réactive les pages concernées (`revalidatePath("/work")`, etc.). Chaque transition modifie directement la base et déclenche la revalidation Next.js au lieu de générer un commit GitHub.

### Disponibilité et gestion des erreurs

La disponibilité est gérée via le modèle **`AvailabilityLog`** en base de données PostgreSQL. La route `/api/availability` effectue des opérations CRUD via Prisma :
- **GET** : Récupère le dernier log de disponibilité du site owner (`prisma.availabilityLog.findFirst`)
- **POST** : Crée un nouveau log d'historique avec le statut mis à jour (`prisma.availabilityLog.create`)

L'architecture maintient un **historique complet** des changements de statut avec horodatage (`createdAt`), permettant un audit et des analyses temporelles. Les erreurs sont gérées de manière uniforme via les helpers `respondSuccess`/`respondError` (dans `src/lib/http/`), avec `ApiError`, `ValidationError` et le wrapper `withApiErrorHandling`.

---

## Architecture API

### Routes API (Backend)

**Emplacement** : `src/app/(api)/api/`

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
5. Proxy (middleware Edge) protège l'accès aux pages `/admin/*` + les routes API admin vérifient le cookie via `checkAuthAPI`
6. Token expire → Refresh via /api/refresh-token
```

**Sécurité** :

- **HTTP-only cookies** : Prévient XSS
- **Secure flag** : HTTPS uniquement en prod
- **SameSite** : Protection CSRF
- **Proxy (middleware)** : `src/proxy.ts` protège `/admin/*` (Edge Runtime)
- **Auth API** : `checkAuthAPI` protège `/api/admin/*` (dans chaque route)
- **Validation** : Zod sur toutes les entrées API
- **Rate limiting** : PostgreSQL-based sur `/api/authenticate` et `/api/contact` (voir `docs/rate-limiting.md`)

**Proxy Next.js (pattern Next.js 13+)** :

```typescript
// src/proxy.ts
export async function proxy(request: NextRequest) {
  // Protège /admin/* (pages) via vérification du cookie authToken
  // Si invalide → redirection vers /admin
}

export const config = { matcher: ["/admin/:path*"] };
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

Les fichiers sont organisés dans `src/app/(web)` pour les pages publiques et l’interface admin (ex. `admin/projects/page.tsx`, `blog/posts/[slug]/page.tsx`), tandis que `src/app/(api)/api` regroupe toutes les routes API (auth, admin, availability, rss, og, analytics, etc.).

```
/                       # Home (SSG)
/about                  # CV/About (SSG)
/blog                   # Liste posts (SSG)
/blog/posts/[slug]      # Post détail (SSR)
/work                   # Liste projets (SSG)
/work/projects/[slug]   # Projet détail (SSR)
/gallery                # Galerie (SSG)
/legal                  # Mentions légales (SSR, noindex)
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

**Proxy (middleware)** : `src/proxy.ts`

```typescript
if (pathname.startsWith("/admin/") && !isAuthenticated) {
  return NextResponse.redirect("/admin");
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

**Configuration** : `src/app/(web)/resources/config/once-ui.config.js`

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

const AdminPanel = dynamic(() => import("@/web/components/admin/AdminPanel"));
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

### Actuel (PostgreSQL + Prisma - variante_BDD)

✅ **Architecture production-ready adaptée pour** :

- Portfolios professionnels avec admin complet
- Blogs jusqu'à 10,000+ posts
- Projets jusqu'à 1,000+ entrées
- Gestion de médias et tags structurés
- Historique de disponibilité et audit logs
- Rate limiting PostgreSQL-based

✅ **Avantages PostgreSQL** :

- Requêtes complexes avec JOINs optimisés
- Index pour recherche rapide
- Transactions ACID
- Backup et restore robustes
- Scalabilité verticale et horizontale

### Évolutions Futures (Si Nécessaire)

Considérer si besoins spécifiques :

- **Recherche full-text avancée** : Ajouter ElasticSearch ou PostgreSQL FTS
- **Multi-tenant** : Adapter schéma Prisma avec tenant isolation
- **Cache distribué** : Redis pour sessions/cache si trafic élevé
- **CDN** : Cloudflare/CloudFront pour assets statiques globaux

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
│  │   Proxy (JWT Verify - /admin)    │   │
│  └──────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │ DB Access (Prisma)
              ↓
┌─────────────────────────────────────────┐
│          PostgreSQL (Prisma)            │
│  - Articles, Projects, Persons, Tags    │
│  - AvailabilityLog, RateLimit           │
└─────────────────────────────────────────┘
```

### Flow d'Authentification

```
User                Browser              Server              PostgreSQL
  │                    │                   │                     │
  │─── Enter password ───→ POST /api/authenticate              │
  │                    │      │                                 │
  │                    │      │─── Verify bcrypt hash (env) ───│
  │                    │      │                                 │
  │                    │←─ Set JWT cookie ─│                   │
  │                    │                   │                   │
  │─── Access /admin ─────→ GET /admin    │                   │
  │                    │      │─── Proxy checks JWT            │
  │                    │      │ (if invalid → redirect)        │
  │                    │      │                                │
  │                    │←──── Admin UI ────│                   │
  │                    │                   │                   │
  │─ Create post ─────────→ POST /api/admin/posts             │
  │                    │      │─── Verify auth (checkAuthAPI) │
  │                    │      │                                │
  │                    │      │─── Prisma.article.create() ────→
  │                    │      │←────── Inserted row ───────────│
  │                    │←──── 200 OK ──────│                   │
```

---

## Décisions Architecturales Clés

### 1. Pourquoi PostgreSQL + Prisma (variante_BDD) ?

**Avantages de PostgreSQL/Prisma** :

- ✅ **Scalabilité** : Gère 10,000+ posts/projets facilement
- ✅ **Requêtes complexes** : JOINs, filtres, agrégations optimisées
- ✅ **Admin temps réel** : Publication instantanée sans rebuild
- ✅ **Transactions ACID** : Intégrité des données garantie
- ✅ **Prisma ORM** : Client TypeScript typé auto-généré
- ✅ **Migrations** : Évolution du schéma versionnée et trackée
- ✅ **Audit** : Historique complet (AvailabilityLog, timestamps)
- ✅ **Backup/Restore** : Outils PostgreSQL robustes

**Trade-offs vs file-based (branche main)** :

- ⚠️ Infrastructure : Nécessite PostgreSQL (Docker facilite déploiement)
- ⚠️ Setup initial : Migrations Prisma (automatisées via script)
- ✅ **Gain majeur** : Admin fonctionnel avec publication immédiate

**Décision** : Architecture production-ready pour portfolio professionnel avec administration complète

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
