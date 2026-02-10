# Documentation du Projet - Portfolio Magic

> **Index principal** : Point d'entrée pour la documentation complète du portfolio

**Date de génération** : 2026-01-31
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

| Aspect | Détails |
|--------|---------|
| **Tech Stack** | Next.js 16 + React 19 + TypeScript + Once UI |
| **Point d'Entrée** | `src/app/layout.tsx`, `src/app/page.tsx` |
| **Architecture** | Component-Based, File-system routing |
| **Contenu** | MDX-based (file system) |
| **Auth** | JWT + HTTP-only cookies |
| **Composants** | 33 composants React (15 Client, 18 Server) |
| **API Routes** | 11 endpoints REST |

---

## 📚 Documentation Générée

### Documents Principaux

1. **[Vue d'Ensemble du Projet](./project-overview.md)**
   - Description générale et fonctionnalités
   - Stack technologique résumée
   - Commandes essentielles
   - Guide de démarrage rapide

2. **[Architecture](./architecture.md)**
   - Architecture technique complète
   - Patterns et décisions architecturales
   - Diagrammes de flux
   - Stack détaillée avec justifications
   - Authentification et sécurité
   - Optimisations et déploiement

3. **[API Contracts](./api-contracts-portfolio.md)**
   - Documentation de tous les endpoints API
   - Routes d'authentification
   - Routes admin (CRUD posts/projets)
   - Routes publiques (RSS, OG, disponibilité)
   - Schémas de requête/réponse
   - Patterns de sécurité

4. **[Inventaire des Composants UI](./ui-components-portfolio.md)**
   - Catalogue complet des 33 composants
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

6. **[Guide de Développement](./development-guide.md)**
   - Prérequis et installation
   - Commandes de développement
   - Workflow typique
   - Ajout de contenu (posts, projets)
   - Personnalisation
   - Debugging et résolution de problèmes
   - Tests recommandés

7. **[Déploiement Docker](./docker-deployment.md)**
   - Configuration Docker multi-stage
   - Docker Compose pour production
   - Variables d'environnement et volumes
   - Reverse proxy (Nginx, Traefik)
   - Déploiement cloud (AWS, GCP, DigitalOcean)
   - Monitoring, sécurité et troubleshooting
   - CI/CD et backup/restore

---

## 📖 Documentation Existante

### Fichiers du Repository

- **[README.md](../README.md)** - Documentation d'origine du template Magic Portfolio
  - Guide de démarrage
  - Fonctionnalités
  - Configuration de base

- **[LICENSE](../LICENSE)** - Licence du projet

- **[portfolio-refonte-narrative.md](../_bmad-output/portfolio-refonte-narrative.md)** - Document de refonte narrative (BMAD)

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
# Éditer .env avec ADMIN_PASSWORD_HASH

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

---

## 🗂️ Structure du Projet

### Organisation Principale

```
portfolio/
├── src/
│   ├── app/              # Routes (pages + API)
│   ├── components/       # Composants React (33)
│   ├── resources/        # Contenu et config
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires
│   └── middleware.ts     # Protection des routes
├── public/               # Assets statiques
├── data/                 # Contenu et données
│   ├── posts/            # Articles de blog (MDX)
│   ├── projects/         # Projets portfolio (MDX)
│   └── availability.json # Statut de disponibilité
└── docs/                 # Documentation (ce dossier)
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

### 2. Système de Contenu MDX

Le contenu (blog, projets) est stocké en fichiers **MDX** dans le dossier `data/` :
- **Blog** : `data/posts/*.mdx`
- **Projets** : `data/projects/*.mdx`
- Markdown avec composants React
- Frontmatter YAML pour métadonnées
- Versionné dans Git
- Interface admin pour édition

**En savoir plus** : [architecture.md#système-de-contenu-mdx](./architecture.md)

### 3. Authentification JWT

Système d'auth simple pour un seul admin :
- JWT stocké en cookies HTTP-only
- Protection via middleware
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

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/rss` | GET | Flux RSS du blog |
| `/api/og/fetch` | GET | Récupère métadonnées OG d'une URL |
| `/api/og/proxy` | GET | Proxy pour images OG |
| `/api/availability` | GET | Statut de disponibilité |

### Routes Admin (Protected)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/authenticate` | POST | Login admin |
| `/api/check-auth` | GET | Vérifier authentification |
| `/api/refresh-token` | POST | Rafraîchir JWT |
| `/api/admin/posts` | GET/POST | CRUD posts |
| `/api/admin/projects` | GET/POST | CRUD projets |
| `/api/admin/publish` | POST | Toggle publication |
| `/api/admin/upload` | POST | Upload d'images |
| `/api/availability` | POST | Mise à jour disponibilité |

**Détails complets** : [api-contracts-portfolio.md](./api-contracts-portfolio.md)

---

## 🎨 Composants UI

### Catégories

- **Layout** : Header, Footer, AdminLayout
- **Navigation** : ThemeToggle, TableOfContents, ScrollToHash
- **Blog** : Posts, Post, ShareSection
- **Work** : Projects, ProjectCard, ProjectFilter, ProjectTag
- **Gallery** : GalleryView
- **Admin** : LoginPage, PostForm, ProjectForm, ImageUpload, DashboardStats, etc.
- **Utilitaires** : RouteGuard, Providers, mdx, HeadingLink

**Total** : 33 composants (15 Client, 18 Server)

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
- **Composants React** : 33
- **API Routes** : 11
- **Pages publiques** : 5 (Home, About, Blog, Work, Gallery)
- **Pages admin** : 3+ (Dashboard, Posts, Projects)
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
- **Middleware** : Protection routes admin
- **Validation** : Zod sur toutes les entrées API
- **Secure flag** : Cookies sécurisés en production
- **SameSite** : Protection CSRF

**Détails** : [architecture.md#authentification-et-sécurité](./architecture.md)

---

## 🚢 Déploiement

### Méthode 1 : Docker (Production Self-Hosted)

**Configuration complète** : Voir [docker-deployment.md](./docker-deployment.md)

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
ADMIN_PASSWORD_HASH=<bcrypt_hash>

# OPTIONNEL
NEXT_PUBLIC_SITE_URL=https://votresite.com
JWT_SECRET=<secret_aleatoire>
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

- [MDX Documentation](https://mdxjs.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [React Icons](https://react-icons.github.io/react-icons/)

---

## 📝 Notes Importantes

### Pour les Développeurs AI

Cette documentation est optimisée pour être utilisée par des assistants AI lors du développement :

1. **Architecture complète** : [architecture.md](./architecture.md) contient toutes les décisions techniques
2. **Contrats API** : [api-contracts-portfolio.md](./api-contracts-portfolio.md) documente précisément chaque endpoint
3. **Composants** : [ui-components-portfolio.md](./ui-components-portfolio.md) liste tous les composants avec leurs props
4. **Structure** : [source-tree-analysis.md](./source-tree-analysis.md) explique l'organisation du code

### Brownfield PRD

Lors de la création d'un PRD brownfield avec BMAD, référencer :
- **Pour features UI** : [ui-components-portfolio.md](./ui-components-portfolio.md) + [architecture.md](./architecture.md)
- **Pour features API** : [api-contracts-portfolio.md](./api-contracts-portfolio.md) + [architecture.md](./architecture.md)
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
- [x] api-contracts-portfolio.md
- [x] ui-components-portfolio.md
- [x] source-tree-analysis.md
- [x] development-guide.md
- [x] index.md (ce fichier)

---

**🎯 Cette documentation est votre point d'entrée unique pour comprendre, développer et maintenir ce portfolio !**
