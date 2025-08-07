# 🔥 CONFIGURATION FIREBASE AUTH POUR VERCEL

## ❌ PROBLÈME ACTUEL
L'application Studio Evento sur Vercel retourne une erreur d'authentification Firebase car le domaine Vercel n'est pas autorisé dans Firebase Auth.

**Domaine actuel Vercel :** `https://studio-evento-1vbmj9pcp-dave234561s-projects.vercel.app`
**Firebase Auth Domain configuré :** `studio-evento-new.firebaseapp.com`

## ✅ SOLUTION : Configurer les domaines autorisés Firebase

### 1. Accéder à Firebase Console
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet `studio-evento-new`

### 2. Configurer Authentication
1. Dans le menu latéral, cliquer sur **"Authentication"**
2. Aller dans l'onglet **"Settings"** (Paramètres)
3. Section **"Authorized domains"** (Domaines autorisés)

### 3. Ajouter le domaine Vercel
Ajouter ces domaines à la liste des domaines autorisés :

```
# Domaine Vercel actuel
studio-evento-1vbmj9pcp-dave234561s-projects.vercel.app

# Domaine Vercel générique (pour futurs déploiements)
*.vercel.app

# Domaine personnalisé si vous en avez un
# votre-domaine.com
```

### 4. Configuration localhost (pour développement)
S'assurer que ces domaines sont aussi autorisés :
```
localhost
127.0.0.1
```

## 🚀 ALTERNATIVE : Configuration domaine personnalisé

Si vous avez un domaine personnalisé :

### 1. Configurer Vercel
```bash
# Dans les paramètres Vercel projet
vercel domains add votre-domaine.com
```

### 2. Mettre à jour Firebase
- Remplacer `studio-evento-1vbmj9pcp-dave234561s-projects.vercel.app`  
- Par `votre-domaine.com` dans les domaines autorisés

## 📝 NOTES IMPORTANTES

- **Après chaque modification** : Attendre 2-3 minutes pour la propagation
- **Variables d'environnement** : Vérifier que `NEXT_PUBLIC_FIREBASE_*` sont correctes sur Vercel
- **Test** : Recharger la page après configuration

## 🔧 VÉRIFICATION RAPIDE

Une fois configuré, l'authentification devrait fonctionner et vous devriez voir :
- Formulaire de connexion sans erreur
- Possibilité de créer un compte ou se connecter
- Accès aux modules Studio Evento

## 💡 CONSEIL DÉVELOPPEMENT

Pour éviter ce problème à l'avenir, utiliser un domaine personnalisé plutôt que les URLs Vercel auto-générées qui changent à chaque déploiement.