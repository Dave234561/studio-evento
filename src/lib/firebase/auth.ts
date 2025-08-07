import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
  Unsubscribe
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

// Types
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  freeModuleUsed?: string
  createdAt: Date
  updatedAt: Date
  subscription?: {
    plan: 'free' | 'module' | 'premium'
    moduleAccess?: string[]
    expiresAt?: Date
  }
  isAdmin?: boolean
}

// Google provider
const googleProvider = new GoogleAuthProvider()

// Auth services
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName })
    }
    
    // Create user profile in Firestore
    await this.createUserProfile(user)
    
    return user
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(auth, googleProvider)
    
    // Check if user profile exists, create if not
    const profileExists = await this.getUserProfile(user.uid)
    if (!profileExists) {
      await this.createUserProfile(user)
    }
    
    return user
  },

  // Sign out
  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  },

  // Create user profile in Firestore
  async createUserProfile(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid)
    
    const profile: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: 'free',
        moduleAccess: []
      }
    }
    
    // Check if admin
    if (user.email === 'cherubindavid@gmail.com') {
      profile.isAdmin = true
      profile.subscription = {
        plan: 'premium',
        moduleAccess: ['all']
      }
    }
    
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile
    }
    
    return null
  },

  // Update user's free module usage
  async updateFreeModuleUsed(uid: string, moduleId: string): Promise<void> {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      freeModuleUsed: moduleId,
      updatedAt: serverTimestamp()
    }, { merge: true })
  },

  // Check if user can access a module
  async canAccessModule(uid: string, moduleId: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid)
    
    if (!profile) return false
    
    // Admin has access to everything
    if (profile.isAdmin) return true
    
    // Premium plan has access to all modules
    if (profile.subscription?.plan === 'premium') return true
    
    // Module plan - check if user has access to this specific module
    if (profile.subscription?.plan === 'module' && profile.subscription.moduleAccess?.includes(moduleId)) {
      return true
    }
    
    // Free plan - check if user hasn't used their free module yet
    if (profile.subscription?.plan === 'free' && !profile.freeModuleUsed) {
      return true
    }
    
    return false
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser
  }
}