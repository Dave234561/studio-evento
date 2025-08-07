import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface RiskRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    participants?: number
    location?: string
    date?: string
    duration?: string
    budget?: number
    constraints?: string[]
  }
}

export interface RiskResponse {
  analyseRisques: {
    risquesMajeurs: Array<{
      risque: string
      probabilite: string
      impact: string
      gravite: string
      description: string
      consequences: string[]
    }>
    risquesModeres: Array<{
      risque: string
      probabilite: string
      impact: string
      gravite: string
      description: string
      consequences: string[]
    }>
    risquesMineurs: Array<{
      risque: string
      probabilite: string
      impact: string
      gravite: string
      description: string
      consequences: string[]
    }>
  }
  planMitigation: Array<{
    risque: string
    prevention: Array<{
      action: string
      responsable: string
      delai: string
      cout: string
    }>
    contingence: Array<{
      action: string
      declencheur: string
      responsable: string
      ressources: string
    }>
  }>
  checklistSecurite: Array<{
    categorie: string
    points: Array<{
      item: string
      obligatoire: boolean
      responsable: string
      echeance: string
    }>
  }>
  analysis: string
}

export class RiskAgent {
  async processRequest(request: RiskRequest): Promise<RiskResponse> {
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
      console.error('Erreur dans RiskAgent:', error)
      throw new Error('Erreur lors de l\'analyse des risques')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement
    const eventTypes = [
      { pattern: /séminaire|formation|conférence/i, type: 'Séminaire/Formation' },
      { pattern: /gala|soirée|cérémonie/i, type: 'Gala/Soirée' },
      { pattern: /salon|exposition|foire/i, type: 'Salon/Exposition' },
      { pattern: /festival|concert|spectacle/i, type: 'Festival/Spectacle' },
      { pattern: /mariage|anniversaire|fête/i, type: 'Événement privé' },
      { pattern: /sport|compétition|tournoi/i, type: 'Événement sportif' },
      { pattern: /lancement|inauguration/i, type: 'Lancement produit' },
      { pattern: /team.?building|cohésion/i, type: 'Team Building' }
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

    // Extraire les dates
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i)
    if (dateMatch) {
      criteria.dates = dateMatch[0]
    }

    const dureeMatch = message.match(/(\d+)\s*(?:jours?|heures?|h)/i)
    if (dureeMatch) {
      criteria.duree = dureeMatch[0]
    }

    // Extraire le lieu et format
    const locationMatch = message.match(/(?:à|dans|sur|vers)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s+pour|\s+avec|\s*$|,)/i)
    if (locationMatch) {
      criteria.lieu = locationMatch[1].trim()
    }

    if (message.match(/intérieur|salle|indoor/i)) {
      criteria.format_lieu = 'Intérieur'
    } else if (message.match(/extérieur|outdoor|plein.?air|jardin|parc/i)) {
      criteria.format_lieu = 'Extérieur'
    } else if (message.match(/mixte|hybride|intérieur.?extérieur/i)) {
      criteria.format_lieu = 'Mixte'
    }

    // Extraire la saison/météo
    if (message.match(/été|estival|juillet|août/i)) {
      criteria.saison = 'Été'
    } else if (message.match(/hiver|hivernal|décembre|janvier|février/i)) {
      criteria.saison = 'Hiver'
    } else if (message.match(/printemps|mars|avril|mai/i)) {
      criteria.saison = 'Printemps'
    } else if (message.match(/automne|septembre|octobre|novembre/i)) {
      criteria.saison = 'Automne'
    }

    // Extraire les activités à risque
    const activites = []
    if (message.match(/sport|activité.?physique|challenge/i)) {
      activites.push('Activités sportives')
    }
    if (message.match(/cuisine|culinaire|atelier.?cuisine/i)) {
      activites.push('Ateliers culinaires')
    }
    if (message.match(/spectacle|show|performance/i)) {
      activites.push('Spectacles et performances')
    }
    if (message.match(/alcool|cocktail|dégustation/i)) {
      activites.push('Service d\'alcool')
    }
    if (message.match(/enfant|famille|mineur/i)) {
      activites.push('Présence d\'enfants')
    }
    if (message.match(/feu|pyrotechnie|artifice/i)) {
      activites.push('Effets pyrotechniques')
    }
    criteria.activites = activites.join(', ') || 'Activités standards'

