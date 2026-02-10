#!/bin/bash
set -e

# Navigation vers la racine du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🚀 Portfolio - Installation Interactive 🚀         ║
║                                                           ║
║     Configuration du premier déploiement                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier les dépendances
echo -e "${YELLOW}⚙️  Vérification des dépendances...${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker n'est pas installé. Installez Docker d'abord : https://docs.docker.com/get-docker/${NC}"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose n'est pas installé.${NC}"; exit 1; }

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}\n"

# Détection de l'environnement
echo -e "${BLUE}📋 Quel environnement souhaitez-vous configurer ?${NC}"
echo "  1) Développement local (docker-compose.dev.yml)"
echo "  2) Production (docker-compose.yml avec Traefik)"
read -p "Choix [1/2]: " ENV_CHOICE

if [ "$ENV_CHOICE" == "2" ]; then
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.production"
    IS_PROD=true
    echo -e "${GREEN}✅ Mode Production sélectionné${NC}\n"
else
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_FILE=".env"
    IS_PROD=false
    echo -e "${GREEN}✅ Mode Développement sélectionné${NC}\n"
fi

# Collecte des informations du propriétaire du site
echo -e "${BLUE}👤 Informations du propriétaire du site${NC}"
echo -e "${YELLOW}Ces informations seront utilisées pour créer votre profil dans la base de données${NC}\n"

read -p "Prénom : " OWNER_FIRST_NAME
read -p "Nom : " OWNER_LAST_NAME
read -p "Email : " OWNER_EMAIL
read -p "Titre/Rôle (ex: Full-Stack Developer) : " OWNER_TITLE
read -p "Bio courte (1-2 lignes) : " OWNER_BIO
read -p "Avatar URL (laisser vide pour utiliser Gravatar) : " OWNER_AVATAR

# Configuration de l'application
echo -e "\n${BLUE}🌐 Configuration de l'application${NC}"

if [ "$IS_PROD" = true ]; then
    read -p "Nom de domaine (ex: portfolio.com) : " SITE_DOMAIN
    SITE_URL="https://${SITE_DOMAIN}"
else
    SITE_URL="http://localhost:3000"
    echo -e "${GREEN}URL du site : ${SITE_URL}${NC}"
fi

# Génération du mot de passe admin
echo -e "\n${BLUE}🔐 Configuration de l'authentification admin${NC}"
read -sp "Mot de passe admin : " ADMIN_PASSWORD
echo
read -sp "Confirmer le mot de passe : " ADMIN_PASSWORD_CONFIRM
echo

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Les mots de passe ne correspondent pas${NC}"
    exit 1
fi

# Génération de AUTH_SECRET (32 caractères aléatoires)
AUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Configuration de la base de données
echo -e "\n${BLUE}🗄️  Configuration de la base de données${NC}"

if [ "$IS_PROD" = true ]; then
    read -p "Utiliser PostgreSQL dans Docker ? [O/n] : " USE_DOCKER_DB
    if [[ "$USE_DOCKER_DB" =~ ^[Nn]$ ]]; then
        read -p "Host PostgreSQL : " DB_HOST
        read -p "Port PostgreSQL [5432] : " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        read -p "Nom de la base de données : " DB_NAME
        read -p "Utilisateur PostgreSQL : " DB_USER
        read -sp "Mot de passe PostgreSQL : " DB_PASSWORD
        echo
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    else
        DB_USER="postgres"
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/")
        DB_NAME="portfolio"
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}"
    fi
else
    DB_USER="postgres"
    DB_PASSWORD="postgres"
    DB_NAME="portfolio"
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}"
fi

# Configuration GitHub (optionnel)
echo -e "\n${BLUE}🐙 Configuration GitHub (optionnel)${NC}"
echo -e "${YELLOW}Permet la publication automatique de contenu via l'admin${NC}"
read -p "Configurer GitHub maintenant ? [o/N] : " CONFIG_GITHUB

if [[ "$CONFIG_GITHUB" =~ ^[Oo]$ ]]; then
    read -p "GitHub Personal Access Token : " GITHUB_TOKEN
    read -p "GitHub Owner/Organisation : " GITHUB_OWNER
    read -p "GitHub Repository : " GITHUB_REPO
    read -p "GitHub Branch [main] : " GITHUB_BRANCH
    GITHUB_BRANCH=${GITHUB_BRANCH:-main}
    read -p "Nom de l'auteur Git [Portfolio Admin] : " GIT_AUTHOR_NAME
    GIT_AUTHOR_NAME=${GIT_AUTHOR_NAME:-Portfolio Admin}
    read -p "Email de l'auteur Git [admin@portfolio.local] : " GIT_AUTHOR_EMAIL
    GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL:-admin@portfolio.local}
else
    GITHUB_TOKEN=""
    GITHUB_OWNER=""
    GITHUB_REPO=""
    GITHUB_BRANCH="main"
    GIT_AUTHOR_NAME="Portfolio Admin"
    GIT_AUTHOR_EMAIL="admin@portfolio.local"
fi

# Configuration Mailchimp (optionnel)
echo -e "\n${BLUE}📧 Configuration Mailchimp (optionnel)${NC}"
read -p "Configurer Mailchimp maintenant ? [o/N] : " CONFIG_MAILCHIMP

