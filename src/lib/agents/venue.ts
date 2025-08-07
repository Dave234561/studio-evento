import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { VenueService } from '../services/venueService'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface VenueRequest {
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
    date?: string
    requirements?: string[]
    accessibility?: boolean
    parking?: boolean
    catering?: boolean
  }
}

export interface VenueResponse {
  recommendations: Array<{
    nom: string
    capacite: string
    localite: string
    code_postal?: string
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

export class VenueAgent {
  async processRequest(request: VenueRequest): Promise<VenueResponse> {
    try {
      console.log('🏢 [VENUE] Début traitement:', request.message)
      
      // Extraire les critères de recherche du message
      console.log('🏢 [VENUE] Extraction critères...')
      const criteria = this.extractSearchCriteria(request.message, request.context)
      console.log('🏢 [VENUE] Critères extraits:', criteria)
      
      // Rechercher les lieux correspondants
      console.log('🏢 [VENUE] Recherche venues...')
      const venues = await VenueService.searchVenues(criteria)
      console.log('🏢 [VENUE] Venues trouvées:', venues?.length || 0)
      
      // Construire le prompt avec les nouvelles variables dynamiques
      console.log('🏢 [VENUE] Construction prompt...')
      const enrichedPrompt = this.buildDetailedPrompt(request.message, criteria, venues, undefined)
      console.log('🏢 [VENUE] Prompt construit, longueur:', enrichedPrompt?.length || 0)
      
      // Générer la réponse avec Claude
      console.log('🏢 [VENUE] Appel Claude...')
      const response = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: enrichedPrompt,
        maxTokens: 3000,
        temperature: 0.7
      })
      console.log('🏢 [VENUE] Réponse Claude reçue:', response.text?.length || 0, 'caractères')

      console.log('🏢 [VENUE] Parsing réponse...')
      return this.parseResponse(response.text, venues, criteria)
    } catch (error) {
      console.error('🏢 [VENUE] Erreur détaillée:', error)
      console.error('🏢 [VENUE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      throw new Error('Erreur lors de la recherche de lieux')
    }
  }

  private extractSearchCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /mariage|anniversaire|fête/i, type: 'Événement privé' },
      { pattern: /cocktail|apéritif|réception/i, type: 'Cocktail/Réception' },
      { pattern: /gala|soirée|dîner/i, type: 'Gala/Soirée' },
      { pattern: /salon|exposition|foire/i, type: 'Salon/Exposition' },
      { pattern: /lancement|inauguration/i, type: 'Lancement produit' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' },
      { pattern: /assemblée|réunion/i, type: 'Assemblée/Réunion' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire les dates/durée
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i)
    if (dateMatch) {
      criteria.dates = dateMatch[0]
    }
    
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.dates = criteria.dates ? `${criteria.dates} (${dureeMatch[0]})` : dureeMatch[0]
    }

