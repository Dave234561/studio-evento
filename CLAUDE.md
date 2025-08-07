# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 🎬 STUDIO EVENTO - GUIDE D'INITIALISATION COMPLÈTE

## 📋 PRÉSENTATION

Studio Evento (EventAI Pro) est une plateforme d'intelligence artificielle spécialisée dans l'événementiel, comprenant :
- **Application principale** : Interface utilisateur avec parcours différenciés selon le profil utilisateur
- **Interface d'administration** : Gestion des agents IA et leurs prompts 
- **Chat orchestrateur** : Communication directe avec l'IA centrale
- **Agents spécialisés** : Système multi-agents pour tous les aspects événementiels

## 🏗️ ARCHITECTURE TECHNIQUE

### **Frontend**
- **Framework** : Next.js 14.2.3 avec App Router + TypeScript
- **Styling** : Tailwind CSS + Radix UI components + CSS modules
- **Interface** : React components avec hooks
- **Authentification** : Firebase Auth intégré dans les pages statiques
- **Animations** : Framer Motion
- **Pages statiques** : HTML/CSS/JS dans `/public` pour l'interface principale

### **Backend**
- **APIs** : Next.js API routes
- **Agents IA** : Claude 3.5 Sonnet, GPT-4, DALL-E 3 via Anthropic SDK
- **Base de données** : Supabase PostgreSQL + Prisma ORM
- **Cache** : Redis (optionnel)
- **Services** : Orchestrateur central + agents spécialisés

### **Architecture Multi-Agents**
L'application utilise un système d'orchestration centrale qui coordonne 12 agents spécialisés :

**Orchestrateur Central** (`src/lib/agents/orchestrator.ts`) :
- Analyse les demandes utilisateur
- Route vers les agents appropriés 
- Synthétise les réponses multi-agents
- Maintient le contexte conversationnel

**Agents Spécialisés** :
- **Concept** : Création créative et storytelling
- **Venue** : Recherche de lieux (14,000+ venues)
- **Visual Identity** : Génération d'images DALL-E 3
- **Animation** : Catalogue d'activités événementielles
- **Budget/ROI/Risk** : Analyses financières et risques
- **Carbon** : Éco-conception événementielle
- **Brief** : Génération de cahiers des charges

**Services Transversaux** (`src/lib/services/`) :
- `venueService.ts` : Recherche dans la base de lieux
- `animationService.ts` : Catalogue d'animations
- `agentConfigService.ts` : Configuration dynamique des agents
- `mcpSearchService.ts` : Recherche web contextuelle

### **Déploiement**
- **Développement** : npm run dev (port 3000)
- **Production** : npm run build + npm start
- **Déploiement** : Compatible Vercel, Netlify, serveurs VPS

## 🚀 INSTALLATION ET DÉMARRAGE

### **1. Prérequis**
```bash
# Node.js 18+ et npm
node --version  # v18.0.0+
npm --version   # 8.0.0+
```

### **2. Installation des dépendances**
```bash
cd studio-evento-unified
npm install
```

### **3. Configuration des variables d'environnement**
Créer/modifier le fichier `.env.local` :
```env
# APIs IA (OBLIGATOIRES)
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
OPENAI_API_BASE=https://api.openai.com/v1

# Recherche web (OPTIONNEL)
SERPER_API_KEY=your_serper_key_here

# Supabase (OBLIGATOIRE pour persistance)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Auth (OBLIGATOIRE pour authentification)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"

# Redis (OPTIONNEL - désactivé par défaut)
REDIS_URL=""
```

### **4. Démarrage de l'application**
```bash
# Mode développement
npm run dev

# L'application sera accessible sur :
# - App principale : http://localhost:3000/studio-evento.html
# - Interface admin : http://localhost:3000/admin
# - Chat : http://localhost:3000/chat
```

## 🛠️ COMMANDES DE DÉVELOPPEMENT

