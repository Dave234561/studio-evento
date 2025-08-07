import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedback, sessionId, userId, conversationHistory } = body

    console.log('👍 Feedback Chef de Projet reçu:', {
      feedback: feedback?.substring(0, 50) + '...' || 'Aucun feedback',
      sessionId,
      userId,
      timestamp: new Date().toISOString()
    })

    // Ici on pourrait stocker le feedback en base de données
    // Pour l'instant, on log simplement et on confirme la réception

    return NextResponse.json({
      success: true,
      message: 'Feedback reçu avec succès',
      sessionId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du feedback:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'enregistrement du feedback'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Chef de Projet - Feedback',
    description: 'Collecte et stockage des retours utilisateurs pour l\'agent Chef de Projet',
    status: 'active'
  })
}