# Guide de Développement - Portfolio

## Prérequis

### Versions Requises
- **Node.js** : v18.17+ (recommandé : v21.3.0)
- **npm** : v9+ (inclus avec Node.js)
- **Git** : Pour le contrôle de version

### Système d'Exploitation
- macOS, Linux, ou Windows (avec WSL2 recommandé)

---

## Installation Initiale

### 1. Cloner le Repository
```bash
git clone <repository-url>
cd portoflio_new
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configuration de l'Environnement

Copier le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

Si vous lancez `npm run dev` sur votre machine (hors Docker), ajoutez aussi :
```bash
cp .env.development.local.example .env.development.local
```

Note : `db` est le hostname Docker (résolvable uniquement dans le réseau Docker). Depuis la machine hôte, utilisez `localhost` via `.env.development.local`.

**Variables d'environnement requises** :
```env
# Authentification Admin
ADMIN_PASSWORD_HASH=<bcrypt_hash>

# Next.js (optionnel)
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

---

## Commandes de Développement

### Démarrage du Serveur de Développement

#### Mode Standard
```bash
npm run dev
```
Démarre le serveur sur `http://localhost:3000` avec Turbopack

#### Mode Clean (Rebuild)
```bash
npm run dev:clean
```
Supprime le cache `.next` avant de démarrer

#### Mode Fast (HTTPS)
```bash
npm run dev:fast
```
Démarre avec HTTPS expérimental (utile pour tester PWA, cookies sécurisés)

---

## Tests

- `npm run test` : exécute les suites Vitest (`tests/http/**/*.test.ts`, services partagés) pour les routes API, validations et erreurs métier.
- `npm run test:e2e` : joue les specs Playwright (`tests/e2e/*.spec.ts`) qui parcourent les pages Home, Blog et Work ainsi que le parcours admin (connexion, éditeur, publication) sur Chromium, Firefox et WebKit ; traces et captures sont conservées dans `test-results/`.

Consultez `tests/README.md` pour la configuration des fixtures, la stratégie network-first, les helpers et les commandes utilitaires (`show-report`, `--debug`, `--trace`).

---

## Build et Production

### Build de Production
```bash
npm run build
```
Compile l'application pour la production dans `.next/`

### Analyser le Bundle
```bash
npm run build:analyze
```
Build avec analyse de la taille du bundle (nécessite `@next/bundle-analyzer`)

