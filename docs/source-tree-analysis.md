# Analyse de l'Arborescence Source - Portfolio

## Structure du Projet

```
portfolio/
├── src/
│   ├── app/
│   │   ├── (web)/                # Site public et administration
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── blog/
│   │   │   │   └── projects/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── posts/
│   │   │   │       └── [slug]/
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   ├── work/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   ├── components/
│   │   │   │   ├── admin/
│   │   │   │   ├── blog/
│   │   │   │   ├── gallery/
│   │   │   │   ├── work/
│   │   │   │   └── utils/
│   │   │   ├── hooks/
│   │   │   ├── resources/
│   │   │   ├── types/
│   │   │   └── data/
│   │   │
│   │   └── (api)/
│   │       └── api/
│   │           ├── admin/
│   │           │   ├── posts/
│   │           │   ├── projects/
│   │           │   ├── publish/
│   │           │   └── upload/
│   │           ├── authenticate/
│   │           ├── check-auth/
│   │           ├── refresh-token/
│   │           ├── availability/
│   │           ├── rss/
│   │           ├── og/
│   │           │   ├── proxy/
│   │           │   └── fetch/
│   │           ├── analytics/
│   │           ├── contact/
│   │           ├── person/
│   │           ├── health/
│   │           └── projects/
│   │
│   ├── lib/                      # Modules backend (services/prisma)
│   └── middleware.ts             # JWT + protection admin/api
│
├── data/                         # Présent uniquement pour alimenter la DB,
│   ├── persons/                  # peut être supprimé après
│   ├── tags/
│   ├── posts/
│   ├── projects/
│   └── availability.json
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed-data.ts
├── tests/
│   ├── http/
│   ├── services/
│   ├── utils/
│   ├── components/
│   └── setup/
├── docs/
├── node_modules/
├── .next/
├── .github/
│   └── workflows/
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.mjs
├── next-env.d.ts
├── biome.json
├── .eslintrc.json
├── .lintstagedrc.js
├── .env
├── .gitignore
├── README.md
└── LICENSE
```

---

## Dossiers Critiques

### `/src/app/(web)` - Routing et pages publiques / admin

**Rôle** : Structure complète des pages publiques et de l’interface admin
**Points d'entrée** :

- `layout.tsx` : Layout global avec providers/typo
- `page.tsx` : Page d’accueil (Hero + CTA)
- Routes imbriquées : `/about`, `/blog`, `/work`, `/gallery`, `/admin`
  **Pattern** : App Router + Server Components
- Chaque dossier avec `page.tsx` = route
- `[slug]/` = routes dynamiques (`/blog/posts/[slug]`, `/work/[slug]`)
- `app/(web)` active le rendering côté serveur tandis que les composants client sont dans `components/`

### `/src/app/(web)/components/` - Composants UI

**Rôle** : Composants partagés utilisés par les pages publiques et l’admin
**Organisation** :

- Par feature/page : `admin/`, `blog/`, `work/`, `gallery/`
- Sous-dossiers utilitaires : `ui/`, `gallery/`, `about/`, `blog/`, `work/`
- Plusieurs composants client (`use client`) mais la majorité reste server-first
  **Pattern** : Feature-based + Atomic (Badge, Card, Filter, Provider)

### `/src/app/(api)/api/` - Backend API

**Rôle** : Endpoints Node.js (Next API Routes)
**Structure** :

- `/admin/*` : Routes protégées (JWT) pour posts/projects/publish/upload
- `/authenticate`, `/check-auth`, `/refresh-token` : Auth flow
- `/availability`, `/rss`, `/og/*`, `/analytics`, `/contact`, `/person`, `/health`, `/projects` : services publics
  **Pattern** : Each folder = route + `route.ts`, middleware (`withApiErrorHandling`, `respondError`)

### `/src/app/(web)/resources/` - Contenu et configuration

**Rôle** : Données structurées (textes, navigation) et tokens Once UI pour la vitrine publique.
**Fichiers clés** :

- `content.tsx` : Texte et métadonnées statiques (home, about, social, navigation) utilisés uniquement comme fallback quand la base PostgreSQL n’expose aucun `siteOwner`.
- `icons.ts` : Mapping des icônes React utilisées dans les composants UI.
- `config/` : Configuration du design system Once UI (tokens, thèmes, palette).

La vitrine publique recherche d’abord les données dynamiques via `src/lib/modules/person/services/person-site.service.ts` → `getSitePersonData()` → `person.utils.ts` (`buildPersonSiteData`). `content.tsx` n’est déclenché que si la BDD n’a pas encore de `PersonProfile` identifiable.

