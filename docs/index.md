# Documentation du Projet - Portfolio

> **Index principal** : Point d'entrée pour la documentation complète du portfolio

**Type de projet** : Application Web - Portfolio Personnel
**Framework** : Next.js 16.0.10 (App Router)
**Langage** : TypeScript 5.8.3

---

## 📋 Vue d'Ensemble

### Type de Projet

- **Structure** : Monolithe
- **Langage Principal** : TypeScript
- **Architecture** : Component-Based avec SSR/SSG Hybride
- **Pattern** : Next.js App Router avec React Server Components

### Quick Reference

| Aspect             | Détails                                      |
| ------------------ | -------------------------------------------- |
| **Tech Stack**     | Next.js 16 + React 19 + TypeScript + Once UI |
| **Point d'Entrée** | `src/app/layout.tsx`, `src/app/page.tsx`     |
| **Architecture**   | Component-Based, File-system routing         |
| **Contenu**        | PostgreSQL/Prisma (seed MDX → BDD persisted) |
| **Auth**           | JWT + HTTP-only cookies                      |
| **Composants**     | 42 composants React (37 Client, 5 Server)    |
| **API Routes**     | 24 endpoints REST                            |

---

## 📚 Documentation Générée

### Documents Principaux

1. **[Vue d'Ensemble du Projet](./project-overview.md)** ⭐ SOURCE - Stack Technologique
   - Description générale et fonctionnalités
   - **Stack technologique complète avec versions** (source unique)
   - Commandes essentielles
   - Guide de démarrage rapide

2. **[Architecture](./architecture.md)**
   - Architecture technique complète
   - Patterns et décisions architecturales
   - Diagrammes de flux
   - Stack détaillée avec justifications
   - Authentification et sécurité
   - Optimisations et déploiement

3. **API Docs (OpenAPI/Swagger)**
   - Interface Swagger admin : `/admin/api-docs`
   - Source de vérité JSON : `/api/admin/openapi`
   - Documentation générée automatiquement depuis les routes Next.js
   - Segmentation par domaines (`auth`, `admin/*`, `public/*`)

4. **[Inventaire des Composants UI](./ui-components-portfolio.md)**
   - Catalogue complet des 42 composants
   - Catégorisation (Layout, Navigation, Forms, Admin, etc.)
   - Props et dépendances
   - Server vs Client Components
   - Patterns de réutilisabilité

5. **[Analyse de l'Arborescence Source](./source-tree-analysis.md)**
   - Structure complète du projet annotée
   - Dossiers critiques expliqués
   - Points d'intégration
   - Conventions de nommage
   - Statistiques

6. **[Guide de Développement](./development-guide.md)** ⭐ SOURCE - Commandes npm
   - Prérequis et installation
   - **Commandes de développement complètes** (source unique)
   - Workflow typique
   - Ajout de contenu (posts, projets)
   - Personnalisation
   - Debugging et résolution de problèmes
   - Tests recommandés

7. **[Déploiement Docker](../installation.md)** - Guide complet d'installation
   - Installation automatique avec script interactif
   - Configuration Docker multi-stage
   - Docker Compose dev/prod
   - Traefik avec SSL automatique
   - Déploiement VPS
   - Troubleshooting
   - CI/CD et backup/restore

8. **[Publication via la base de données (variante_BDD)](./github-api-setup.md)**
   - Explique pourquoi la branche `variante_BDD` n'utilise plus GitHub API
   - Décrit `/api/admin/publish`, les statuts Prisma et les variables d'environnement
   - Décrit la publication différée via cron (`/api/admin/publish-due`, `publish-cron`)
   - Fournit des diagnostics et étapes de seed/BDD

9. **[Rate Limiting](./rate-limiting.md)** ⭐ NOUVEAU
   - Protection PostgreSQL contre abus et DoS
   - Configuration par route (`/api/authenticate`, `/api/contact`)
   - Utilisation, maintenance et troubleshooting
   - Migration Redis (si nécessaire)

---

## 📖 Documentation Existante

### Fichiers du Repository

- **[README.md](../README.md)** - Documentation d'origine du Portfolio
  - Guide de démarrage
  - Fonctionnalités
  - Configuration de base

- **[LICENSE](../LICENSE)** - Licence du projet

---

## 🚀 Getting Started

### Pour Développeurs

```bash
# 1. Cloner et installer
git clone <repository-url>
cd portoflio_new
npm install

# 2. Configurer l'environnement
cp .env.example .env
cp .env.development.local.example .env.development.local
# `.env` sert a Docker (host DB = `db`)
# `.env.development.local` override DATABASE_URL pour `npm run dev` (host DB = `localhost`)

# 3. Démarrer le serveur de dev
npm run dev
# → http://localhost:3000
```

**Voir** : [development-guide.md](./development-guide.md) pour plus de détails

### Pour Éditeurs de Contenu

1. Accéder à `/admin` sur le site
2. Se connecter avec le mot de passe admin
3. Utiliser l'interface WYSIWYG pour :
   - ✍️ Créer/éditer des posts de blog
   - 💼 Créer/éditer des projets
   - 📤 Uploader des images
   - 📊 Voir les statistiques
   - 🎯 Gérer la publication
4. La publication déclenche ensuite `/api/admin/publish` qui met à jour les statuts via Prisma et invalide les caches Next.js ; voir [Publication via la base de données (variante_BDD)](./github-api-setup.md) pour le flux complet.

---

## 🗂️ Structure du Projet

### Organisation Principale

```
portfolio/
├── src/
│   ├── app/
│   │   ├── (web)/         # Pages publiques + interface admin
│   │   └── (api)/api/     # API routes (auth, admin, availability, rss, og, contact, projects, person, health)
│   ├── lib/               # Services Prisma, repositories, helpers HTTP
│   └── proxy.ts           # Protection /admin (Edge middleware)
├── data/
│   ├── posts/             # MDX source (seed → PostgreSQL via scripts/seed-data.ts)
│   ├── projects/          # Projets MDX source (seed → PostgreSQL)
│   └── availability.json  # Statut disponibilité (JSON)
├── prisma/
│   └── schema.prisma      # Schéma & enums (Status, MediaKind, ...)
├── scripts/
│   └── seed-data.ts       # Import MDX → PostgreSQL
├── docs/
├── public/                # Assets statiques
└── package.json           # Manifest & config
```

**Détails** : Voir [source-tree-analysis.md](./source-tree-analysis.md)

---

## 🔑 Concepts Clés

### 1. Next.js App Router

Le projet utilise le **App Router** moderne de Next.js avec :

- Routing basé sur le système de fichiers
- React Server Components par défaut
- Layouts imbriqués
- API Routes intégrées

**En savoir plus** : [architecture.md#next.js-app-router](./architecture.md)

### 2. Pipeline Contenu → Base (variante_BDD)

Les fichiers MDX dans `data/posts/` et `data/projects/` servent d’import initial via `scripts/seed-data.ts`, mais l’application fonctionne désormais sur PostgreSQL/Prisma.

- `seed-data.ts` normalise slugs, tags, médias et personnes puis remplit les tables `Article`, `Project`, `Person`, `Tag`, `Media`.
- Les services backend (`src/lib/modules/*`) manipulent les statuts (`draft`, `scheduled`, `published`) et exposent des API admin/CRUD.
- `src/lib/modules/person/services/person-site.service.ts` consulte Prisma pour construire le `PersonSiteData` affiché dans la vitrine (via `buildPersonSiteData()` dans `person.utils.ts`) et n'utilise `src/app/(web)/resources/content.tsx` qu’en fallback si aucun `siteOwner` n’est trouvé.
- Lorsque l’admin clique sur Publier, `/api/admin/publish` met à jour `setProjectStatus`/`setArticleStatus` et déclenche `revalidatePath` plutôt que de créer un commit Git.
- Les fichiers MDX restent « sources » pour le seed mais ne sont pas modifiés en production ; la base PostgreSQL devient la source de vérité runtime.

**En savoir plus** : [architecture.md#architecture-des-données](./architecture.md) et [Publication via la base de données (variante_BDD)](./github-api-setup.md)

### 3. Authentification JWT

Système d'auth simple pour un seul admin :

- JWT stocké en cookies HTTP-only
- Protection via `proxy.ts` + `checkAuthAPI` sur `/api/admin/*`
- Refresh token pour sessions longues

**En savoir plus** : [architecture.md#authentification-et-sécurité](./architecture.md)

### 4. Design System Once UI

Once UI fournit :

- Tokens de design configurables
- Composants accessibles
- Thème light/dark intégré
- Responsive par défaut

**En savoir plus** : [architecture.md#gestion-du-thème](./architecture.md)

---

## 🔌 API et Endpoints

### Routes Publiques

| Endpoint            | Méthode | Description                       |
| ------------------- | ------- | --------------------------------- |
| `/api/rss`          | GET     | Flux RSS du blog                  |
| `/api/og/fetch`     | GET     | Récupère métadonnées OG d'une URL |
| `/api/og/proxy`     | GET     | Proxy pour images OG              |
| `/api/availability` | GET     | Statut de disponibilité           |
| `/api/health`       | GET     | Health check application          |
| `/api/person`       | GET     | Données site owner pour la vitrine |
| `/api/projects`     | GET     | Liste projets publics             |
| `/api/projects/[slug]` | GET | Détail projet |
| `/api/contact`      | POST    | Soumission formulaire contact (rate-limited) |

UI admin dédiée: `/admin/api-docs`

### Routes d'Authentification

| Endpoint             | Méthode     | Description                           |
| -------------------- | ----------- | ------------------------------------- |
| `/api/authenticate`  | POST/DELETE | Login admin / Logout                  |
| `/api/check-auth`    | GET         | Vérifier authentification             |
| `/api/refresh-token` | POST        | Rafraîchir JWT                        |

### Routes Admin (Protected)

| Endpoint              | Méthode  | Description               |
| --------------------- | -------- | ------------------------- |
| `/api/admin/posts`    | GET/POST/PUT/DELETE | CRUD posts |
| `/api/admin/projects` | GET/POST/PUT/DELETE | CRUD projets |
| `/api/admin/projects/tags` | GET | Tags liés aux projets |
| `/api/admin/tags`     | GET/POST | CRUD tags (création/liste) |
| `/api/admin/tags/[slug]` | GET/PUT/DELETE | CRUD tag ciblé |
| `/api/admin/persons`  | GET/POST | CRUD personnes (liste/création) |
| `/api/admin/persons/[id]` | GET/PUT/DELETE | CRUD personne ciblée |
| `/api/admin/assets`   | GET/POST/PUT/DELETE | Gestion assets `/public/images` |
| `/api/admin/publish`  | POST     | Toggle publication        |
| `/api/admin/upload`   | POST | Upload image transformée |
| `/api/availability`   | POST     | Mise à jour disponibilité (admin) |
| `/api/admin/openapi`    | GET      | Spécification OpenAPI (auth admin) |
| `/api/admin/openapi/ui` | GET      | Swagger UI (auth admin) |

**Détails complets** : `/admin/api-docs` (UI) et `/api/admin/openapi` (JSON)

👉 Détails complémentaires de la variante BDD de publication : [Publication via la base de données (variante_BDD)](./github-api-setup.md)

---

## 🎨 Composants UI

### Catégories

- **Layout** : Header, Footer, AdminLayout
- **Navigation** : ThemeToggle, TableOfContents, ScrollToHash
- **Blog** : FilterablePosts, Post, ShareSection
- **Work** : FilterableProjects, ProjectCard, ClientProjects
- **Partagés** : Tag, FilterByTags (utilisés pour blog ET projets)
- **Gallery** : GalleryView
- **Admin** : LoginPage, PostForm, ProjectForm, ImageUpload, DashboardStats, etc.
- **Utilitaires** : RouteGuard, Providers, mdx, HeadingLink

**Total** : 42 composants (37 Client, 5 Server)

**Inventaire complet** : [ui-components-portfolio.md](./ui-components-portfolio.md)

---

## 🛠️ Commandes Essentielles

```bash
# Développement
npm run dev              # Serveur de dev (Turbopack)
npm run dev:clean        # Dev avec rebuild complet
npm run dev:fast         # Dev avec HTTPS expérimental

# Production
npm run build            # Build pour production
npm run start            # Démarrer en mode production

# Qualité du Code
npm run lint             # Linter ESLint + Next.js
npm run biome-write      # Formatter avec Biome

# Autres
npm run build:analyze    # Analyser la taille du bundle
npm run export           # Exporter en statique pur
```

**Guide complet** : [development-guide.md](./development-guide.md)

---

## 📊 Métriques du Projet

### Code

- **Lignes de code** : ~10,000+ LOC (estimé)
- **Composants React** : 42
- **API Routes** : 24
- **Pages publiques** : 6 (Home, About, Blog, Work, Gallery, Legal)
- **Pages admin** : 14 (Dashboard + CRUD blog/projects/tags/persons/assets)
- **Fichiers TypeScript** : 100+

### Performance (Lighthouse)

- **Performance** : 95+
- **Accessibility** : 100
- **Best Practices** : 100
- **SEO** : 100

### Qualité

- ✅ TypeScript strict mode
- ✅ ESLint + Biome configurés
- ✅ Pre-commit hooks (lint-staged)
- ✅ Validation Zod sur toutes les entrées

---

## 🔐 Sécurité

### Mesures Implémentées

- **HTTP-only cookies** : Protection contre XSS
- **JWT tokens** : Authentification stateless
- **Middleware (proxy.ts)** : Protection routes admin
- **Validation** : Zod sur toutes les entrées API
- **Rate Limiting** : PostgreSQL-based (auth: 5/min, contact: 3/5min) ⭐ NOUVEAU
- **Secure flag** : Cookies sécurisés en production
- **SameSite** : Protection CSRF

**Détails** : [architecture.md#authentification-et-sécurité](./architecture.md) et [rate-limiting.md](./rate-limiting.md)

---

## 🚢 Déploiement

### Méthode 1 : Docker (Production Self-Hosted - Recommandé)

**Configuration complète** : Voir [installation.md](../installation.md)

```bash
# Build et démarrer avec Docker Compose
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Health check
curl http://localhost:3000/api/health
```

**Caractéristiques Docker** :

- ✅ Multi-stage build optimisé
- ✅ Image finale ~150MB
- ✅ Utilisateur non-root (sécurité)
- ✅ Health check intégré
- ✅ Volumes persistants (data/, images/)
- ✅ Support reverse proxy (Nginx, Traefik)

### Méthode 2 : Plateformes Cloud (Serverless)

1. **Vercel** (recommandé) - Créateurs de Next.js

   ```bash
   vercel --prod
   ```

2. **Netlify** - Alternative solide
   - Build automatique sur push GitHub

3. **Autres** : AWS Amplify, Railway, Render, DigitalOcean

### Variables d'Environnement Requises

```env
# REQUIS
DATABASE_URL=postgresql://postgres:password@db:5432/portfolio
ADMIN_PASSWORD=votre_mot_de_passe
AUTH_SECRET=votre_secret_hmac
CRON_SECRET=votre_cron_secret

# OPTIONNEL
NEXT_PUBLIC_SITE_URL=https://votresite.com
NEXT_PUBLIC_MAILCHIMP_*=<si_newsletter>
```

### Commandes de Build

```bash
# Build standard (Vercel, Netlify)
npm run build

# Build Docker
docker build -t portfolio-max:latest .

# Build avec analyse
npm run build:analyze
```

**Guide détaillé** : [architecture.md#déploiement](./architecture.md)

---

## 📈 Évolutions Possibles

### Court Terme

- [ ] Analytics (GA4, Plausible)
- [ ] Newsletter Mailchimp intégrée
- [ ] Commentaires sur blog
- [ ] SEO avancé (structured data)

### Moyen Terme

- [ ] Multi-langue (i18n)
- [ ] Recherche full-text
- [ ] Tags pour posts de blog
- [ ] Archives chronologiques

### Long Terme

- [ ] Migration CMS headless (optionnel)
- [ ] Mode multi-utilisateurs
- [ ] Système de brouillons
- [ ] Planification de publications

**Voir** : [project-overview.md#roadmap](./project-overview.md)

---

## 🎓 Ressources

### Documentation Officielle

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Once UI Documentation](https://once-ui.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Outils et Bibliothèques

- [Prisma Documentation](https://www.prisma.io/docs)
- [Publication via la base de données (variante_BDD)](./github-api-setup.md)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [React Icons](https://react-icons.github.io/react-icons/)

---

## 📝 Notes Importantes

### Pour les Développeurs AI

Cette documentation est optimisée pour être utilisée par des assistants AI lors du développement :

1. **Architecture complète** : [architecture.md](./architecture.md) contient toutes les décisions techniques
2. **Contrats API** : `/api/admin/openapi` documente les endpoints (source générée)
3. **Composants** : [ui-components-portfolio.md](./ui-components-portfolio.md) liste tous les composants avec leurs props
4. **Structure** : [source-tree-analysis.md](./source-tree-analysis.md) explique l'organisation du code

### Brownfield PRD

Lors de la création d'un PRD brownfield avec BMAD, référencer :

- **Pour features UI** : [ui-components-portfolio.md](./ui-components-portfolio.md) + [architecture.md](./architecture.md)
- **Pour features API** : `/api/admin/openapi` + [architecture.md](./architecture.md)
- **Pour features full-stack** : Tous les documents ci-dessus

---

## 🆘 Support

### Résolution de Problèmes

1. **Consulter** : [development-guide.md#debugging](./development-guide.md)
2. **Documentation** : Parcourir les docs ci-dessus
3. **Issues** : Vérifier GitHub Issues
4. **Logs** : Inspecter console et `.next/`

### Contact

- **GitHub** : (URL du repository)
- **Documentation Once UI** : https://once-ui.com/docs
- **Documentation Next.js** : https://nextjs.org/docs

---

## ⚙️ Métadonnées

**Généré par** : BMad Document Project Workflow v1.2.0
**Date** : 2026-01-31
**Mode** : initial_scan
**Scan Level** : quick
**Type détecté** : web (Next.js Application)
**Structure** : Monolithe - 1 partie

**Fichiers générés** :

- [x] project-overview.md
- [x] architecture.md
- [x] ui-components-portfolio.md
- [x] source-tree-analysis.md
- [x] development-guide.md
- [x] index.md (ce fichier)

---

**🎯 Cette documentation est votre point d'entrée unique pour comprendre, développer et maintenir ce portfolio !**
