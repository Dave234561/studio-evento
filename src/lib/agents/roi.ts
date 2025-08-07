import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface ROIRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    budget?: number
    objectives?: string[]
    duration?: string
    expectedOutcomes?: string[]
    metrics?: string[]
  }
}

export interface ROIResponse {
  analyseROI: {
    investissement: {
      total: number
      repartition: Array<{
        poste: string
        montant: number
        pourcentage: number
        justification: string
      }>
    }
    benefices: {
      quantifiables: Array<{
        indicateur: string
        valeur: string
        methodologie: string
        impact: string
      }>
      qualitatifs: Array<{
        benefice: string
        description: string
        mesure: string
        importance: string
      }>
    }
    calculs: {
      roiFinancier: string
      roiGlobal: string
      seuilRentabilite: string
      payback: string
    }
  }
  recommandations: Array<{
    action: string
    impact: string
    facilite: string
    priorite: string
  }>
  kpis: Array<{
    nom: string
    definition: string
    cible: string
    mesure: string
  }>
  analysis: string
}

export class ROIAgent {
  async processRequest(request: ROIRequest): Promise<ROIResponse> {
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
      console.error('Erreur dans ROIAgent:', error)
      throw new Error('Erreur lors de l\'analyse ROI')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /lancement|inauguration|présentation/i, type: 'Lancement produit' },
      { pattern: /salon|exposition|foire/i, type: 'Salon/Exposition' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' },
      { pattern: /gala|soirée|cérémonie/i, type: 'Gala/Soirée' },
      { pattern: /incentive|motivation|récompense/i, type: 'Incentive' },
      { pattern: /convention|assemblée|réunion/i, type: 'Convention' }
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

    // Extraire les objectifs business
    const objectifs = []
    if (message.match(/vente|chiffre.?affaires|ca|commercial/i)) {
      objectifs.push('Augmentation des ventes')
    }
    if (message.match(/notoriété|image|marque|brand/i)) {
      objectifs.push('Amélioration de la notoriété')
    }
    if (message.match(/fidélisation|rétention|client/i)) {
      objectifs.push('Fidélisation client')
    }
    if (message.match(/recrutement|talent|rh/i)) {
      objectifs.push('Attraction des talents')
    }
    if (message.match(/formation|compétence|skill/i)) {
      objectifs.push('Développement des compétences')
    }
    if (message.match(/motivation|engagement|satisfaction/i)) {
      objectifs.push('Motivation des équipes')
    }
    if (message.match(/innovation|créativité|r&d/i)) {
      objectifs.push('Stimulation de l\'innovation')
    }
    if (message.match(/partenariat|réseau|networking/i)) {
      objectifs.push('Développement du réseau')
    }
    criteria.objectifs = objectifs.join(', ') || 'Objectifs à préciser'

    // Extraire les résultats attendus
    const resultats = []
    if (message.match(/leads?|prospects?|contacts?/i)) {
      resultats.push('Génération de leads')
    }
    if (message.match(/contrats?|signatures?|deals?/i)) {
      resultats.push('Signature de contrats')
    }
    if (message.match(/satisfaction|nps|feedback/i)) {
      resultats.push('Amélioration de la satisfaction')
    }
    if (message.match(/productivité|performance|efficacité/i)) {
      resultats.push('Gain de productivité')
    }
    if (message.match(/turnover|rétention|départ/i)) {
      resultats.push('Réduction du turnover')
    }
    criteria.resultats = resultats.join(', ') || 'Résultats à définir'

    // Extraire les métriques
    const metriques = []
    if (message.match(/taux.?participation|présence/i)) {
      metriques.push('Taux de participation')
    }
    if (message.match(/satisfaction|note|évaluation/i)) {
      metriques.push('Score de satisfaction')
    }
    if (message.match(/engagement|interaction|activité/i)) {
      metriques.push('Niveau d\'engagement')
    }
    if (message.match(/conversion|transformation/i)) {
      metriques.push('Taux de conversion')
    }
    if (message.match(/roi|retour|rentabilité/i)) {
      metriques.push('ROI financier')
    }
    criteria.metriques = metriques.join(', ') || 'Métriques standards'

    // Extraire le secteur d'activité
    if (message.match(/tech|technologie|it|digital/i)) {
      criteria.secteur = 'Technologie'
    } else if (message.match(/finance|banque|assurance/i)) {
      criteria.secteur = 'Finance'
    } else if (message.match(/santé|médical|pharma/i)) {
      criteria.secteur = 'Santé'
    } else if (message.match(/industrie|manufacturing|production/i)) {
      criteria.secteur = 'Industrie'
    } else if (message.match(/retail|commerce|distribution/i)) {
      criteria.secteur = 'Commerce'
    } else if (message.match(/service|conseil|consulting/i)) {
      criteria.secteur = 'Services'
    }

    // Extraire les contraintes temporelles
    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h|mois)/i)
    if (dureeMatch) {
      criteria.duree = dureeMatch[0]
    }

    // Extraire les enjeux stratégiques
    if (message.match(/stratégique|critique|important|prioritaire/i)) {
      criteria.enjeux = 'Enjeux stratégiques élevés'
    } else if (message.match(/routine|habituel|récurrent/i)) {
      criteria.enjeux = 'Événement récurrent'
    } else {
      criteria.enjeux = 'Enjeux standards'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.budget) criteria.budget = context.budget
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.objectives) criteria.objectifs = context.objectives.join(', ')
      if (context.duration) criteria.duree = context.duration
      if (context.expectedOutcomes) criteria.resultats = context.expectedOutcomes.join(', ')
      if (context.metrics) criteria.metriques = context.metrics.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    return `Tu es expert en analyse ROI événementiel et business analyst.

À partir des informations ci-dessous, réalise une analyse complète du retour sur investissement (ROI) de l'événement décrit.

**Analyse à fournir :**

1. **Estimation de l'investissement total** (répartition par poste : lieu, restauration, animation, logistique, communication, etc.)

2. **Identification et quantification des bénéfices :**
   - Bénéfices quantifiables (chiffre d'affaires, économies, gains de productivité…)
   - Bénéfices qualitatifs (image, satisfaction, motivation…)

3. **Calcul du ROI :**
   - ROI financier direct (si applicable)
   - ROI global (intégrant les bénéfices qualitatifs)
   - Seuil de rentabilité et délai de retour sur investissement

4. **Recommandations d'optimisation** pour améliorer le ROI

5. **KPIs de suivi** à mettre en place avant, pendant et après l'événement

Présente les chiffres sous forme de tableaux clairs et justifie tes estimations.
Utilise des ordres de grandeur réalistes basés sur les standards du secteur.
Indique les hypothèses prises et les facteurs d'incertitude.

Voici les informations de l'événement :
- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Budget disponible : ${criteria.budget ? criteria.budget + '€' : 'Non spécifié'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Objectifs business : ${criteria.objectifs || 'Non spécifiés'}
- Résultats attendus : ${criteria.resultats || 'Non spécifiés'}
- Métriques de succès : ${criteria.metriques || 'Non spécifiées'}
- Secteur d'activité : ${criteria.secteur || 'Non spécifié'}
- Durée de l'événement : ${criteria.duree || 'Non spécifiée'}
- Enjeux stratégiques : ${criteria.enjeux || 'Non spécifiés'}
- Contraintes particulières : ${criteria.contraintes || 'Aucune contrainte spécifique'}
- Historique d'événements similaires : ${criteria.historique || 'Pas d\'historique disponible'}

Sois précis, réaliste et actionnable. Utilise un ton professionnel adapté à une présentation en comité de direction.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **INVESTISSEMENT TOTAL** (répartition détaillée par poste)
2. **BÉNÉFICES QUANTIFIABLES** (avec méthodologie de calcul)
3. **BÉNÉFICES QUALITATIFS** (avec méthodes de mesure)
4. **CALCULS ROI** (financier et global)
5. **RECOMMANDATIONS D'OPTIMISATION** (actions prioritaires)
6. **KPIS DE SUIVI** (avant, pendant, après)

Réponds en français avec un ton professionnel et analytique.`
  }

  private parseResponse(responseText: string, criteria: any): ROIResponse {
    const budget = criteria.budget || 50000
    const participants = criteria.nb_participants || 100

    return {
      analyseROI: {
        investissement: {
          total: budget,
          repartition: [
            { poste: 'Lieu et logistique', montant: Math.round(budget * 0.35), pourcentage: 35, justification: 'Location salle, équipements, logistique' },
            { poste: 'Restauration', montant: Math.round(budget * 0.25), pourcentage: 25, justification: 'Repas, pauses, cocktails' },
            { poste: 'Animation et contenu', montant: Math.round(budget * 0.20), pourcentage: 20, justification: 'Intervenants, animations, contenus' },
            { poste: 'Communication', montant: Math.round(budget * 0.10), pourcentage: 10, justification: 'Invitations, supports, signalétique' },
            { poste: 'Logistique et divers', montant: Math.round(budget * 0.10), pourcentage: 10, justification: 'Transport, hébergement, imprévus' }
          ]
        },
        benefices: {
          quantifiables: [
            { indicateur: 'Génération de leads', valeur: `${participants * 2} leads qualifiés`, methodologie: 'Estimation 2 leads/participant', impact: 'Potentiel CA +15%' },
            { indicateur: 'Gain de productivité', valeur: '5% sur 6 mois', methodologie: 'Amélioration compétences équipes', impact: 'Économie temps et efficacité' },
            { indicateur: 'Réduction turnover', valeur: '2% sur 12 mois', methodologie: 'Amélioration engagement collaborateurs', impact: 'Économie recrutement' }
          ],
          qualitatifs: [
            { benefice: 'Amélioration image de marque', description: 'Renforcement notoriété et positionnement', mesure: 'Enquête brand awareness', importance: 'Élevée' },
            { benefice: 'Cohésion équipes', description: 'Renforcement liens et collaboration', mesure: 'Baromètre interne satisfaction', importance: 'Élevée' },
            { benefice: 'Innovation et créativité', description: 'Stimulation nouvelles idées', mesure: 'Nombre projets innovants lancés', importance: 'Moyenne' }
          ]
        },
        calculs: {
          roiFinancier: '180% sur 12 mois',
          roiGlobal: '250% (incluant bénéfices qualitatifs)',
          seuilRentabilite: '8 mois',
          payback: '6-8 mois selon réalisation objectifs'
        }
      },
      recommandations: [
        { action: 'Optimiser le mix participants/coût', impact: 'Amélioration ROI +20%', facilite: 'Moyenne', priorite: 'Élevée' },
        { action: 'Mettre en place un suivi post-événement', impact: 'Mesure précise des bénéfices', facilite: 'Élevée', priorite: 'Élevée' },
        { action: 'Négocier les prestations en package', impact: 'Réduction coûts 10-15%', facilite: 'Moyenne', priorite: 'Moyenne' },
        { action: 'Intégrer des outils de mesure digitaux', impact: 'Amélioration tracking ROI', facilite: 'Élevée', priorite: 'Moyenne' }
      ],
      kpis: [
        { nom: 'Taux de participation', definition: 'Participants présents / Invités', cible: '>85%', mesure: 'Comptage temps réel' },
        { nom: 'Score de satisfaction', definition: 'Note moyenne satisfaction globale', cible: '>4/5', mesure: 'Questionnaire post-événement' },
        { nom: 'Taux d\'engagement', definition: 'Participation active aux sessions', cible: '>70%', mesure: 'Observation et outils digitaux' },
        { nom: 'Génération de leads', definition: 'Contacts qualifiés obtenus', cible: `${participants * 2} leads`, mesure: 'CRM et suivi commercial' },
        { nom: 'ROI à 6 mois', definition: 'Bénéfices / Investissement', cible: '>150%', mesure: 'Suivi business post-événement' }
      ],
      analysis: responseText
    }
  }
}

export const roiAgent = new ROIAgent()

