import { NextRequest, NextResponse } from 'next/server'

// Route sécurisée pour les builds - AUCUNE dépendance externe
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ 
    error: 'Service unavailable during build', 
    phase: 'build-safe-mode' 
  }, { status: 503 })
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Service unavailable during build', 
    phase: 'build-safe-mode' 
  }, { status: 503 })
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Service unavailable during build', 
    phase: 'build-safe-mode' 
  }, { status: 503 })
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Service unavailable during build', 
    phase: 'build-safe-mode' 
  }, { status: 503 })
}