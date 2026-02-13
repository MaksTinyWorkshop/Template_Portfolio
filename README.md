# Portfolio Professionnel Next.js

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)

Portfolio professionnel moderne avec système d'administration complet, construit sur Next.js 16, TypeScript, PostgreSQL et Once UI. Template open source prêt à déployer pour créer votre portfolio personnel en quelques minutes.

Basé sur [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) par Once UI, enrichi avec une architecture backend complète et des fonctionnalités professionnelles.

> **📌 Note** : Cette branche `variante_BDD` utilise **PostgreSQL + Prisma** pour la persistance des données. La branche `main` conserve l'architecture file-based originale (MDX + JSON, sans base de données).

---

## ✨ Fonctionnalités

### 🌐 Interface Publique

- **Portfolio Moderne** : Design élégant avec Hero section, page About/CV interactive, galerie de projets
- **Blog Intégré** : Publication d'articles avec support MDX (Markdown + React)
- **Projets Showcase** : Portfolio de projets avec images, tags, filtrage et descriptions détaillées
- **Performance** : Lighthouse 95+, SSR/SSG hybride, images optimisées (AVIF/WebP)
- **SEO** : Métadonnées dynamiques, flux RSS, sitemap automatique
- **Responsive** : Design 100% adaptatif sur tous les appareils
- **Dark/Light Mode** : Thème avec bascule automatique selon préférences système

### 🔐 Administration Complète

- **Dashboard Admin** : Interface d'administration professionnelle avec statistiques
- **Éditeur WYSIWYG** : Création et édition de posts/projets en Markdown enrichi
- **Gestion de Médias** : Upload d'images, organisation des fichiers
- **Publication** : Publication/dépublication en un clic avec prévisualisation
- **Publication différée** : contenus planifiés publiés automatiquement via un cron Docker (prod)
- **Authentification** : Système sécurisé JWT avec cookies HTTP-only
- **Gestion des Tags** : Organisation du contenu par catégories
- **Statut Disponibilité** : Indicateur de disponibilité freelance personnalisable

### 🗄️ Architecture Backend

- **PostgreSQL** : Base de données relationnelle robuste
- **Prisma ORM** : Migrations automatiques, typage fort, génération de client
- **API REST** : Endpoints structurés pour CRUD complet
- **Validation** : Schémas Zod pour sécurité et validation des données
- **Docker** : Déploiement conteneurisé avec orchestration complète (Docker Compose multi-services)
- **Rate Limiting** : Protection API intégrée contre les abus
- **Tests** : Suite de tests unitaires (Vitest) et E2E (Playwright)

---

## 🚀 Installation Rapide

### Option 1 : Installation Automatique (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/VOTRE_USERNAME/portfolio.git
cd portfolio

# 2. Lancer le script d'installation interactif
chmod +x scripts/setup-first-deploy.sh
./scripts/setup-first-deploy.sh
```

Le script vous guidera pour :

- ✅ Configurer vos informations personnelles
- ✅ Générer les secrets de sécurité automatiquement
- ✅ Choisir entre développement local ou production
- ✅ Configurer GitHub et Mailchimp (optionnel)
- ✅ Lancer Docker Compose

**Accédez ensuite à :**

- 🌐 Application : `http://localhost:3000`
- 🔐 Admin : `http://localhost:3000/admin`

### Option 2 : Installation Manuelle

Consultez le guide complet : **[docs/installation.md](docs/installation.md)**

---

## 📚 Documentation

### Guides Principaux

