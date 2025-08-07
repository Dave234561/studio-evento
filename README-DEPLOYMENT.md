# 🚀 GUIDE DE DÉPLOIEMENT - STUDIO EVENTO

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement de Studio Evento sur GitHub et Vercel.

## 🔧 Prérequis

- [Node.js](https://nodejs.org/) 18+ installé
- [Git](https://git-scm.com/) installé
- Compte [GitHub](https://github.com/)
- Compte [Vercel](https://vercel.com/)
- Clés API configurées (voir section Variables d'environnement)

## 📁 Structure du projet

```
studio-evento-unified/
├── src/                    # Code source Next.js
├── public/                 # Pages statiques HTML
├── .env.local             # Variables d'environnement (local)
├── .env.example           # Template des variables
├── vercel.json            # Configuration Vercel
├── .gitignore             # Fichiers ignorés par Git
└── README-DEPLOYMENT.md   # Ce guide
```

## 🔐 Configuration des variables d'environnement

### 1. Variables locales (.env.local)

Copiez `.env.example` vers `.env.local` et remplissez vos clés :

```bash
cp .env.example .env.local
```

### 2. Variables obligatoires

```env
# APIs IA (OBLIGATOIRES)
ANTHROPIC_API_KEY=sk-ant-...          # Claude 3.5 Sonnet
OPENAI_API_KEY=sk-...                 # GPT-4 et DALL-E 3

# Supabase (persistance données)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Firebase (authentification)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

### 3. Variables optionnelles

```env
# Recherche web
SERPER_API_KEY=...                    # Optionnel

# Cache Redis
REDIS_URL=                            # Optionnel (laisser vide)
```

## 🌐 Déploiement sur Vercel

### Méthode 1 : Via GitHub (Recommandée)

1. **Initialiser Git**
```bash
git init
git add .
git commit -m "Initial commit - Studio Evento"
```

2. **Créer dépôt GitHub**
```bash
# Créer le dépôt sur github.com puis :
git remote add origin https://github.com/USERNAME/studio-evento.git
git push -u origin main
```

3. **Connecter à Vercel**
- Aller sur [vercel.com](https://vercel.com)
- Cliquer "New Project"
- Importer votre dépôt GitHub
- Vercel détecte automatiquement Next.js

4. **Configurer variables d'environnement**
- Dans Vercel Dashboard → Settings → Environment Variables
- Ajouter toutes les variables de `.env.example`
- ⚠️ **IMPORTANT** : Exclure les variables commençant par `NEXT_PUBLIC_` si elles contiennent des secrets

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Suivre les instructions interactives
```

## 🔍 Variables d'environnement Vercel

Dans le dashboard Vercel, ajouter :

| Variable | Valeur | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude 3.5 Sonnet |
| `OPENAI_API_KEY` | `sk-...` | GPT-4 & DALL-E 3 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...` | URL publique Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Clé anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Clé service Supabase |
| `NEXT_PUBLIC_FIREBASE_*` | ... | Config Firebase publique |
| `FIREBASE_ADMIN_*` | ... | Config Firebase Admin |
| `SERPER_API_KEY` | ... | (Optionnel) Recherche web |

## ⚙️ Configuration post-déploiement

### 1. Vérifier les URLs d'accès

- **App principale** : `https://your-app.vercel.app/studio-evento.html`
- **Interface admin** : `https://your-app.vercel.app/admin`
- **Chat** : `https://your-app.vercel.app/chat`

### 2. Tester les fonctionnalités

1. Authentification Firebase
2. Connexion aux APIs IA
3. Sauvegarde Supabase
4. Génération d'images DALL-E 3
5. Recherche de lieux (14K+ venues)

### 3. Configuration Firebase

Ajouter le domaine Vercel dans Firebase Console :
- Authentication → Settings → Authorized domains
- Ajouter : `your-app.vercel.app`

## 🛠️ Commandes de développement

```bash
# Installation
npm install

# Développement local
npm run dev                # Port 3000

# Build de production
npm run build

# Test du build
npm start

# Vérification des types
npm run type-check

# Linting
npm run lint
```

## 🐛 Dépannage

### Erreurs courantes

1. **Build failed: Module not found**
```bash
# Vérifier les dépendances
npm install
npm run type-check
```

2. **API errors in production**
- Vérifier les variables d'environnement Vercel
- Vérifier les quotas API (Anthropic/OpenAI)
- Consulter les logs Vercel

3. **Authentication issues**
- Vérifier la configuration Firebase
- Ajouter le domaine Vercel aux domaines autorisés

4. **Database connection errors**
- Vérifier les clés Supabase
- Vérifier que les tables existent (voir CLAUDE.md)

### Logs et monitoring

- **Vercel logs** : `vercel logs https://your-app.vercel.app`
- **Logs en temps réel** : Dashboard Vercel → Functions tab
- **Monitoring** : Vercel Analytics (optionnel)

## 📊 Performance et optimisation

### Recommandations Vercel

- **Région** : CDG1 (Paris) configurée dans `vercel.json`
- **Functions** : Node.js 20.x
- **Cache** : Headers optimisés pour les assets statiques
- **Security** : Headers de sécurité configurés

### Monitoring

1. **Métriques Vercel**
   - Temps de réponse des APIs
   - Usage bandwidth
   - Erreurs 4xx/5xx

2. **Métriques IA**
   - Tokens consommés (Anthropic/OpenAI)
   - Latence des réponses
   - Taux d'erreur API

## 🔄 Mises à jour

### Déploiement continu

1. Push vers GitHub
2. Vercel déploie automatiquement
3. Vérification des tests (si configurés)
4. Mise en production

### Rollback

```bash
# Via Vercel CLI
vercel rollback https://your-app.vercel.app

# Ou via le Dashboard Vercel
```

## 🎯 URLs finales

Après déploiement, votre application sera accessible :

- **🏠 Application principale** : `https://your-app.vercel.app/studio-evento.html`
- **⚙️ Interface admin** : `https://your-app.vercel.app/admin`
- **💬 Chat orchestrateur** : `https://your-app.vercel.app/chat`
- **🔌 API Health Check** : `https://your-app.vercel.app/api/health`

## 📞 Support

- **Documentation** : Voir `CLAUDE.md`
- **Issues** : Logs Vercel Dashboard
- **Performance** : Vercel Analytics

---

**🎉 Studio Evento est maintenant déployé et prêt à révolutionner l'événementiel avec l'IA !**