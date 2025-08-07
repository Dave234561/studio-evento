import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface BudgetRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    budget?: number
    location?: string
    duration?: string
    requirements?: string[]
    constraints?: string[]
  }
}

export interface BudgetResponse {
  budgetDetaille: {
    budgetTotal: number
    repartition: Array<{
      poste: string
      montant: number
      pourcentage: number
      details: Array<{
        item: string
        quantite: number
        prixUnitaire: number
        total: number
        commentaire: string
      }>
    }>
  }
  optimisations: Array<{
    poste: string
    economie: number
    action: string
    impact: string
    faisabilite: string
    risques: string[]
  }>
  scenarios: Array<{
    nom: string
    budget: number
    description: string
    avantages: string[]
    inconvenients: string[]
    recommandation: boolean
  }>
  conseils: Array<{
    categorie: string
    conseil: string
    benefice: string
    mise_en_oeuvre: string
  }>
  analysis: string
}

export class BudgetAgent {
  async processRequest(request: BudgetRequest): Promise<BudgetResponse> {
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
      console.error('Erreur dans BudgetAgent:', error)
      throw new Error('Erreur lors de l\'optimisation du budget')
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
      { pattern: /lancement|inauguration/i, type: 'Lancement produit' },
      { pattern: /cocktail|réception/i, type: 'Cocktail/Réception' },
      { pattern: /festival|concert|spectacle/i, type: 'Festival/Spectacle' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire le budget
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?|k€|K€)/i)
    if (budgetMatch) {
      let budget = budgetMatch[1].replace(/\s/g, '')
      if (budgetMatch[0].toLowerCase().includes('k')) {
        budget = (parseInt(budget) * 1000).toString()
      }
      criteria.budget = parseInt(budget)
    }

    // Extraire le nombre de participants
    const participantsMatch = message.match(/(\d+)\s*(?:personnes?|participants?|pax|places?|invités?)/i)
    if (participantsMatch) {
      criteria.nb_participants = parseInt(participantsMatch[1])
    }