### Démarrer en Mode Production
```bash
npm run start
```
Démarre le serveur de production (requiert `npm run build` d'abord)

---

## Base de Données (Prisma)

### Générer le Client Prisma
```bash
npm run prisma:generate
```
Génère le client Prisma TypeScript après modification du schéma

### Créer une Migration
```bash
npm run prisma:migrate
```
Crée une nouvelle migration depuis les changements du schéma

### Seed la Base de Données
```bash
npm run db:seed
```
Exécute le seed SQL depuis `prisma/seed.sql`

### Studio Prisma (GUI)
```bash
npx prisma studio
```
Ouvre l'interface Prisma Studio pour explorer/éditer la base de données

---

## Qualité du Code

### Linting
```bash
npm run lint
```
Vérifie le code avec ESLint et Next.js linting

### Formatage avec Biome
```bash
npm run biome-write
```
Formate automatiquement tout le code avec Biome

### Lint-Staged (Pre-commit)
Configuration automatique via `.lintstagedrc.js`
- S'exécute sur `git commit`
- Formate les fichiers staged
- Vérifie les erreurs de linting

---

## Structure de Développement

### Workflow Typique

1. **Créer une branche feature**
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

2. **Développer localement**
   ```bash
   npm run dev
   ```

3. **Tester les changements**
   - Vérifier visuellement dans le navigateur
   - Tester les routes API avec Postman/Insomnia
   - Vérifier la console pour les erreurs

4. **Commiter les changements**
   ```bash
   git add .
   git commit -m "feat: description de la feature"
   ```
   (lint-staged s'exécute automatiquement)

5. **Pousser et créer une PR**
   ```bash
   git push origin feature/ma-nouvelle-feature
   ```

---

## Ajout de Contenu

### Créer un Nouveau Post de Blog

1. **Via l'Interface Admin** (Recommandé)
   - Aller sur `/admin`
   - Connexion avec mot de passe admin
   - "Posts" → "Nouveau Post"
   - Éditer avec MDX Editor
   - Publier
   - La publication déclenche `/api/admin/publish` qui met à jour les statuts en base et invalide les caches (voir [Publication via la base de données (variante_BDD)](./github-api-setup.md))

### Créer un Nouveau Projet

1. **Via l'Interface Admin** (Recommandé)
   - `/admin` → "Projets" → "Nouveau Projet"

---

## Personnalisation

### Modifier le Contenu du Site

**Fichier principal** : `src/app/(web)/resources/content.tsx`

Contient :
- Informations personnelles (nom, titre, bio)
- Contenu de la page d'accueil
- Liens sociaux
- Configuration de navigation
- Textes de la page About

> En runtime, la vitrine préfère les données stockées en PostgreSQL/Prisma via `src/lib/modules/person/services/person-site.service.ts` → `getSitePersonData()` et `buildPersonSiteData()` (`person.utils.ts`). `content.tsx` sert uniquement de fallback statique si aucun `siteOwner` n’est présent en base (utile en seed ou en mode offline).

### Configurer le Design System

**Fichier** : `src/app/(web)/resources/config/once-ui.config.js`

Permet de personnaliser :
- Couleurs (brand, neutral, accent)
- Typographie (fonts, scales)
- Spacing, radius, borders
- Effets visuels

### Modifier les Icônes

**Fichier** : `src/app/(web)/resources/icons.ts`

Mapping des icônes React Icons utilisées dans le site

---

## Gestion des Images

### Upload via Admin
- Interface admin : `/admin`
- Upload d'images → stockées dans `public/images/`
- URL générée automatiquement

### Ajout Manuel
```bash
# Placer les images dans public/
cp mon-image.jpg public/images/blog/
```

**Utilisation dans MDX** :
```markdown
![Alt text](/images/blog/mon-image.jpg)
```

### Optimisation des Images

Next.js optimise automatiquement :
- Formats AVIF et WebP
- Lazy loading
- Responsive images
- Cache de 60s

---

## Debugging

### Outils de Développement

**React DevTools** : Extension navigateur pour inspecter les composants

**Next.js DevTools** : Intégré dans le navigateur en mode dev

**Console Logs** :
- En développement : tous les logs visibles
- En production : console.log() supprimés (sauf error/warn)

### Erreurs Courantes

**Port 3000 déjà utilisé** :
```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill
```

**Cache corrompu** :
```bash
rm -rf .next
npm run dev
```

**Dépendances manquantes** :
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Tests

### Tests Manuels Recommandés

Avant chaque déploiement, tester :

1. **Navigation**
   - [ ] Toutes les pages publiques accessibles
   - [ ] Liens de navigation fonctionnels
   - [ ] Routes dynamiques (blog posts, projets)

2. **Admin**
   - [ ] Login admin fonctionne
   - [ ] Création/édition de posts
   - [ ] Création/édition de projets
   - [ ] Upload d'images
   - [ ] Publication/dépublication

3. **Responsive**
   - [ ] Mobile (320px+)
   - [ ] Tablet (768px+)
   - [ ] Desktop (1024px+)

4. **Performance**
   - [ ] Lighthouse score > 90
   - [ ] Images optimisées
   - [ ] Pas d'erreurs console

---

## Variables d'Environnement

### Variables Disponibles

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| `ADMIN_PASSWORD_HASH` | Hash bcrypt du mot de passe admin | Oui | - |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | Non | `http://localhost:3000` |
| `NEXT_PUBLIC_MAILCHIMP_ACTION_URL` | URL d'action Mailchimp | Non | - |
| `JWT_SECRET` | Secret pour signer les JWT | Non (auto-généré) | - |

**Note** : Les variables préfixées `NEXT_PUBLIC_` sont exposées au client

---

## Dépendances Principales

### Framework et Core
- `next` : Framework React avec SSR/SSG
- `react` : Bibliothèque UI
- `typescript` : Typage statique

### UI et Design
- `@once-ui-system/core` : Design system
- `react-icons` : Bibliothèque d'icônes
- `sass` : Préprocesseur CSS

### Contenu
- `@next/mdx` : Support MDX
- `next-mdx-remote` : Rendu MDX dynamique
- `gray-matter` : Parsing frontmatter

### Forms et Validation
- `react-hook-form` : Gestion de formulaires
- `zod` : Validation de schémas
- `@hookform/resolvers` : Intégration zod + react-hook-form

### Outils de Développement
- `@biomejs/biome` : Linter et formatter
- `eslint` : Linter JavaScript/TypeScript
- `lint-staged` : Pre-commit hooks

---

## Performance

### Optimisations Activées

- **Turbopack** : Bundler ultra-rapide en dev
- **Image Optimization** : AVIF/WebP automatique
- **Code Splitting** : Automatique par route
- **Tree Shaking** : Suppression du code mort
- **Minification** : En production
- **CSS Optimization** : Extraction et minification

### Optimisations Recommandées

- Utiliser `next/image` pour toutes les images
- Lazy load des composants lourds avec `dynamic()`
- Éviter les re-renders inutiles (memo, useMemo, useCallback)
- Préférer Server Components quand possible

---

## Ressources

### Documentation
- Next.js : https://nextjs.org/docs
- Once UI : https://once-ui.com/docs
- React : https://react.dev

### Outils Utiles
- **Postman/Insomnia** : Tester les API routes
- **React DevTools** : Inspector les composants
- **Lighthouse** : Auditer les performances

---

## Support

Pour toute question ou problème :
1. Consulter la documentation technique
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement
