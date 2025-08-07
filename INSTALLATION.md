# 🚀 EventAI Pro - Guide d'Installation

## ✅ Prérequis

### Système
- **Node.js 18+** (recommandé: 18.17.0 ou plus récent)
- **npm 9+** ou **yarn 3+**
- **PostgreSQL 15+**
- **Redis 7+**

### Clés API
- **Anthropic API Key** (Claude Sonnet 4 & Opus 4)
- Compte Anthropic avec accès aux modèles Claude

## 📦 Installation Rapide

### Option 1: Script d'Installation Automatique

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Installation complète locale
./deploy.sh local

# Ou installation pour développement
./deploy.sh dev

# Ou déploiement Docker
./deploy.sh docker
```

### Option 2: Installation Manuelle

1. **Cloner et installer les dépendances**
```bash
git clone <repository-url>
cd eventai-pro
npm install
```

2. **Configuration environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Configuration base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Synchroniser le schéma
npx prisma db push

# (Optionnel) Données de démonstration
npx prisma db seed
```

4. **Démarrer l'application**
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# === ANTHROPIC API ===
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# === DATABASE ===
DATABASE_URL="postgresql://username:password@localhost:5432/eventai_pro"

# === REDIS ===
REDIS_URL="redis://localhost:6379"

# === AUTHENTICATION ===
NEXTAUTH_SECRET=your_very_secure_secret_here
NEXTAUTH_URL=http://localhost:3000

# === ENVIRONMENT ===
NODE_ENV=development
```

### Configuration Anthropic

1. **Créer un compte Anthropic** sur [console.anthropic.com](https://console.anthropic.com)
2. **Générer une clé API** dans les paramètres
3. **Vérifier l'accès** aux modèles Claude Sonnet 4 et Opus 4
4. **Configurer les limites** de taux selon vos besoins

### Configuration Base de Données

#### PostgreSQL Local

```bash
# Installation PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE eventai_pro;
CREATE USER eventai WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eventai_pro TO eventai;
\q
```

#### PostgreSQL avec Docker

```bash
docker run --name eventai-postgres \
  -e POSTGRES_DB=eventai_pro \
  -e POSTGRES_USER=eventai \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### Configuration Redis

#### Redis Local

```bash
# Installation Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Démarrer Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Redis avec Docker

```bash
docker run --name eventai-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

## 🐳 Déploiement Docker

### Docker Compose (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Services Disponibles

- **Application** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379
- **PgAdmin** : http://localhost:5050 (admin@eventai.com / admin123)

### Build Manuel

```bash
# Construire l'image
docker build -t eventai-pro .

# Démarrer le conteneur
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e DATABASE_URL=your_db_url \
  -e REDIS_URL=your_redis_url \
  eventai-pro
```

## 🔍 Vérification de l'Installation

### Tests de Base

```bash
# Vérifier les dépendances
npm run type-check

# Vérifier le build
npm run build

# Tester la connexion DB
npx prisma db push --accept-data-loss

# Lancer les tests
npm test
```

### Health Check

```bash
# Utiliser le script de vérification
./deploy.sh health

# Ou vérification manuelle
curl -f http://localhost:3000/api/health
```

### Tests des Agents

1. **Ouvrir** http://localhost:3000
2. **Cliquer** sur "Commencer"
3. **Tester** une requête simple : "Bonjour, pouvez-vous m'aider ?"
4. **Vérifier** que l'agent Orchestrateur répond correctement

## 📊 Monitoring

### Logs Application

```bash
# Logs en temps réel
npm run dev

# Logs Docker
docker-compose logs -f app

# Logs spécifiques
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Métriques

- **Utilisation tokens** : Visible dans l'interface chat
- **Latence agents** : Affichée sous chaque réponse
- **Cache hit rate** : Logs serveur

### Base de Données

```bash
# Accéder à la base de données
npx prisma studio

# Ou avec PgAdmin
# http://localhost:5050
```

## 🔧 Développement

### Structure du Projet

```
eventai-pro/
├── src/
│   ├── app/                 # Pages Next.js 14
│   │   ├── api/            # API routes
│   │   ├── chat/           # Interface de chat
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants React
│   │   └── ui/            # Composants UI
│   ├── lib/               # Bibliothèques
│   │   ├── anthropic.ts   # Client Anthropic
│   │   ├── orchestrator.ts # Orchestrateur
│   │   ├── prisma.ts      # Client DB
│   │   └── redis.ts       # Client Redis
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Migrations
├── docker-compose.yml     # Configuration Docker
├── Dockerfile            # Image Docker
└── deploy.sh            # Script de déploiement
```

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build production
npm run start           # Serveur production
npm run lint            # Linting
npm run type-check      # Vérification types

# Base de données
npm run db:migrate      # Migrations
npm run db:generate     # Générer client Prisma
npm run db:push         # Synchroniser schéma
npm run db:studio       # Interface graphique
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. Erreur de connexion Anthropic

```bash
# Vérifier la clé API
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/messages
```

**Solution** : Vérifier que votre clé API est valide et a accès aux modèles Claude

#### 2. Erreur de base de données

```bash
# Vérifier la connexion
npx prisma db push --accept-data-loss
```

**Solution** : Vérifier que PostgreSQL est démarré et accessible

#### 3. Erreur Redis

```bash
# Tester la connexion Redis
redis-cli ping
```

**Solution** : Vérifier que Redis est démarré

#### 4. Problèmes de build

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Logs de Debug

```bash
# Activer les logs détaillés
NODE_ENV=development npm run dev

# Logs Prisma
DEBUG=prisma:* npm run dev

# Logs Redis
DEBUG=redis:* npm run dev
```

## 🆘 Support

### Ressources
- **Documentation** : README.md
- **Issues** : GitHub Issues
- **Logs** : Vérifier les logs serveur

### Commandes de Diagnostic

```bash
# Vérifier l'état des services
./deploy.sh health

# Vérifier les versions
node --version
npm --version
npx prisma --version

# Vérifier la configuration
npm run type-check
```

## 🎯 Prochaines Étapes

1. **Tester l'application** avec des requêtes simples
2. **Configurer** les paramètres selon vos besoins
3. **Personnaliser** les prompts des agents
4. **Optimiser** les performances selon votre usage
5. **Déployer** en production

---

**EventAI Pro** est maintenant prêt à révolutionner vos événements ! 🚀