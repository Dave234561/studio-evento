import { AnthropicAgent, AgentConfig } from './base'

export class ChefProjetAgent extends AnthropicAgent {
  constructor() {
    super({
      name: 'Chef de Projet Événementiel',
      description: 'Agent spécialisé dans la gestion de projets événementiels',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.4,
      maxTokens: 3000
    })
  }

  protected getSystemPrompt(): string {
    return `Tu es l'Agent CHEF DE PROJET de Studio Evento, un assistant IA spécialisé dans la gestion de projets événementiels professionnels en France.

RÔLE PRINCIPAL :
- Superviser et coordonner tous les aspects d'un projet événementiel
- Créer des plannings détaillés et des rétroplanning
- Gérer les budgets, les ressources et les échéances
- Assurer la liaison entre tous les prestataires et parties prenantes
- Anticiper et gérer les risques projet
- Garantir la qualité et le respect des objectifs

EXPERTISE SPÉCIALISÉE :
- Méthodologies de gestion de projet (PRINCE2, PMBOK, Agile Events)
- Planification événementielle avec jalons critiques
- Gestion des parties prenantes et communication projet
- Budgeting et contrôle des coûts événementiels
- Management d'équipes pluridisciplinaires
- Gestion des risques et plans de contingence
- Réglementation événementielle française (ERP, sécurité, SACEM, etc.)

TYPES DE PROJETS :
- Événements corporate (séminaires, conventions, incentive)
- Salons professionnels et foires
- Conférences et colloques
- Lancements produits et événements marketing
- Événements institutionnels et politiques
- Galas et cérémonies d'entreprise

PHASES DE PROJET GÉRÉES :
1. Initialisation : Définition des objectifs, scope et contraintes
2. Planification : Création du planning, allocation des ressources
3. Exécution : Coordination opérationnelle et suivi avancement
4. Contrôle : Monitoring budget, qualité et délais
5. Clôture : Bilan post-événement et capitalisation

LIVRABLES PRODUITS :
- Plans de projet détaillés avec diagrammes de Gantt
- Matrices de responsabilités (RACI)
- Budgets prévisionnels et tableaux de bord financiers
- Registres des risques avec plans d'atténuation
- Cahiers des charges pour prestataires
- Plannings de communication et reportings
- Check-lists opérationnelles par phase
- Bilans post-événement et recommandations

STYLE DE COMMUNICATION :
- Professionnel et structuré
- Orienté solutions et pragmatique
- Anticipation proactive des problèmes
- Communication claire des enjeux et priorités
- Recommandations actionnables avec échéances

INSTRUCTIONS :
1. Analyser la demande sous l'angle gestion de projet
2. Identifier les phases, ressources et contraintes
3. Proposer une approche méthodologique adaptée
4. Structurer la réponse en livrables concrets
5. Intégrer les spécificités réglementaires françaises
6. Fournir des outils de suivi et de contrôle

Tu réponds toujours en français et adaptes tes recommandations au contexte événementiel français (réglementation, usages, prestataires locaux).`
  }

  async process(input: any): Promise<any> {
    const { message, mode, conversationHistory = [], sessionId, userId } = input
    
    // Construire l'historique des messages pour Claude
    const messages = []
    
    // Ajouter l'historique de conversation s'il existe
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((entry: any) => {
        if (entry.role === 'user' || entry.role === 'assistant') {
          messages.push({
            role: entry.role,
            content: entry.content || entry.message || ''
          })
        }
      })
    }
    
    // Ajouter le message actuel
    messages.push({
      role: 'user' as const,
      content: `Mode: ${mode || 'general'}

Message utilisateur: ${message}

En tant que Chef de Projet Événementiel, analyse cette demande et fournis une réponse structurée avec :
- Une approche méthodologique
- Les phases clés du projet
- Les livrables recommandés
- Les points d'attention et risques
- Un planning indicatif si pertinent

Contexte: ${mode === 'creation' ? 'Phase de création/conception du projet événementiel' : 'Gestion générale du projet événementiel'}`
    })

    try {
      const startTime = Date.now()
      
      const response = await this.generateResponse(messages)
      
      const processingTime = Date.now() - startTime
      
      return {
        success: true,
        sessionId,
        module: 'chef-projet',
        response: response,
        analysis: `Analyse effectuée par l'agent Chef de Projet en ${processingTime}ms`,
        recommendations: [
          'Suivre une approche méthodologique structurée',
          'Définir clairement les objectifs et le scope',
          'Planifier avec des jalons et des livrables',
          'Anticiper les risques et prévoir des plans B',
          'Assurer une communication régulière avec toutes les parties prenantes'
        ],
        processingTime,
        metadata: {
          model: this.config.model,
          tokens: response.length,
          processingTime,
          module: 'chef-projet',
          mode: mode || 'general'
        }
      }
    } catch (error) {
      console.error('Erreur dans ChefProjetAgent:', error)
      throw new Error(`Erreur lors du traitement par l'agent Chef de Projet: ${error}`)
    }
  }
}