### **Commandes principales**
```bash
# Développement avec hot reload
npm run dev

# Build de production
npm run build

# Démarrage production
npm start

# Linting
npm run lint

# Vérification des types TypeScript
npm run type-check
```

### **Base de données (Prisma)**
```bash
# Générer le client Prisma
npm run db:generate

# Migrations de développement
npm run db:migrate

# Push du schéma (pour prototypage)
npm run db:push

# Interface graphique de la DB
npm run db:studio
```

## 🎯 MODULES ET FONCTIONNALITÉS

### **📱 APPLICATION PRINCIPALE**
**URL** : `/studio-evento.html`

**9 Modules disponibles :**
1. **🎨 Conception créative** - Concepts innovants et storytelling
2. **🏢 Recherche de lieux** - Base de 14,000 lieux événementiels
3. **💰 Analyse ROI** - Calculs financiers et métriques
4. **🎨 Identité visuelle** - Génération DALL-E 3 (3 propositions)
5. **🎪 Recherche d'animations** - Catalogue d'activités
6. **💰 Gestion budgétaire** - Optimisation des coûts
7. **🌱 Éco-conception** - Événementiel responsable
8. **📋 Cahier des charges** - Briefs professionnels
9. **⚠️ Gestion des risques** - Sécurité événementielle

### **🔧 INTERFACE D'ADMINISTRATION**
**URL** : `/admin`
**Authentification** : cherubindavid@gmail.com

**12 Agents configurables :**
1. **🎭 ORCHESTRATEUR** - Coordination centrale (Claude 3.5 Sonnet)
2. **🎨 CONCEPT** - Création créative (Claude 3.5 Sonnet)
3. **🏢 VENUE** - Recherche lieux (Claude 3.5 Sonnet)
4. **💰 ROI** - Analyse financière (Claude 3.5 Sonnet)
5. **🎨 VISUAL_IDENTITY** - Identité visuelle (DALL-E 3)
6. **🎪 ANIMATION** - Recherche animations (GPT-4)
7. **💰 BUDGET** - Gestion budgétaire (Claude 3.5 Sonnet)
8. **🌱 CARBON** - Éco-conception (Claude 3.5 Sonnet)
9. **🎨 DESIGN** - Direction artistique (Claude 3.5 Sonnet)
10. **⚠️ RISK** - Gestion risques (Claude 3.5 Sonnet)
11. **📋 BRIEF** - Cahiers des charges (Claude 3.5 Sonnet)
12. **🧪 TEST** - Agent de test (Claude 3.5 Sonnet)

**Fonctionnalités admin :**
- Modification des prompts système en temps réel
- Configuration des paramètres IA (modèle, température, tokens)
- Sauvegarde locale ou Supabase
- Interface moderne et responsive

### **💬 CHAT ORCHESTRATEUR**
**URL** : `/chat`

Interface de communication directe avec l'orchestrateur central pour :
- Analyse de demandes complexes
- Coordination multi-agents
- Conseils stratégiques globaux

## 🗄️ CONFIGURATION SUPABASE (OPTIONNEL)

### **1. Créer un projet Supabase**
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les clés API

