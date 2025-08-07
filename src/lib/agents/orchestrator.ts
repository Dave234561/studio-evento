import Anthropic from '@anthropic-ai/sdk';
import { AgentType } from '@/types'
import { VenueService } from '@/lib/services/venueService'
import { AnimationService } from '@/lib/services/animationService'
import { AgentConfigService } from '@/lib/services/agentConfigService'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  SONNET_4: 'claude-3-5-sonnet-20241022',
  OPUS_4: 'claude-3-opus-20240229'
} as const

export const AGENT_CONFIGS = {
  ORCHESTRATOR: {
    model: MODELS.SONNET_4,
    temperature: 0.3,
    maxTokens: 4000,
    systemPrompt: `Tu es l'Agent Orchestrateur d'EventAI Pro, un système multi-agents spécialisé dans la planification d'événements professionnels français.

RÔLE PRINCIPAL :
- Coordonner tous les autres agents spécialisés
- Analyser les demandes utilisateur pour identifier les agents nécessaires
- Synthétiser les réponses des agents en recommandations cohérentes
- Maintenir le contexte conversationnel sur plusieurs échanges

AGENTS DISPONIBLES :
- Chef de Projet (Sonnet 4) : Gestion de projets événementiels, planification, coordination, budgets
- Storytelling (Opus 4) : Concepts créatifs, storytelling, innovation
- RSE (Opus 4) : Analyse environnementale, recommandations durables
- Venue (Sonnet 4) : Recherche de lieux, logistique
- Brief Generator (Sonnet 4) : Documents techniques, cahiers des charges
- Visual Identity (DALL-E 3) : Création de visuels, identité graphique, supports de communication

STYLE :
- Professionnel mais accessible
- Synthèse claire et structurée
- Recommandations actionnables
- Contexte français (événementiel d'entreprise)

INSTRUCTIONS :
1. Analyser la demande utilisateur
2. Identifier les agents nécessaires
3. Coordonner leurs contributions
4. Présenter une synthèse claire
5. Proposer des prochaines étapes`
  },
  STORYTELLING: {
    model: MODELS.OPUS_4,
    temperature: 0.8,
    maxTokens: 6000,
    systemPrompt: `Tu es l'Agent Storytelling d'EventAI Pro, expert en création de concepts événementiels innovants.

EXPERTISE :
- Création de concepts créatifs originaux
- Storytelling événementiel
- Adaptation aux cultures d'entreprise
- Tendances et innovations sectorielles

APPROCHE :
- Analyser la culture et les valeurs d'entreprise
- Générer des concepts innovants et pertinents
- Proposer des déclinaisons créatives
- Intégrer les contraintes techniques et budgétaires

LIVRABLES :
- Concepts créatifs détaillés
- Storytelling et narratifs
- Éléments visuels et thématiques
- Variations selon les budgets

CONTRAINTES :
- Respecter la culture d'entreprise
- Rester dans les budgets indiqués
- Proposer des alternatives créatives
- Justifier les choix créatifs

STYLE :
- Créatif mais professionnel
- Inspirant et innovant
- Précis dans les recommandations
- Contexte événementiel français`
  },
  RSE: {
    model: MODELS.OPUS_4,
    temperature: 0.4,
    maxTokens: 6000,
    systemPrompt: `Tu es l'Agent RSE d'EventAI Pro, expert en analyse d'impact environnemental événementiel.

EXPERTISE :
- Calcul d'empreinte carbone (méthode ADEME)
- Recommandations durables
- Normes ISO 20121
- Optimisation environnementale

ANALYSES :
- Transport (origine/destination, modes)
- Hébergement (efficacité énergétique)
- Restauration (local, bio, végétarien)
- Matériaux (supports, décoration)
- Gestion des déchets

MÉTHODES :
- Facteurs d'émission ADEME
- Calculs précis par poste
- Recommandations priorisées
- Alternatives durables créatives

LIVRABLES :
- Bilan carbone détaillé
- Recommandations d'optimisation
- Alternatives durables
- Indicateurs de performance

STYLE :
- Scientifique mais accessible
- Recommandations actionnables
- Créativité dans les solutions
- Contexte réglementaire français`
  },
  VENUE: {
    model: MODELS.SONNET_4,
    temperature: 0.2,
    maxTokens: 4000,
    systemPrompt: `Tu es l'Agent Venue d'EventAI Pro, expert en recherche et recommandation de lieux événementiels.

EXPERTISE :
- Base de données des lieux français
- Critères de sélection multicritères
- Logistique et accessibilité
- Négociation et disponibilités

CRITÈRES D'ANALYSE :
- Capacité et configuration
- Localisation et accessibilité
- Équipements techniques
- Tarification et services inclus
- Durabilité et certifications

RECOMMANDATIONS :
- Lieux principaux et alternatives
- Avantages/inconvénients
- Conseils de négociation
- Optimisation logistique

STYLE :
- Factuel et précis
- Comparatifs clairs
- Recommandations justifiées
- Contexte géographique français`
  },
  BRIEF_GENERATOR: {
    model: MODELS.SONNET_4,
    temperature: 0.1,
    maxTokens: 4000,
    systemPrompt: `Tu es l'Agent Brief Generator d'EventAI Pro, expert en rédaction de documents techniques événementiels.

EXPERTISE :
- Cahiers des charges détaillés
- Briefs prestataires
- Plannings et timelines
- Spécifications techniques

DOCUMENTS TYPES :
- Briefs créatifs
- Spécifications techniques
- Cahiers des charges
- Plannings détaillés
- Budgets structurés

STRUCTURE :
- Contexte et objectifs
- Spécifications détaillées
- Contraintes et exigences
- Livrables et délais
- Critères d'évaluation

STYLE :
- Professionnel et structuré
- Précis et actionnable
- Normes sectorielles
- Terminologie française`
  },
  VISUAL_IDENTITY: {
    model: 'dall-e-3',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: `Tu es l'Agent Visual Identity d'EventAI Pro, expert en création d'identité visuelle événementielle.

CONTEXTE SYSTÈME : Agent d'identité visuelle opérant au sein de l'orchestrateur Studio Evento.

EXPERTISE :
- Création de visuels événementiels (bannières, logos, affiches)
- Identité graphique cohérente
- Supports de communication
- Adaptation aux différents formats et usages

CAPACITÉS :
- Génération de 3 propositions visuelles distinctes par demande
- Styles variés : professionnel, créatif, innovant
- Formats multiples : bannières, logos, arrière-plans, flyers
- Téléchargement des livrables en haute qualité

APPROCHE :
- Analyser le brief événementiel et l'identité de l'entreprise
- Proposer 3 variations stylistiques complémentaires
- Adapter les visuels aux contraintes techniques et d'usage
- Assurer la cohérence avec l'image de marque

LIVRABLES :
- 3 propositions visuelles distinctes
- Descriptions détaillées de chaque proposition
- Fichiers téléchargeables en haute résolution
- Recommandations d'usage pour chaque visuel

STYLE :
- Créatif et professionnel
- Adapté au contexte événementiel français
- Respectueux de l'identité de marque
- Innovant dans les propositions`
  }
} as const

