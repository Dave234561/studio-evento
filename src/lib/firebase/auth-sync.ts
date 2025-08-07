import { User } from 'firebase/auth'
import { supabaseAdmin } from '../supabase'

/**
 * Service de synchronisation entre Firebase Auth et Supabase
 * Utilise le client admin pour bypasser RLS
 */
export const authSyncService = {
  /**
   * Synchronise un utilisateur Firebase avec Supabase
   * Appelé après chaque connexion/inscription
   */
  async syncFirebaseUserToSupabase(firebaseUser: User, idToken?: string) {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized')
      return { success: false, error: 'Supabase not configured' }
    }

    try {
      // Préparer les données utilisateur
      const userData = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        // Admin si c'est l'email spécifique
        is_admin: firebaseUser.email === 'cherubindavid@gmail.com'
      }

      // Si admin, définir le plan premium
      if (userData.is_admin) {
        Object.assign(userData, {
          subscription_plan: 'premium',
          module_access: ['all']
        })
      }

      // Upsert dans Supabase (insert ou update)
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(userData, {
          onConflict: 'firebase_uid',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error syncing user to Supabase:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Sync error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },

  /**
   * Vérifie si un utilisateur existe dans Supabase
   */
  async checkUserExists(firebaseUid: string) {
    if (!supabaseAdmin) {
      return false
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle()

    return !error && data !== null
  },

  /**
   * Met à jour les custom claims Firebase basés sur Supabase
   * (nécessite Firebase Admin SDK côté serveur)
   */
  async updateFirebaseCustomClaims(firebaseUid: string) {
    if (!supabaseAdmin) {
      return
    }

    // Récupérer les infos utilisateur depuis Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('is_admin, subscription_plan, module_access')
      .eq('firebase_uid', firebaseUid)
      .single()

    if (error || !user) {
      console.error('Error fetching user for claims update:', error)
      return
    }

    // Les custom claims doivent être définis côté serveur avec Admin SDK
    // Retourner les claims pour l'API
    return {
      admin: user.is_admin || false,
      plan: user.subscription_plan,
      modules: user.module_access
    }
  },

  /**
   * Nettoie les données utilisateur lors de la suppression
   */
  async cleanupUserData(firebaseUid: string) {
    if (!supabaseAdmin) {
      return
    }

    // Soft delete - on garde les données mais on les anonymise
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        email: `deleted_${firebaseUid}@deleted.com`,
        display_name: 'Utilisateur supprimé',
        photo_url: null,
        name: 'Utilisateur supprimé',
        avatar: null,
        updated_at: new Date().toISOString()
      })
      .eq('firebase_uid', firebaseUid)

    if (error) {
      console.error('Error cleaning up user data:', error)
    }
  }
}