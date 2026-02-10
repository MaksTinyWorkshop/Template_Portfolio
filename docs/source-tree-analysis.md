# Analyse de l'Arborescence Source - Portfolio

## Structure du Projet

```
portfolio/
├── src/                          # Code source principal
│   ├── app/                      # App Router Next.js (routes)
│   │   ├── about/                # Page À propos / CV
│   │   │   └── page.tsx          # Route: /about
│   │   ├── admin/                # Interface d'administration
│   │   │   ├── page.tsx          # Dashboard admin
│   │   │   ├── posts/            # Gestion des posts
│   │   │   └── projects/         # Gestion des projets
│   │   ├── api/                  # API Routes (Backend)
│   │   │   ├── admin/            # API admin (protégée JWT)
│   │   │   │   ├── posts/        # CRUD posts
│   │   │   │   ├── projects/     # CRUD projets
│   │   │   │   ├── publish/      # Publication contenu
│   │   │   │   └── upload/       # Upload images
│   │   │   ├── authenticate/     # Login admin
│   │   │   ├── check-auth/       # Vérification auth
│   │   │   ├── refresh-token/    # Refresh JWT
│   │   │   ├── availability/     # Statut disponibilité
│   │   │   ├── rss/              # Flux RSS
│   │   │   └── og/               # Open Graph utils
│   │   ├── blog/                 # Section blog
│   │   │   ├── page.tsx          # Liste des posts
│   │   │   └── posts/            # Posts MDX individuels
│   │   │       └── [slug]/       # Route dynamique: /blog/posts/[slug]
│   │   ├── gallery/              # Galerie photos
│   │   │   └── page.tsx          # Route: /gallery
│   │   ├── work/                 # Portfolio de projets
│   │   │   ├── page.tsx          # Liste des projets
│   │   │   └── projects/         # Projets MDX individuels
│   │   │       └── [slug]/       # Route dynamique: /work/projects/[slug]
│   │   ├── layout.tsx            # Layout racine (ThemeProvider, Fonts)
│   │   ├── page.tsx              # Page d'accueil (Hero + CTA)
│   │   ├── not-found.tsx         # Page 404 personnalisée
│   │   ├── robots.ts             # Configuration robots.txt
│   │   ├── sitemap.ts            # Génération sitemap.xml
│   │   └── favicon.ico           # Icône du site
│   │
│   ├── components/               # Composants React réutilisables
│   │   ├── about/                # Composants page About
│   │   │   └── TableOfContents.tsx
│   │   ├── admin/                # Composants administration
│   │   │   ├── AdminLayout.tsx   # Layout admin
│   │   │   ├── AvailabilityManager.tsx
│   │   │   ├── ContentList.tsx   # Liste générique contenu
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── ImageUpload.tsx   # Upload d'images
│   │   │   ├── LoginPage.tsx     # Page connexion
│   │   │   ├── PostForm.tsx      # Formulaire posts
│   │   │   ├── PostsList.tsx     # Liste posts admin
│   │   │   ├── ProjectForm.tsx   # Formulaire projets
│   │   │   ├── ProjectsList.tsx  # Liste projets admin
│   │   │   └── TagSelector.tsx   # Sélecteur tags
│   │   ├── blog/                 # Composants blog
│   │   │   ├── Post.tsx          # Affichage post
│   │   │   ├── Posts.tsx         # Liste posts
│   │   │   └── ShareSection.tsx  # Partage social
│   │   ├── gallery/              # Composants galerie
│   │   │   └── GalleryView.tsx
│   │   ├── work/                 # Composants projets
│   │   │   ├── ClientProjects.tsx
│   │   │   ├── FilterableProjects.tsx
│   │   │   ├── ProjectFilter.tsx # Filtres par tags
│   │   │   └── Projects.tsx
│   │   ├── AdminEasterEgg.tsx    # Konami code → admin
│   │   ├── AvailabilityBadge.tsx # Badge disponibilité
│   │   ├── Footer.tsx            # Pied de page
│   │   ├── Header.tsx            # En-tête navigation
│   │   ├── HeadingLink.tsx       # Headings avec ancres
│   │   ├── Mailchimp.tsx         # Newsletter
│   │   ├── mdx.tsx               # Composants MDX custom
│   │   ├── ProjectCard.tsx       # Carte projet
│   │   ├── ProjectTag.tsx        # Badge tag projet
│   │   ├── Providers.tsx         # Context providers
│   │   ├── RouteGuard.tsx        # Protection routes admin
│   │   ├── ScrollToHash.tsx      # Scroll vers ancres
│   │   └── ThemeToggle.tsx       # Switch thème
│   │
│   ├── config/                   # Configuration applicative
│   │   └── admin.config.ts       # Config admin (mot de passe hash)
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   └── useAuth.ts            # Hook authentification
│   │
│   ├── lib/                      # Utilitaires et helpers
│   │   └── jwt.ts                # Gestion JWT tokens
│   │
│   ├── middleware.ts             # Middleware Next.js (auth)
│   │
│   ├── resources/                # Ressources de contenu
│   │   ├── config/               # Configuration Once UI
│   │   ├── content.tsx           # Contenu structuré (textes, data)
│   │   └── icons.ts              # Définitions icônes
│   │
│   ├── types/                    # Définitions TypeScript
│   │   ├── admin.types.ts        # Types admin
│   │   ├── blog.types.ts         # Types blog
│   │   ├── content.types.ts      # Types contenu général
│   │   ├── gallery.types.ts      # Types galerie
│   │   └── work.types.ts         # Types projets
│   │
│   └── utils/                    # Fonctions utilitaires
│       ├── formatDate.ts         # Formatage dates
│       ├── getBlogPosts.ts       # Récupération posts
│       ├── getGalleryImages.ts   # Récupération images
│       ├── getProjects.ts        # Récupération projets
│       ├── mdx.ts                # Parsing MDX
│       ├── published.ts          # État publication
│       └── slug.ts               # Gestion slugs
│
├── public/                       # Assets statiques publics
│   ├── images/                   # Images du site
│   │   ├── og/                   # Images Open Graph
│   │   ├── gallery/              # Photos galerie
│   │   └── projects/             # Images projets
│   └── favicon.ico               # Favicon
│
├── data/                         # Données JSON
│   └── availability.json         # État disponibilité
│
├── docs/                         # Documentation générée
│   └── (fichiers de documentation)
│
├── _bmad/                        # Configuration BMAD workflows
├── _bmad-output/                 # Sorties BMAD
│
├── node_modules/                 # Dépendances npm
├── .next/                        # Build Next.js
│
├── .github/                      # Configuration GitHub
│   └── workflows/                # CI/CD (si configuré)
│
├── .vscode/                      # Configuration VS Code
│
├── package.json                  # Manifeste npm
├── package-lock.json             # Lock des dépendances
├── tsconfig.json                 # Configuration TypeScript
├── next.config.mjs               # Configuration Next.js
├── next-env.d.ts                 # Types Next.js auto-générés
├── biome.json                    # Configuration Biome (linter)
├── .eslintrc.json                # Configuration ESLint
├── .lintstagedrc.js              # Configuration lint-staged
├── .env                          # Variables d'environnement (git-ignored)
├── .env.example                  # Template variables d'env
├── .gitignore                    # Fichiers ignorés par git
├── README.md                     # Documentation projet
└── LICENSE                       # Licence du projet
```