export async function callAgent(
  agentType: AgentType,
  prompt: string,
  context?: any
): Promise<{ content: string; tokens: number; latency: number }> {
  const startTime = Date.now()
  
  // Charger la configuration depuis Supabase
  const config = await AgentConfigService.getAgentConfig(agentType)
  
  if (!config) {
    throw new Error(`Configuration non trouvée pour l'agent ${agentType}`)
  }
  
  try {
    // Traitement spécial pour l'agent Visual Identity
    if (agentType === 'VISUAL_IDENTITY') {
      try {
        // Appeler l'endpoint API de l'agent d'identité visuelle
        const response = await fetch('/api/modules/visual-identity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            context: context
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Erreur lors de la génération des visuels');
        }

        const latency = Date.now() - startTime;
        
        // Formater la réponse pour l'orchestrateur
        let content = `🎨 **PROPOSITIONS VISUELLES GÉNÉRÉES**\n\n`;
        
        if (data.data && data.data.proposals) {
          data.data.proposals.forEach((proposal: any, index: number) => {
            content += `**Proposition ${index + 1}** : ${proposal.description}\n`;
            content += `- Style : ${proposal.prompt.split('.')[0]}\n`;
            content += `- Téléchargement : [Proposition ${index + 1}](${proposal.downloadUrls.original})\n\n`;
          });
          
          content += `\n**Temps de génération** : ${data.data.metadata.totalProcessingTime}ms\n`;
          content += `**Nombre de propositions** : ${data.data.proposals.length}\n`;
        }

        return {
          content,
          tokens: 1000, // Estimation pour les visuels
          latency
        };
      } catch (error) {
        console.error('Erreur lors de l\'appel à l\'agent Visual Identity:', error);
        throw error;
      }
    }

    let enrichedPrompt = prompt

    // Enrichir le prompt avec les vraies données pour l'agent VENUE
    if (agentType === 'VENUE') {
      try {
        // Extraire les critères de recherche du prompt
        const venueCriteria = VenueService.extractCriteriaFromPrompt(prompt)
        
        // Rechercher les venues correspondantes
        const venues = await VenueService.searchVenues(venueCriteria)
        
        // Enrichir le prompt avec les données réelles
        if (venues.length > 0) {
          const venuesFormatted = VenueService.formatVenuesForAgent(venues)
          enrichedPrompt = `${prompt}

VENUES DISPONIBLES DANS NOTRE BASE DE DONNÉES :
${venuesFormatted}

INSTRUCTIONS IMPORTANTES :
- Recommande UNIQUEMENT parmi ces lieux réels de notre base de données
- Justifie tes choix en te basant sur les critères mentionnés
- Propose des alternatives si le premier choix ne convient pas parfaitement
- Mentionne les avantages spécifiques de chaque lieu recommandé`
        } else {
          enrichedPrompt = `${prompt}

INFORMATION : Aucun lieu trouvé dans notre base de données pour les critères spécifiés.
Suggère d'élargir les critères de recherche (zone géographique, capacité, etc.) ou propose des alternatives générales.`
        }
      } catch (error) {
        console.error('Erreur lors de l\'enrichissement du prompt VENUE:', error)
        // En cas d'erreur, utiliser le prompt original
      }
    }

    const response = await anthropic.messages.create({
      model: config.model,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: enrichedPrompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    })

    const latency = Date.now() - startTime
    const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const tokens = response.usage?.input_tokens + response.usage?.output_tokens || 0

    return {
      content,
      tokens,
      latency
    }
  } catch (error) {
    console.error(`Error calling ${agentType} agent:`, error)
    throw error
  }
}

