import { VenueService } from '../services/venueService'

interface VenueRequest {
  message: string
  context?: any
}

interface VenueResponse {
  recommendations: Array<{
    name: string
    location: string
    capacity: number
    score: number
    advantages: string[]
    considerations: string[]
  }>
  analysis: string
  searchCriteria: {
    capacity: number
    location: string
    eventType: string
    budget: number
  }
  alternatives: string[]
}

export class VenueAgentSimple {
  async processRequest(request: VenueRequest): Promise<VenueResponse> {
    console.log('🏢 [VENUE-AGENT-SIMPLE] Début processRequest')
    console.log('🏢 [VENUE-AGENT-SIMPLE] Request reçue:', { 
      messageLength: request.message.length,
      hasContext: !!request.context 
    })
    
    try {
      console.log('🏢 [VENUE-AGENT-SIMPLE] Extraction des critères...')
      const criteria = this.extractSearchCriteria(request.message, request.context)
      console.log('🏢 [VENUE-AGENT-SIMPLE] Critères extraits:', criteria)
      
      console.log('🏢 [VENUE-AGENT-SIMPLE] Recherche des lieux...')
      const venues = await VenueService.searchVenues(criteria)
      console.log('🏢 [VENUE-AGENT-SIMPLE] Lieux trouvés:', venues.length)
      
      console.log('🏢 [VENUE-AGENT-SIMPLE] Génération de la réponse simplifiée...')
      
      // Générer une réponse basée directement sur les données Supabase
      const topVenues = venues.slice(0, 3).map((venue, index) => ({
        name: venue.nom || `Lieu ${index + 1}`,
        location: venue.localite || criteria.location,
        capacity: venue.capacite || criteria.capacity,
        score: 90 - (index * 5),
        advantages: [
          `Capacité adaptée (${venue.capacite || criteria.capacity} personnes)`, 
          'Localisation idéale', 
          'Équipements modernes'
        ],
        considerations: ['Vérifier disponibilité', 'Confirmer tarifs']
      }))
      
      const analysis = `Voici mes recommandations pour votre ${criteria.eventType || 'événement'} à ${criteria.location} :

**Recommandations principales :**

${topVenues.map((venue, i) => `
${i + 1}. **${venue.name}** (Score: ${venue.score}/100)
   - Capacité: ${venue.capacity} personnes
   - Localisation: ${venue.location}
   - Avantages: ${venue.advantages.join(', ')}
   - À considérer: ${venue.considerations.join(', ')}
`).join('')}

**Analyse comparative :**
Ces lieux ont été sélectionnés en fonction de votre demande pour ${criteria.capacity} personnes à ${criteria.location}. Ils offrent tous les équipements nécessaires pour votre événement.

**Recommandation finale :**
Je recommande particulièrement ${topVenues[0].name} qui présente le meilleur rapport qualité-prix pour vos besoins.`

      const result = {
        recommendations: topVenues,
        analysis,
        searchCriteria: {
          capacity: criteria.capacity || 0,
          location: criteria.location || 'Non spécifiée',
          eventType: criteria.eventType || 'Professionnel',
          budget: criteria.budget || 0
        },
        alternatives: [
          'Élargir la recherche aux villes voisines',
          'Considérer des lieux avec capacité modulable',
          'Explorer les options de location courte durée'
        ]
      }
      
      console.log('🏢 [VENUE-AGENT-SIMPLE] Réponse générée avec succès:', {
        recommendationsCount: result.recommendations.length,
        hasAnalysis: !!result.analysis,
        hasAlternatives: result.alternatives.length > 0
      })
      
      return result
    } catch (error) {
      console.error('🏢 [VENUE-AGENT-SIMPLE] ERREUR:', error)
      console.error('🏢 [VENUE-AGENT-SIMPLE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw new Error('Erreur lors de la recherche de lieux')
    }
  }

  private extractSearchCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire la capacité
    const capacityMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?)/i)
    if (capacityMatch) {
      criteria.capacity = parseInt(capacityMatch[1])
    }
    
    // Extraire la localisation
    const locationMatch = message.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$)/i)
    if (locationMatch) {
      criteria.location = locationMatch[1].trim()
    }
    
    // Extraire le type d'événement
    const eventTypes = ['mariage', 'séminaire', 'conférence', 'cocktail', 'formation', 'réunion', 'gala', 'anniversaire']
    for (const type of eventTypes) {
      if (message.toLowerCase().includes(type)) {
        criteria.eventType = type
        break
      }
    }
    
    // Extraire le budget
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?)/i)
    if (budgetMatch) {
      criteria.budget = parseInt(budgetMatch[1].replace(/\s/g, ''))
    }
    
    // Ajouter le contexte de session
    if (context) {
      criteria.sessionId = context.sessionId
      criteria.module = context.module
      criteria.userMessage = message
    }
    
    criteria.requirements = []
    
    return criteria
  }
}

