# Inventaire des Composants UI - Portfolio

## Vue d'ensemble

Ce document catalogue tous les composants UI du portfolio, organisés par catégorie fonctionnelle. Le projet utilise le design system Once UI comme base.

---

## Composants de Layout

### `Header.tsx`
**Catégorie** : Navigation
**Description** : En-tête principal avec navigation et toggle de thème
**Props** : N/A
**Dépendances** : Once UI, ThemeToggle

### `Footer.tsx`
**Catégorie** : Layout
**Description** : Pied de page avec liens et informations
**Props** : N/A
**Dépendances** : Once UI

### `AdminLayout.tsx`
**Catégorie** : Layout
**Description** : Layout spécifique pour les pages d'administration
**Props** : `{ children: ReactNode }`
**Dépendances** : Once UI, RouteGuard

---

## Composants de Navigation

### `ThemeToggle.tsx`
**Catégorie** : Navigation
**Description** : Bouton pour basculer entre thèmes clair/sombre
**Réutilisable** : Oui
**Dépendances** : Once UI theme system

### `ScrollToHash.tsx`
**Catégorie** : Navigation
**Description** : Gère le scroll automatique vers les ancres de page
**Réutilisable** : Oui
**Client Component** : Oui

---

## Composants de Contenu

### Blog

#### `Posts.tsx`
**Catégorie** : Display
**Description** : Liste de tous les posts du blog
**Props** : `{ posts: Post[] }`
**Dépendances** : Post, ProjectCard

#### `Post.tsx`
**Catégorie** : Display
**Description** : Affichage d'un post de blog individuel
**Props** : `{ post: Post }`
**Dépendances** : MDX, HeadingLink

#### `ShareSection.tsx`
**Catégorie** : Interactive
**Description** : Boutons de partage social pour les posts
**Props** : `{ title: string, url: string }`
**Réutilisable** : Oui

### Work/Projects

#### `Projects.tsx`
**Catégorie** : Display
**Description** : Grille de tous les projets
**Props** : `{ projects: Project[] }`
**Dépendances** : ProjectCard

#### `ClientProjects.tsx`
**Catégorie** : Interactive
**Description** : Version client-side de la liste de projets
**Client Component** : Oui
**Props** : `{ projects: Project[] }`

#### `FilterableProjects.tsx`
**Catégorie** : Interactive
**Description** : Projets avec filtrage par tags
**Client Component** : Oui
**Props** : `{ projects: Project[], tags: string[] }`
**Dépendances** : ProjectFilter, ProjectCard

#### `ProjectFilter.tsx`
**Catégorie** : Form/Interactive
**Description** : Contrôles de filtrage pour les projets
**Client Component** : Oui
**Props** : `{ tags: string[], activeFilters: string[], onFilterChange: Function }`

#### `ProjectCard.tsx`
**Catégorie** : Display
**Description** : Carte d'aperçu d'un projet
**Réutilisable** : Oui
**Props** : `{ project: Project }`
**Dépendances** : ProjectTag

#### `ProjectTag.tsx`
**Catégorie** : Display
**Description** : Badge/tag pour catégoriser les projets
**Réutilisable** : Oui
**Props** : `{ tag: string }`

### About

#### `TableOfContents.tsx`
**Catégorie** : Navigation
**Description** : Table des matières pour la page About
**Client Component** : Oui
**Props** : `{ headings: Heading[] }`

### Gallery

#### `GalleryView.tsx`
**Catégorie** : Display
**Description** : Affichage en grille des images de la galerie
**Props** : `{ images: GalleryImage[] }`
**Dépendances** : Once UI Image

---

## Composants Admin

### Authentification

#### `LoginPage.tsx`
**Catégorie** : Form
**Description** : Page de connexion administrateur
**Client Component** : Oui
**Props** : N/A
**Dépendances** : React Hook Form, Zod

#### `RouteGuard.tsx`
**Catégorie** : Security
**Description** : HOC pour protéger les routes admin
**Props** : `{ children: ReactNode }`
**Fonctionnalité** : Vérifie l'authentification JWT

### Gestion de Contenu

#### `PostsList.tsx`
**Catégorie** : Admin - Display
**Description** : Liste des posts pour l'administration
**Client Component** : Oui
**Props** : N/A
**Dépendances** : ContentList

