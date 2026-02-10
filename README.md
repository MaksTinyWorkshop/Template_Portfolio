# Portfolio Pro

Portfolio professionnel moderne construit avec Next.js 16, TypeScript et Once UI. Ce projet est une adaptation personnalisée de [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) par Once UI, enrichie avec un système d'administration complet et des fonctionnalités avancées.

> **Note:** Ce README fait partie de la branche `main` (version statique avec fichiers MDX). Pour la version avec base de données PostgreSQL, consultez la branche `variante_BDD`.

## 🌟 Fonctionnalités

### Interface Publique

- 🏠 **Page d'accueil** élégante avec Hero section
- 👤 **About/CV** interactif avec table des matières
- 📝 **Blog** avec support MDX (Markdown + React)
- 💼 **Portfolio** de projets avec filtrage par tags
- 🖼️ **Galerie** photos/médias
- 🎨 **Thème Dark/Light** avec bascule automatique
- 🔖 **Flux RSS** pour le blog
- ⚡ **Performances optimales** (Lighthouse 95+)

### Administration Complète

- 🔐 **Authentification sécurisée** avec JWT
- ✍️ **Éditeur WYSIWYG** pour posts et projets (MDX)
- 📤 **Upload d'images** avec gestion des médias
- 📊 **Dashboard** avec statistiques
- 🎯 **Publication/Dépublication** en un clic
- 🏷️ **Gestion des tags** pour les projets
- 💚 **Statut de disponibilité** personnalisable

### Optimisations Techniques

- ⚡ **Next.js 16** avec App Router et React Server Components
- 🎯 **TypeScript strict mode** pour la robustesse du code
- 🖼️ **Images optimisées** (AVIF, WebP automatiques)
- 🚀 **SSR/SSG hybride** pour performance maximale
- 📱 **100% Responsive** sur tous les appareils
- 🔒 **Sécurité renforcée** (HTTP-only cookies, validation Zod)
- 🎨 **Design System Once UI** avec tokens configurables

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** v18.17+ (recommandé: v21+)
- **npm** v9+
- **Git**

### Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd portfolio

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (voir section Configuration)

# 4. Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ⚙️ Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# Authentification Admin (REQUIS)
ADMIN_PASSWORD_HASH=<votre_hash_bcrypt>

# URL du Site (optionnel)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Newsletter Mailchimp (optionnel)
NEXT_PUBLIC_MAILCHIMP_ACTION_URL=
NEXT_PUBLIC_MAILCHIMP_USER_ID=
NEXT_PUBLIC_MAILCHIMP_FORM_ID=
```

**Générer le hash du mot de passe admin** :

```bash
node -e "console.log(require('bcrypt').hashSync('votre-mot-de-passe', 10))"
```

### Personnalisation du Contenu

**1. Informations personnelles**

- Éditer `src/resources/content.tsx`
- Modifier nom, titre, bio, liens sociaux, etc.

**2. Design System**

- Éditer `src/resources/config/once-ui.config.js`
- Personnaliser couleurs, typographie, espacements

**3. Icônes**

- Éditer `src/resources/icons.ts`
- Changer les icônes utilisées dans le site

---

## 📝 Gestion du Contenu

### Via l'Interface Admin

1. Accéder à `/admin` sur votre site
2. Se connecter avec le mot de passe configuré
3. Gérer posts et projets via l'éditeur WYSIWYG

### Manuellement (Fichiers MDX)

**Créer un post de blog** :

```bash
# Créer le fichier
touch data/posts/mon-article.mdx
```

Structure du fichier :

```mdx
---
title: "Titre de l'article"
publishedAt: "2026-01-31"
summary: "Résumé court de l'article"
images:
  - /images/blog/cover.jpg
published: true
---

Contenu de l'article en Markdown...
```

**Créer un projet** :

```bash
touch data/projects/mon-projet.mdx
```

Structure du fichier :

```mdx
---
title: "Nom du Projet"
publishedAt: "2026-01-31"
summary: "Description courte"
images:
  - /images/projects/cover.jpg
team:
  - name: "Votre Nom"
    role: "Développeur"