if [[ "$CONFIG_MAILCHIMP" =~ ^[Oo]$ ]]; then
    read -p "Mailchimp Action URL : " MAILCHIMP_ACTION_URL
    read -p "Mailchimp User ID : " MAILCHIMP_USER_ID
    read -p "Mailchimp Form ID : " MAILCHIMP_FORM_ID
else
    MAILCHIMP_ACTION_URL=""
    MAILCHIMP_USER_ID=""
    MAILCHIMP_FORM_ID=""
fi

# Création du fichier .env
echo -e "\n${YELLOW}📝 Création du fichier ${ENV_FILE}...${NC}"

cat > "$ENV_FILE" << EOF
# Configuration générée par setup-first-deploy.sh
# Date: $(date)

# Application
NODE_ENV=${IS_PROD:+production}${IS_PROD:-development}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_TELEMETRY_DISABLED=1

# Authentification
ADMIN_PASSWORD=${ADMIN_PASSWORD}
AUTH_SECRET=${AUTH_SECRET}

# Base de données
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=${DB_NAME}
DATABASE_URL=${DATABASE_URL}

# GitHub (Publication automatique)
GITHUB_TOKEN=${GITHUB_TOKEN}
GITHUB_OWNER=${GITHUB_OWNER}
GITHUB_REPO=${GITHUB_REPO}
GITHUB_BRANCH=${GITHUB_BRANCH}
GIT_AUTHOR_NAME=${GIT_AUTHOR_NAME}
GIT_AUTHOR_EMAIL=${GIT_AUTHOR_EMAIL}

# Mailchimp (Newsletter)
NEXT_PUBLIC_MAILCHIMP_ACTION_URL=${MAILCHIMP_ACTION_URL}
NEXT_PUBLIC_MAILCHIMP_USER_ID=${MAILCHIMP_USER_ID}
NEXT_PUBLIC_MAILCHIMP_FORM_ID=${MAILCHIMP_FORM_ID}
EOF

echo -e "${GREEN}✅ Fichier ${ENV_FILE} créé${NC}"

# Génération du seed SQL personnalisé
echo -e "\n${YELLOW}📝 Personnalisation du seed SQL avec vos informations...${NC}"

# Créer un backup du seed original
cp prisma/seed.sql prisma/seed.sql.backup

# Remplacer les valeurs dans le seed SQL
sed -i.tmp "s/INSERT INTO \"Person\" (\"id\", \"firstName\", \"lastName\", \"role\", \"avatar\", \"location\", \"languages\", \"bio\", \"isSiteOwner\", \"createdAt\", \"updatedAt\") VALUES ('1', 'Max', 'Dinodev', 'Full-Stack Developer & UX Designer'/INSERT INTO \"Person\" (\"id\", \"firstName\", \"lastName\", \"role\", \"avatar\", \"location\", \"languages\", \"bio\", \"isSiteOwner\", \"createdAt\", \"updatedAt\") VALUES ('1', '${OWNER_FIRST_NAME}', '${OWNER_LAST_NAME}', '${OWNER_TITLE}'/" prisma/seed.sql

if [ -n "$OWNER_AVATAR" ]; then
    sed -i.tmp "s|'https://avatar.vercel.sh/max'|'${OWNER_AVATAR}'|" prisma/seed.sql
fi

# Nettoyer les fichiers temporaires
rm -f prisma/seed.sql.tmp

echo -e "${GREEN}✅ Seed SQL personnalisé${NC}"

# Récapitulatif
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               📋 RÉCAPITULATIF                            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}Environnement   :${NC} ${IS_PROD:+Production}${IS_PROD:-Développement}"
echo -e "${GREEN}Fichier compose :${NC} ${COMPOSE_FILE}"
echo -e "${GREEN}URL du site     :${NC} ${SITE_URL}"
echo -e "${GREEN}Base de données :${NC} ${DB_NAME}"
echo -e "${GREEN}Propriétaire    :${NC} ${OWNER_FIRST_NAME} ${OWNER_LAST_NAME}"
echo -e "${GREEN}Email           :${NC} ${OWNER_EMAIL}"

# Lancement
echo -e "\n${BLUE}🚀 Prêt à lancer le déploiement ?${NC}"
read -p "Lancer docker compose maintenant ? [O/n] : " LAUNCH_NOW

if [[ ! "$LAUNCH_NOW" =~ ^[Nn]$ ]]; then
    echo -e "\n${YELLOW}🐳 Lancement de Docker Compose...${NC}"

    # Nettoyer l'ancien environnement
    docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true

    # Lancer le build et démarrage
    docker compose -f "$COMPOSE_FILE" up --build -d

    echo -e "\n${GREEN}✅ Déploiement lancé avec succès !${NC}"
    echo -e "\n${BLUE}📊 Suivre les logs :${NC}"
    echo -e "   docker compose -f ${COMPOSE_FILE} logs -f"
    echo -e "\n${BLUE}🌐 Accéder à l'application :${NC}"
    echo -e "   ${SITE_URL}"
    echo -e "\n${BLUE}🔐 Connexion admin :${NC}"
    echo -e "   ${SITE_URL}/admin"
    echo -e "   Email: ${OWNER_EMAIL}"
    echo -e "   Mot de passe: (celui que vous avez défini)"
else
    echo -e "\n${YELLOW}Configuration terminée. Pour démarrer plus tard :${NC}"
    echo -e "   docker compose -f ${COMPOSE_FILE} up --build -d"
fi

echo -e "\n${GREEN}🎉 Installation terminée !${NC}\n"
