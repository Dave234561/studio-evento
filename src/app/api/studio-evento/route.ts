import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const htmlPath = path.join(process.cwd(), 'public', 'studio-evento.html')
    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    return new NextResponse('Fichier HTML non trouvé', { status: 404 })
  }
}