### `/src/lib/` - Modules backend & helpers

**Rôle** : Logique métier Node.js, accès base, helpers HTTP
**Organisation** :

- `modules/` : Domaines `person`, `articles`, `projects` avec `application/`, `infrastructure/`, `domain/`
- `http/` : Helpers `errors.ts`, `response.ts`, `with-api-error.ts`
- `prisma.ts` : Client Prisma unique
- `utils/` : Auth (`auth.ts`, `auth-constants.ts`), transformations (`content-normalizers.ts`, `slugify.ts`)
  **Pattern** : Modules appellent les repos Prisma (`src/lib/modules/*/repositories`) et exposent des services aux API routes.

### `/data/` - Sources Markdown & JSON

**Rôle** : Contenu prêt à être importé + état runtime léger
**Sous-dossiers** :

- `posts/` et `projects/` : fichiers `.mdx` décrivant articles & projets, frontmatter avec metadata.
- `availability.json` : état de disponibilité (`available`, `lastUpdated`).
  Ces fichiers alimentent `scripts/seed-data.ts`, mais la version active est en base de données Postgres/Prisma.

### `/prisma/` - Schéma & Génération

**Fichier clé** : `schema.prisma`

- Définit les relations `Article`, `Project`, `Person`, `Tag`, `Media`
- Enum `Status` gère les états `draft/scheduled/published`
- Génère un client Prisma (`npm run prisma:generate`) utilisé dans `src/lib/prisma.ts`

### `/scripts/` - Maintenance & Seed

**Fichier** : `seed-data.ts`

- Lit `data/posts` et `data/projects`, normalise via `content-normalizers`
- Assure la création/reconnexion de `persons`, `tags`, `media`
- Utilise `PrismaPg` pour performer les inserts
- Permet de synchroniser MDX → BDD sans manipuler Git

### `/tests/` - Suite de tests

**Structure** :

- `tests/http/` : couverture des API routes (publish, posts, projects, contact)
- `tests/services/` : tests des services métiers (projects, articles)
- `tests/utils/` + `tests/components/` : helpers utilitaires
- `tests/setup/` : fixtures & helpers Prisma/Next
  Le dossier référence `vitest` et `tsx` dans les scripts `package.json`.

**Pattern** : Centralized content management

- Contenu séparé du code
- Facilite i18n future

### `/src/app/(web)/types/` - Définitions TypeScript UI

**Rôle** : Types spécifiques aux pages et composants web
**Organisation** : Dossiers `blog`, `work`, `content`, `gallery`, `admin`
**Pattern** : Chaque feature expose un fichier `.types.ts` ou `index.ts`

### `/src/app/(web)/components/utils/` - Helpers UI

**Rôle** : Fonctions utilitaires pour l’UI (providers, context, formatting)
**Fonctions clés** :

- `Providers.tsx`, `RouteGuard.tsx`, `HeadingLink.tsx`
- `mdx.tsx` : parsing MDX custom
  **Pattern** : Réutilisable entre admin/public

---

## Points d'Intégration

### Frontend ↔ API

**Routes Client** → `/api/*`

- Admin forms → `/api/admin/*`
- Public features → `/api/availability`, `/api/rss`
- Auth flow → `/api/authenticate` → `/api/check-auth`

### MDX Content System

**Fichiers MDX** (`data/posts/*.mdx`, `data/projects/*.mdx`)
↓
**Utils** (`getBlogPosts.ts`, `getProjects.ts`, `mdx.ts`)
↓
**Components** (Post, Projects)
↓
**Rendu** avec composants MDX custom

### Design System

**Once UI Config** (`src/app/(web)/resources/config/`)
↓
**Providers.tsx** (ThemeProvider)
↓
**Tous composants** utilisant Once UI tokens

---

## Conventions de Nommage

- **Composants** : PascalCase (e.g., `ProjectCard.tsx`)
- **Utils/Hooks** : camelCase (e.g., `getBlogPosts.ts`, `useAuth.ts`)
- **API Routes** : kebab-case folders, `route.ts` file
- **Types** : PascalCase interfaces/types, `.types.ts` suffix
- **Constants** : UPPER_SNAKE_CASE

---

## Statistiques

- **Total fichiers source** : ~100
- **Composants React** : 33
- **API Routes** : 11
- **Pages publiques** : 5 (Home, About, Blog, Work, Gallery)
- **Pages admin** : 3+ (Dashboard, Posts, Projects)
- **Fichiers de types** : 5
- **Utilitaires** : 7
