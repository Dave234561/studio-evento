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
import { auth } from './config'
import { supabase } from '../supabase'

// Types
export interface UserProfile {
  id: string
  firebase_uid: string
  email: string
  display_name?: string
  photo_url?: string
  free_module_used?: string
  created_at: string
  updated_at: string
  subscription_plan: 'free' | 'module' | 'premium'
  module_access: string[]
  is_admin: boolean
}

// Google provider
const googleProvider = new GoogleAuthProvider()

// Auth services with Supabase integration
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    
    // Sync with Supabase
    await this.syncUserWithSupabase(user)
    
    return user
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName })
    }
    
    // Create user profile in Supabase
    await this.createUserProfile(user, displayName)
    
    return user
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(auth, googleProvider)
    
    // Check if user profile exists, create if not
    const profileExists = await this.getUserProfile(user.uid)
    if (!profileExists) {
      await this.createUserProfile(user)
    } else {
      // Just sync in case of updates
      await this.syncUserWithSupabase(user)
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

  // Create user profile in Supabase
  async createUserProfile(user: User, displayName?: string): Promise<void> {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    const profile = {
      firebase_uid: user.uid,
      email: user.email!,
      display_name: displayName || user.displayName || undefined,
      photo_url: user.photoURL || undefined,
      subscription_plan: 'free' as 'free' | 'module' | 'premium',
      module_access: [] as string[],
      is_admin: user.email === 'cherubindavid@gmail.com'
    }
    
    // Special handling for admin
    if (profile.is_admin) {
      profile.subscription_plan = 'premium'
      profile.module_access = ['all']
    }
    
    const { error } = await supabase
      .from('users')
      .upsert({
        ...profile,
        name: profile.display_name,
        avatar: profile.photo_url
      }, {
        onConflict: 'firebase_uid'
      })
    
    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  },

  // Sync user with Supabase (for existing users)
  async syncUserWithSupabase(user: User): Promise<void> {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        firebase_uid: user.uid,
        email: user.email!,
        display_name: user.displayName || undefined,
        photo_url: user.photoURL || undefined,
        name: user.displayName || undefined,
        avatar: user.photoURL || undefined
      }, {
        onConflict: 'firebase_uid'
      })
    
    if (error) {
      console.error('Error syncing user with Supabase:', error)
    }
  },

  // Get user profile from Supabase
  async getUserProfile(firebaseUid: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error getting user profile:', error)
      return null
    }
    
    return data as UserProfile
  },

  // Update user's free module usage
  async updateFreeModuleUsed(firebaseUid: string, moduleId: string): Promise<void> {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    const { error } = await supabase
      .from('users')
      .update({
        free_module_used: moduleId,
        updated_at: new Date().toISOString()
      })
      .eq('firebase_uid', firebaseUid)
    
    if (error) {
      console.error('Error updating free module used:', error)
      throw error
    }
  },

  // Check if user can access a module
  async canAccessModule(firebaseUid: string, moduleId: string): Promise<boolean> {
    const profile = await this.getUserProfile(firebaseUid)
    
    if (!profile) return false
    
    // Admin has access to everything
    if (profile.is_admin) return true
    
    // Premium plan has access to all modules
    if (profile.subscription_plan === 'premium') return true
    
    // Module plan - check if user has access to this specific module
    if (profile.subscription_plan === 'module' && profile.module_access?.includes(moduleId)) {
      return true
    }
    
    // Free plan - check if user hasn't used their free module yet
    if (profile.subscription_plan === 'free' && !profile.free_module_used) {
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