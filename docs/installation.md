# 🚀 Installation du Portfolio

Guide d'installation complet pour déployer votre propre portfolio basé sur ce projet.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Installation manuelle](#installation-manuelle)
- [Configuration](#configuration)
- [Déploiement Docker](#-déploiement-docker)
  - [Architecture Dockerfile](#architecture-dockerfile-multi-stage)
  - [Configuration avancée](#configuration-avancée-docker)
  - [Production avec Reverse Proxy](#production-avec-reverse-proxy)
  - [Optimisations](#optimisations-de-performance)
  - [Déploiement Cloud](#déploiement-cloud)
  - [Sécurité](#sécurité-docker)
  - [CI/CD](#cicd-avec-github-actions)
  - [Backup & Monitoring](#sauvegarde-et-restauration)
- [Déploiement sur VPS](#-déploiement-sur-vps)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** (≥ 24.0) et **Docker Compose** (≥ 2.20)
  - [Installer Docker](https://docs.docker.com/get-docker/)
- **Git** pour cloner le repository
- **Un éditeur de texte** pour personnaliser les fichiers

### Vérification des prérequis

```bash
docker --version
docker compose version
git --version
```

---

## ⚡ Installation rapide

Le script d'installation interactif configure tout automatiquement :

### 1. Cloner le repository

```bash
git clone https://github.com/VOTRE_USERNAME/portfolio.git
cd portfolio
```

### 2. Lancer le script d'installation

```bash
chmod +x scripts/setup-first-deploy.sh
./scripts/setup-first-deploy.sh
```

Le script vous guidera à travers :
- ✅ Choix de l'environnement (dev/prod)
- ✅ Configuration de vos informations personnelles
- ✅ Génération des secrets de sécurité
- ✅ Configuration de la base de données
- ✅ Configuration optionnelle GitHub et Mailchimp
- ✅ Création du fichier `.env`
- ✅ Personnalisation du seed SQL
- ✅ Lancement de Docker Compose

### 3. Accéder à votre portfolio

**Développement :**
```
http://localhost:3000
```

**Production :**
```
https://votre-domaine.com
```

**Admin :**
```
http://localhost:3000/admin (ou /admin en prod)
```

---

## 📝 Installation manuelle

Si vous préférez configurer manuellement :

### 1. Cloner et préparer

```bash
git clone https://github.com/VOTRE_USERNAME/portfolio.git
cd portfolio
```

### 2. Copier le fichier d'environnement

**Pour Docker (DB + app dans des containers)** :
```bash
cp .env.example .env
```

**Pour le développement local (Next.js sur la machine hôte)** :
```bash
# On garde `.env` pour Docker (host DB = `db`)
# et on override uniquement la connexion DB pour `npm run dev` (host DB = `localhost`)
cp .env.development.local.example .env.development.local
```

**Pour la production :**
```bash
cp .env.example .env.production
```

### 3. Éditer le fichier `.env`

Ouvrez le fichier avec votre éditeur préféré et configurez :

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com

# Authentification (IMPORTANT : Changez ces valeurs)
ADMIN_PASSWORD=votre_mot_de_passe_securise
AUTH_SECRET=generer_avec_openssl_rand_base64_32

# Base de données
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_password_db_securise
POSTGRES_DB=portfolio
DATABASE_URL=postgresql://postgres:password@db:5432/portfolio

# GitHub (optionnel - pour publication automatique)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=votre_username
GITHUB_REPO=votre_repo
GITHUB_BRANCH=main

# Mailchimp (optionnel - pour newsletter)
NEXT_PUBLIC_MAILCHIMP_ACTION_URL=
NEXT_PUBLIC_MAILCHIMP_USER_ID=
NEXT_PUBLIC_MAILCHIMP_FORM_ID=
```

Notes importantes :
- `db` est le nom du service Docker (résolvable uniquement *dans* le réseau Docker).
- Si vous lancez `npm run dev` sur votre machine, utilisez `localhost` via `.env.development.local`.

### 4. Personnaliser le seed SQL

Éditez `prisma/seed.sql` et remplacez les informations par les vôtres :

```sql
-- Ligne ~3 : Vos informations personnelles
INSERT INTO "Person" (...) VALUES (
  '1',
  'Votre_Prénom',      -- Changez ici
  'Votre_Nom',         -- Changez ici
  'Votre_Titre',       -- Ex: Full-Stack Developer
  'https://votre-avatar.jpg',  -- URL de votre avatar
  ...
);
```

### 5. Générer les secrets

```bash
# Générer AUTH_SECRET
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# Générer un mot de passe DB sécurisé
openssl rand -base64 16 | tr -d "=+/"
```

### 6. Lancer Docker Compose

**Développement :**
```bash
docker compose -f docker-compose.dev.yml up --build -d
```

**Production :**
```bash
docker compose up --build -d
```

### 7. Vérifier le déploiement

```bash
# Voir les logs
docker compose logs -f

# Vérifier le statut des conteneurs
docker compose ps
```

---

## ⚙️ Configuration

### Architecture Docker

Le projet utilise **3 services Docker** orchestrés :

```
┌─────────────────────┐
│   db (PostgreSQL)   │  ← Base de données
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  db-init (Prisma)   │  ← Migrations + Seed (se termine après init)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  app (Next.js)      │  ← Application web
└─────────────────────┘
```

**Flux de démarrage :**
1. **db** démarre et devient healthy
2. **db-init** exécute migrations Prisma + seed SQL (puis se termine)
3. **app** démarre avec une base de données prête

### Structure des environnements

| Fichier | Usage | Ports | Services |
|---------|-------|-------|----------|
| `docker-compose.dev.yml` | Développement local | 3000, 5432 | app, db, db-init |
| `docker-compose.yml` | Production avec Traefik | Traefik gère | app, db |

### Variables d'environnement importantes

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `ADMIN_PASSWORD` | Mot de passe admin | ✅ |
| `AUTH_SECRET` | Secret pour sessions | ✅ |
| `DATABASE_URL` | URL PostgreSQL | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | ✅ |
| `GITHUB_TOKEN` | Token GitHub API | ❌ |
| `MAILCHIMP_*` | Config newsletter | ❌ |

### Configuration Traefik (Production)

Le fichier `docker-compose.yml` est configuré pour Traefik avec :
- ✅ Redirection HTTP → HTTPS automatique
- ✅ Certificats SSL Let's Encrypt
- ✅ Headers de sécurité

**Prérequis Traefik :**
- Réseau Docker `traefik` doit exister
- Traefik doit être configuré avec Let's Encrypt

```bash
# Créer le réseau Traefik
docker network create traefik
```

---

## 🐳 Déploiement Docker

### Architecture Dockerfile Multi-Stage

Le `Dockerfile` utilise **3 stages** pour optimiser la taille et la sécurité :

1. **deps** : Installation des dépendances de production uniquement
2. **builder** : Build de l'application Next.js en mode standalone
3. **runner** : Image finale minimale avec utilisateur non-root

**Avantages :**

- ✅ Image finale ultra-légère (~150MB)
- ✅ Sécurité renforcée (utilisateur non-root `nextjs` UID 1001)
- ✅ Build optimisé avec cache Docker
- ✅ Health check intégré

---

### Configuration Avancée Docker

#### Limites de Ressources

Par défaut, le conteneur est limité à :

- **CPU** : Max 1 core, réservé 0.5 core
- **Mémoire** : Max 1GB, réservé 512MB

Ajuster dans `docker-compose.yml` si nécessaire :

```yaml
deploy:
  resources:
    limits:
      cpus: "2" # Augmenter si besoin
      memory: 2G
    reservations:
      cpus: "1"
      memory: 1G
```

#### Volumes Persistants

Le `docker-compose.yml` monte deux volumes :

```yaml
volumes:
  # Données (availability.json, etc.)
  - ./data:/app/data

  # Images uploadées via l'admin
  - ./public/images:/app/public/images
```

**Important** : Ces volumes préservent les données entre les redémarrages du conteneur.

#### Health Check

Un health check est configuré pour vérifier l'état de l'application :

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "..."]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Vérifier manuellement** :

```bash
curl http://localhost:3000/api/health

# Vérifier le statut Docker
docker inspect --format='{{.State.Health.Status}}' portfolio-app
```

Réponse attendue :

```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T10:00:00.000Z",
  "uptime": 123.45
}
```

---

### Production avec Reverse Proxy

#### Option 1 : Nginx + Docker Compose

**Fichier `docker-compose.prod.yml`** :

```yaml
version: "3.8"

services:
  app:
    extends:
      file: docker-compose.yml
      service: app
    environment:
      - NEXT_PUBLIC_SITE_URL=https://votredomaine.com
    networks:
      - web

  nginx:
    image: nginx:alpine
    container_name: portfolio-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - web

networks:
  web:
    driver: bridge
```

**Exemple `nginx.conf`** :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name votredomaine.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name votredomaine.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**Démarrer** :

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

#### Option 2 : Traefik (Alternative Moderne)

**Fichier `docker-compose.traefik.yml`** :

```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./acme.json:/acme.json
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=votre@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    networks:
      - web

  app:
    extends:
      file: docker-compose.yml
      service: app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portfolio.rule=Host(`votredomaine.com`)"
      - "traefik.http.routers.portfolio.entrypoints=websecure"
      - "traefik.http.routers.portfolio.tls.certresolver=letsencrypt"
      - "traefik.http.services.portfolio.loadbalancer.server.port=3000"
    networks:
      - web

networks:
  web:
    external: true
```

**Créer le réseau et démarrer** :

```bash
docker network create web
docker compose -f docker-compose.traefik.yml up -d
```

---

### Optimisations de Performance

#### 1. Multi-core CPU

Ajuster le nombre de workers Node.js :

```yaml
# docker-compose.yml
environment:
  - NODE_OPTIONS=--max-old-space-size=2048 --max-workers=4
```

#### 2. Cache Build Docker

Utiliser BuildKit pour des builds plus rapides :

```bash
DOCKER_BUILDKIT=1 docker build -t portfolio-app:latest .
```

#### 3. Registry Privé

Pour déploiements multiples, utiliser un registry :

```bash
# Tag l'image
docker tag portfolio-app:latest registry.example.com/portfolio-app:latest

# Push vers le registry
docker push registry.example.com/portfolio-app:latest

# Pull sur le serveur de prod
docker pull registry.example.com/portfolio-app:latest
```

---

### Déploiement Cloud

#### AWS ECS (Elastic Container Service)

1. Push l'image vers ECR
2. Créer une task definition avec `Dockerfile`
3. Déployer sur ECS Fargate

#### Google Cloud Run

```bash
# Build et push
gcloud builds submit --tag gcr.io/PROJECT_ID/portfolio-app

# Deploy
gcloud run deploy portfolio-app \
  --image gcr.io/PROJECT_ID/portfolio-app \
  --platform managed \
  --region europe-west1 \
  --set-env-vars ADMIN_PASSWORD=xxx,AUTH_SECRET=xxx
```

#### DigitalOcean App Platform

1. Connecter le repository GitHub
2. DigitalOcean détecte automatiquement le `Dockerfile`
3. Configurer les variables d'environnement
4. Déployer

---

### Sécurité Docker

#### Bonnes Pratiques

✅ **Utilisateur non-root** : Le conteneur tourne avec l'utilisateur `nextjs` (UID 1001)
✅ **Secrets** : Jamais commiter `.env` ou secrets dans Git
✅ **HTTPS** : Toujours utiliser SSL en production (via reverse proxy)
✅ **Firewall** : Limiter l'accès au port 3000 (uniquement reverse proxy)
✅ **Updates** : Mettre à jour régulièrement l'image de base

#### Scan de Vulnérabilités

```bash
# Avec Docker Scout
docker scout cves portfolio-app:latest

# Avec Trivy
trivy image portfolio-app:latest
```

---

### CI/CD avec GitHub Actions

**Fichier `.github/workflows/docker.yml`** :

```yaml
name: Docker Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: user/portfolio-app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### Sauvegarde et Restauration

#### Backup

```bash
# Créer une sauvegarde des données
tar -czf backup-$(date +%Y%m%d).tar.gz data/ public/images/

# Avec Docker volumes
docker run --rm \
  -v portfolio_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

#### Restore

```bash
# Restaurer depuis backup
tar -xzf backup-20260209.tar.gz

# Redémarrer le conteneur
docker compose restart app
```

---

### Monitoring (Optionnel)

#### Prometheus + Grafana

Ajouter au `docker-compose.yml` :

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### Commandes Docker Utiles

```bash
# Voir les logs
docker compose logs -f app

# Redémarrer
docker compose restart app

# Rebuild après changements
docker compose up -d --build

# Voir les ressources utilisées
docker stats portfolio-app

# Entrer dans le conteneur
docker compose exec app sh

# Supprimer images inutilisées
docker image prune -a
```

---

## 🚀 Déploiement sur VPS

### 1. Préparer le VPS

```bash
# SSH dans votre VPS
ssh user@votre-vps.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt-get install docker-compose-plugin
```

### 2. Déployer le portfolio

```bash
# Cloner sur le VPS
git clone https://github.com/VOTRE_USERNAME/portfolio.git
cd portfolio

# Configurer avec le script
./scripts/setup-first-deploy.sh

# Ou manuellement
cp .env.example .env.production
# Éditer .env.production
docker compose up --build -d
```

### 3. Configurer le DNS

Pointez votre domaine vers l'IP du VPS :
```
Type A : @ → IP_DU_VPS
Type A : www → IP_DU_VPS
```

---

## 🔍 Troubleshooting

### Le build Docker est très long

**Normal pour le premier build** (8-10 minutes). Les builds suivants utilisent le cache et sont beaucoup plus rapides (30-60s).

Pour voir la progression :
```bash
docker compose logs -f
```

### Erreur "network traefik not found"

Vous devez créer le réseau Traefik :
```bash
docker network create traefik
```

### Base de données vide après démarrage

Vérifiez les logs du conteneur `db-init` :
```bash
docker compose logs db-init
```

Le seed devrait s'exécuter automatiquement si la DB est vide.

### Impossible de se connecter à l'admin

Vérifiez :
1. Que le fichier `.env` contient `ADMIN_PASSWORD`
2. Que vous utilisez le bon mot de passe
3. Les logs de l'application : `docker compose logs app`

### Port 3000 déjà utilisé (dev)

Modifiez le port dans `docker-compose.dev.yml` :
```yaml
ports:
  - "3001:3000"  # Au lieu de 3000:3000
```

### Migration Prisma échoue

Vérifiez que :
1. PostgreSQL est bien démarré : `docker compose logs db`
2. `DATABASE_URL` est correcte dans `.env`
3. Le conteneur `db-init` a terminé : `docker compose ps`

Pour forcer une réinitialisation :
```bash
docker compose down -v
docker compose up --build -d
```

---

## 📚 Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Traefik](https://doc.traefik.io/traefik/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)

---

## 🆘 Support

Pour toute question ou problème :

1. Consultez d'abord cette documentation
2. Vérifiez les [Issues GitHub](https://github.com/VOTRE_USERNAME/portfolio/issues)
3. Ouvrez une nouvelle issue si nécessaire

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**🎉 Félicitations ! Votre portfolio est maintenant déployé !**
