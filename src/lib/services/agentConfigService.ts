import { PromptService } from './promptService'
import { AgentPrompt } from '../supabase'

export interface AgentConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export class AgentConfigService {
  private static configCache: Map<string, AgentConfig> = new Map()
  private static lastCacheUpdate = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Récupérer la configuration d'un agent depuis Supabase avec cache
   */
  static async getAgentConfig(agentName: string): Promise<AgentConfig | null> {
    try {
      // Vérifier le cache
      const now = Date.now()
      if (this.configCache.has(agentName) && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        return this.configCache.get(agentName) || null
      }

      // Charger depuis Supabase
      const prompt = await PromptService.getPromptByAgentName(agentName)
      
      if (!prompt) {
        console.warn(`Configuration non trouvée pour l'agent ${agentName}`)
        return this.getFallbackConfig(agentName)
      }

      const config: AgentConfig = {
        model: prompt.model,
        temperature: prompt.temperature,
        maxTokens: prompt.max_tokens,
        systemPrompt: prompt.system_prompt
      }

      // Mettre en cache
      this.configCache.set(agentName, config)
      this.lastCacheUpdate = now

      return config
    } catch (error) {
      console.error(`Erreur lors du chargement de la config ${agentName}:`, error)
      return this.getFallbackConfig(agentName)
    }
  }

  /**
   * Configuration de fallback en cas d'erreur
   */
  private static getFallbackConfig(agentName: string): AgentConfig {
    const fallbackConfigs: Record<string, AgentConfig> = {
      'ORCHESTRATEUR': {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.3,
        maxTokens: 4000,
        systemPrompt: `Tu es l'Agent Orchestrateur d'EventAI Pro, un système multi-agents spécialisé dans la planification d'événements professionnels français.

RÔLE PRINCIPAL :
- Coordonner tous les autres agents spécialisés
- Analyser les demandes utilisateur pour identifier les agents nécessaires
- Synthétiser les réponses des agents en recommandations cohérentes
- Maintenir le contexte conversationnel sur plusieurs échanges

STYLE :
- Professionnel mais accessible
- Synthèse claire et structurée
- Recommandations actionnables
- Contexte français (événementiel d'entreprise)`
      },
      'CONCEPT': {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.8,
        maxTokens: 4000,
        systemPrompt: `Tu es un expert en création de concepts événementiels et storytelling.

À partir des informations ci-dessous, propose 3 concepts originaux et impactants pour l'événement décrit.

Sois créatif, audacieux mais cohérent. Mets en avant la différenciation et la valeur ajoutée de chaque concept.

Réponds en français avec créativité et professionnalisme.`
      },
      'VENUE': {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `Tu es un expert en recherche de lieux événementiels pour Studio Evento.

Propose 3-5 lieux adaptés avec :
- Nom du lieu
- Capacité
- Localisation
- Avantages
- Tarif estimé

Réponds de manière professionnelle et détaillée.`
      },
      'ROI': {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt: `Tu es expert en analyse ROI événementiel et business analyst.

Réalise une analyse complète du retour sur investissement (ROI) de l'événement décrit.

Sois précis, réaliste et actionnable. Utilise un ton professionnel adapté à une présentation en comité de direction.`
      },
      'VISUAL_IDENTITY': {
        model: 'dall-e-3',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `Tu es l'Agent Visual Identity d'EventAI Pro, expert en création d'identité visuelle événementielle.

EXPERTISE :
- Création de visuels événementiels (bannières, logos, affiches)
- Identité graphique cohérente
- Supports de communication
- Adaptation aux différents formats et usages

CAPACITÉS :
- Génération de 3 propositions visuelles distinctes par demande
- Styles variés : professionnel, créatif, innovant`
      }
    }

    return fallbackConfigs[agentName] || {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'Tu es un assistant IA spécialisé dans l\'événementiel professionnel français.'
    }
  }

  /**
   * Vider le cache (utile après modification des prompts)
   */
  static clearCache(): void {
    this.configCache.clear()
    this.lastCacheUpdate = 0
  }

  /**
   * Récupérer toutes les configurations en une fois
   */
  static async getAllConfigs(): Promise<Record<string, AgentConfig>> {
    try {
      const prompts = await PromptService.getAllPrompts()
      const configs: Record<string, AgentConfig> = {}

      for (const prompt of prompts) {
        configs[prompt.agent_name] = {
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.max_tokens,
          systemPrompt: prompt.system_prompt
        }
      }

      return configs
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les configs:', error)
      return {}
    }
  }
}

