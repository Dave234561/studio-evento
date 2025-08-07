import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface VenueRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    webEnrichment?: any
  }
}

export class VenueAgentSimple {
  async processRequest(request: VenueRequest): Promise<string> {
    try {
      console.log('🏢 [VENUE-SIMPLE] Début traitement:', request.message)
      
      // Extraire la ville demandée
      const cityMatch = request.message.toLowerCase().match(/(?:à|dans|sur|vers)\s+([a-zA-ZÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i);
      const requestedCity = cityMatch ? cityMatch[1].trim() : '';
      
      const prompt = `Tu es un expert en recherche de lieux événementiels pour Studio Evento.

IMPORTANT : L'utilisateur cherche des lieux spécifiquement à ${requestedCity || 'la localisation mentionnée'}.

Analyse cette demande : "${request.message}"

${request.context?.webEnrichment ? 
  `Informations web enrichies : ${JSON.stringify(request.context.webEnrichment, null, 2)}` : 
  ''
}

RÈGLES STRICTES :
- Propose UNIQUEMENT des lieux situés à ${requestedCity || 'la ville demandée'} 
- N'invente pas de vrais noms de lieux existants
- Utilise des noms génériques comme "Centre de Conférences [Ville]", "Espace [Nom]", etc.
- Assure-toi que tous les lieux proposés correspondent à la ville demandée

Format de réponse :
1. [Nom du lieu générique]
- Capacité : [nombre] personnes
- Localisation : [arrondissement/quartier de ${requestedCity || 'la ville'}]
- Avantages : [liste des avantages]
- Tarif estimé : [prix]/jour

Réponds de manière professionnelle et détaillée en respectant ABSOLUMENT la localisation demandée.`

      console.log('🏢 [VENUE-SIMPLE] Appel Claude...')
      
      const response = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: prompt,
        maxTokens: 2000,
        temperature: 0.7
      })

      console.log('🏢 [VENUE-SIMPLE] Réponse générée:', response.text.substring(0, 100) + '...')
      
      return response.text
    } catch (error) {
      console.error('🏢 [VENUE-SIMPLE] Erreur:', error)
      throw new Error(`Erreur dans l'agent venue simplifié: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }
}

export const venueAgentSimple = new VenueAgentSimple()

