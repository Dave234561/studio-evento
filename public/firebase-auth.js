// Firebase Auth Integration for Studio Evento
(function() {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAyzdBzUm0bkvbJizOM3iHEhzvK3PDF5PM",
    authDomain: "studio-evento-new.firebaseapp.com",
    projectId: "studio-evento-new",
    storageBucket: "studio-evento-new.firebasestorage.app",
    messagingSenderId: "187884180725",
    appId: "1:187884180725:web:1508258aa655b831a461bc"
  };

  // Initialize Firebase (will be done after script loads)
  let auth = null;
  let currentUser = null;
  let authModalCallback = null;
  
  // Sync with Supabase backend
  async function syncWithSupabase(user, idToken) {
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      const data = await response.json();
      console.log('User synced with Supabase:', data);
      
      // Store user profile data if needed
      if (data.profile) {
        window.userProfile = data.profile;
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  }

  // Load Firebase scripts dynamically
  function loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
      const script1 = document.createElement('script');
      script1.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js';
        script2.onload = () => {
          try {
            // Check if we're on Vercel domain and show helpful message
            if (window.location.hostname.includes('vercel.app')) {
              console.log('🔥 Firebase Auth - Configuration domaine Vercel nécessaire');
              console.log('📖 Voir FIREBASE-CONFIG.md pour les instructions');
              console.log('🚀 Contournement temporaire: Ajouter ?demo=true à l\'URL');
              
              // Check for demo mode
              if (window.location.search.includes('demo=true')) {
                console.log('🚀 Mode démo activé - Authentification contournée');
                currentUser = { uid: 'demo', email: 'demo@studio-evento.com', displayName: 'Utilisateur Démo' };
                updateUIForAuthState(currentUser);
                return;
              }
            }
            
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            
            // Set up auth state listener
            auth.onAuthStateChanged(async (user) => {
              currentUser = user;
              updateUIForAuthState(user);
              
              // Sync with Supabase when user signs in
              if (user) {
                try {
                  const idToken = await user.getIdToken();
                  await syncWithSupabase(user, idToken);
                } catch (error) {
                  console.error('Error syncing with Supabase:', error);
                }
              }
            });
          } catch (error) {
            console.error('Firebase initialization error:', error);
            
            // Check if it's a domain authorization error
            if (error.code === 'auth/unauthorized-domain' || error.message.includes('domain') || error.message.includes('origin')) {
              console.log('🔥 Erreur de domaine Firebase détectée');
              console.log('📖 Solution: Voir FIREBASE-CONFIG.md');
              console.log('🚀 Mode démo: ' + window.location.href + '?demo=true');
            }
            
            // En cas d'erreur, permettre le mode bypass
            console.log('⚠️ Firebase non disponible - Mode bypass activé');
            console.log('👉 Ajoutez ?bypass-auth=true à l\'URL pour tester sans authentification');
          }
          
          resolve();
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    });
  }

  // Check if user is authenticated
  window.isUserAuthenticated = function() {
    // Mode bypass pour test sans Firebase
    if (window.location.search.includes('bypass-auth=true')) {
      return true;
    }
    return currentUser !== null;
  };

  // Get current user
  window.getCurrentUser = function() {
    return currentUser;
  };

  // Show auth modal
  window.showAuthModal = function(callback) {
    authModalCallback = callback;
    const modal = createAuthModal();
    document.body.appendChild(modal);
  };

  // Create auth modal HTML
  function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
      <div class="auth-modal">
        <div class="auth-modal-header">
          <h2 id="authModalTitle">Créer votre compte gratuit</h2>
          <button onclick="closeAuthModal()" class="auth-modal-close">&times;</button>
        </div>
        
        <div id="registerBenefits" class="auth-benefits">
          <div class="benefit-item">✓ Aucune carte bancaire requise</div>
          <div class="benefit-item">✓ Accès immédiat après inscription</div>
          <div class="benefit-item">✓ 1 module gratuit au choix</div>
        </div>
        
        <div class="auth-modal-body">
          <button onclick="signInWithGoogle()" class="auth-google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18">
            <span id="googleBtnText">S'inscrire avec Google</span>
          </button>
          
          <div class="auth-divider">
            <span>Ou</span>
          </div>
          
          <form id="authForm" onsubmit="handleAuthSubmit(event)">
            <div id="authError" class="auth-error" style="display: none;"></div>
            
            <input type="email" id="authEmail" placeholder="votre@entreprise.com" required>
            <input type="password" id="authPassword" placeholder="Mot de passe (min. 8 caractères)" required minlength="8">
            <input type="password" id="authConfirmPassword" placeholder="Confirmer le mot de passe" required minlength="8">
            
            <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
              Créer mon compte gratuit
            </button>
          </form>
          
          <div class="auth-switch">
            <span id="authSwitchText">Déjà un compte ?</span>
            <button onclick="toggleAuthMode()" id="authSwitchBtn">Connectez-vous</button>
          </div>
        </div>
      </div>
    `;
    
    return modal;
  }

  // Toggle between login and register
  window.toggleAuthMode = function() {
    const isLogin = document.getElementById('authModalTitle').textContent.includes('Connexion');
    
    if (isLogin) {
      // Switch to register
      document.getElementById('authModalTitle').textContent = 'Créer votre compte gratuit';
      document.getElementById('registerBenefits').style.display = 'block';
      document.getElementById('authConfirmPassword').style.display = 'block';
      document.getElementById('authConfirmPassword').required = true;
      document.getElementById('googleBtnText').textContent = "S'inscrire avec Google";
      document.getElementById('authSubmitBtn').textContent = 'Créer mon compte gratuit';
      document.getElementById('authSwitchText').textContent = 'Déjà un compte ?';
      document.getElementById('authSwitchBtn').textContent = 'Connectez-vous';
    } else {
      // Switch to login
      document.getElementById('authModalTitle').textContent = 'Connexion';
      document.getElementById('registerBenefits').style.display = 'none';
      document.getElementById('authConfirmPassword').style.display = 'none';
      document.getElementById('authConfirmPassword').required = false;
      document.getElementById('googleBtnText').textContent = 'Continuer avec Google';
      document.getElementById('authSubmitBtn').textContent = 'Se connecter';
      document.getElementById('authSwitchText').textContent = 'Pas encore de compte ?';
      document.getElementById('authSwitchBtn').textContent = 'Inscrivez-vous gratuitement';
    }
  };

  // Handle auth form submit
  window.handleAuthSubmit = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const confirmPassword = document.getElementById('authConfirmPassword').value;
    const isLogin = !document.getElementById('authConfirmPassword').required;
    
    // Clear error
    showAuthError('');
    
    if (!isLogin && password !== confirmPassword) {
      showAuthError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      document.getElementById('authSubmitBtn').disabled = true;
      document.getElementById('authSubmitBtn').textContent = isLogin ? 'Connexion...' : 'Création du compte...';
      
      let user;
      if (isLogin) {
        const result = await auth.signInWithEmailAndPassword(email, password);
        user = result.user;
      } else {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        user = result.user;
      }
      
      // Sync with Supabase
      const idToken = await user.getIdToken();
      await syncWithSupabase(user, idToken);
      
      closeAuthModal();
      if (authModalCallback) authModalCallback();
      
    } catch (error) {
      handleAuthError(error);
    } finally {
      document.getElementById('authSubmitBtn').disabled = false;
      document.getElementById('authSubmitBtn').textContent = isLogin ? 'Se connecter' : 'Créer mon compte gratuit';
    }
  };

  // Sign in with Google
  window.signInWithGoogle = async function() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      
      // Sync with Supabase
      const idToken = await result.user.getIdToken();
      await syncWithSupabase(result.user, idToken);
      
      closeAuthModal();
      if (authModalCallback) authModalCallback();
      
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Handle auth errors
  function handleAuthError(error) {
    let message = 'Une erreur est survenue. Veuillez réessayer.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Un compte existe déjà avec cet email';
        break;
      case 'auth/invalid-email':
        message = 'Email invalide';
        break;
      case 'auth/weak-password':
        message = 'Le mot de passe est trop faible';
        break;
      case 'auth/user-not-found':
        message = 'Aucun compte trouvé avec cet email';
        break;
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect';
        break;
    }
    
    showAuthError(message);
  }

  // Show auth error
  function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (message) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    } else {
      errorDiv.style.display = 'none';
    }
  }

  // Close auth modal
  window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.remove();
    }
    authModalCallback = null;
  };

  // Sign out
  window.signOut = async function() {
    try {
      await auth.signOut();
      showNotification('Vous avez été déconnecté');
      showPage('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update UI for auth state
  function updateUIForAuthState(user) {
    const navButtons = document.querySelector('.nav-buttons');
    if (!navButtons) return;
    
    // Remove existing auth buttons
    const existingAuthBtn = navButtons.querySelector('.auth-nav-btn');
    if (existingAuthBtn) existingAuthBtn.remove();
    
    if (user) {
      // User is signed in
      const userBtn = document.createElement('div');
      userBtn.className = 'auth-nav-btn';
      userBtn.innerHTML = `
        <button onclick="toggleUserMenu()" class="btn btn-secondary">
          ${user.email}
        </button>
        <div id="userMenu" class="user-menu" style="display: none;">
          <button onclick="showPage('dashboard')">Mon compte</button>
          <button onclick="signOut()">Se déconnecter</button>
        </div>
      `;
      navButtons.appendChild(userBtn);
    } else {
      // User is signed out
      const loginBtn = document.createElement('button');
      loginBtn.className = 'btn btn-primary auth-nav-btn';
      loginBtn.textContent = 'Essai Gratuit';
      loginBtn.onclick = startFreeTrial;
      navButtons.appendChild(loginBtn);
    }
  }

  // Toggle user menu
  window.toggleUserMenu = function() {
    const menu = document.getElementById('userMenu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  };

  // Initialize Firebase when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFirebaseScripts);
  } else {
    loadFirebaseScripts();
  }

  // Add auth modal styles
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .auth-modal {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .auth-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .auth-modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .auth-modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }
    
    .auth-modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .auth-benefits {
      background: #f3e8ff;
      padding: 15px 20px;
      border-bottom: 1px solid #e9d5ff;
    }
    
    .benefit-item {
      color: #6b21a8;
      font-size: 0.9rem;
      margin: 5px 0;
    }
    
    .auth-modal-body {
      padding: 20px;
    }
    
    .auth-google-btn {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background 0.2s;
    }
    
    .auth-google-btn:hover {
      background: #f5f5f5;
    }
    
    .auth-divider {
      text-align: center;
      margin: 20px 0;
      position: relative;
    }
    
    .auth-divider span {
      background: white;
      padding: 0 10px;
      color: #666;
      font-size: 0.9rem;
    }
    
    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #ddd;
      z-index: -1;
    }
    
    #authForm input {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    
    #authForm input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .auth-error {
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }
    
    .auth-submit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 10px;
      transition: transform 0.2s;
    }
    
    .auth-submit-btn:hover {
      transform: translateY(-1px);
    }
    
    .auth-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .auth-switch {
      text-align: center;
      margin-top: 15px;
      font-size: 0.9rem;
      color: #666;
    }
    
    .auth-switch button {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-weight: bold;
    }
    
    .auth-switch button:hover {
      text-decoration: underline;
    }
    
    .user-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      margin-top: 5px;
      overflow: hidden;
    }
    
    .user-menu button {
      display: block;
      width: 100%;
      padding: 10px 20px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .user-menu button:hover {
      background: #f5f5f5;
    }
    
    .auth-nav-btn {
      position: relative;
    }
  `;
  document.head.appendChild(style);
})();