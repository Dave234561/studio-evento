import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder'
})

export interface DesignRequest {
  message: string
  context?: {
    sessionId?: string
    module?: string
    userMessage?: string
    eventType?: string
    brand?: string
    colors?: string[]
    style?: string
    audience?: string
    constraints?: string[]
  }
}

export interface DesignResponse {
  charteGraphique: {
    palette: {
      couleurs: Array<{
        nom: string
        hex: string
        usage: string
      }>
    }
    typographies: Array<{
      nom: string
      usage: string
      style: string
    }>
    elements: {
      motifs: string[]
      pictos: string[]
      textures: string[]
    }
    logo: {
      idee: string
      style: string
      variantes: string[]
    }
    inspirations: string[]
    ambiance: string[]
  }
  applications: Array<{
    support: string
    couleurs: string[]
    miseEnPage: string
    elements: string[]
    ton: string
  }>
  exemples: Array<{
    support: string
    description: string
    specifications: string
  }>
  moodboardPrompt: string
  analysis: string
}

export class DesignAgent {
  async processRequest(request: DesignRequest): Promise<DesignResponse> {
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
        temperature: 0.8
      })

      return this.parseResponse(response.text, criteria)
    } catch (error) {
      console.error('Erreur dans DesignAgent:', error)
      throw new Error('Erreur lors de la création de la charte graphique')
    }
  }

  private extractCriteria(message: string, context?: any) {
    const criteria: any = {}
    
    // Extraire le type d'événement/contexte
    const eventTypes = [
      { pattern: /séminaire|formation|conférence|corporate/i, type: 'Événement corporate' },
      { pattern: /lancement|inauguration|présentation/i, type: 'Lancement produit' },
      { pattern: /gala|soirée|cérémonie|prestige/i, type: 'Événement prestige' },
      { pattern: /festival|concert|spectacle/i, type: 'Événement culturel' },
      { pattern: /salon|exposition|foire/i, type: 'Salon professionnel' },
      { pattern: /mariage|anniversaire|fête/i, type: 'Événement privé' },
      { pattern: /sport|compétition|challenge/i, type: 'Événement sportif' }
    ]

    for (const { pattern, type } of eventTypes) {
      if (pattern.test(message)) {
        criteria.type_evenement = type
        break
      }
    }

    // Extraire les objectifs/valeurs/messages
    const objectifs = []
    if (message.match(/innovation|technologie|digital|futur/i)) {
      objectifs.push('Innovation et modernité')
    }
    if (message.match(/excellence|qualité|performance|professionnel/i)) {
      objectifs.push('Excellence et professionnalisme')
    }
    if (message.match(/créativité|art|culture|original/i)) {
      objectifs.push('Créativité et originalité')
    }
    if (message.match(/durable|écologie|environnement|rse|vert/i)) {
      objectifs.push('Développement durable')
    }
    if (message.match(/luxe|prestige|élégance|haut.?de.?gamme/i)) {
      objectifs.push('Luxe et prestige')
    }
    if (message.match(/dynamique|énergie|mouvement|action/i)) {
      objectifs.push('Dynamisme et énergie')
    }
    criteria.objectifs = objectifs.join(', ') || 'Professionnalisme et impact'

    // Extraire l'univers/ambiances souhaités
    const univers = []
    if (message.match(/moderne|contemporain|actuel/i)) {
      univers.push('Moderne et contemporain')
    }
    if (message.match(/classique|traditionnel|intemporel/i)) {
      univers.push('Classique et intemporel')
    }
    if (message.match(/minimaliste|épuré|simple/i)) {
      univers.push('Minimaliste et épuré')
    }
    if (message.match(/coloré|vibrant|énergique/i)) {
      univers.push('Coloré et vibrant')
    }
    if (message.match(/naturel|organique|authentique/i)) {
      univers.push('Naturel et authentique')
    }
    if (message.match(/technologique|digital|cyber/i)) {
      univers.push('Technologique et digital')
    }
    criteria.univers = univers.join(', ') || 'Professionnel et moderne'

    // Extraire les contraintes branding
    if (message.match(/charte.?existante|identité.?visuelle|logo.?entreprise/i)) {
      criteria.contraintes = 'Respecter la charte graphique existante'
    } else if (message.match(/couleurs?.?imposées?|palette.?définie/i)) {
      criteria.contraintes = 'Couleurs imposées par la marque'
    } else {
      criteria.contraintes = 'Liberté créative totale'
    }

    // Extraire les inspirations/références
    if (message.match(/apple|google|tech|startup/i)) {
      criteria.inspirations = 'Univers tech et startup'
    } else if (message.match(/luxury|chanel|dior|luxe/i)) {
      criteria.inspirations = 'Codes du luxe'
    } else if (message.match(/nature|bio|écologique/i)) {
      criteria.inspirations = 'Inspiration naturelle'
    } else if (message.match(/art|musée|culture/i)) {
      criteria.inspirations = 'Univers artistique et culturel'
    } else if (message.match(/sport|olympique|compétition/i)) {
      criteria.inspirations = 'Codes sportifs'
    }

    // Extraire les supports visés
    const supports = []
    if (message.match(/invitation|save.?the.?date/i)) {
      supports.push('Invitations')
    }
    if (message.match(/kakémono|roll.?up|signalétique/i)) {
      supports.push('Signalétique')
    }
    if (message.match(/badge|accréditation/i)) {
      supports.push('Badges')
    }
    if (message.match(/powerpoint|présentation|slide/i)) {
      supports.push('Présentations')
    }
    if (message.match(/site.?web|digital|écran/i)) {
      supports.push('Supports digitaux')
    }
    criteria.supports = supports.join(', ') || 'Tous supports événementiels'

    // Extraire le public cible
    if (message.match(/cadres?|dirigeants?|managers?|direction/i)) {
      criteria.cible = 'Cadres et dirigeants'
    } else if (message.match(/jeunes?|étudiants?|millennials?/i)) {
      criteria.cible = 'Public jeune'
    } else if (message.match(/experts?|professionnels?|spécialistes?/i)) {
      criteria.cible = 'Experts professionnels'
    } else if (message.match(/grand.?public|famille|tous/i)) {
      criteria.cible = 'Grand public'
    }

    // Ajouter le contexte si fourni
    if (context) {
      if (context.eventType) criteria.type_evenement = context.eventType
      if (context.brand) criteria.contraintes = `Marque: ${context.brand}`
      if (context.colors) criteria.contraintes = `Couleurs: ${context.colors.join(', ')}`
      if (context.style) criteria.univers = context.style
      if (context.audience) criteria.cible = context.audience
      if (context.constraints) criteria.contraintes = `${criteria.contraintes}, ${context.constraints.join(', ')}`
    }

    return criteria
  }

  private buildDetailedPrompt(originalMessage: string, criteria: any, webEnrichment?: any): string {
    return `Tu es directeur artistique spécialisé en événementiel.

À partir des éléments ci-dessous, crée une mini-charte graphique dédiée à cet événement :
- Palette de couleurs (codes hex, usage recommandé)
- Typographies (libres de droits, usage conseillé : titres, textes, chiffres)
- Motifs/éléments graphiques (formes, pictos, textures)
- Suggestions de logo éphémère (idée, style, variante)
- Inspirations visuelles (moodboard, univers…)
- Ambiance générale à transmettre (3 à 5 adjectifs)
- Recommandations d'usage détaillées pour chaque support de l'événement : Save the date, invitation, kakémonos, signalétique, badges, infodécor, scénographie, powerpoints
- Pour chaque support, liste : couleurs à privilégier, mise en page recommandée, éléments graphiques à utiliser, ton ou style à adopter

**Détaille un exemple d'application de la charte pour 3 supports :**
- Invitation (texte d'exemple, couleurs, typo, éléments graphiques)
- Kakémonos (accroche ou slogan, mise en page, ambiance visuelle)
- Infodécor (ambiance, message, combinaison couleur/éléments visuels)

Termine par un prompt en anglais pour générer un moodboard image via IA.

Voici les informations fournies :
- Type d'événement/contexte : ${criteria.type_evenement || 'Événement professionnel'}
- Objectifs/valeurs/messages : ${criteria.objectifs || 'Professionnalisme et impact'}
- Univers/ambiances souhaités : ${criteria.univers || 'Moderne et professionnel'}
- Contraintes branding : ${criteria.contraintes || 'Liberté créative'}
- Inspirations/références : ${criteria.inspirations || 'Références contemporaines'}
- Supports visés : ${criteria.supports || 'Supports événementiels standards'}
- Public cible : ${criteria.cible || 'Professionnels'}

Sois créatif, cohérent, et rends la charte exploitable directement, même pour quelqu'un sans compétences graphiques.

DEMANDE ORIGINALE: "${originalMessage}"

Structure ta réponse avec :
1. **PALETTE DE COULEURS** (codes hex et usages)
2. **TYPOGRAPHIES** (noms et usages)
3. **ÉLÉMENTS GRAPHIQUES** (motifs, pictos, textures)
4. **LOGO ÉPHÉMÈRE** (concept et variantes)
5. **INSPIRATIONS VISUELLES** (moodboard et univers)
6. **AMBIANCE GÉNÉRALE** (5 adjectifs clés)
7. **APPLICATIONS PAR SUPPORT** (détails pour chaque support)
8. **EXEMPLES CONCRETS** (3 applications détaillées)
9. **PROMPT MOODBOARD IA** (en anglais)

Réponds en français avec créativité et précision technique.`
  }

  private parseResponse(responseText: string, criteria: any): DesignResponse {
    return {
      charteGraphique: {
        palette: {
          couleurs: [
            { nom: 'Couleur principale', hex: '#1E3A8A', usage: 'Titres et éléments forts' },
            { nom: 'Couleur secondaire', hex: '#3B82F6', usage: 'Accents et liens' },
            { nom: 'Couleur neutre', hex: '#6B7280', usage: 'Textes et fonds' }
          ]
        },
        typographies: [
          { nom: 'Roboto', usage: 'Titres et headers', style: 'Sans-serif moderne' },
          { nom: 'Open Sans', usage: 'Textes courants', style: 'Lisible et professionnel' }
        ],
        elements: {
          motifs: ['Lignes géométriques', 'Formes abstraites', 'Patterns subtils'],
          pictos: ['Icônes minimalistes', 'Symboles métier', 'Pictogrammes universels'],
          textures: ['Dégradés subtils', 'Effets de matière', 'Transparences']
        },
        logo: {
          idee: 'Logo éphémère basé sur le concept événementiel',
          style: 'Moderne et mémorable',
          variantes: ['Version couleur', 'Version monochrome', 'Version simplifiée']
        },
        inspirations: ['Design contemporain', 'Codes sectoriels', 'Tendances actuelles'],
        ambiance: ['Professionnel', 'Moderne', 'Impactant', 'Cohérent', 'Mémorable']
      },
      applications: [
        {
          support: 'Save the date',
          couleurs: ['Couleur principale', 'Couleur secondaire'],
          miseEnPage: 'Épurée et impactante',
          elements: ['Logo', 'Informations essentielles', 'Call-to-action'],
          ton: 'Informatif et engageant'
        },
        {
          support: 'Invitation',
          couleurs: ['Palette complète'],
          miseEnPage: 'Structurée et élégante',
          elements: ['Visuel principal', 'Programme', 'Informations pratiques'],
          ton: 'Professionnel et accueillant'
        },
        {
          support: 'Signalétique',
          couleurs: ['Couleurs contrastées'],
          miseEnPage: 'Lisible à distance',
          elements: ['Pictogrammes', 'Textes courts', 'Codes couleurs'],
          ton: 'Informatif et direct'
        }
      ],
      exemples: [
        {
          support: 'Invitation',
          description: 'Design élégant avec palette de couleurs cohérente',
          specifications: 'Format A5, impression haute qualité, finition mate'
        },
        {
          support: 'Kakémono',
          description: 'Visuel impactant pour l\'accueil des participants',
          specifications: '200x80cm, impression textile, structure enroulable'
        },
        {
          support: 'Infodécor',
          description: 'Ambiance visuelle immersive pour les espaces',
          specifications: 'Formats variables, impression grand format, pose temporaire'
        }
      ],
      moodboardPrompt: `Create a professional event moodboard featuring ${criteria.univers || 'modern corporate'} design elements, ${criteria.objectifs || 'professional'} atmosphere, color palette with blues and grays, clean typography, geometric patterns, suitable for ${criteria.type_evenement || 'corporate event'}`,
      analysis: responseText
    }
  }
}

export const designAgent = new DesignAgent()

