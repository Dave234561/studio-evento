import { NextRequest, NextResponse } from 'next/server'

// Mapping des modules Studio Evento vers les modules de l'orchestrateur
const moduleMapping = {
  'gestion-risques': 'gestion-risques',
  'recherche-lieux': 'recherche-lieux', 
  'recherche-animations': 'recherche-animations',
  'synthese-brief': 'synthese-brief',
  'conception-creative': 'conception-creative',
  'design-evenement': 'design-evenement',
  'empreinte-carbone': 'empreinte-carbone',
  'analyse-roi': 'analyse-roi',
  'gestion-budget': 'gestion-budget',
  
  // Anciens noms pour compatibilité
  'cahier-des-charges': 'synthese-brief',
  'recherche-animation': 'recherche-animations',
  'creation-concept': 'conception-creative',
  'charte-graphique': 'design-evenement',
  'impact-carbone': 'empreinte-carbone',
  'mesure-roi': 'analyse-roi',
  'optimisation-budget': 'gestion-budget'
}

export async function POST(
  request: NextRequest,
  { params }: { params: { module: string } }
) {
  try {
    const { module } = params
    const body = await request.json()
    const { message, context } = body

    // Validation des données
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      )
    }

    // Mapper le module vers le nom de l'orchestrateur
    const orchestratorModule = moduleMapping[module as keyof typeof moduleMapping] || module

    console.log(`📋 [MODULE API] ${module} → ${orchestratorModule}`)

    // Rediriger vers l'orchestrateur existant
    const orchestratorUrl = `http://localhost:3000/api/orchestrator`
    
    const orchestratorResponse = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        module: orchestratorModule,
        context: {
          source: 'studio-evento',
          moduleInterface: module,
          ...context
        }
      })
    })

    if (!orchestratorResponse.ok) {
      throw new Error(`Erreur orchestrateur: ${orchestratorResponse.status}`)
    }

    const orchestratorResult = await orchestratorResponse.json()

    // Retourner la réponse dans le format attendu par ModuleChat
    const moduleResponse = {
      success: true,
      response: {
        content: orchestratorResult.response || orchestratorResult.analysis || 'Réponse générée',
        analysis: orchestratorResult.analysis || orchestratorResult.response,
        recommendations: orchestratorResult.recommendations || [],
        metadata: {
          module: orchestratorModule,
          processingTime: orchestratorResult.processingTime,
          tokens: orchestratorResult.metadata?.tokens,
          model: orchestratorResult.metadata?.model || 'claude-3.5-sonnet'
        }
      },
      sessionId: orchestratorResult.sessionId,
      module: orchestratorModule
    }

    console.log(`✅ [MODULE API] ${module} traité avec succès`)
    return NextResponse.json(moduleResponse)

  } catch (error) {
    console.error(`❌ [MODULE API] Erreur pour ${params.module}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        module: params.module
      },
      { status: 500 }
    )
  }
}

