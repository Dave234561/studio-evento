import { NextRequest, NextResponse } from 'next/server'
import { ChefProjetAgent } from '@/lib/agents/chef-projet'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const chefProjetAgent = new ChefProjetAgent()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, mode, conversationHistory, sessionId, userId } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message manquant' },
        { status: 400 }
      )
    }

    console.log('🎯 Chef de Projet Agent - Requête reçue:', {
      message: message.substring(0, 100) + '...',
      mode,
      sessionId,
      userId,
      historyLength: conversationHistory?.length || 0
    })

    const result = await chefProjetAgent.process({
      message,
      mode,
      conversationHistory,
      sessionId: sessionId || `session_${Date.now()}_chef_projet`,
      userId: userId || 'anonymous'
    })

    console.log('✅ Chef de Projet Agent - Réponse générée:', {
      sessionId: result.sessionId,
      responseLength: result.response.length,
      processingTime: result.processingTime,
      module: result.module
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Erreur Chef de Projet Agent:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        message: 'Une erreur est survenue lors du traitement par l\'agent Chef de Projet'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'Chef de Projet Événementiel',
    description: 'Agent spécialisé dans la gestion de projets événementiels',
    capabilities: [
      'Planification de projets événementiels',
      'Gestion des budgets et ressources',
      'Coordination des prestataires',
      'Gestion des risques',
      'Création de rétroplanning',
      'Suivi qualité et échéances'
    ],
    status: 'active'
  })
}