    // Extraire les contraintes techniques
    const technique = []
    if (message.match(/sonorisation|sono|audio/i)) {
      technique.push('Sonorisation')
    }
    if (message.match(/éclairage|lumière|projecteur/i)) {
      technique.push('Éclairage')
    }
    if (message.match(/scène|podium|estrade/i)) {
      technique.push('Structures scéniques')
    }
    if (message.match(/électricité|alimentation|groupe/i)) {
      technique.push('Alimentation électrique')
    }
    if (message.match(/vidéo|écran|projection/i)) {
      technique.push('Équipements vidéo')
    }
    criteria.technique = technique.join(', ') || 'Équipements standards'

    // Extraire le profil des participants
    if (message.match(/vip|personnalité|dirigeant/i)) {
      criteria.profil_participants = 'VIP et personnalités'
    } else if (message.match(/enfant|famille|jeune/i)) {
      criteria.profil_participants = 'Familles avec enfants'
    } else if (message.match(/senior|âgé|retraité/i)) {
      criteria.profil_participants = 'Public senior'
    } else if (message.match(/handicap|pmr|accessibilité/i)) {
      criteria.profil_participants = 'Personnes à mobilité réduite'
    } else {
      criteria.profil_participants = 'Public général'
    }

    // Extraire le budget (pour évaluer les moyens de sécurité)
    const budgetMatch = message.match(/(\d+(?:\s*\d{3})*)\s*(?:€|euros?|k€|K€)/i)
    if (budgetMatch) {
      let budget = budgetMatch[1].replace(/\s/g, '')
      if (budgetMatch[0].toLowerCase().includes('k')) {
        budget = (parseInt(budget) * 1000).toString()
      }
      criteria.budget = parseInt(budget)
    }

    // Extraire les contraintes spécifiques
    const contraintes = []
    if (message.match(/covid|sanitaire|virus/i)) {
      contraintes.push('Contraintes sanitaires')
    }
    if (message.match(/sécurité|vigile|contrôle/i)) {
      contraintes.push('Sécurité renforcée')
    }
    if (message.match(/assurance|responsabilité|juridique/i)) {
      contraintes.push('Exigences d\'assurance')
    }
    if (message.match(/autorisation|préfecture|mairie/i)) {
      contraintes.push('Autorisations administratives')
    }
    criteria.contraintes = contraintes.join(', ') || 'Contraintes standards'

