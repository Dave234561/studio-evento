import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/firebase/auth-middleware'
import { authService } from '@/lib/firebase/auth'

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user, error } = await verifyAuth(request)
    
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: error || 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user profile from Firestore
    const profile = await authService.getUserProfile(user.uid)
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        isAdmin: user.isAdmin || profile?.isAdmin || false,
        profile
      }
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // For GET requests, just check if user is authenticated
  const { authenticated, user } = await verifyAuth(request)
  
  return NextResponse.json({
    authenticated,
    user: authenticated ? { uid: user.uid, email: user.email } : null
  })
}