- **[📖 Guide d'Installation](docs/installation.md)** - Installation complète, déploiement VPS, Traefik
- **[📂 Documentation Technique](docs/)** - Architecture, API, composants

### Documentation Technique (dossier `docs/`)

- **[Index](docs/index.md)** - Point d'entrée de la documentation
- **[Architecture](docs/architecture.md)** - Architecture technique détaillée
- **[Guide de Développement](docs/development-guide.md)** - Workflow et bonnes pratiques
- **[Composants UI](docs/ui-components-portfolio.md)** - Inventaire des 33 composants
- **API Docs (Swagger)** - `/admin/api-docs` (UI) et `/api/admin/openapi` (JSON)
- **[Structure du Projet](docs/source-tree-analysis.md)** - Organisation du code

---

## 🏗️ Stack Technologique

**Stack complète avec versions** : Voir [docs/project-overview.md - Stack Technologique](docs/project-overview.md#stack-technologique)

**Résumé** :

- **Frontend** : Next.js 16 + React 19.2 + TypeScript 5.8 + Once UI 1.5
- **Backend** : PostgreSQL 16 + Prisma 7 + API Routes + JWT
- **Contenu** : MDX 3.1 + next-mdx-remote
- **DevOps** : Docker + Docker Compose + Traefik
- **Qualité** : Vitest + Playwright + Biome + TypeScript strict

---

## 🎨 Personnalisation

### 1. Informations Personnelles

Les informations de base sont configurées via le script `setup-first-deploy.sh` qui modifie automatiquement :

- Le seed SQL (`prisma/seed.sql`) avec vos données
- Le fichier `.env` avec vos credentials

Pour modifier ultérieurement :

- **Via l'admin** : `/admin` → Modifier votre profil
- **Via les fichiers** : Éditer `src/app/(web)/resources/content.tsx`

### 2. Design System

Personnaliser couleurs, typographie, espacements :

- Éditer `src/app/(web)/resources/config/once-ui.config.js`

### 3. Icônes

Enrichir la bibliothèque d'icônes :

- Éditer `src/app/(web)/resources/icons.ts`

---

## 🛠️ Développement

**Guide complet** : Voir [docs/development-guide.md](docs/development-guide.md)

### Installation Rapide (développement local)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
cp .env.development.local.example .env.development.local

# 3. Lancer avec Docker (recommandé)
docker compose -f docker-compose.dev.yml up -d

# 4. Accéder à l'application
open http://localhost:3000
```

### Commandes Principales

```bash
# Développement
npm run dev              # Serveur dev avec Turbopack
npm run build            # Build pour production

# Tests
npm run test             # Tests unitaires (Vitest)
npm run test:e2e         # Tests E2E (Playwright)

# Qualité
npm run lint             # Vérifier avec ESLint
npm run biome-write      # Formatter avec Biome
```

Pour la liste complète des commandes et leur description : [docs/development-guide.md - Commandes](docs/development-guide.md#commandes-de-développement)

---

## 🧪 Tests

**Documentation complète** : [tests/README.md](tests/README.md) | [docs/development-guide.md - Tests](docs/development-guide.md#tests)

```bash
# Tests unitaires (Vitest)
npm run test

# Tests E2E (Playwright)
npm run test:e2e
```

**Couverture** : Routes API, services, flux publics et admin

---

## 📦 Déploiement

### Docker (Recommandé)

Le projet inclut une configuration Docker complète avec :

- ✅ Multi-stage build optimisé
- ✅ Initialisation automatique de la DB (migrations + seed)
- ✅ Publication différée (cron interne) pour les contenus `scheduled`
- ✅ Support Traefik pour SSL automatique
- ✅ Healthchecks intégrés

**Guide complet** : [docs/installation.md](docs/installation.md)

### Déploiement VPS avec Traefik

Architecture production :

```
Internet → Traefik (SSL) → Next.js App
                         → PostgreSQL
```

Voir [docs/installation.md - Déploiement VPS](docs/installation.md#déploiement-sur-vps)

### Autres Plateformes

Compatible avec (avec adaptations) :

- **Vercel** - Nécessite base de données externe (Neon, Supabase)
- **Netlify** - Idem
- **Railway** - Support PostgreSQL intégré
- **Render** - Support PostgreSQL intégré

⚠️ **Note** : Ce projet utilise PostgreSQL. Les plateformes serverless nécessitent une base de données managée externe.

---

## 🗂️ Structure du Projet

```
portfolio/
├── src/
│   ├── app/
│   │   ├── (api)/              # API Routes
│   │   └── (web)/              # Pages publiques
│   ├── lib/
│   │   ├── contracts/          # Types partagés
│   │   ├── modules/            # Logique métier (articles, projets, etc.)
│   │   └── utils/              # Utilitaires
│   └── components/             # Composants React
├── prisma/
│   ├── schema.prisma           # Schéma de la base de données
│   ├── migrations/             # Migrations SQL
│   └── seed.sql                # Données initiales
├── docker-compose.yml          # Production (avec Traefik)
├── docker-compose.dev.yml      # Développement local
├── Dockerfile                  # Image app Next.js
├── Dockerfile.init             # Image init DB (migrations)
├── scripts/
│   └── setup-first-deploy.sh   # Installation interactive
├── tests/                      # Tests unitaires et E2E
├── docs/                       # Documentation technique
└── public/                     # Assets statiques
```

---

## 🎯 Contrats Typés

Les types partagés entre UI et backend sont centralisés dans `src/lib/contracts` :

- `ProjectAdminMetadata`, `ArticleAdminMetadata` - Métadonnées
- `ContentStatus`, `PROJECT_STATUSES`, `ARTICLE_STATUSES` - Statuts
- `ApiResponse` - Réponses API standardisées

Réexportés dans `src/app/(web)/types/index.ts` pour import simplifié.

---

## 🎨 Crédits

Ce projet est basé sur [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) par [Once UI](https://once-ui.com), créé par [Lorant Ambrus](https://www.linkedin.com/in/lorant-one/).

### Améliorations Apportées

- ✅ Architecture backend PostgreSQL + Prisma
- ✅ Système d'administration complet
- ✅ Authentification JWT sécurisée
- ✅ API REST structurée
- ✅ Configuration Docker production-ready
- ✅ Script d'installation interactif
- ✅ Suite de tests complète (unitaires + E2E)
- ✅ Documentation technique exhaustive
- ✅ Support Traefik pour SSL automatique

---

## 📄 Licence

Ce projet utilise des composants sous licence **CC BY-NC 4.0** (Magic Portfolio).

**Restrictions :**

- ✅ Usage personnel et non-commercial autorisé
- ✅ Attribution requise (Once UI)
- ❌ Usage commercial non autorisé sans licence

**Licence commerciale** : Disponible via [Once UI Pro](https://once-ui.com/pricing)

Voir [LICENSE](LICENSE) pour plus d'informations.

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

**Conventions :**

- Commits selon [Conventional Commits](https://www.conventionalcommits.org/)
- Tests requis pour nouvelles fonctionnalités
- Documentation à jour

---

## 📞 Support & Ressources

### Documentation

- **Guide d'installation** : [docs/installation.md](docs/installation.md)
- **Documentation technique** : [docs/](docs/)
- **Once UI Docs** : [docs.once-ui.com](https://docs.once-ui.com)
- **Next.js Docs** : [nextjs.org/docs](https://nextjs.org/docs)

### Communauté

- **Issues** : [GitHub Issues](../../issues)
- **Discord** : [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS)
- **Once UI Hub** : [once-ui.com/hub](https://once-ui.com/hub)

---

## 🌟 Remerciements

- **Once UI** pour le design system et le template de base
- **Lorant Ambrus** pour Magic Portfolio
- La communauté Next.js et React

---

**Développé avec ❤️ par Max | DinoDev - Propulsé par Next.js et Once UI**
