# 🔧 Guide de Configuration EventAI Pro

## ✅ Fichier .env Créé

J'ai créé le fichier `.env` avec les variables nécessaires. **Vous devez maintenant compléter la configuration** :

## 📋 Étapes de Configuration

### 1. **Nouvelle Clé API Anthropic** 🚨

**URGENT** : Votre ancienne clé a été exposée publiquement !

1. **Aller** sur [console.anthropic.com](https://console.anthropic.com)
2. **Se connecter** à votre compte
3. **Aller** dans "API Keys"
4. **Supprimer** l'ancienne clé si elle existe
5. **Créer** une nouvelle clé
6. **Remplacer** dans `.env` :
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-VOTRE-NOUVELLE-CLE-ICI
   ```

### 2. **Créer Projet Supabase**

1. **Aller** sur [supabase.com](https://supabase.com)
2. **Créer** un compte gratuit
3. **Nouveau projet** :
   - Nom : `eventai-pro`
   - Mot de passe : **NOTEZ-LE** (vous en aurez besoin)
   - Région : Europe (recommandé)

### 3. **Récupérer les Clés Supabase**

Dans votre projet Supabase :

1. **Aller** dans "Settings" → "API"
2. **Copier** et remplacer dans `.env` :

```env
# Project URL
SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co

# anon public key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXX

# service_role key  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXX
```

### 4. **URL Base de Données**

Dans Supabase → "Settings" → "Database" :

1. **Trouver** "Connection string"
2. **Copier** l'URL PostgreSQL
3. **Remplacer** `[YOUR-PASSWORD]` par votre mot de passe
4. **Mettre à jour** dans `.env` :

```env
DATABASE_URL="postgresql://postgres:VOTRE-MOT-DE-PASSE@db.XXXXXXXXXXXX.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:VOTRE-MOT-DE-PASSE@db.XXXXXXXXXXXX.supabase.co:5432/postgres"
```

## 🚀 Test de Configuration

Une fois configuré, testez :

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Créer les tables dans Supabase
npx prisma db push

# 4. Démarrer l'application
npm run dev
```

## ✅ Configuration Actuelle

Votre fichier `.env` contient déjà :
- ✅ **NEXTAUTH_SECRET** : Généré automatiquement
- ✅ **NEXTAUTH_URL** : Configuré pour le développement
- ✅ **NODE_ENV** : Configuré pour le développement
- ✅ **REDIS_URL** : Configuré (optionnel)

## 🆘 À Compléter

- ❌ **ANTHROPIC_API_KEY** : Nouvelle clé requise
- ❌ **SUPABASE_URL** : Projet Supabase requis
- ❌ **SUPABASE_ANON_KEY** : Clé Supabase requise
- ❌ **SUPABASE_SERVICE_ROLE_KEY** : Clé Supabase requise
- ❌ **DATABASE_URL** : URL Supabase requise
- ❌ **DIRECT_URL** : URL Supabase requise

## 🔒 Sécurité

- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Les clés ne seront pas commitées
- ✅ NEXTAUTH_SECRET généré de manière sécurisée

Une fois ces étapes terminées, votre EventAI Pro sera prêt ! 🎉