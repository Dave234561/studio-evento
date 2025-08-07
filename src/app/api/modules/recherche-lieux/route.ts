import { NextRequest, NextResponse } from 'next/server'
import { VenueAgentSimple } from '@/lib/agents/venue-simple'
import { VenueAgent } from '@/lib/agents/venue'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context = {} } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      )
    }

    console.log('🏢 [RECHERCHE-LIEUX] Nouvelle demande:', message)

    const startTime = Date.now()

    try {
      // Essayer d'utiliser l'agent complet avec base de données
      const venueAgent = new VenueAgent()
      const venueResponse = await venueAgent.processRequest({
        message,
        context
      })

      // Formater la réponse pour l'interface
      const response = {
        success: true,
        response: {
          content: venueResponse.analysis
        },
        analysis: venueResponse.analysis,
        recommendations: venueResponse.recommendations,
        searchCriteria: venueResponse.searchCriteria,
        alternatives: venueResponse.alternatives,
        metadata: {
          module: 'recherche-lieux',
          model: 'claude-3-5-sonnet',
          processingTime: Date.now() - startTime
        }
      }

      console.log('🏢 [RECHERCHE-LIEUX] Réponse générée avec agent complet')
      return NextResponse.json(response)

    } catch (error) {
      console.log('🏢 [RECHERCHE-LIEUX] Fallback vers VenueAgentSimple:', error)
      
      // En cas d'erreur, utiliser l'agent simple
      const venueAgent = new VenueAgentSimple()
      const venueResponse = await venueAgent.processRequest({
        message,
        context
      })

      const response = {
        success: true,
        response: {
          content: venueResponse
        },
        analysis: venueResponse,
        recommendations: [],
        metadata: {
          module: 'recherche-lieux',
          model: 'claude-3-5-sonnet',
          processingTime: Date.now() - startTime
        }
      }

      console.log('🏢 [RECHERCHE-LIEUX] Réponse générée avec agent simple')
      return NextResponse.json(response)
    }

  } catch (error) {
    console.error('🏢 [RECHERCHE-LIEUX] Erreur:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}