### **2. Exécuter les scripts SQL**
```sql
-- Table des prompts des agents
CREATE TABLE agent_prompts (
  id SERIAL PRIMARY KEY,
  agent_type VARCHAR(50) UNIQUE NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  model VARCHAR(50) NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 3000,
  system_prompt TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs admin
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer l'utilisateur admin autorisé
INSERT INTO admin_users (email) VALUES ('cherubindavid@gmail.com');

-- Insérer les agents par défaut
INSERT INTO agent_prompts (agent_type, agent_name, model, temperature, max_tokens, system_prompt, description) VALUES
('orchestrator', 'ORCHESTRATEUR', 'claude-3-5-sonnet-20241022', 0.3, 4000, 'Tu es l''orchestrateur central de Studio Evento...', 'Agent central de coordination'),
('concept', 'CONCEPT', 'claude-3-5-sonnet-20241022', 0.7, 3000, 'Tu es l''agent CONCEPT de Studio Evento...', 'Création de concepts créatifs'),
('venue', 'VENUE', 'claude-3-5-sonnet-20241022', 0.2, 2000, 'Tu es l''agent VENUE de Studio Evento...', 'Recherche de lieux'),
('roi', 'ROI', 'claude-3-5-sonnet-20241022', 0.1, 2500, 'Tu es l''agent ROI de Studio Evento...', 'Analyse ROI'),
('visual-identity', 'VISUAL_IDENTITY', 'dall-e-3', 0.8, 1000, 'Tu es l''agent VISUAL_IDENTITY...', 'Identité visuelle'),
('animation', 'ANIMATION', 'gpt-4', 0.7, 3000, 'Tu es l''agent ANIMATION...', 'Recherche animations'),
('budget', 'BUDGET', 'claude-3-5-sonnet-20241022', 0.3, 2000, 'Tu es l''agent BUDGET...', 'Gestion budgétaire'),
('carbon', 'CARBON', 'claude-3-5-sonnet-20241022', 0.5, 2500, 'Tu es l''agent CARBON...', 'Éco-conception'),
('design', 'DESIGN', 'claude-3-5-sonnet-20241022', 0.6, 2500, 'Tu es l''agent DESIGN...', 'Direction artistique'),
('risk', 'RISK', 'claude-3-5-sonnet-20241022', 0.4, 2000, 'Tu es l''agent RISK...', 'Gestion des risques'),
('brief', 'BRIEF', 'claude-3-5-sonnet-20241022', 0.3, 3000, 'Tu es l''agent BRIEF...', 'Cahiers des charges'),
('test', 'TEST', 'claude-3-5-sonnet-20241022', 0.5, 1000, 'Tu es l''agent TEST...', 'Agent de test');
```

### **3. Configurer les variables d'environnement**
Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔧 DÉVELOPPEMENT ET PERSONNALISATION

### **Structure du projet**
```
studio-evento-unified/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── admin/             # Interface d'administration
│   │   ├── chat/              # Chat orchestrateur
│   │   ├── modules/           # Pages des modules
│   │   └── api/               # API routes
│   ├── lib/
│   │   ├── agents/            # Agents IA
│   │   ├── services/          # Services (Supabase, MCP)
│   │   └── utils/             # Utilitaires
│   ├── types/                 # Types TypeScript
│   └── components/            # Composants React
├── public/                    # Fichiers statiques
│   ├── studio-evento.html     # Page principale
│   └── module-chat.js         # Script de chat
├── .env.local                 # Variables d'environnement
└── package.json               # Dépendances
```

### **Ajouter un nouvel agent**
1. Créer le fichier dans `src/lib/agents/`
2. Ajouter le type dans `src/types/index.ts`
3. Configurer dans l'orchestrateur
4. Ajouter dans l'interface admin

### **Modifier les prompts**
- **Via interface admin** : `/admin` (recommandé)
- **Via code** : Fichiers dans `src/lib/agents/`
- **Via Supabase** : Table `agent_prompts`

## 🚀 DÉPLOIEMENT EN PRODUCTION

### **Vercel (Recommandé)**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans le dashboard Vercel
```

### **Netlify**
```bash
# Build
npm run build

# Déployer le dossier .next
```

### **Serveur VPS**
```bash
# Build
npm run build

# Démarrer en production
npm start

# Ou avec PM2
pm2 start npm --name "studio-evento" -- start
```

## 🔍 DÉPANNAGE

### **Problèmes courants**

**1. Erreur "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Erreur API Anthropic/OpenAI**
- Vérifier les clés API dans `.env.local`
- Vérifier les quotas et crédits

**3. Interface admin ne charge pas**
- Vérifier l'authentification (cherubindavid@gmail.com)
- Vérifier la configuration Supabase

**4. Agents ne répondent pas**
- Vérifier les logs dans la console
- Tester les endpoints API individuellement

### **Logs et debugging**
```bash
# Logs détaillés
DEBUG=* npm run dev

