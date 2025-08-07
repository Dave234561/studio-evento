import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset',
  '/api/auth',
  '/studio-evento.html',
  '/firebase-auth.js',
  '/module-chat.js'
]

// Admin only routes
const adminRoutes = [
  '/admin',
  '/api/admin'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // For now, we'll just add headers to indicate route type
  // In production, you would verify Firebase auth token here
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // For API routes, we'll need to verify auth token
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // In production, verify Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For now, we'll allow requests without token
      // In production, return 401 for protected routes
      console.warn('API request without auth token:', pathname)
    }
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}