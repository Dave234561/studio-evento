import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface CarbonRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    location?: string
    duration?: string
    transport?: string[]
    accommodation?: string
    catering?: string[]
    activities?: string[]
  }
}

export interface CarbonResponse {
  empreinteCarbone: {
    total: number
    parParticipant: number
    postes: Array<{
      nom: string
      emissions: number
      pourcentage: number
      commentaire: string
    }>
  }
  planAction: {
    incontournables: Array<{
      mesure: string
      impact: string
      benefices: string[]
      contraintes: string[]
      exemples: string[]
    }>
    recommandees: Array<{
      mesure: string
      impact: string
      benefices: string[]
      contraintes: string[]
      exemples: string[]
    }>
    bonus: Array<{
      mesure: string
      impact: string
      benefices: string[]
      contraintes: string[]
      exemples: string[]
    }>
  }
  synthese: string[]
  analysis: string
}

export class CarbonAgent {
  async processRequest(request: CarbonRequest): Promise<CarbonResponse> {
    try {
      // Extraire les critères du message
      const criteria = this.extractCriteria(request.message, request.context)
      
      // Construire le prompt avec les nouvelles variables dynamiques
      const enrichedPrompt = this.buildDetailedPrompt(request.message, criteria, undefined)
      
      // Générer la réponse avec Claude
      const response = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: enrichedPrompt,
        maxTokens: 4000,
        temperature: 0.7
      })

