# Vue d'Ensemble du Projet - Portfolio

## Informations Générales

**Nom du projet** : Portfolio professionnel
**Type** : Application Web (Portfolio Personnel)
**Structure** : Monolithe
**Version** : 2.3.0
**Statut** : Production-ready

---

## Description

PortFolio professionnel est une application web moderne conçue pour présenter un portfolio professionnel complet. Elle combine un site vitrine public élégant avec un système d'administration robuste permettant la gestion complète du contenu.

### Fonctionnalités Principales

**Public** :

- 🏠 **Page d'accueil** : Hero section avec call-to-action
- 👤 **About/CV** : Présentation professionnelle avec table des matières
- 📝 **Blog** : Articles techniques avec support MDX
- 💼 **Portfolio** : Showcase de projets avec filtrage par tags
- 🖼️ **Galerie** : Collection de photos/images
- 🎨 **Thème Dark/Light** : Bascule automatique ou manuelle
- 🔖 **RSS Feed** : Flux RSS pour le blog
- ⚖️ **Mentions légales** : Page avec infos RGPD, hébergeur, contact, propriété intellectuelle

**Administration** :

- 🔐 **Authentification sécurisée** : Login avec JWT
- ✍️ **Éditeur MDX** : Interface WYSIWYG pour posts et projets
- 📤 **Upload d'images** : Gestion des médias
- 📊 **Dashboard** : Statistiques et vue d'ensemble
- 🎯 **Publication** : Toggle publish/unpublish
- 🏷️ **Tags** : Catégorisation des projets
- 💚 **Statut de disponibilité** : Mise à jour du statut freelance

---

## Résumé Technique

### Stack Technologique

| Catégorie         | Technologies                       |
| ----------------- | ---------------------------------- |
| **Framework**     | Next.js 16.0.10 (App Router)       |
| **Language**      | TypeScript 5.8.3                   |
| **UI Library**    | React 19.2.0                       |
| **Design System** | Once UI 1.5.6                      |
| **Content**       | MDX 3.1.0 + next-mdx-remote        |
| **Styling**       | Sass 1.86.3 + Once UI tokens       |
| **Forms**         | React Hook Form 7.71.1 + Zod 4.3.6 |
| **Auth**          | JWT custom + HTTP-only cookies     |
| **Dev Tools**     | Biome 1.9.4, ESLint 9.25.0         |

### Architecture

**Pattern** : Component-Based avec SSR/SSG hybride
**Routing** : File-system based (Next.js App Router)
**Rendu** :

- SSG (Static Site Generation) pour pages publiques
- SSR (Server-Side Rendering) pour contenu dynamique
- CSR (Client-Side Rendering) pour interface admin

**Data** : PostgreSQL/Prisma (MDX + JSON utilisés comme source de seed)

---

## Structure du Repository

```
portfolio/
├── src/                    # Code source
│   ├── app/                # Routes Next.js (pages + API)
│   ├── components/         # Composants React (33 total)
│   ├── resources/          # Contenu et configuration
│   ├── types/              # Définitions TypeScript
│   ├── utils/              # Fonctions utilitaires
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Bibliothèques helpers
│   ├── config/             # Configuration app
│   └── proxy.ts            # Protection pages /admin (Edge)
├── public/                 # Assets statiques
├── data/                   # Données JSON
├── docs/                   # Documentation générée
└── Configuration files     # package.json, tsconfig, etc.
```

**Nombre de lignes de code** : ~10,000+ LOC (estimé)
**Composants** : 42 composants React
**Routes API** : 24 endpoints
**Pages** : 9 routes publiques + 14 routes admin

---

## Quick Reference

### Commandes Essentielles

```bash
# Développement
npm run dev              # Démarrer le serveur de dev

# Production
npm run build            # Build pour production
npm run start            # Démarrer en mode prod

# Qualité
npm run lint             # Vérifier le code
npm run biome-write      # Formatter le code
```

### URLs Principales

| Route      | Description                |
| ---------- | -------------------------- |
| `/`        | Page d'accueil             |
| `/about`   | CV/Présentation            |
| `/blog`    | Liste des articles         |
| `/work`    | Portfolio de projets       |
| `/gallery` | Galerie photos             |
| `/admin`   | Interface d'administration |

### Points d'Entrée

**Frontend** :

- `src/app/layout.tsx` : Layout racine
- `src/app/page.tsx` : Page d'accueil (Hero + CTA)
- `src/app/(web)/components/` : Composants réutilisables (admin, blog, work, gallery)
- `src/app/(web)/resources/` : Contenu statique et configuration Once UI

**Backend** :

- `src/app/(api)/api/` : Routes API (auth, admin CRUD, admin openapi, availability, rss, og, contact, person, projects, health)
- `src/lib/` : Services Prisma, repositories et helpers HTTP (`errors.ts`, `response.ts`, `with-api-error.ts`)
- `src/proxy.ts` : Protection des pages `/admin`

---

## Caractéristiques Notables