    // Extraire le nombre de participants
    const participantsMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?|invités?)/i)
    if (participantsMatch) {
      criteria.nb_participants = parseInt(participantsMatch[1])
    }

    // Extraire le lieu/destination recherchée
    const locationPatterns = [
      /(?:à|dans|sur|vers)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i,
      /région\s+([A-Za-zÀ-ÿ\s-]+)/i,
      /proche\s+de\s+([A-Za-zÀ-ÿ\s-]+)/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = message.match(pattern)
      if (match) {
        criteria.lieu_recherche = match[1].trim()
        break
      }
    }

    // Extraire le profil des participants
    if (message.match(/cadres?|dirigeants?|managers?|direction/i)) {
      criteria.profil_participants = 'Cadres/Dirigeants'
    } else if (message.match(/équipes?|collaborateurs?|salariés?|employés?/i)) {
      criteria.profil_participants = 'Équipes/Collaborateurs'
    } else if (message.match(/clients?|prospects?|partenaires?/i)) {
      criteria.profil_participants = 'Clients/Partenaires'
    } else if (message.match(/famille|amis|proches/i)) {
      criteria.profil_participants = 'Famille/Amis'
    }

    // Extraire le budget
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?)/i)
    if (budgetMatch) {
      criteria.budget = budgetMatch[1].replace(/\s/g, '') + '€'
    }

    // Extraire le format de salle
    if (message.match(/théâtre|auditorium|amphithéâtre/i)) {
      criteria.format_salle = 'Théâtre/Auditorium'
    } else if (message.match(/classe|école|formation/i)) {
      criteria.format_salle = 'Classe/Formation'
    } else if (message.match(/cocktail|debout|réception/i)) {
      criteria.format_salle = 'Cocktail/Debout'
    } else if (message.match(/banquet|dîner|assis/i)) {
      criteria.format_salle = 'Banquet/Dîner'
    } else if (message.match(/u|fer à cheval/i)) {
      criteria.format_salle = 'En U'
    }

    // Extraire les besoins techniques
    const besoinstech = []
    if (message.match(/vidéoprojecteur|projecteur|écran/i)) {
      besoinstech.push('Vidéoprojecteur/Écran')
    }
    if (message.match(/sonorisation|micro|audio/i)) {
      besoinstech.push('Sonorisation')
    }
    if (message.match(/wifi|internet|connexion/i)) {
      besoinstech.push('WiFi/Internet')
    }
    if (message.match(/éclairage|lumière/i)) {
      besoinstech.push('Éclairage')
    }
    criteria.besoins_techniques = besoinstech.join(', ') || 'Standard'

    // Extraire l'accessibilité
    if (message.match(/transport|gare|aéroport|métro/i)) {
      criteria.accessibilite = 'Transports en commun requis'
    } else if (message.match(/parking|voiture|stationnement/i)) {
      criteria.accessibilite = 'Parking requis'
    } else if (message.match(/hébergement|hôtel|logement/i)) {
      criteria.accessibilite = 'Hébergement à proximité'
    }

    // Extraire les contraintes
    const contraintes = []
    if (message.match(/accessible|handicap|pmr/i)) {
      contraintes.push('Accessibilité PMR')
    }
    if (message.match(/climatisation|climatisé/i)) {
      contraintes.push('Climatisation')
    }
    if (message.match(/extérieur|terrasse|jardin/i)) {
      contraintes.push('Espace extérieur')
    }
    if (message.match(/cuisine|traiteur|restauration/i)) {
      contraintes.push('Possibilité restauration')
    }
    criteria.contraintes = contraintes.join(', ') || 'Aucune contrainte spécifique'

    // Extraire les activités
    if (message.match(/team.?building|activités|animations/i)) {
      criteria.activites = 'Team building et animations'
    } else if (message.match(/visite|découverte|tourisme/i)) {
      criteria.activites = 'Visites et découvertes'
    } else if (message.match(/sport|golf|tennis/i)) {
      criteria.activites = 'Activités sportives'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.budget) criteria.budget = context.budget
      if (context.location) criteria.lieu_recherche = context.location
      if (context.duration) criteria.dates = context.duration
      if (context.date) criteria.dates = context.date
      if (context.requirements) criteria.besoins_techniques = context.requirements.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, venues: any[] = [], webEnrichment?: any): string {
    const venuesText = venues.length > 0 
      ? venues.slice(0, 10).map(v => 
          `- ${v.nom} (${v.localite}): Capacité ${v.capacite} personnes${v.code_postal ? ` - ${v.code_postal}` : ''}${v.description ? ` - ${v.description}` : ''}`
        ).join('\n')
      : 'Aucun lieu trouvé dans la base de données pour ces critères.'

    // Ajouter l'enrichissement web si disponible
    const webInfo = webEnrichment ? `

INFORMATIONS WEB RÉCENTES :
${webEnrichment.summary}

Sources web consultées :
${webEnrichment.results.map((r: any) => `• ${r.title} (${r.domain}): ${r.snippet.substring(0, 150)}...`).join('\n')}
` : ''

    return `CONTEXTE SYSTÈME : Tu fais partie de Studio Evento, un écosystème d'agents spécialisés coordonnés par un orchestrateur central. Tu peux référencer les informations des autres modules (animations, budget, design) si pertinent pour tes recommandations de lieux.

Tu es un expert en événementiel et en sourcing de lieux.  
À partir des critères ci-dessous, propose une **sélection de lieux adaptés** pour organiser l'événement décrit, en donnant pour chaque lieu :
- Nom et description synthétique
- Localisation précise (adresse/ville/région/pays)
- Capacité d'accueil adaptée au format et au nombre de participants
- Avantages principaux et points distinctifs
- Points de vigilance ou limites éventuelles
- Format des espaces disponibles
- Estimation budgétaire (si possible)
- Suggestions d'activités ou d'ambiances en lien avec le lieu

Si possible, présente les lieux sous forme de tableau comparatif (si tu en proposes plusieurs), puis fais une recommandation personnalisée à la fin.

Voici les critères fournis par l'utilisateur :

- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Dates/durée : ${criteria.dates || 'Non spécifiées'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Lieu/destination recherchée : ${criteria.lieu_recherche || 'Non spécifié'}
- Profil des participants : ${criteria.profil_participants || 'Non spécifié'}
- Budget disponible : ${criteria.budget || 'Non spécifié'}
- Format(s) de salle(s) attendu(s) : ${criteria.format_salle || 'Non spécifié'}
- Besoins techniques : ${criteria.besoins_techniques || 'Standard'}
- Accessibilité (transports, hébergement) : ${criteria.accessibilite || 'Non spécifiée'}
- Contraintes spécifiques : ${criteria.contraintes || 'Aucune'}
- Activités attendues ou souhaitées sur place : ${criteria.activites || 'Non spécifiées'}
- Historique des événements précédents ou lieux à exclure : ${criteria.historique || 'Aucun'}
- Facteurs clés de succès : ${criteria.facteurs_cle_succes || 'Non spécifiés'}

LIEUX DISPONIBLES DANS LA BASE DE DONNÉES:
${venuesText}

INSTRUCTIONS IMPORTANTES:
1. Base tes recommandations EXCLUSIVEMENT sur les lieux de la base de données fournie
2. Utilise un ton professionnel et clair, va à l'essentiel pour aider à la prise de décision
3. Structure ta réponse avec des tableaux comparatifs et une recommandation finale
4. Adapte chaque lieu aux critères spécifiques de l'événement

DEMANDE ORIGINALE: "${originalMessage}"

Réponds en français avec une approche consultative et professionnelle.`
  }

  private parseResponse(responseText: string, venues: any[], criteria: any): VenueResponse {
    const topVenues = venues.slice(0, 5).map((venue, index) => ({
      nom: venue.nom || `Lieu ${index + 1}`,
      capacite: venue.capacite || criteria.nb_participants?.toString() || 'Non spécifiée',
      localite: venue.localite || venue.ville || criteria.lieu_recherche || 'Non spécifiée',
      code_postal: venue.code_postal,
      score: 90 - (index * 5),
      advantages: [
        `Capacité adaptée (${venue.capacite || criteria.nb_participants} personnes)`,
        'Localisation idéale',
        'Équipements modernes'
      ],
      considerations: ['Vérifier disponibilité', 'Confirmer tarifs']
    }))

    return {
      recommendations: topVenues,
      analysis: responseText,
      searchCriteria: {
        capacity: criteria.nb_participants || 0,
        location: criteria.lieu_recherche || 'Non spécifiée',
        eventType: criteria.type_evenement || 'Professionnel',
        budget: parseInt(criteria.budget?.replace(/[€\s]/g, '') || '0')
      },
      alternatives: [
        'Élargir la recherche aux villes voisines',
        'Considérer des lieux avec capacité modulable',
        'Explorer les options de location courte durée'
      ]
    }
  }
}

export const venueAgent = new VenueAgent()