    // Extraire la durée
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.duree = dureeMatch[0]
    }

    // Extraire le lieu/destination
    const locationMatch = message.match(/(?:à|dans|sur|vers)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i)
    if (locationMatch) {
      criteria.lieu = locationMatch[1].trim()
    }

    // Extraire les prestations souhaitées
    const prestations = []
    if (message.match(/hébergement|hôtel|logement/i)) {
      prestations.push('Hébergement')
    }
    if (message.match(/transport|déplacement|voyage/i)) {
      prestations.push('Transport')
    }
    if (message.match(/restauration|repas|déjeuner|dîner/i)) {
      prestations.push('Restauration')
    }
    if (message.match(/animation|spectacle|show/i)) {
      prestations.push('Animation')
    }
    if (message.match(/technique|sonorisation|éclairage/i)) {
      prestations.push('Technique')
    }
    if (message.match(/décoration|scénographie|fleurs/i)) {
      prestations.push('Décoration')
    }
    if (message.match(/communication|invitation|signalétique/i)) {
      prestations.push('Communication')
    }
    if (message.match(/photo|vidéo|reportage/i)) {
      prestations.push('Captation')
    }
    criteria.prestations = prestations.join(', ') || 'Prestations standards'

    // Extraire le niveau de standing
    if (message.match(/luxe|prestige|haut.?de.?gamme|5.?étoiles/i)) {
      criteria.standing = 'Luxe/Prestige'
    } else if (message.match(/premium|qualité|4.?étoiles/i)) {
      criteria.standing = 'Premium'
    } else if (message.match(/standard|classique|3.?étoiles/i)) {
      criteria.standing = 'Standard'
    } else if (message.match(/économique|budget|serré/i)) {
      criteria.standing = 'Économique'
    } else {
      criteria.standing = 'Standard'
    }

    // Extraire les contraintes budgétaires
    const contraintes = []
    if (message.match(/budget.?serré|économie|réduction/i)) {
      contraintes.push('Budget contraint')
    }
    if (message.match(/urgent|dernière.?minute|court.?délai/i)) {
      contraintes.push('Délai court')
    }
    if (message.match(/négociation|remise|tarif.?préférentiel/i)) {
      contraintes.push('Négociation requise')
    }
    if (message.match(/qualité|excellence|sans.?compromis/i)) {
      contraintes.push('Qualité prioritaire')
    }
    criteria.contraintes = contraintes.join(', ') || 'Contraintes standards'

    // Extraire les priorités
    const priorites = []
    if (message.match(/lieu|salle|location/i)) {
      priorites.push('Lieu exceptionnel')
    }
    if (message.match(/restauration|gastronomie|chef/i)) {
      priorites.push('Restauration de qualité')
    }
    if (message.match(/animation|divertissement|spectacle/i)) {
      priorites.push('Animation marquante')
    }
    if (message.match(/technique|audiovisuel|digital/i)) {
      priorites.push('Équipements techniques')
    }
    criteria.priorites = priorites.join(', ') || 'Équilibre général'

    // Extraire les objectifs d'optimisation
    if (message.match(/optimis|économis|rédui|moins.?cher/i)) {
      criteria.objectif = 'Optimisation budgétaire'
    } else if (message.match(/qualité|excellence|premium/i)) {
      criteria.objectif = 'Maximisation qualité'
    } else if (message.match(/équilibr|compromis|juste.?milieu/i)) {
      criteria.objectif = 'Équilibre qualité-prix'
    } else {
      criteria.objectif = 'Optimisation générale'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.budget) criteria.budget = context.budget
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.location) criteria.lieu = context.location
      if (context.duration) criteria.duree = context.duration
      if (context.requirements) criteria.prestations = context.requirements.join(', ')
      if (context.constraints) criteria.contraintes = context.constraints.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    return `Tu es expert en gestion budgétaire événementielle et optimisation des coûts.

À partir des informations ci-dessous, propose une analyse budgétaire complète et des recommandations d'optimisation pour l'événement décrit.

**Analyse à fournir :**

1. **Budget détaillé** avec répartition par postes principaux :
   - Lieu et logistique
   - Restauration
   - Animation et contenu
   - Technique et audiovisuel
   - Communication et signalétique
   - Transport et hébergement
   - Divers et imprévus

Pour chaque poste, détaille les éléments constitutifs avec quantités, prix unitaires et totaux.

2. **Recommandations d'optimisation** pour réduire les coûts sans compromettre la qualité :
   - Actions concrètes par poste
   - Économies potentielles chiffrées
   - Impact sur la qualité de l'événement
   - Faisabilité et risques

3. **Scénarios budgétaires** (3 versions) :
   - Version "économique" (-20% du budget)
   - Version "standard" (budget de référence)
   - Version "premium" (+20% du budget)

4. **Conseils pratiques** pour la gestion budgétaire :
   - Négociation avec les prestataires
   - Timing optimal des achats
   - Alternatives créatives
   - Pièges à éviter

Utilise des tarifs réalistes basés sur le marché français actuel.
Justifie tes estimations et indique les facteurs de variation.

Voici les informations de l'événement :
- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Budget disponible : ${criteria.budget ? criteria.budget + '€' : 'Non spécifié'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Durée : ${criteria.duree || 'Non spécifiée'}
- Lieu/destination : ${criteria.lieu || 'Non spécifié'}
- Prestations souhaitées : ${criteria.prestations || 'Non spécifiées'}
- Niveau de standing : ${criteria.standing || 'Standard'}
- Contraintes budgétaires : ${criteria.contraintes || 'Aucune contrainte spécifique'}
- Priorités : ${criteria.priorites || 'Non spécifiées'}
- Objectif d'optimisation : ${criteria.objectif || 'Optimisation générale'}
- Historique budgétaire : ${criteria.historique || 'Pas d\'historique disponible'}
- Marge de manœuvre : ${criteria.marge || 'Standard'}

Sois précis, réaliste et actionnable. Propose des solutions créatives pour optimiser le rapport qualité-prix.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **BUDGET DÉTAILLÉ** (répartition par postes avec détails)
2. **OPTIMISATIONS RECOMMANDÉES** (actions concrètes par poste)
3. **SCÉNARIOS BUDGÉTAIRES** (économique, standard, premium)
4. **CONSEILS PRATIQUES** (négociation et gestion)

Réponds en français avec un ton professionnel et pragmatique.`
  }

  private parseResponse(responseText: string, criteria: any): BudgetResponse {
    const budget = criteria.budget || 50000
    const participants = criteria.nb_participants || 100
    const budgetParParticipant = budget / participants

    // Répartition budgétaire standard
    const repartitionStandard = {
      lieu: 0.30,
      restauration: 0.25,
      animation: 0.15,
      technique: 0.10,
      communication: 0.08,
      transport: 0.07,
      divers: 0.05
    }

    const postes = [
      {
        poste: 'Lieu et logistique',
        montant: Math.round(budget * repartitionStandard.lieu),
        pourcentage: Math.round(repartitionStandard.lieu * 100),
        details: [
          { item: 'Location salle principale', quantite: 1, prixUnitaire: Math.round(budget * 0.20), total: Math.round(budget * 0.20), commentaire: 'Salle adaptée à la capacité' },
          { item: 'Espaces annexes', quantite: 2, prixUnitaire: Math.round(budget * 0.05), total: Math.round(budget * 0.10), commentaire: 'Accueil et pause' }
        ]
      },
      {
        poste: 'Restauration',
        montant: Math.round(budget * repartitionStandard.restauration),
        pourcentage: Math.round(repartitionStandard.restauration * 100),
        details: [
          { item: 'Déjeuner', quantite: participants, prixUnitaire: Math.round(budgetParParticipant * 0.15), total: Math.round(budget * 0.15), commentaire: 'Menu 3 services' },
          { item: 'Pauses café', quantite: participants * 2, prixUnitaire: Math.round(budgetParParticipant * 0.05), total: Math.round(budget * 0.10), commentaire: '2 pauses dans la journée' }
        ]
      },
      {
        poste: 'Animation et contenu',
        montant: Math.round(budget * repartitionStandard.animation),
        pourcentage: Math.round(repartitionStandard.animation * 100),
        details: [
          { item: 'Intervenant principal', quantite: 1, prixUnitaire: Math.round(budget * 0.10), total: Math.round(budget * 0.10), commentaire: 'Expert reconnu' },
          { item: 'Animation team building', quantite: 1, prixUnitaire: Math.round(budget * 0.05), total: Math.round(budget * 0.05), commentaire: 'Activité de cohésion' }
        ]
      }
    ]

    return {
      budgetDetaille: {
        budgetTotal: budget,
        repartition: postes
      },
      optimisations: [
        {
          poste: 'Lieu et logistique',
          economie: Math.round(budget * 0.05),
          action: 'Négocier un package incluant les espaces annexes',
          impact: 'Économie de 5% sans impact qualité',
          faisabilite: 'Élevée',
          risques: ['Moins de flexibilité sur les horaires']
        },
        {
          poste: 'Restauration',
          economie: Math.round(budget * 0.03),
          action: 'Proposer un menu buffet au lieu du service à table',
          impact: 'Économie de 3% avec ambiance plus conviviale',
          faisabilite: 'Moyenne',
          risques: ['Moins de standing', 'Gestion des flux']
        },
        {
          poste: 'Animation',
          economie: Math.round(budget * 0.02),
          action: 'Privilégier des intervenants locaux',
          impact: 'Économie sur les frais de déplacement',
          faisabilite: 'Élevée',
          risques: ['Choix plus restreint']
        }
      ],
      scenarios: [
        {
          nom: 'Économique',
          budget: Math.round(budget * 0.8),
          description: 'Version optimisée avec prestations essentielles',
          avantages: ['Respect budget contraint', 'Focus sur l\'essentiel'],
          inconvenients: ['Moins de prestations annexes', 'Standing réduit'],
          recommandation: criteria.standing === 'Économique'
        },
        {
          nom: 'Standard',
          budget: budget,
          description: 'Version équilibrée qualité-prix',
          avantages: ['Bon rapport qualité-prix', 'Prestations complètes'],
          inconvenients: ['Pas d\'extras', 'Choix limités'],
          recommandation: true
        },
        {
          nom: 'Premium',
          budget: Math.round(budget * 1.2),
          description: 'Version haut de gamme avec prestations d\'exception',
          avantages: ['Qualité maximale', 'Expérience mémorable'],
          inconvenients: ['Coût élevé', 'ROI à valider'],
          recommandation: criteria.standing === 'Luxe/Prestige'
        }
      ],
      conseils: [
        {
          categorie: 'Négociation',
          conseil: 'Demander plusieurs devis et négocier les packages',
          benefice: 'Économie de 10-15% en moyenne',
          mise_en_oeuvre: 'Contacter 3-4 prestataires par poste'
        },
        {
          categorie: 'Timing',
          conseil: 'Réserver les prestations principales 2-3 mois à l\'avance',
          benefice: 'Meilleurs tarifs et disponibilité',
          mise_en_oeuvre: 'Planning de réservation échelonné'
        },
        {
          categorie: 'Alternatives',
          conseil: 'Explorer les solutions créatives et locales',
          benefice: 'Originalité et économies',
          mise_en_oeuvre: 'Recherche de prestataires émergents'
        }
      ],
      analysis: responseText
    }
  }
}

export const budgetAgent = new BudgetAgent()

