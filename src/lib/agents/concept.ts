import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { AgentConfigService } from '@/lib/services/agentConfigService'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface ConceptRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    budget?: number
    objectives?: string[]
    targetAudience?: string
    brand?: string
    industry?: string
    duration?: string
    constraints?: string[]
  }
}

export interface ConceptResponse {
  concepts: Array<{
    name: string
    slogan: string
    description: string
    experience: string
    declinaisons: string[]
    inspirations: string[]
    arguments: string[]
  }>
  analysis: string
  recommendations: string[]
}

export class ConceptAgent {
  async processRequest(request: ConceptRequest): Promise<ConceptResponse> {
    try {
      // Charger la configuration depuis Supabase
      const config = await AgentConfigService.getAgentConfig('CONCEPT')
      
      if (!config) {
        throw new Error('Configuration non trouvée pour l\'agent CONCEPT')
      }
      
      // Extraire les critères du message
      const criteria = this.extractCriteria(request.message, request.context)
      
      // Construire le prompt avec les nouvelles variables dynamiques
      const enrichedPrompt = this.buildDetailedPrompt(request.message, criteria, undefined, config.systemPrompt)
      
      // Générer la réponse avec Claude
      const response = await generateText({
        model: anthropic(config.model),
        prompt: enrichedPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature
      })

      return this.parseResponse(response.text, criteria)
    } catch (error) {
      console.error('Erreur dans ConceptAgent:', error)
      throw new Error('Erreur lors de la création de concepts')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement et contexte
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /lancement|inauguration|présentation/i, type: 'Lancement produit' },
      { pattern: /gala|soirée|cérémonie/i, type: 'Gala/Soirée' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' },
      { pattern: /salon|exposition|foire/i, type: 'Salon/Exposition' },
      { pattern: /mariage|anniversaire|fête/i, type: 'Événement privé' },
      { pattern: /cocktail|réception/i, type: 'Cocktail/Réception' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire les objectifs
    const objectifs = []
    if (message.match(/innovation|créativité|nouveauté/i)) {
      objectifs.push('Stimuler l\'innovation et la créativité')
    }
    if (message.match(/cohésion|team|équipe/i)) {
      objectifs.push('Renforcer la cohésion d\'équipe')
    }
    if (message.match(/communication|message|valeurs/i)) {
      objectifs.push('Communiquer les valeurs de l\'entreprise')
    }
    if (message.match(/networking|réseau|rencontres/i)) {
      objectifs.push('Faciliter le networking')
    }
    if (message.match(/formation|apprentissage|développement/i)) {
      objectifs.push('Favoriser l\'apprentissage')
    }
    criteria.objectifs = objectifs.join(', ') || 'Créer une expérience mémorable'

    // Extraire la cible/participants
    if (message.match(/cadres?|dirigeants?|managers?|direction/i)) {
      criteria.cible = 'Cadres et dirigeants'
    } else if (message.match(/équipes?|collaborateurs?|salariés?|employés?/i)) {
      criteria.cible = 'Équipes et collaborateurs'
    } else if (message.match(/clients?|prospects?|partenaires?/i)) {
      criteria.cible = 'Clients et partenaires'
    } else if (message.match(/jeunes?|étudiants?|millennials?/i)) {
      criteria.cible = 'Public jeune'
    } else if (message.match(/experts?|professionnels?|spécialistes?/i)) {
      criteria.cible = 'Experts et professionnels'
    }

    // Extraire les thématiques, valeurs, messages
    const thematiques = []
    if (message.match(/innovation|technologie|digital|futur/i)) {
      thematiques.push('Innovation et technologie')
    }
    if (message.match(/durable|écologie|environnement|rse/i)) {
      thematiques.push('Développement durable')
    }
    if (message.match(/excellence|qualité|performance/i)) {
      thematiques.push('Excellence et performance')
    }
    if (message.match(/humain|bienveillance|collaboration/i)) {
      thematiques.push('Valeurs humaines')
    }
    if (message.match(/créativité|art|culture/i)) {
      thematiques.push('Créativité et culture')
    }
    criteria.thematiques = thematiques.join(', ') || 'À définir selon l\'événement'

    // Extraire les contraintes
    const contraintes = []
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?)/i)
    if (budgetMatch) {
      contraintes.push(`Budget: ${budgetMatch[1].replace(/\s/g, '')}€`)
    }
    
    const locationMatch = message.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i)
    if (locationMatch) {
      contraintes.push(`Lieu: ${locationMatch[1].trim()}`)
    }
    
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i)
    if (dateMatch) {
      contraintes.push(`Date: ${dateMatch[0]}`)
    }
    
    if (message.match(/intérieur|salle|indoor/i)) {
      contraintes.push('Format: Intérieur')
    } else if (message.match(/extérieur|outdoor|plein.?air/i)) {
      contraintes.push('Format: Extérieur possible')
    }
    
    criteria.contraintes = contraintes.join(', ') || 'Contraintes standards'

    // Extraire les inspirations
    if (message.match(/cinéma|film|hollywood/i)) {
      criteria.inspirations = 'Cinéma et entertainment'
    } else if (message.match(/art|musée|galerie/i)) {
      criteria.inspirations = 'Art et culture'
    } else if (message.match(/nature|voyage|aventure/i)) {
      criteria.inspirations = 'Nature et voyage'
    } else if (message.match(/sport|compétition|olympique/i)) {
      criteria.inspirations = 'Sport et compétition'
    } else if (message.match(/luxe|prestige|élégance/i)) {
      criteria.inspirations = 'Luxe et prestige'
    }

    // Extraire les souhaits particuliers
    if (message.match(/interactif|participation|engagement/i)) {
      criteria.souhaits = 'Expérience interactive et participative'
    } else if (message.match(/spectaculaire|impressionnant|wow/i)) {
      criteria.souhaits = 'Effet spectaculaire et mémorable'
    } else if (message.match(/intimiste|convivial|chaleureux/i)) {
      criteria.souhaits = 'Ambiance intimiste et conviviale'
    }

    // Extraire la durée et moments clés
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.moments_cles = `Événement de ${dureeMatch[0]}`
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.objectives) criteria.objectifs = context.objectives.join(', ')
      if (context.targetAudience) criteria.cible = context.targetAudience
      if (context.budget) criteria.contraintes = `Budget: ${context.budget}, ${criteria.contraintes}`
      if (context.duration) criteria.moments_cles = `Durée: ${context.duration}`
      if (context.constraints) criteria.contraintes = `${criteria.contraintes}, ${context.constraints.join(', ')}`
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any, systemPrompt?: string): string {
    // Ajouter l'enrichissement web si disponible
    const webInfo = webEnrichment ? `

INFORMATIONS WEB RÉCENTES :
${webEnrichment.summary}

Sources web consultées :
${webEnrichment.results.map((r: any) => `• ${r.title} (${r.domain}): ${r.snippet.substring(0, 150)}...`).join('\n')}
` : ''

    // Utiliser le prompt système depuis Supabase ou un fallback
    const basePrompt = systemPrompt || `CONTEXTE SYSTÈME : Tu fais partie de Studio Evento, un écosystème d'agents spécialisés coordonnés par un orchestrateur central. Tu peux référencer les informations des autres modules si pertinent pour tes recommandations.

Tu es un expert en création de concepts événementiels et storytelling.

À partir des informations ci-dessous, propose 3 concepts originaux et impactants pour l'événement décrit, en détaillant pour chaque :
- Nom du concept
- Slogan ou phrase d'accroche
- Description synthétique et univers créatif (mise en scène, ambiance…)
- Expérience proposée aux participants (fil rouge, moments forts…)
- Déclinaisons possibles (format, digital, RSE…)
- Inspirations ou références éventuelles (cinéma, art, pop culture, etc.)
- Arguments qui justifient la pertinence du concept par rapport au brief

Sois créatif, audacieux mais cohérent. Mets en avant la différenciation et la valeur ajoutée de chaque concept.

Structure ta réponse avec :
1. **CONCEPT 1** avec tous les détails demandés
2. **CONCEPT 2** avec tous les détails demandés  
3. **CONCEPT 3** avec tous les détails demandés
4. **RECOMMANDATION FINALE** avec le concept le plus adapté et pourquoi

Réponds en français avec créativité et professionnalisme.`

    return `${basePrompt}${webInfo}
- Type d'événement et contexte : ${criteria.type_evenement || 'À définir'}
- Objectifs à atteindre : ${criteria.objectifs || 'À préciser'}
- Cible/participants : ${criteria.cible || 'À définir'}
- Thématiques, valeurs, messages à véhiculer : ${criteria.thematiques || 'À définir'}
- Contraintes (budget, lieu, saison, format…) : ${criteria.contraintes || 'Contraintes standards'}
- Inspirations à prendre en compte : ${criteria.inspirations || 'Ouvert à toutes inspirations'}
- Souhaits particuliers : ${criteria.souhaits || 'Expérience mémorable'}
- Durée et moments clés à scénariser : ${criteria.moments_cles || 'À définir'}
- Contraintes graphiques/branding : ${criteria.graphisme || 'Liberté créative'}

Sois créatif, audacieux mais cohérent. Mets en avant la différenciation et la valeur ajoutée de chaque concept.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **CONCEPT 1** avec tous les détails demandés
2. **CONCEPT 2** avec tous les détails demandés  
3. **CONCEPT 3** avec tous les détails demandés
4. **RECOMMANDATION FINALE** avec le concept le plus adapté et pourquoi

Réponds en français avec créativité et professionnalisme.`
  }

  private parseResponse(responseText: string, criteria: any): ConceptResponse {
    // Parser basique pour extraire les concepts
    const concepts = []
    
    // Concept par défaut si parsing échoue
    for (let i = 1; i <= 3; i++) {
      concepts.push({
        name: `Concept ${i}`,
        slogan: 'Slogan à définir',
        description: 'Description créative du concept',
        experience: 'Expérience participant immersive',
        declinaisons: ['Format présentiel', 'Déclinaison digitale', 'Version RSE'],
        inspirations: ['Références créatives', 'Inspirations sectorielles'],
        arguments: ['Pertinence par rapport aux objectifs', 'Différenciation forte', 'Faisabilité technique']
      })
    }

    return {
      concepts,
      analysis: responseText,
      recommendations: [
        'Valider le concept choisi avec les parties prenantes',
        'Décliner le concept sur tous les supports',
        'Prévoir des tests utilisateurs si possible'
      ]
    }
  }
}

export const conceptAgent = new ConceptAgent()