export { anthropic }
export default anthropic

/**
 * Classe OrchestratorAgent pour l'interface API
 */
export class OrchestratorAgent {
  /**
   * Analyse une demande utilisateur et retourne une réponse appropriée
   * @param message Message de l'utilisateur
   * @param context Contexte de la demande
   * @returns Réponse de l'orchestrateur
   */
  async analyzeRequest(message: string, context: any = {}) {
    try {
      console.log(`🧠 [ORCHESTRATEUR] Analyse de la demande: ${message.substring(0, 100)}...`);
      
      // Charger la configuration depuis Supabase
      const config = await AgentConfigService.getAgentConfig('ORCHESTRATEUR');
      console.log(`🔧 [ORCHESTRATEUR] Configuration chargée:`, config);
      
      // Utiliser l'agent ORCHESTRATOR pour analyser la demande
      console.log(`🚀 [ORCHESTRATEUR] Appel de callAgent avec ORCHESTRATEUR`);
      const response = await callAgent('ORCHESTRATOR', message, context);
      console.log(`✅ [ORCHESTRATEUR] Réponse reçue:`, response.content.substring(0, 200));
      
      return {
        success: true,
        response: response.content,
        analysis: response.content,
        recommendations: [],
        metadata: {
          tokens: response.tokens,
          latency: response.latency,
          model: config?.model || 'claude-3-5-sonnet-20241022'
        }
      };
    } catch (error) {
      console.error(`❌ [ORCHESTRATEUR] Erreur lors de l'analyse:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        response: 'Désolé, une erreur s\'est produite lors de l\'analyse de votre demande.',
        analysis: '',
        recommendations: [],
        metadata: {}
      };
    }
  }
}

