import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
  userId: z.string().optional().default('anonymous'),
  context: z.any().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatRequestSchema.parse(body)
    
    const { message, sessionId, context } = validatedData
    
    // Utiliser l'orchestrateur directement sans Prisma/Redis
    const orchestratorUrl = `http://localhost:3000/api/orchestrator`
    
    const orchestratorResponse = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        context: {
          source: 'chat',
          ...context
        }
      })
    })

    if (!orchestratorResponse.ok) {
      throw new Error(`Erreur orchestrateur: ${orchestratorResponse.status}`)
    }

    const result = await orchestratorResponse.json()
    
    // Retourner la réponse formatée pour le chat
    return NextResponse.json({
      success: true,
      conversationId: sessionId || result.sessionId,
      message: {
        id: `msg_${Date.now()}`,
        content: result.response || result.analysis || 'Réponse générée',
        role: 'assistant',
        agentType: result.module || 'orchestrator',
        model: result.metadata?.model || 'claude-3-5-sonnet',
        tokens: result.metadata?.tokens,
        latency: result.processingTime,
        metadata: result.metadata
      }
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}