      return this.parseResponse(response.text, criteria)
    } catch (error) {
      console.error('Erreur dans CarbonAgent:', error)
      throw new Error('Erreur lors de l\'analyse carbone')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /gala|soirée|cérémonie/i, type: 'Gala/Soirée' },
      { pattern: /salon|exposition|foire/i, type: 'Salon/Exposition' },
      { pattern: /mariage|anniversaire|fête/i, type: 'Événement privé' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' },
      { pattern: /lancement|inauguration/i, type: 'Lancement produit' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire le nombre de participants
    const participantsMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?|invités?)/i)
    if (participantsMatch) {
      criteria.nb_participants = parseInt(participantsMatch[1])
    }

    // Extraire les dates/durée
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.dates = dureeMatch[0]
    }

    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i)
    if (dateMatch) {
      criteria.dates = criteria.dates ? `${dateMatch[0]} (${criteria.dates})` : dateMatch[0]
    }

    // Extraire le lieu/destination
    const locationMatch = message.match(/(?:à|dans|sur|vers)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i)
    if (locationMatch) {
      criteria.lieu = locationMatch[1].trim()
    }

    // Extraire les modes de transport
    const transports = []
    if (message.match(/avion|aérien|vol/i)) {
      transports.push('Avion')
    }
    if (message.match(/train|sncf|tgv/i)) {
      transports.push('Train')
    }
    if (message.match(/voiture|automobile|route/i)) {
      transports.push('Voiture')
    }
    if (message.match(/bus|car|autocar/i)) {
      transports.push('Bus/Car')
    }
    if (message.match(/covoiturage|partage/i)) {
      transports.push('Covoiturage')
    }
    criteria.transports = transports.join(', ') || 'Transport à définir'

    // Extraire l'hébergement
    if (message.match(/hébergement|hôtel|logement/i)) {
      if (message.match(/nuit|nuits/i)) {
        const nuitMatch = message.match(/(\d+)\s*nuits?/i)
        criteria.hebergement = nuitMatch ? `Hébergement ${nuitMatch[1]} nuit(s)` : 'Hébergement avec nuitée'
      } else {
        criteria.hebergement = 'Hébergement journée'
      }
    } else {
      criteria.hebergement = 'Pas d\'hébergement'
    }

    // Extraire les types de repas
    const repas = []
    if (message.match(/petit.?déjeuner|breakfast/i)) {
      repas.push('Petit-déjeuner')
    }
    if (message.match(/déjeuner|lunch/i)) {
      repas.push('Déjeuner')
    }
    if (message.match(/dîner|dinner/i)) {
      repas.push('Dîner')
    }
    if (message.match(/cocktail|apéritif/i)) {
      repas.push('Cocktail')
    }
    if (message.match(/pause|café|collation/i)) {
      repas.push('Pauses café')
    }
    criteria.repas = repas.join(', ') || 'Restauration standard'

    // Extraire les activités prévues
    const activites = []
    if (message.match(/team.?building|activité.?groupe/i)) {
      activites.push('Team building')
    }
    if (message.match(/visite|découverte|tourisme/i)) {
      activites.push('Visites et découvertes')
    }
    if (message.match(/sport|golf|tennis/i)) {
      activites.push('Activités sportives')
    }
    if (message.match(/spectacle|show|animation/i)) {
      activites.push('Spectacles et animations')
    }
    criteria.activites = activites.join(', ') || 'Activités standard'

    // Extraire les besoins techniques
    const technique = []
    if (message.match(/vidéoprojecteur|écran|audiovisuel/i)) {
      technique.push('Équipements audiovisuels')
    }
    if (message.match(/sonorisation|micro|audio/i)) {
      technique.push('Sonorisation')
    }
    if (message.match(/éclairage|lumière|scénographie/i)) {
      technique.push('Éclairage et scénographie')
    }
    if (message.match(/streaming|digital|virtuel/i)) {
      technique.push('Solutions digitales')
    }
    criteria.technique = technique.join(', ') || 'Équipements standards'

    // Extraire les supports de communication
    const communication = []
    if (message.match(/invitation|save.?the.?date/i)) {
      communication.push('Invitations papier')
    }
    if (message.match(/kakémono|roll.?up|signalétique/i)) {
      communication.push('Signalétique')
    }
    if (message.match(/goodies|cadeaux|objets/i)) {
      communication.push('Goodies et objets')
    }
    if (message.match(/digital|email|site/i)) {
      communication.push('Communication digitale')
    }
    criteria.communication = communication.join(', ') || 'Communication standard'

    // Extraire le niveau d'exigence green
    if (message.match(/très.?écologique|100%.?vert|zéro.?carbone/i)) {
      criteria.niveau_green = 'Très élevé - Objectif zéro carbone'
    } else if (message.match(/écologique|vert|durable|rse/i)) {
      criteria.niveau_green = 'Élevé - Démarche RSE affirmée'
    } else if (message.match(/responsable|conscient|attention/i)) {
      criteria.niveau_green = 'Modéré - Sensibilisation environnementale'
    } else {
      criteria.niveau_green = 'Standard - Optimisations de base'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.location) criteria.lieu = context.location
      if (context.duration) criteria.dates = context.duration
      if (context.transport) criteria.transports = context.transport.join(', ')
      if (context.accommodation) criteria.hebergement = context.accommodation
      if (context.catering) criteria.repas = context.catering.join(', ')
      if (context.activities) criteria.activites = context.activities.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    return `Tu es expert en éco-conception et événementiel responsable.
À partir des critères ci-dessous, propose un plan d'action détaillé pour réduire au maximum l'empreinte carbone de l'événement décrit.
Classe les recommandations par priorité :
- Actions "incontournables"
- Actions "fortement recommandées"
- Actions "bonus"

Pour chaque recommandation, détaille :
- La mesure à mettre en place
- L'impact carbone estimé (qualitatif)
- Les bénéfices annexes (RSE, communication, confort, budget…)
- Les freins/contraintes éventuels
- Des exemples concrets ou fournisseurs si pertinent

Estime de façon indicative l'empreinte carbone totale de l'événement, en kg CO₂, en détaillant les principaux postes : 
- Transport
- Hébergement
- Restauration
- Technique/numérique
- Déchets/communication

Présente ces estimations sous forme de tableau clair (1 colonne "Poste", 1 colonne "Estimation kg CO₂", 1 colonne "Commentaire").
Indique à la fin un ordre de grandeur pour l'empreinte carbone totale et le poste le plus impactant.
Précise que l'estimation reste indicative et dépend de nombreux facteurs réels.

Voici les informations de l'événement :
- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Dates/durée : ${criteria.dates || 'Non spécifiées'}
- Lieu/destination : ${criteria.lieu || 'Non spécifié'}
- Modes de transport prévus : ${criteria.transports || 'Non spécifiés'}
- Hébergement : ${criteria.hebergement || 'Non spécifié'}
- Types de repas : ${criteria.repas || 'Non spécifiés'}
- Activités prévues : ${criteria.activites || 'Non spécifiées'}
- Besoins techniques : ${criteria.technique || 'Non spécifiés'}
- Supports de communication : ${criteria.communication || 'Non spécifiés'}
- Niveau d'exigence/objectif "green" : ${criteria.niveau_green || 'Standard'}
- Contraintes spécifiques : ${criteria.contraintes || 'Aucune contrainte spécifique'}
- Démarches éco-responsables déjà en place : ${criteria.historique_green || 'Aucune démarche préexistante'}

Ajoute une synthèse finale en 5 lignes : "Les 5 gestes à privilégier pour maximiser la réduction de l'empreinte carbone sur ce projet".
Utilise un ton pédagogique, pro, et va à l'essentiel.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **ESTIMATION EMPREINTE CARBONE** (tableau détaillé par poste)
2. **ACTIONS INCONTOURNABLES** (mesures prioritaires)
3. **ACTIONS FORTEMENT RECOMMANDÉES** (optimisations importantes)
4. **ACTIONS BONUS** (améliorations supplémentaires)
5. **SYNTHÈSE : LES 5 GESTES CLÉS** (résumé actionnable)

Réponds en français avec un ton pédagogique et professionnel.`
  }

  private parseResponse(responseText: string, criteria: any): CarbonResponse {
    // Estimation basique basée sur les critères
    const participants = criteria.nb_participants || 50
    const transportEmissions = participants * 45 // 45kg CO2 par participant en moyenne
    const hebergementEmissions = criteria.hebergement?.includes('nuit') ? participants * 25 : 0
    const restaurationEmissions = participants * 15
    const techniqueEmissions = participants * 3
    const communicationEmissions = participants * 2

    const totalEmissions = transportEmissions + hebergementEmissions + restaurationEmissions + techniqueEmissions + communicationEmissions

    return {
      empreinteCarbone: {
        total: totalEmissions,
        parParticipant: Math.round(totalEmissions / participants),
        postes: [
          {
            nom: 'Transport',
            emissions: transportEmissions,
            pourcentage: Math.round((transportEmissions / totalEmissions) * 100),
            commentaire: 'Principal poste d\'émissions'
          },
          {
            nom: 'Hébergement',
            emissions: hebergementEmissions,
            pourcentage: Math.round((hebergementEmissions / totalEmissions) * 100),
            commentaire: 'Variable selon la durée'
          },
          {
            nom: 'Restauration',
            emissions: restaurationEmissions,
            pourcentage: Math.round((restaurationEmissions / totalEmissions) * 100),
            commentaire: 'Optimisable par les menus'
          },
          {
            nom: 'Technique/numérique',
            emissions: techniqueEmissions,
            pourcentage: Math.round((techniqueEmissions / totalEmissions) * 100),
            commentaire: 'Impact modéré'
          },
          {
            nom: 'Communication',
            emissions: communicationEmissions,
            pourcentage: Math.round((communicationEmissions / totalEmissions) * 100),
            commentaire: 'Réductible par la dématérialisation'
          }
        ]
      },
      planAction: {
        incontournables: [
          {
            mesure: 'Privilégier les transports en commun et le covoiturage',
            impact: 'Réduction de 30-50% des émissions transport',
            benefices: ['Économies budgétaires', 'Convivialité', 'Image RSE'],
            contraintes: ['Organisation logistique', 'Contraintes horaires'],
            exemples: ['Navettes collectives', 'Plateforme covoiturage', 'Incitations financières']
          },
          {
            mesure: 'Choisir un lieu proche des participants',
            impact: 'Réduction significative des déplacements',
            benefices: ['Moins de fatigue', 'Gain de temps', 'Réduction des coûts'],
            contraintes: ['Disponibilité des lieux', 'Capacité d\'accueil'],
            exemples: ['Analyse géographique des participants', 'Lieux centraux', 'Hubs de transport']
          }
        ],
        recommandees: [
          {
            mesure: 'Proposer des menus végétariens et locaux',
            impact: 'Réduction de 20-30% des émissions restauration',
            benefices: ['Découverte culinaire', 'Soutien aux producteurs locaux', 'Santé'],
            contraintes: ['Acceptation des participants', 'Disponibilité saisonnière'],
            exemples: ['Menus de saison', 'Circuits courts', 'Traiteurs éco-responsables']
          },
          {
            mesure: 'Dématérialiser la communication',
            impact: 'Réduction de 80% des émissions communication',
            benefices: ['Réactivité', 'Personnalisation', 'Traçabilité'],
            contraintes: ['Fracture numérique', 'Préférences utilisateurs'],
            exemples: ['Invitations digitales', 'App événement', 'QR codes']
          }
        ],
        bonus: [
          {
            mesure: 'Compenser les émissions résiduelles',
            impact: 'Neutralité carbone théorique',
            benefices: ['Communication positive', 'Engagement concret', 'Sensibilisation'],
            contraintes: ['Coût supplémentaire', 'Choix du projet de compensation'],
            exemples: ['Reforestation', 'Énergies renouvelables', 'Labels reconnus']
          }
        ]
      },
      synthese: [
        'Privilégier les transports collectifs et le covoiturage',
        'Choisir un lieu central et accessible en transports en commun',
        'Proposer des menus végétariens et de saison',
        'Dématérialiser au maximum la communication',
        'Sensibiliser les participants aux gestes éco-responsables'
      ],
      analysis: responseText
    }
  }
}

export const carbonAgent = new CarbonAgent()