---

## Dossiers Critiques

### `/src/app/` - Routing et Pages
**Rôle** : Définit toutes les routes de l'application avec Next.js App Router
**Points d'entrée** :
- `layout.tsx` : Layout global, providers, fonts
- `page.tsx` : Page d'accueil
- Routes imbriquées : `/about`, `/blog`, `/work`, `/gallery`, `/admin`

**Pattern** : File-system based routing
- Chaque dossier avec `page.tsx` = route publique
- `[slug]/` = routes dynamiques
- Routes API dans `app/api/`

### `/src/components/` - Composants UI
**Rôle** : Tous les composants React réutilisables et spécifiques
**Organisation** :
- Par feature/page : `admin/`, `blog/`, `work/`, `gallery/`
- Composants globaux à la racine
- Mix de Server Components et Client Components

**Pattern** : Feature-based organization
- Composants regroupés par fonctionnalité
- Séparation claire admin/public

### `/src/app/api/` - Backend API
**Rôle** : Endpoints API pour authentification, CRUD, et services
**Structure** :
- `/admin/*` : Routes protégées (JWT required)
- `/authenticate`, `/check-auth`, `/refresh-token` : Auth system
- `/availability` : Feature publique/admin
- `/rss`, `/og/*` : Utilitaires publics

**Pattern** : RESTful API routes
- Chaque dossier = endpoint
- `route.ts` définit GET, POST, etc.
- Middleware protège routes admin

### `/src/resources/` - Contenu et Configuration
**Rôle** : Données structurées et configuration du design system
**Fichiers clés** :
- `content.tsx` : Tout le contenu textuel (home, about, metadata)
- `icons.ts` : Mapping des icônes
- `config/` : Configuration Once UI (tokens, thème)

**Pattern** : Centralized content management
- Contenu séparé du code
- Facilite i18n future

### `/src/types/` - Définitions TypeScript
**Rôle** : Types partagés pour toute l'application
**Organisation** : Par domaine (admin, blog, work, gallery, content)
**Pattern** : Type-safe architecture

### `/src/utils/` - Fonctions Utilitaires
**Rôle** : Helpers pour MDX, slugs, data fetching
**Fonctions clés** :
- `getBlogPosts.ts`, `getProjects.ts` : Data fetching
- `mdx.ts` : Parsing MDX avec frontmatter
- `published.ts` : Gestion état publication

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
**Once UI Config** (`src/resources/config/`)
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