# Vérifier les APIs
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## 📞 SUPPORT ET CONTACT

**Développeur** : Manus AI Assistant
**Email autorisé admin** : cherubindavid@gmail.com
**Documentation** : Ce fichier CLAUDE.md

## 🎯 FONCTIONNALITÉS AVANCÉES

### **Système MCP (Model Context Protocol)**
- Recherche web automatique avec déclencheurs intelligents
- Enrichissement contextuel des réponses
- Intégration multi-sources

### **Génération d'identité visuelle**
- 3 propositions par demande
- Styles : Professionnel, Créatif, Avant-garde
- Téléchargement haute résolution
- Intégration DALL-E 3

### **Base de données de lieux**
- 14,000 lieux référencés en France
- Filtrage par capacité, budget, localisation
- Recommandations personnalisées

### **Calculateur ROI intégré**
- Métriques financières complètes
- Projections et scénarios
- Optimisation budgétaire

## 🔄 MISES À JOUR

Pour mettre à jour Studio Evento :
1. Sauvegarder les configurations personnalisées
2. Télécharger la nouvelle version
3. Restaurer les variables d'environnement
4. Tester en mode développement
5. Déployer en production

## 📐 RÈGLES DE DÉVELOPPEMENT

### **Principes fondamentaux**

- **Simplicité :** Toujours préférer des solutions simples et directes.
- **Éviter la duplication :** Avant d'ajouter du nouveau code, vérifier si une fonctionnalité similaire existe déjà. Si c'est le cas, améliorer ou corriger le code existant plutôt que de le dupliquer.
- **Portée des modifications :** Implémenter uniquement les changements spécifiquement demandés. Éviter de toucher aux parties non liées du code pour prévenir l'introduction de problèmes imprévus.
- **Séparation des environnements :** S'assurer que tous les changements prennent en compte une séparation claire entre les environnements de développement (dev), de test et de production.
- **Propreté du code :**
    - Une fois qu'une nouvelle fonctionnalité est validée, supprimer toute ancienne implémentation pour éviter la logique dupliquée.
    - Maintenir une base de code bien organisée et propre.
- **Scripts temporaires :** Pour les scripts ponctuels (comme les scripts de test), les exécuter en ligne plutôt que de les sauvegarder comme fichiers persistants, et les supprimer une fois qu'ils ont rempli leur fonction.
- **Gestion de la taille des fichiers :** Si un fichier approche 200-300 lignes de code, le refactoriser en modules plus petits.
- **Utilisation de données réelles :** Ne pas utiliser de données mock ou stub dans les environnements de développement ou de production ; s'assurer que l'application utilise soit des données réelles, soit gère les erreurs de manière appropriée.

### **Directives pour l'agent IA**

- **Sélection du modèle :** Utiliser un agent comme "Claude 3.7 Sonnet Thinking" ou tout autre modèle qui supporte pleinement le comportement agentique, les appels de fonction et l'intégration d'outils.
    - Ces règles agissent comme des messages système qui guident l'IA sur les technologies à utiliser, le workflow à suivre et la structure du code.

### **Directives globales**

- **Cohérence technologique :** Ne pas introduire de nouvelles technologies ou patterns qui ne font pas déjà partie de la stack définie - sauf si absolument nécessaire et seulement après avoir exploré toutes les options avec l'implémentation existante.
- **Focus :** Se concentrer uniquement sur la tâche spécifiée sans ajouter de fonctionnalités supplémentaires ou faire des changements non liés.
- **Qualité et propreté :** Le code généré doit être clair, concis et suivre les meilleures pratiques pour assurer une maintenance facile et des améliorations futures.

### **Stack technologique habituelle**
- **Frontend :** Python, HTML et JavaScript
- **Base de données :** SQL

---

**🎉 Studio Evento est maintenant prêt à révolutionner votre événementiel avec l'IA !**

