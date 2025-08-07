import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const htmlPath = path.join(process.cwd(), 'public', 'studio-evento.html')
    
    // Debug: vérifier si le fichier existe
    if (!fs.existsSync(htmlPath)) {
      console.error('[DEBUG] studio-evento.html NOT FOUND at:', htmlPath)
      return new NextResponse(
        JSON.stringify({
          error: 'Fichier HTML non trouvé',
          path: htmlPath,
          cwd: process.cwd(),
          exists: false,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
    console.log('[DEBUG] studio-evento.html loaded successfully, size:', htmlContent.length)
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Debug': 'studio-evento-loaded'
      },
    })
  } catch (error) {
    console.error('[ERROR] studio-evento route:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