tags:
  - React
  - Next.js
published: true
---

Description détaillée du projet...
```

---

## 🛠️ Commandes Disponibles

```bash
# Développement
npm run dev              # Serveur de dev avec Turbopack
npm run dev:clean        # Dev avec rebuild complet
npm run dev:fast         # Dev avec HTTPS expérimental

# Production
npm run build            # Build pour production
npm run start            # Démarrer en mode production

# Qualité du Code
npm run lint             # Vérifier avec ESLint
npm run biome-write      # Formatter avec Biome

# Analyse
npm run build:analyze    # Analyser la taille du bundle
```

---

## 📦 Déploiement

### Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<votre-repo-url>)

1. Pusher le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer automatiquement

### Docker (Production)

Documentation Docker disponible dans [`docs/docker-deployment.md`](docs/docker-deployment.md) _(à venir)_

### Autres Plateformes

Compatible avec :

- **Netlify** : Build automatique sur push
- **AWS Amplify** : Déploiement serverless
- **Railway** : Déploiement simplifié
- **Render** : Alternative gratuite

---

## 📚 Documentation

Une documentation technique complète est disponible dans le dossier [`docs/`](docs/) :

- **[Index](docs/index.md)** - Point d'entrée principal
- **[Architecture](docs/architecture.md)** - Architecture technique détaillée
- **[Guide de Développement](docs/development-guide.md)** - Workflow et bonnes pratiques
- **[Composants UI](docs/ui-components-portfolio.md)** - Inventaire des 33 composants
- **[API Contracts](docs/api-contracts-portfolio.md)** - Documentation des endpoints
- **[Structure du Projet](docs/source-tree-analysis.md)** - Organisation du code
- **[Vue d'Ensemble](docs/project-overview.md)** - Résumé du projet

---

## 🏗️ Stack Technologique

| Catégorie     | Technologies                 |
| ------------- | ---------------------------- |
| **Framework** | Next.js 16.0.10 (App Router) |
| **Langage**   | TypeScript 5.8.3             |
| **UI**        | React 19.2.0 + Once UI 1.5.6 |
| **Contenu**   | MDX 3.1.0 + next-mdx-remote  |
| **Styling**   | Sass 1.86.3 + Once UI tokens |
| **Forms**     | React Hook Form + Zod        |
| **Auth**      | JWT + HTTP-only cookies      |
| **Dev Tools** | Biome, ESLint, lint-staged   |

---

## 🎨 Crédits

Ce projet est basé sur [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio) par [Once UI](https://once-ui.com), créé par [Lorant Ambrus](https://www.linkedin.com/in/lorant-one/).

### Modifications et Améliorations

- ✅ Système d'administration complet avec authentification JWT
- ✅ Éditeur WYSIWYG pour contenu MDX
- ✅ Upload et gestion d'images
- ✅ Dashboard avec statistiques
- ✅ Gestion de la disponibilité freelance
- ✅ API Routes pour CRUD de contenu
- ✅ Documentation technique complète
- ✅ Configuration Docker pour production
- ✅ Optimisations de performance avancées

---

## 📄 Licence

Ce projet utilise des composants sous licence CC BY-NC 4.0 (Magic Portfolio).

**Restrictions** :

- ✅ Attribution requise
- ❌ Usage commercial non autorisé sans licence
- 💡 Licence commerciale disponible via [Once UI Pro](https://once-ui.com/pricing)

Voir [`LICENSE`](LICENSE) pour plus d'informations.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- **Documentation** : Consultez le dossier [`docs/`](docs/)
- **Issues** : [GitHub Issues](../../issues)
- **Once UI Docs** : [docs.once-ui.com](https://docs.once-ui.com)
- **Next.js Docs** : [nextjs.org/docs](https://nextjs.org/docs)

---

## 🌟 Rejoignez la Communauté

- **Discord** : [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS)
- **Once UI Hub** : Partagez votre projet sur [Once UI Hub](https://once-ui.com/hub)

---

**Développé avec ❤️ en utilisant Next.js et Once UI**
