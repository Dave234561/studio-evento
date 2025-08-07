import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AnimationService } from '../services/animationService'

export interface AnimationRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    budget?: string
    location?: string
    duration?: string
    objectives?: string[]
    webEnrichment?: {
      query: string
      results: Array<{
        title: string
        url: string
        snippet: string
        domain: string
        relevanceScore: number
      }>
      summary: string
      sources: string[]
    }
  }
}

export interface AnimationResponse {
  recommendations: Array<{
    nom: string
    type_animation: string
    description: string
    capacite?: string
    duree?: string
    prix?: string
    contact?: string
    url?: string
  }>
  analysis: string
  suggestions: string[]
}

export class AnimationAgent {
  async processRequest(request: AnimationRequest): Promise<AnimationResponse> {
    try {
      // Extraire les critères de recherche du message
      const criteria = this.extractCriteria(request.message, request.context)
      
      // Rechercher les animations correspondantes
      const animations = await AnimationService.searchAnimations(criteria)
      
      // Construire le prompt avec les nouvelles variables dynamiques et enrichissement web
      const enrichedPrompt = this.buildDetailedPrompt(request.message, animations, criteria, undefined)
      
      // Générer la réponse avec OpenAI
      const response = await generateText({
        model: openai('gpt-4'),
        prompt: enrichedPrompt,
        maxTokens: 3000,
        temperature: 0.7
      })

      return this.parseResponse(response.text, animations)
    } catch (error) {
      console.error('Erreur dans AnimationAgent:', error)
      throw new Error('Erreur lors de la recherche d\'animations')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' },
      { pattern: /cocktail|apéritif/i, type: 'Cocktail' },
      { pattern: /gala|soirée/i, type: 'Gala/Soirée' },
      { pattern: /mariage|anniversaire/i, type: 'Événement privé' },
      { pattern: /salon|exposition/i, type: 'Salon/Exposition' },
      { pattern: /lancement|inauguration/i, type: 'Lancement produit' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire le nombre de participants
    const participantsMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?)/i)
    if (participantsMatch) {
      criteria.nb_participants = parseInt(participantsMatch[1])
    }

    // Extraire le profil des participants
    if (message.match(/cadres?|dirigeants?|managers?/i)) {
      criteria.profil_participants = 'Cadres/Dirigeants'
    } else if (message.match(/équipes?|collaborateurs?|salariés?/i)) {
      criteria.profil_participants = 'Équipes/Collaborateurs'
    } else if (message.match(/clients?|prospects?/i)) {
      criteria.profil_participants = 'Clients/Prospects'
    }

    // Extraire les objectifs
    const objectifs = []
    if (message.match(/cohésion|team.?building|esprit.?équipe/i)) {
      objectifs.push('Renforcer la cohésion d\'équipe')
    }
    if (message.match(/créativité|innovation|brainstorming/i)) {
      objectifs.push('Stimuler la créativité')
    }
    if (message.match(/détente|bien.?être|relaxation/i)) {
      objectifs.push('Favoriser la détente')
    }
    if (message.match(/networking|réseau|rencontres/i)) {
      objectifs.push('Faciliter le networking')
    }
    criteria.objectifs = objectifs.join(', ') || 'Divertissement et engagement'

    // Extraire la durée
    const dureeMatch = message.match(/(\d+)\s*(?:heures?|h|minutes?|min|jours?)/i)
    if (dureeMatch) {
      criteria.duree = dureeMatch[0]
    }

    // Extraire le format
    if (message.match(/atelier|workshop/i)) {
      criteria.format = 'Atelier/Workshop'
    } else if (message.match(/spectacle|show|performance/i)) {
      criteria.format = 'Spectacle/Show'
    } else if (message.match(/challenge|compétition|jeu/i)) {
      criteria.format = 'Challenge/Jeu'
    } else if (message.match(/conférence|présentation/i)) {
      criteria.format = 'Conférence/Présentation'
    }

    // Extraire la thématique
    if (message.match(/cuisine|culinaire|gastronomie/i)) {
      criteria.thematique = 'Culinaire'
    } else if (message.match(/sport|sportif|activité.?physique/i)) {
      criteria.thematique = 'Sportive'
    } else if (message.match(/art|artistique|créatif/i)) {
      criteria.thematique = 'Artistique'
    } else if (message.match(/technologie|digital|numérique/i)) {
      criteria.thematique = 'Technologique'
    } else if (message.match(/nature|écologique|environnement/i)) {
      criteria.thematique = 'Nature/Écologique'
    }

    // Extraire les contraintes de lieu
    if (message.match(/intérieur|salle|indoor/i)) {
      criteria.contraintes_lieu = 'Intérieur uniquement'
    } else if (message.match(/extérieur|outdoor|plein.?air/i)) {
      criteria.contraintes_lieu = 'Extérieur possible'
    }

    // Extraire le budget
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?)/i)
    if (budgetMatch) {
      criteria.budget = budgetMatch[1].replace(/\s/g, '') + '€'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.budget) criteria.budget = context.budget
      if (context.duration) criteria.duree = context.duration
      if (context.location) criteria.contraintes_lieu = context.location
      if (context.objectives) criteria.objectifs = context.objectives.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, animations: any[], criteria: any, webEnrichment?: any): string {
    const animationsText = animations.length > 0 
      ? animations.map(a => 
          `- ${a.nom} (${a.type_animation}): ${a.description}${a.capacite ? ` - Capacité: ${a.capacite}` : ''}${a.duree ? ` - Durée: ${a.duree}` : ''}${a.prix ? ` - Prix: ${a.prix}` : ''}`
        ).join('\n')
      : 'Aucune animation trouvée dans la base de données pour ces critères.'

    // Ajouter l'enrichissement web si disponible
    const webInfo = webEnrichment ? `

INFORMATIONS WEB RÉCENTES :
${webEnrichment.summary}

Sources web consultées :
${webEnrichment.results.map((r: any) => `• ${r.title} (${r.domain}): ${r.snippet.substring(0, 150)}...`).join('\n')}
` : ''

    return `CONTEXTE SYSTÈME : Tu fais partie de Studio Evento, un écosystème d'agents spécialisés coordonnés par un orchestrateur central. Tu peux référencer les informations des autres modules (lieu, budget, design) si pertinent pour tes recommandations.

Tu es un expert en animation événementielle.  
À partir des critères ci-dessous, propose une **sélection d'animations** parfaitement adaptées à l'événement, avec pour chaque proposition :
- Nom de l'animation
- Description synthétique
- Objectif(s) visé(s)
- Format (atelier, spectacle, challenge, etc.)${webInfo}
- Durée estimée
- Taille de groupe idéale
- Besoins techniques/logistiques (si utile)
- Estimation budgétaire (si possible)
- Points forts et points de vigilance
- Idées de variantes ou adaptations selon le contexte

Présente les animations sous forme de tableau comparatif (si plusieurs), puis termine par une recommandation personnalisée.

Voici les critères fournis par l'utilisateur :

- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Profil des participants : ${criteria.profil_participants || 'Non spécifié'}
- Objectifs recherchés : ${criteria.objectifs || 'Non spécifié'}
- Durée(s) souhaitée(s) : ${criteria.duree || 'Non spécifiée'}
- Format(s) attendu(s) : ${criteria.format || 'Non spécifié'}
- Thématique(s) ou ambiance(s) recherchée(s) : ${criteria.thematique || 'Non spécifiée'}
- Contraintes de lieu : ${criteria.contraintes_lieu || 'Non spécifiées'}
- Contraintes budgétaires : ${criteria.budget || 'Non spécifiées'}
- Contraintes techniques/logistiques : ${criteria.contraintes_techniques || 'Non spécifiées'}
- Historique ou préférences : ${criteria.historique || 'Non spécifié'}
- Facteurs clés de succès : ${criteria.facteurs_cle_succes || 'Non spécifiés'}
- Niveau d'implication souhaité des participants : ${criteria.niveau_implication || 'Non spécifié'}

ANIMATIONS DISPONIBLES DANS LA BASE DE DONNÉES:
${animationsText}

INSTRUCTIONS IMPORTANTES:
1. Base tes recommandations EXCLUSIVEMENT sur les animations de la base de données fournie
2. Utilise un ton professionnel, concis, et valorise la créativité
3. Structure ta réponse avec des tableaux clairs et une recommandation finale
4. Adapte chaque animation aux critères spécifiques de l'événement

DEMANDE ORIGINALE: "${originalMessage}"

Réponds en français avec une approche consultative et professionnelle.`
  }

  private parseResponse(responseText: string, animations: any[]): AnimationResponse {
    return {
      recommendations: animations.slice(0, 5), // Top 5 animations
      analysis: responseText,
      suggestions: this.extractSuggestions(responseText)
    }
  }

  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = []
    
    // Extraire les suggestions du texte de réponse
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.includes('suggestion') || line.includes('recommande') || line.includes('conseil')) {
        suggestions.push(line.trim())
      }
    }
    
    return suggestions.slice(0, 3) // Max 3 suggestions
  }
}

export const animationAgent = new AnimationAgent()

