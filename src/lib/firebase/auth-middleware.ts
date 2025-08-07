import { NextRequest } from 'next/server'
import { verifyIdToken } from './admin'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string
    email?: string
    emailVerified?: boolean
    isAdmin?: boolean
  }
}

export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean
  user?: any
  error?: string
}> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'No authorization header'
      }
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decodedToken = await verifyIdToken(token)
    
    if (!decodedToken) {
      return {
        authenticated: false,
        error: 'Invalid token'
      }
    }
    
    return {
      authenticated: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        isAdmin: decodedToken.admin === true
      }
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      authenticated: false,
      error: 'Authentication failed'
    }
  }
}

// Helper to check if user can access a module
export async function canUserAccessModule(
  userId: string,
  moduleId: string
): Promise<boolean> {
  // This would check the user's subscription in Firestore
  // For now, we'll return true for testing
  return true
}