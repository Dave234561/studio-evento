import { NextRequest, NextResponse } from 'next/server'
import { authSyncService } from '@/lib/firebase/auth-sync'
import { verifyIdToken } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token depuis le header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token' },
        { status: 401 }
      )
    }
    
    const idToken = authHeader.substring(7)
    
    // Vérifier le token Firebase
    const decodedToken = await verifyIdToken(idToken)
    
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Récupérer les données utilisateur depuis le body
    const body = await request.json()
    const { user } = body
    
    if (!user || !user.uid) {
      return NextResponse.json(
        { success: false, error: 'User data required' },
        { status: 400 }
      )
    }
    
    // Vérifier que l'UID correspond au token
    if (user.uid !== decodedToken.uid) {
      return NextResponse.json(
        { success: false, error: 'UID mismatch' },
        { status: 403 }
      )
    }
    
    // Synchroniser avec Supabase
    const result = await authSyncService.syncFirebaseUserToSupabase(user, idToken)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    // Retourner les infos de profil
    return NextResponse.json({
      success: true,
      profile: result.data,
      claims: {
        admin: result.data?.is_admin || false,
        plan: result.data?.subscription_plan || 'free',
        modules: result.data?.module_access || []
      }
    })
    
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// GET pour vérifier le statut de sync
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token' },
        { status: 401 }
      )
    }
    
    const idToken = authHeader.substring(7)
    const decodedToken = await verifyIdToken(idToken)
    
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Vérifier si l'utilisateur existe dans Supabase
    const exists = await authSyncService.checkUserExists(decodedToken.uid)
    
    return NextResponse.json({
      success: true,
      synced: exists,
      uid: decodedToken.uid
    })
    
  } catch (error) {
    console.error('Sync check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}