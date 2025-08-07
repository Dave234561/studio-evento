# 📋 GUIDE DE CRÉATION DU DÉPÔT GITHUB

## 🔄 Option 1 : GitHub CLI (Recommandée)

### 1. Authentification
```bash
gh auth login
```
Suivez les instructions pour vous connecter.

### 2. Création du dépôt et push
```bash
# Créer dépôt public
gh repo create studio-evento --public --description "🎬 Studio Evento - AI-powered event planning platform with multi-agent system"

# OU créer dépôt privé
gh repo create studio-evento --private --description "🎬 Studio Evento - AI-powered event planning platform with multi-agent system"

# Push automatique
git push -u origin main
```

## 🌐 Option 2 : Interface Web GitHub

### 1. Créer le dépôt
- Aller sur https://github.com/new
- Nom : `studio-evento`
- Description : `🎬 Studio Evento - AI-powered event planning platform with multi-agent system`
- Choisir Public ou Private
- NE PAS initialiser avec README, .gitignore ou licence
- Cliquer "Create repository"

### 2. Connecter et pousser
```bash
# Remplacer YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/studio-evento.git
git push -u origin main
```

## ✅ Vérification

Après le push, vérifiez que tout est synchronisé :
```bash
git remote -v
git status
```

## 📋 Informations du projet

- **Nom** : studio-evento
- **Description** : 🎬 Studio Evento - AI-powered event planning platform with multi-agent system
- **Technos** : Next.js 14.2.3, TypeScript, AI Multi-agents, Firebase Auth, Supabase
- **Fonctionnalités** : 9 modules événementiels, 12 agents IA spécialisés, 14K+ lieux référencés

## 🚀 Prêt pour Vercel

Une fois le dépôt créé, vous pourrez immédiatement le connecter à Vercel pour déploiement automatique !