# Publication via la base de données (variante_BDD)

## 1. À quoi sert ce document

La branche `main` documente la publication automatique via l’API GitHub, en générant des commits sur les fichiers MDX. Dans `variante_BDD`, cette étape n’existe plus : tout passe désormais par PostgreSQL, Prisma et des services administratifs qui écrivent directement dans la base de données. Ce guide décrit les flux, prérequis et diagnostics spécifiques à cette variante.

## 2. Vue d’ensemble fonctionnelle

- **Sources de vérité** : les modèles Prisma `Article` et `Project` (statuts `draft`, `scheduled`, `published`) stockent le contenu, les métadonnées et les relations.
- **Interface admin** : `ContentList.tsx` déclenche un POST vers `/api/admin/publish` lorsque l’utilisateur clique sur « Publier ».
- **Route backend** : `src/app/(api)/api/admin/publish/route.ts` vérifie l’authentification (`checkAuthAPI`), valide la charge utile `{ slug, type }`, appelle `setProjectStatus` ou `setArticleStatus` puis réactive les pages concernées (`revalidatePath("/work")`, etc.).
- **Publication différée (cron)** : `src/app/(api)/api/admin/publish-due/route.ts` publie en base tous les contenus `scheduled` dont la date est dépassée, et le service Docker `publish-cron` l’exécute quotidiennement.
- **Pas de Git ou d’API GitHub** : aucun fichier `git.ts`/`git-github.ts` n’est consommé, et la publication ne génère plus de commits dans le repository. Les variables `GITHUB_*` peuvent être retirées si elles restent inutilisées.

## 3. Prérequis et variables d’environnement

### 3.1 Système

- Node.js 18.17+ (ou 21.3+ recommandé)  
- npm >= 9  
- PostgreSQL accessible (en local via Docker ou service distante)

### 3.2 Variables essentielles

Copiez `.env.example` vers `.env` et remplissez au minimum :

| Variable | Objectif |
|----------|----------|
| `DATABASE_URL` | Connexion PostgreSQL principale |
| `SHADOW_DATABASE_URL` | (Optionnel) utilisé par Prisma pour les migrations |
| `ADMIN_PASSWORD` | Mot de passe maître de `/admin` |
| `AUTH_SECRET` | Clé HMAC pour signer les tokens (par défaut : `ADMIN_PASSWORD`) |
| `CRON_SECRET` | Secret utilisé par le cron pour appeler `/api/admin/publish-due` |
| `CONTACT_EMAIL_RECIPIENT` | Destinataire des formulaires de contact |
| `CONTACT_EMAIL_SENDER` | Expéditeur logiquement identifiable |
| `CONTACT_WEBHOOK_URL` | (Optionnel) webhook à notifier sur envoi de contact |

Les constantes de `src/lib/utils/auth-constants.ts` définissent les durées : tokens valables 2 heures, rafraîchissement quand il reste < 30 minutes.

## 4. Mise en place de la base de données

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Générer le client Prisma :
   ```bash
   npm run prisma:generate
   ```
3. Appliquer les migrations :
   ```bash
   npm run prisma:migrate dev
   ```
4. Importer le contenu MDX dans PostgreSQL (proj/posts) :
   ```bash
   npm run db:seed
   ```
   Le script `scripts/seed-data.ts` lit `data/posts` et `data/projects`, normalise les slugs, tags, personnes et médias puis peuple les tables Prisma.

## 5. Flux de publication « publish »

1. L’utilisateur clique sur **Publier** dans l’UI admin (`ContentList`) → confirmation.
2. Le frontend envoie :
   ```json
   {
     "slug": "super-projet",
     "type": "project"
   }
   ```
3. Route `/api/admin/publish` :
   - `checkAuthAPI` vérifie le cookie `authToken`;
   - `setProjectStatus`/`setArticleStatus` (Prisma) modifient le champ `status`;
   - `revalidatePath` redemande les pages `/work`, `/blog` et les routes individuelles pour mettre à jour le cache Next.js.
4. Réponse uniforme `{ success: true, data: { slug, type } }`.
5. L’UI met à jour le badge et affiche une notification de succès.

## 6. Statuts et cache

| Statut | Signification | Comportement |
|--------|---------------|-------------|
| `draft` | Brouillon privé | contenu non listé dans `/work` ou `/blog` |
| `scheduled` | Publication programmée | publié automatiquement via cron (voir ci-dessous) |
| `published` | Visible publiquement | figure dans les listes et RSS |

Chaque changement de statut déclenche `revalidatePath` pour forcer Next.js à regénérer les pages à la prochaine requête.

## 6.1 Publication différée (cron)

- Endpoint : `POST /api/admin/publish-due` (protégé par `CRON_SECRET` avec `Authorization: Bearer ...`)
- Docker (prod) : le service `publish-cron` exécute la publication **tous les jours à 12:00 (Europe/Paris)** en appelant `http://app:3000/api/admin/publish-due` sur le réseau Docker.

## 7. Authentification et sécurité admin

- `/admin` repose sur une génération de token via `generateAuthToken()` (HMAC SHA-256) et un `verifyAuthToken()` côté serveur.
- Les cookies Next.js transportent `authToken` ; la validation se fait dans `checkAuthAPI`.
- La durée de validité (`TOKEN_MAX_AGE_MS`) est de 2h et un rafraîchissement automatique a lieu si moins de 30 min restent (`TOKEN_REFRESH_THRESHOLD_MS`).
- Pour la procédure complète, voir `src/lib/utils/auth.ts` et `auth-constants.ts`.

## 8. Notifications de contact

Le formulaire `/api/contact` utilise `handleContactRequest` :
- Valide le payload avec `contactSchema` (`name`, `email`, `message`, `subject` optionnel).
- Log internement l’envoi et, si `CONTACT_WEBHOOK_URL` est défini, poste les données en JSON vers le webhook.
- Les destinataires/sender sont configurés via `CONTACT_EMAIL_RECIPIENT`/`SENDER`.

## 9. Débogage et vérifications rapides

- **500 sur `/api/admin/publish`** : assurerez-vous que le slug existe (`psql` ou `pgAdmin`). Les erreurs Prisma (e.g. `ProjectNotFoundError`) sont converties en `ApiError`.
- **Authentification refusée** : collector `authToken` dans les cookies; `ADMIN_PASSWORD`/`AUTH_SECRET` doivent être identiques entre client et server.
- **Données non visibles** : vérifier le champ `status` dans la table `Article`/`Project`, puis appeler `await setProjectStatus(slug, "published")` dans un REPL Prisma si besoin.
- **Seed non complète** : inspecter `data/posts` et `data/projects` (frontmatter). Le script `scripts/seed-data.ts` normalise tags, médias et personnes.
- **Contact ne notifie pas** : activer `CONTACT_WEBHOOK_URL` ou streamer les logs; le module utilise `fetch` pour les requêtes sortantes.

## 10. Prochaines étapes (par rapport à `main`)

1. **Supprimer les anciennes références Git** : les fichiers `src/lib/utils/git*.ts` n’existent plus, donc retirer toute mention restante dans les docs.
2. **Réviser la doc `main` si besoin** : celle-ci reste utile pour la version GitHub API, mais ici on documente uniquement la variante BDD.
3. **Automatiser la réconciliation** : un script `npm run db:seed` peut être planifié pour synchroniser les contenus MDX avec la base quand la branche est déployée.
