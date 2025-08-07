import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface BriefRequest {
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
    date?: string
    duration?: string
    location?: string
    constraints?: string[]
    stakeholders?: string[]
  }
}

export interface BriefResponse {
  cahierDesCharges: {
    executive: ExecutiveSummary
    objectives: ProjectObjectives
    scope: ProjectScope
    requirements: Requirements
    constraints: Constraints
    timeline: Timeline
    budget: BudgetBreakdown
    success: SuccessCriteria
  }
  deliverables: string[]
  analysis: string
}

interface ExecutiveSummary {
  projectName: string
  description: string
  context: string
  keyStakeholders: string[]
}

interface ProjectObjectives {
  primary: string[]
  secondary: string[]
  kpis: string[]
}

interface ProjectScope {
  included: string[]
  excluded: string[]
  assumptions: string[]
}

interface Requirements {
  functional: string[]
  technical: string[]
  logistical: string[]
}

interface Constraints {
  budget: string
  timeline: string
  resources: string[]
  regulatory: string[]
}

interface Timeline {
  phases: Array<{
    name: string
    duration: string
    deliverables: string[]
  }>
  milestones: Array<{
    name: string
    date: string
    criteria: string
  }>
}

interface BudgetBreakdown {
  total: string
  categories: Array<{
    category: string
    amount: string
    percentage: string
  }>
}

interface SuccessCriteria {
  quantitative: string[]
  qualitative: string[]
  measurement: string[]
}