### Système de Contenu MDX

Le projet utilise MDX pour le contenu, permettant d'écrire en Markdown avec des composants React embarqués.

**Avantages** :

- Édition simple en Markdown
- Composants React interactifs dans le contenu
- Frontmatter YAML pour métadonnées
- Versionné avec Git
- Interface admin pour non-développeurs

### Design System Once UI

Once UI fournit un système de design complet avec :

- Tokens de design (couleurs, typographie, espacement)
- Composants accessibles
- Thème light/dark intégré
- Responsive par défaut

### Authentification Simple

**Pattern** : JWT avec cookies HTTP-only

- Un seul utilisateur admin
- Pas de gestion complexe de rôles
- Sécurisé pour un usage personnel

### Performance Optimale

**Optimisations** :

- Images automatiquement optimisées (AVIF/WebP)
- Code splitting automatique par route
- Server Components par défaut
- Turbopack en développement

---

## Déploiement

### Plateformes Recommandées

1. **Vercel** (recommandé)
   - Créateurs de Next.js
   - Déploiement en un clic
   - Preview deployments automatiques

2. **Netlify**
   - Alternative solide
   - Build automatique sur push

3. **Autres** : AWS Amplify, Railway, Render

### Configuration Requise

**Variables d'environnement** :

```env
DATABASE_URL=postgresql://postgres:password@db:5432/portfolio
ADMIN_PASSWORD=votre_mot_de_passe
AUTH_SECRET=votre_secret_hmac
CRON_SECRET=votre_cron_secret
NEXT_PUBLIC_SITE_URL=https://votresite.com
```

**Build** :

```bash
npm run build
```

**Sortie** : `.next/` directory (statique + serverless functions)

---

## Liens vers Documentation Détaillée

### Documentation Technique

- **[Architecture](./architecture.md)** : Architecture complète du système
- **API Docs (OpenAPI/Swagger)** : `/admin/api-docs` (UI) et `/api/admin/openapi` (JSON)
- **[UI Components](./ui-components-portfolio.md)** : Inventaire des composants
- **[Source Tree](./source-tree-analysis.md)** : Structure de fichiers annotée
- **[Development Guide](./development-guide.md)** : Guide du développeur

### Documentation Existante

- **[README.md](../README.md)** : Documentation d'origine du template
- **[LICENSE](../LICENSE)** : Licence du projet

---

## Getting Started

### Pour Développeurs

1. **Cloner le repository**

   ```bash
   git clone <url>
   cd portoflio_new
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer l'environnement**

   ```bash
   cp .env.example .env
   cp .env.development.local.example .env.development.local
   # `.env` sert a Docker (host DB = `db`)
   # `.env.development.local` override DATABASE_URL pour `npm run dev` (host DB = `localhost`)
   ```

4. **Lancer le serveur de dev**

   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   - Site : http://localhost:3000
   - Admin : http://localhost:3000/admin

### Pour Éditeurs de Contenu

1. Aller sur `/admin`
2. Se connecter avec le mot de passe admin
3. Utiliser l'interface pour :
   - Créer/éditer des posts
   - Créer/éditer des projets
   - Uploader des images
   - Gérer la publication

---

## Roadmap et Évolutions Possibles

### Fonctionnalités Potentielles

**Court terme** :

- [ ] Analytics (Google Analytics, Plausible)
- [ ] Newsletter avancée (Mailchimp intégration)
- [ ] Commentaires sur blog
- [ ] Partage social amélioré

**Moyen terme** :

- [ ] Multi-langue (i18n)
- [ ] Recherche full-text
- [ ] Tags pour posts de blog
- [ ] Archives chronologiques

**Long terme** :

- [ ] Migration vers CMS headless (si besoin)
- [ ] Mode multi-utilisateurs
- [ ] Système de brouillons
- [ ] Planification de publications

---

## Support et Maintenance

### Mises à Jour

**Dépendances** : Vérifier tous les 1-3 mois

```bash
npm outdated
npm update
```

**Next.js** : Suivre les releases majeures (guides de migration fournis)

### Résolution de Problèmes

1. **Consulter** : [docs/development-guide.md](./development-guide.md)
2. **Issues GitHub** : Vérifier les problèmes connus
3. **Logs** : Inspecter `.next/` et la console

### Contact

Pour questions ou support :

- GitHub Issues : (URL repository)
- Documentation Once UI : https://once-ui.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Documentation publication (variante_BDD) : [Publication via la base de données (variante_BDD)](./github-api-setup.md)

---

## Métriques Clés

**Performance** (Lighthouse) :

- Performance : 95+
- Accessibility : 100
- Best Practices : 100
- SEO : 100

**Code Quality** :

- TypeScript strict mode : ✅
- Linting configuré : ✅
- Pre-commit hooks : ✅

**Sécurité** :

- HTTP-only cookies : ✅
- Input validation (Zod) : ✅
- HTTPS en production : ✅

---

**Dernière mise à jour** : 2026-02-09
