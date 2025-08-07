# EventAI Pro - Intelligence Événementielle

## 🚀 Architecture Multi-Agents Custom

EventAI Pro est une plateforme d'intelligence artificielle révolutionnaire pour la planification d'événements professionnels, exploitant directement les APIs Claude d'Anthropic avec une architecture multi-agents custom.

### ✨ Caractéristiques Principales

- **Architecture Custom Multi-Agents** : Coordination intelligente entre 5 agents spécialisés
- **Claude Sonnet 4 + Opus 4** : Utilisation optimisée des meilleurs modèles d'Anthropic
- **Interface Conversationnelle** : Chat en temps réel avec synthèse multi-agents
- **Optimisation des Coûts** : Cache sémantique intelligent et routage adaptatif
- **Performance Native** : Aucune dépendance framework externe

### 🤖 Écosystème d'Agents

| Agent | Modèle | Spécialisation |
|-------|---------|---------------|
| **Orchestrateur** | Claude Sonnet 4 | Coordination et synthèse intelligente |
| **Storytelling** | Claude Opus 4 | Concepts créatifs et innovation |
| **RSE** | Claude Opus 4 | Analyse environnementale systémique |
| **Lieu** | Claude Sonnet 4 | Recherche et recommandations de venues |
| **Brief Generator** | Claude Sonnet 4 | Documents techniques et cahiers des charges |

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Radix UI** pour les composants

### Backend
- **Node.js** avec APIs REST
- **Supabase** (PostgreSQL + Auth + Storage)
- **Prisma ORM** pour les requêtes
- **Redis** pour le cache et les sessions
- **Architecture microservices**

### IA & Données
- **Anthropic Claude APIs** (Sonnet 4 & Opus 4)
- **Cache sémantique** avec embeddings
- **Optimisation automatique** des prompts
- **Analyse de performance** en temps réel

## 🚀 Installation Rapide

### Prérequis
- Node.js 18+
- Compte Supabase (gratuit)
- Redis 7+ (optionnel)
- Clé API Anthropic

### Installation Locale

1. **Cloner le projet**
```bash
git clone https://github.com/your-org/eventai-pro.git
cd eventai-pro
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
```bash
# Suivre le guide détaillé
cat SUPABASE_SETUP.md
```

4. **Configuration environnement**
```bash
cp .env.example .env
# Éditer .env avec vos clés Supabase et Anthropic
```

5. **Base de données**
```bash
npx prisma generate
npx prisma db push
```

6. **Démarrer le serveur**
```bash
npm run dev
```

### Déploiement Docker

```bash
# Avec Docker Compose
docker-compose up -d