#### `ProjectsList.tsx`
**Catégorie** : Admin - Display
**Description** : Liste des projets pour l'administration
**Client Component** : Oui
**Props** : N/A
**Dépendances** : ContentList

#### `ContentList.tsx`
**Catégorie** : Admin - Display
**Description** : Composant générique de liste de contenu
**Client Component** : Oui
**Props** : `{ items: ContentItem[], type: 'post'|'project' }`

#### `PostForm.tsx`
**Catégorie** : Admin - Form
**Description** : Formulaire d'édition de post de blog
**Client Component** : Oui
**Props** : `{ post?: Post }`
**Dépendances** : React Hook Form, MDX Editor, ImageUpload

#### `ProjectForm.tsx`
**Catégorie** : Admin - Form
**Description** : Formulaire d'édition de projet
**Client Component** : Oui
**Props** : `{ project?: Project }`
**Dépendances** : React Hook Form, MDX Editor, TagSelector

#### `TagSelector.tsx`
**Catégorie** : Admin - Form
**Description** : Sélecteur de tags pour les projets
**Client Component** : Oui
**Props** : `{ selectedTags: string[], onChange: Function }`

#### `ImageUpload.tsx`
**Catégorie** : Admin - Form
**Description** : Upload d'images pour le contenu
**Client Component** : Oui
**Props** : `{ onUpload: Function }`
**Dépendances** : API `/api/admin/upload`

#### `DashboardStats.tsx`
**Catégorie** : Admin - Display
**Description** : Statistiques du dashboard admin
**Props** : `{ stats: DashboardStats }`

#### `AvailabilityManager.tsx`
**Catégorie** : Admin - Form
**Description** : Gestion du statut de disponibilité
**Client Component** : Oui
**Props** : N/A
**Dépendances** : API `/api/availability`

### Utilitaires

#### `AdminEasterEgg.tsx`
**Catégorie** : Interactive
**Description** : Easter egg pour accéder à l'admin (Konami Code)
**Client Component** : Oui
**Props** : N/A

#### `AvailabilityBadge.tsx`
**Catégorie** : Display
**Description** : Badge affichant le statut de disponibilité
**Props** : `{ available: boolean }`
**Réutilisable** : Oui

---

## Composants Techniques

### `Providers.tsx`
**Catégorie** : Context
**Description** : Provider pour les contextes React (Theme, etc.)
**Props** : `{ children: ReactNode }`
**Dépendances** : Once UI ThemeProvider

### `mdx.tsx`
**Catégorie** : Content
**Description** : Composants personnalisés pour le rendu MDX
**Exports** : Components map pour MDX
**Dépendances** : Once UI, HeadingLink

### `HeadingLink.tsx`
**Catégorie** : Display
**Description** : Headings avec liens d'ancrage automatiques
**Réutilisable** : Oui
**Props** : `{ level: 1-6, children: ReactNode, id?: string }`

### `Mailchimp.tsx`
**Catégorie** : Form
**Description** : Formulaire d'inscription à la newsletter
**Client Component** : Oui
**Props** : N/A
**Intégration** : Mailchimp API

---

## Design System

**Base** : Once UI (@once-ui-system/core)
**Tokens** : Configurés dans `src/app/(web)/resources/config/once-ui.config.js`
**Composants Once UI utilisés** :
- Flex, Grid, Stack (Layout)
- Text, Heading (Typography)
- Button, Input, Select (Forms)
- Icon, Avatar, Badge (Display)
- SmartImage (Images optimisées)

---

## Patterns de Composition

### Client vs Server Components
- **Server Components** : Layout, Display de contenu statique
- **Client Components** : Forms, Interactive features, State management

### Réutilisabilité
- **Hautement réutilisables** : ProjectCard, ProjectTag, HeadingLink, ShareSection
- **Spécifiques au contexte** : Admin components, Page-specific components

### État et Props
- Props drilling minimal grâce à la composition
- Server Components pour data fetching
- Client Components pour interactivité

---

## Statistiques

- **Total composants** : 33
- **Client Components** : 15
- **Server Components** : 18
- **Composants admin** : 13
- **Composants réutilisables** : 8