export class BriefAgent {
  async processRequest(request: BriefRequest): Promise<BriefResponse> {
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
      console.error('Erreur dans BriefAgent:', error)
      throw new Error('Erreur lors de la génération du cahier des charges')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le nom ou type de projet
    const projectMatch = message.match(/(?:projet|événement|séminaire|formation|gala|mariage|cocktail|conférence)\s+([^,.\n]+)/i)
    if (projectMatch) {
      criteria.type_projet = projectMatch[0]
    }

    // Extraire le contexte et objectifs
    if (message.match(/objectif|but|goal|vise|souhaite/i)) {
      const objectifMatch = message.match(/(?:objectif|but|goal|vise|souhaite)[^.]*\.?([^.]*)/i)
      if (objectifMatch) {
        criteria.contexte_objectifs = objectifMatch[0]
      }
    }

    // Extraire les dates
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i)
    if (dateMatch) {
      criteria.dates = dateMatch[0]
    }
    
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.dates = criteria.dates ? `${criteria.dates} (${dureeMatch[0]})` : dureeMatch[0]
    }

    // Extraire le lieu
    const locationMatch = message.match(/(?:à|dans|sur|vers)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i)
    if (locationMatch) {
      criteria.lieu = locationMatch[1].trim()
    }

    // Extraire le nombre et profil des participants
    const participantsMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?|invités?)/i)
    if (participantsMatch) {
      criteria.nb_participants = parseInt(participantsMatch[1])
    }

    if (message.match(/cadres?|dirigeants?|managers?|direction/i)) {
      criteria.profil_participants = 'Cadres/Dirigeants'
    } else if (message.match(/équipes?|collaborateurs?|salariés?|employés?/i)) {
      criteria.profil_participants = 'Équipes/Collaborateurs'
    } else if (message.match(/clients?|prospects?|partenaires?/i)) {
      criteria.profil_participants = 'Clients/Partenaires'
    }

    // Extraire le budget
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?)/i)
    if (budgetMatch) {
      criteria.budget = budgetMatch[1].replace(/\s/g, '') + '€'
    }

    // Extraire l'hébergement
    if (message.match(/hébergement|hôtel|logement/i)) {
      if (message.match(/3\s*étoiles?|3\*/i)) {
        criteria.hebergement = '3 étoiles'
      } else if (message.match(/4\s*étoiles?|4\*/i)) {
        criteria.hebergement = '4 étoiles'
      } else if (message.match(/5\s*étoiles?|5\*/i)) {
        criteria.hebergement = '5 étoiles'
      } else {
        criteria.hebergement = 'Standard'
      }
    }

    // Extraire les transports
    if (message.match(/transport|déplacement|voyage/i)) {
      if (message.match(/avion|aérien/i)) {
        criteria.transport = 'Avion'
      } else if (message.match(/train|sncf|tgv/i)) {
        criteria.transport = 'Train'
      } else if (message.match(/bus|car|autocar/i)) {
        criteria.transport = 'Bus/Car'
      } else {
        criteria.transport = 'À définir'
      }
    }

    // Extraire les salles et équipements
    const salles = []
    if (message.match(/plénière|auditorium|amphithéâtre/i)) {
      salles.push('Salle plénière')
    }
    if (message.match(/atelier|workshop|salle de travail/i)) {
      salles.push('Salles d\'atelier')
    }
    if (message.match(/cocktail|réception/i)) {
      salles.push('Espace cocktail')
    }
    criteria.salles_equipements = salles.join(', ') || 'À définir'

    // Extraire les activités
    if (message.match(/team.?building|cohésion/i)) {
      criteria.activites = 'Team building et cohésion'
    } else if (message.match(/formation|apprentissage/i)) {
      criteria.activites = 'Formation et développement'
    } else if (message.match(/networking|réseau/i)) {
      criteria.activites = 'Networking et échanges'
    }

    // Extraire la restauration
    if (message.match(/déjeuner|dîner|repas/i)) {
      criteria.restauration = 'Repas complets'
    } else if (message.match(/pause|café|collation/i)) {
      criteria.restauration = 'Pauses et collations'
    } else if (message.match(/cocktail|apéritif/i)) {
      criteria.restauration = 'Cocktail/Apéritif'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.eventType) criteria.type_projet = context.eventType
      if (context.budget) criteria.budget = context.budget
      if (context.location) criteria.lieu = context.location
      if (context.date) criteria.dates = context.date
      if (context.duration) criteria.dates = criteria.dates ? `${criteria.dates} (${context.duration})` : context.duration
      if (context.objectives) criteria.contexte_objectifs = context.objectives.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    // Ajouter l'enrichissement web si disponible
    const webInfo = webEnrichment ? `

INFORMATIONS WEB RÉCENTES :
${webEnrichment.summary}

Sources web consultées :
${webEnrichment.results.map((r: any) => `• ${r.title} (${r.domain}): ${r.snippet.substring(0, 150)}...`).join('\n')}
` : ''

    return `CONTEXTE SYSTÈME : Tu fais partie de Studio Evento, un écosystème d'agents spécialisés coordonnés par un orchestrateur central. Tu peux référencer les informations des autres modules (lieu, animations, budget) si pertinent pour enrichir le cahier des charges.${webInfo}

Rédige un cahier des charges complet, clair et structuré pour l'organisation de l'événement décrit ci-dessous.  
Ce document doit servir de référence pour toutes les équipes impliquées, qu'il soit utilisé en interne ou partagé avec des partenaires extérieurs.  
Le contenu doit être synthétique mais détaillé, comporter des titres, sous-titres, et reprendre toutes les rubriques essentielles d'un cahier des charges événementiel.  
Si certaines informations sont manquantes, propose les questions à poser pour compléter le dossier.

Voici les informations collectées :

- Nom ou type de projet : ${criteria.type_projet || 'À définir'}
- Contexte et objectifs : ${criteria.contexte_objectifs || 'À préciser'}
- Dates, durée, alternatives : ${criteria.dates || 'À définir'}
- Lieu ou destination(s) envisagée(s) : ${criteria.lieu || 'À définir'}
- Nombre et profil des participants : ${criteria.nb_participants || 'À définir'}, ${criteria.profil_participants || 'À préciser'}
- Budget disponible (total, par personne, TTC/HT, sources) : ${criteria.budget || 'À définir'}
- Hébergement (catégorie, répartition, préférences) : ${criteria.hebergement || 'À définir'}
- Transports et logistique (pré-acheminement, transferts) : ${criteria.transport || 'À définir'}
- Salles et équipements attendus (plénière, ateliers, forums, technique, etc.) : ${criteria.salles_equipements || 'À définir'}
- Activités, animations ou temps forts prévus : ${criteria.activites || 'À définir'}
- Restauration (formats, lieux, contraintes) : ${criteria.restauration || 'À définir'}
- Programme prévisionnel (timing, déroulé, points forts) : ${criteria.programme || 'À définir'}
- Prestations et ressources attendues (organisation, communication, outils, suivi, etc.) : ${criteria.prestations || 'À définir'}
- Contraintes spécifiques, exigences particulières, facteurs clés de succès : ${criteria.contraintes || 'À définir'}
- Contacts, calendrier projet, échéances clés : ${criteria.contacts_calendrier || 'À définir'}

Structure le cahier des charges en :
1. Synthèse du projet
2. Contexte et objectifs
3. Participants et invités
4. Lieu et hébergement
5. Transports et logistique
6. Salles et équipements techniques
7. Activités, animations et restauration
8. Programme prévisionnel
9. Budget et modalités
10. Prestations attendues et ressources mobilisées
11. Contraintes, exigences, facteurs clés de succès
12. Planning projet, contacts et échéances

Utilise un ton professionnel et neutre, adapté à une diffusion interne ou externe.

DEMANDE ORIGINALE: "${originalMessage}"

Réponds en français avec une structure claire et des sections bien définies.`
  }

  private parseResponse(responseText: string, criteria: any): BriefResponse {
    return {
      cahierDesCharges: {
        executive: {
          projectName: criteria.type_projet || 'Projet événementiel',
          description: 'Cahier des charges généré automatiquement',
          context: criteria.contexte_objectifs || 'Contexte à préciser',
          keyStakeholders: ['Organisateur', 'Participants', 'Prestataires']
        },
        objectives: {
          primary: ['Organiser un événement réussi'],
          secondary: ['Respecter le budget', 'Satisfaire les participants'],
          kpis: ['Taux de satisfaction', 'Respect du budget', 'Taux de participation']
        },
        scope: {
          included: ['Organisation complète', 'Coordination prestataires'],
          excluded: ['À définir selon besoins'],
          assumptions: ['Disponibilité des participants', 'Conditions météo favorables']
        },
        requirements: {
          functional: ['Gestion des inscriptions', 'Coordination logistique'],
          technical: ['Équipements audiovisuels', 'Connexion internet'],
          logistical: ['Transport', 'Hébergement', 'Restauration']
        },
        constraints: {
          budget: criteria.budget || 'À définir',
          timeline: criteria.dates || 'À définir',
          resources: ['Équipe projet', 'Prestataires'],
          regulatory: ['Assurances', 'Autorisations']
        },
        timeline: {
          phases: [
            { name: 'Préparation', duration: '2 mois', deliverables: ['Cahier des charges', 'Sélection prestataires'] },
            { name: 'Organisation', duration: '1 mois', deliverables: ['Logistique finalisée', 'Communications'] },
            { name: 'Réalisation', duration: '1-3 jours', deliverables: ['Événement réalisé', 'Bilan à chaud'] }
          ],
          milestones: [
            { name: 'Validation du concept', date: 'J-60', criteria: 'Cahier des charges approuvé' },
            { name: 'Finalisation logistique', date: 'J-15', criteria: 'Tous prestataires confirmés' }
          ]
        },
        budget: {
          total: criteria.budget || 'À définir',
          categories: [
            { category: 'Lieu', amount: '30%', percentage: '30%' },
            { category: 'Restauration', amount: '25%', percentage: '25%' },
            { category: 'Animation', amount: '20%', percentage: '20%' },
            { category: 'Logistique', amount: '15%', percentage: '15%' },
            { category: 'Communication', amount: '10%', percentage: '10%' }
          ]
        },
        success: {
          quantitative: ['Taux de participation > 90%', 'Respect du budget'],
          qualitative: ['Satisfaction participants', 'Atteinte des objectifs'],
          measurement: ['Questionnaire satisfaction', 'Bilan financier', 'Retours participants']
        }
      },
      deliverables: [
        'Cahier des charges complet',
        'Planning détaillé',
        'Budget prévisionnel',
        'Liste des prestataires',
        'Plan de communication'
      ],
      analysis: responseText
    }
  }
}

export const briefAgent = new BriefAgent()