# Ou build manuel
docker build -t eventai-pro .
docker run -p 3000:3000 eventai-pro
```

## 📋 Variables d'Environnement

```env
# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_key_here

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Base de données (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres

# Cache Redis (optionnel)
REDIS_URL=redis://localhost:6379

# Authentification
NEXTAUTH_SECRET=your_secure_secret_here
NEXTAUTH_URL=http://localhost:3000

# Environnement
NODE_ENV=development
```

## 🏗️ Architecture Système

### Orchestration Multi-Agents

```typescript
// Exemple d'utilisation
const orchestrator = new AgentOrchestrator()
const response = await orchestrator.processMessage(
  conversationId,
  "Organisez un séminaire d'innovation durable pour 150 personnes",
  userId,
  context
)
```

### Routage Intelligent

L'orchestrateur analyse automatiquement les requêtes pour déterminer :
- **Agents nécessaires** selon la complexité
- **Ordre d'exécution** (parallèle/séquentiel)
- **Modèle optimal** (Sonnet 4 vs Opus 4)
- **Stratégie de cache** pour optimiser les coûts

### Cache Sémantique

```typescript
// Cache intelligent avec embeddings
const cachedResponse = await orchestrator.getCachedResponse(query)
if (cachedResponse) {
  return { ...cachedResponse, metadata: { cached: true } }
}
```

## 📊 Métriques et Performance

### KPIs Techniques
- **Latence Orchestrateur** : <2s (P95)
- **Latence Agents Créatifs** : <8s (P95)
- **Disponibilité** : >99.9%
- **Cache Hit Rate** : >60%

### Optimisation des Coûts
- **Coût par conversation** : <0.15€ moyenne
- **Efficacité routage** : >85% précision
- **ROI Opus 4** : >300% valeur ajoutée

## 🔒 Sécurité

- **Chiffrement end-to-end** des conversations
- **Authentification multi-facteurs**
- **Conformité RGPD** native
- **Audit trails** complets
- **Isolation des données** par tenant

## 🚀 Cas d'Usage

### Storytelling Créatif
```
"Créez un concept innovant pour notre événement de lancement produit"
→ Agent Storytelling (Opus 4) génère des concepts créatifs
→ Agent RSE (Opus 4) analyse l'impact environnemental
→ Orchestrateur synthétise les recommandations
```

### Analyse RSE Complète
```
"Analysez l'empreinte carbone de notre séminaire à Lyon"
→ Agent RSE (Opus 4) calcule l'impact détaillé
→ Agent Lieu (Sonnet 4) propose des alternatives durables
→ Brief Generator (Sonnet 4) documente les recommandations
```

### Recherche de Lieux
```
"Trouvez des lieux atypiques pour 300 personnes à Paris"
→ Agent Lieu (Sonnet 4) recherche dans la base de données
→ Agent RSE (Opus 4) évalue la durabilité
→ Orchestrateur priorise selon les critères
```

## 🔧 Développement

### Structure du Projet
```
src/
├── app/                 # Pages Next.js 14
├── components/          # Composants React
├── lib/                 # Bibliothèques et utilitaires
├── types/               # Types TypeScript
└── utils/               # Fonctions utilitaires

prisma/
├── schema.prisma        # Modèle de données
└── migrations/          # Migrations base de données
```

### Scripts Disponibles
```bash
npm run dev              # Serveur développement
npm run build           # Build production
npm run start           # Serveur production
npm run lint            # Linting
npm run type-check      # Vérification types
npm run db:migrate      # Migrations DB
npm run db:generate     # Génération client Prisma
```

### Tests
```bash
npm run test            # Tests unitaires
npm run test:e2e        # Tests end-to-end
npm run test:coverage   # Couverture de code
```

## 📚 Documentation API

### Endpoints Principaux

#### Chat Multi-Agents
```typescript
POST /api/chat
{
  "message": "Votre demande",
  "conversationId": "optional-id",
  "userId": "user-id",
  "context": { ... }
}
```

#### Gestion des Projets
```typescript
GET /api/projects?userId=user-id
POST /api/projects
PUT /api/projects
DELETE /api/projects?projectId=id&userId=user-id
```

#### Analytics
```typescript
GET /api/analytics?userId=user-id&timeRange=30d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

### Phase 1 (Actuelle)
- ✅ Architecture multi-agents
- ✅ Interface conversationnelle
- ✅ Cache sémantique
- ✅ Déploiement Docker

### Phase 2 (Q3 2025)
- 🔄 Apprentissage adaptatif
- 🔄 Intégrations écosystème
- 🔄 Analytics prédictives
- 🔄 Multi-tenant avancé

### Phase 3 (Q4 2025)
- 📋 Fine-tuning modèles
- 📋 API publique
- 📋 Marketplace extensions
- 📋 Enterprise features

## 🆘 Support

- **Documentation** : [docs.eventai.pro](https://docs.eventai.pro)
- **Support** : support@eventai.pro
- **Issues** : [GitHub Issues](https://github.com/your-org/eventai-pro/issues)
- **Discord** : [Communauté EventAI](https://discord.gg/eventai)

## 📈 Monitoring

### Métriques Disponibles
- Performance des agents
- Coûts d'API en temps réel
- Satisfaction utilisateur
- Utilisation des ressources

### Dashboards
- **Grafana** : Métriques système
- **Custom Dashboard** : Analytics business
- **Anthropic Dashboard** : Utilisation APIs

---

**EventAI Pro** - *Révolutionnez vos événements avec l'intelligence artificielle*

© 2025 Manus AI - Tous droits réservés