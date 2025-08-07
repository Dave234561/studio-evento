'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { authService, UserProfile } from '../firebase/auth-supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  canAccessModule: (moduleId: string) => Promise<boolean>
  updateFreeModuleUsed: (moduleId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user profile when user changes
  useEffect(() => {
    const loadUserProfile = async (currentUser: User) => {
      try {
        const userProfile = await authService.getUserProfile(currentUser.uid)
        setProfile(userProfile)
        
        // Also sync with API to ensure consistency
        if (currentUser && typeof window !== 'undefined') {
          const idToken = await currentUser.getIdToken()
          fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL
              }
            })
          }).catch(err => console.error('Sync error:', err))
        }
      } catch (err) {
        console.error('Error loading user profile:', err)
      }
    }

    if (user) {
      loadUserProfile(user)
    } else {
      setProfile(null)
    }
  }, [user])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await authService.signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
      throw err
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      await authService.signUp(email, password, displayName)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
      throw err
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await authService.signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google')
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await authService.signOut()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion')
      throw err
    }
  }

  const sendPasswordReset = async (email: string) => {
    try {
      setError(null)
      await authService.sendPasswordReset(email)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du lien de réinitialisation')
      throw err
    }
  }

  const canAccessModule = async (moduleId: string) => {
    if (!user) return false
    return authService.canAccessModule(user.uid, moduleId)
  }

  const updateFreeModuleUsed = async (moduleId: string) => {
    if (!user) throw new Error('Utilisateur non connecté')
    await authService.updateFreeModuleUsed(user.uid, moduleId)
    // Reload profile
    const updatedProfile = await authService.getUserProfile(user.uid)
    setProfile(updatedProfile)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    canAccessModule,
    updateFreeModuleUsed
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook to check if user is admin
export function useIsAdmin() {
  const { profile } = useAuth()
  return profile?.is_admin || false
}