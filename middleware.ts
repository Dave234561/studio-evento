import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export function middleware(request: NextRequest) {
  // Intercepter la route /studio-evento
  if (request.nextUrl.pathname === '/studio-evento') {
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'studio-evento.html')
      const htmlContent = fs.readFileSync(htmlPath, 'utf8')
      
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } catch (error) {
      console.error('Erreur lors du chargement du HTML:', error)
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/studio-evento',
}