    // Ajouter le contexte si fourni
    if (context) {
      if (context.participants) criteria.nb_participants = context.participants
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.location) criteria.lieu = context.location
      if (context.date) criteria.dates = context.date
      if (context.duration) criteria.duree = context.duration
      if (context.budget) criteria.budget = context.budget
      if (context.constraints) criteria.contraintes = context.constraints.join(', ')
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    return `Tu es expert en gestion des risques événementiels et sécurité.

À partir des informations ci-dessous, réalise une analyse complète des risques de l'événement décrit et propose un plan de mitigation détaillé.

**Analyse à fournir :**

1. **Identification et classification des risques** par niveau de gravité :
   - Risques majeurs (impact fort, probabilité élevée)
   - Risques modérés (impact moyen ou probabilité moyenne)
   - Risques mineurs (impact faible, probabilité faible)

Pour chaque risque, précise :
- Description du risque
- Probabilité d'occurrence (faible/moyenne/élevée)
- Impact potentiel (faible/moyen/fort)
- Conséquences possibles

2. **Plan de mitigation** pour chaque risque majeur et modéré :
   - Actions de prévention (à mettre en place avant l'événement)
   - Plans de contingence (actions en cas de survenance du risque)
   - Responsables et délais
   - Coûts estimés

3. **Checklist sécurité** organisée par catégories :
   - Sécurité des personnes
   - Sécurité technique
   - Sécurité juridique/administrative
   - Sécurité sanitaire
   - Sécurité logistique

Pour chaque point, indique si c'est obligatoire ou recommandé, le responsable et l'échéance.

Utilise un ton professionnel et précis. Base-toi sur la réglementation française et les bonnes pratiques du secteur.

Voici les informations de l'événement :
- Type d'événement : ${criteria.type_evenement || 'Non spécifié'}
- Nombre de participants : ${criteria.nb_participants || 'Non spécifié'}
- Dates et durée : ${criteria.dates || 'Non spécifiées'}, ${criteria.duree || 'Non spécifiée'}
- Lieu et format : ${criteria.lieu || 'Non spécifié'}, ${criteria.format_lieu || 'Non spécifié'}
- Saison/conditions météo : ${criteria.saison || 'Non spécifiée'}
- Activités prévues : ${criteria.activites || 'Non spécifiées'}
- Équipements techniques : ${criteria.technique || 'Non spécifiés'}
- Profil des participants : ${criteria.profil_participants || 'Non spécifié'}
- Budget disponible : ${criteria.budget ? criteria.budget + '€' : 'Non spécifié'}
- Contraintes spécifiques : ${criteria.contraintes || 'Aucune contrainte spécifique'}
- Historique d'incidents : ${criteria.historique || 'Pas d\'historique disponible'}
- Niveau de sécurité souhaité : ${criteria.niveau_securite || 'Standard'}

Sois exhaustif mais pragmatique. Priorise les risques selon leur criticité réelle.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **RISQUES MAJEURS** (probabilité élevée, impact fort)
2. **RISQUES MODÉRÉS** (probabilité ou impact moyen)
3. **RISQUES MINEURS** (probabilité faible, impact faible)
4. **PLAN DE MITIGATION** (prévention et contingence)
5. **CHECKLIST SÉCURITÉ** (par catégories avec responsables)

Réponds en français avec un ton professionnel et sécuritaire.`
  }

  private parseResponse(responseText: string, criteria: any): RiskResponse {
    const participants = criteria.nb_participants || 100
    const isOutdoor = criteria.format_lieu === 'Extérieur'
    const hasRiskyActivities = criteria.activites?.includes('sport') || criteria.activites?.includes('spectacle')

    return {
      analyseRisques: {
        risquesMajeurs: [
          {
            risque: 'Incident sécurité personnes',
            probabilite: 'Moyenne',
            impact: 'Fort',
            gravite: 'Critique',
            description: 'Blessure, malaise ou accident impliquant les participants',
            consequences: ['Arrêt de l\'événement', 'Responsabilité juridique', 'Impact image']
          },
          ...(isOutdoor ? [{
            risque: 'Conditions météorologiques défavorables',
            probabilite: 'Élevée',
            impact: 'Fort',
            gravite: 'Majeur',
            description: 'Pluie, vent fort ou conditions extrêmes',
            consequences: ['Annulation partielle', 'Inconfort participants', 'Dégâts matériels']
          }] : []),
          ...(participants > 200 ? [{
            risque: 'Mouvement de foule',
            probabilite: 'Faible',
            impact: 'Fort',
            gravite: 'Critique',
            description: 'Panique ou bousculade dans les espaces confinés',
            consequences: ['Blessures multiples', 'Évacuation d\'urgence', 'Traumatismes']
          }] : [])
        ],
        risquesModeres: [
          {
            risque: 'Défaillance technique',
            probabilite: 'Moyenne',
            impact: 'Moyen',
            gravite: 'Modéré',
            description: 'Panne sonorisation, éclairage ou équipements',
            consequences: ['Perturbation programme', 'Mécontentement participants']
          },
          {
            risque: 'Retard ou absence intervenant clé',
            probabilite: 'Moyenne',
            impact: 'Moyen',
            gravite: 'Modéré',
            description: 'Indisponibilité de dernière minute',
            consequences: ['Modification programme', 'Déception audience']
          },
          {
            risque: 'Problème logistique',
            probabilite: 'Élevée',
            impact: 'Faible',
            gravite: 'Modéré',
            description: 'Retard livraison, erreur commande, problème accès',
            consequences: ['Stress organisationnel', 'Ajustements de dernière minute']
          }
        ],
        risquesMineurs: [
          {
            risque: 'Insatisfaction restauration',
            probabilite: 'Moyenne',
            impact: 'Faible',
            gravite: 'Mineur',
            description: 'Qualité ou quantité insuffisante des repas',
            consequences: ['Commentaires négatifs', 'Impact satisfaction globale']
          },
          {
            risque: 'Problème de communication',
            probabilite: 'Faible',
            impact: 'Faible',
            gravite: 'Mineur',
            description: 'Information manquante ou erronée',
            consequences: ['Confusion temporaire', 'Perte de temps']
          }
        ]
      },
      planMitigation: [
        {
          risque: 'Incident sécurité personnes',
          prevention: [
            { action: 'Contrôle sécurité du lieu', responsable: 'Organisateur', delai: 'J-15', cout: '500€' },
            { action: 'Présence secouriste', responsable: 'Prestataire sécurité', delai: 'Jour J', cout: '300€' },
            { action: 'Trousse de premiers secours', responsable: 'Équipe logistique', delai: 'J-1', cout: '50€' }
          ],
          contingence: [
            { action: 'Appel services d\'urgence', declencheur: 'Incident grave', responsable: 'Responsable sécurité', ressources: 'Téléphone d\'urgence' },
            { action: 'Évacuation partielle', declencheur: 'Zone dangereuse', responsable: 'Équipe sécurité', ressources: 'Plan d\'évacuation' }
          ]
        },
        ...(isOutdoor ? [{
          risque: 'Conditions météorologiques',
          prevention: [
            { action: 'Surveillance météo J-3', responsable: 'Organisateur', delai: 'J-3', cout: '0€' },
            { action: 'Solution de repli couverte', responsable: 'Responsable lieu', delai: 'J-7', cout: '1000€' },
            { action: 'Équipements protection pluie', responsable: 'Prestataire', delai: 'J-1', cout: '200€' }
          ],
          contingence: [
            { action: 'Activation plan B couvert', declencheur: 'Alerte météo orange', responsable: 'Directeur événement', ressources: 'Lieu de repli' },
            { action: 'Report événement', declencheur: 'Alerte rouge', responsable: 'Direction', ressources: 'Communication d\'urgence' }
          ]
        }] : [])
      ],
      checklistSecurite: [
        {
          categorie: 'Sécurité des personnes',
          points: [
            { item: 'Vérification capacité d\'accueil du lieu', obligatoire: true, responsable: 'Organisateur', echeance: 'J-30' },
            { item: 'Présence secouriste diplômé', obligatoire: participants > 50, responsable: 'Prestataire sécurité', echeance: 'Jour J' },
            { item: 'Signalisation issues de secours', obligatoire: true, responsable: 'Responsable lieu', echeance: 'J-1' },
            { item: 'Trousse de premiers secours accessible', obligatoire: true, responsable: 'Équipe logistique', echeance: 'Jour J' }
          ]
        },
        {
          categorie: 'Sécurité technique',
          points: [
            { item: 'Vérification installations électriques', obligatoire: true, responsable: 'Prestataire technique', echeance: 'J-2' },
            { item: 'Test équipements sonorisation', obligatoire: true, responsable: 'Technicien son', echeance: 'J-1' },
            { item: 'Contrôle stabilité structures', obligatoire: true, responsable: 'Prestataire scénographie', echeance: 'J-1' },
            { item: 'Plan de sauvegarde équipements', obligatoire: false, responsable: 'Responsable technique', echeance: 'J-7' }
          ]
        },
        {
          categorie: 'Sécurité juridique/administrative',
          points: [
            { item: 'Assurance responsabilité civile', obligatoire: true, responsable: 'Organisateur', echeance: 'J-15' },
            { item: 'Déclaration préfecture si >1500 personnes', obligatoire: participants > 1500, responsable: 'Organisateur', echeance: 'J-30' },
            { item: 'Autorisations débit de boissons', obligatoire: criteria.activites?.includes('alcool'), responsable: 'Organisateur', echeance: 'J-15' },
            { item: 'Contrats prestataires signés', obligatoire: true, responsable: 'Responsable achats', echeance: 'J-7' }
          ]
        }
      ],
      analysis: responseText
    }
  }
}

export const riskAgent = new RiskAgent()

