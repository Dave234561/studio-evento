import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
const initializeAdmin = () => {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // In production, use environment variables
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    })
  }

  // In development, you might use a service account file
  // For now, we'll initialize without credentials (limited functionality)
  console.warn('Firebase Admin initialized without credentials - some features may not work')
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  })
}

const adminApp = initializeAdmin()
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)

// Verify ID token from client
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

// Set custom claims (like admin status)
export async function setCustomClaims(uid: string, claims: Record<string, any>) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims)
    return true
  } catch (error) {
    console.error('Error setting custom claims:', error)
    return false
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email)
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

// Create user profile in Firestore (admin version)
export async function createUserProfileAdmin(uid: string, data: any) {
  try {
    await adminDb.collection('users').doc(uid).set({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error creating user profile:', error)
    return false
  }
}