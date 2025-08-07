import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export interface TestRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    webEnrichment?: any
  }
}

export class TestAgent {
  async processRequest(request: TestRequest): Promise<string> {
    try {
      console.log('🧪 [TEST-AGENT] Début traitement:', request.message)
      
      // Test simple sans services externes
      const prompt = `Tu es un agent de test pour Studio Evento.
      
Réponds simplement à cette demande : "${request.message}"

Indique que tu es un agent de test fonctionnel et que l'architecture hub centralisée fonctionne correctement.

${undefined ? 
  `Informations web enrichies : ${JSON.stringify(request.context.webEnrichment, null, 2)}` : 
  'Aucun enrichissement web détecté.'
}`

      console.log('🧪 [TEST-AGENT] Appel OpenAI...')
      
      // Générer la réponse avec OpenAI
      const response = await generateText({
        model: openai('gpt-4'),
        prompt: prompt,
        maxTokens: 500,
        temperature: 0.7
      })

      console.log('🧪 [TEST-AGENT] Réponse générée:', response.text.substring(0, 100) + '...')
      
      return response.text
    } catch (error) {
      console.error('🧪 [TEST-AGENT] Erreur:', error)
      throw new Error(`Erreur dans l'agent de test: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }
}

export const testAgent = new TestAgent()

