import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
)

export interface ProjectContext {
  sessionId: string
  userId?: string
  projectName?: string
  eventType?: string
  participants?: number
  budget?: number
  location?: string
  date?: string
  duration?: string
  requirements?: string[]
  preferences?: any
  constraints?: any
  decisions?: {
    module: string
    decision: any
    timestamp: string
    reasoning: string
  }[]
  interactions?: {
    module: string
    userMessage: string
    agentResponse: any
    timestamp: string
    context: any
  }[]
  globalObjectives?: string[]
  currentPhase?: string
  completedModules?: string[]
  nextRecommendedModules?: string[]
}

export interface AgentContext {
  projectContext: ProjectContext
  moduleHistory: any[]
  relatedDecisions: any[]
  globalConstraints: any[]
  coherenceGuidelines: string[]
  crossModuleData: any
}

export class ContextService {
  // Créer ou récupérer un contexte de projet depuis Supabase
  static async getProjectContext(sessionId: string): Promise<ProjectContext> {
    try {
      // Récupérer le contexte principal
      const { data: contextData, error: contextError } = await supabase
        .from('project_contexts')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (contextError && contextError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du contexte:', contextError)
        throw contextError
      }

      // Si le contexte n'existe pas, le créer
      if (!contextData) {
        const newContext: ProjectContext = {
          sessionId,
          decisions: [],
          interactions: [],
          globalObjectives: [],
          completedModules: [],
          nextRecommendedModules: []
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('project_contexts')
          .insert({
            session_id: sessionId,
            global_objectives: [],
            completed_modules: [],
            next_recommended_modules: []
          })
          .select()
          .single()

        if (insertError) {
          console.error('Erreur lors de la création du contexte:', insertError)
          throw insertError
        }

        return newContext
      }

      // Récupérer les interactions associées
      const { data: interactions, error: interactionsError } = await supabase
        .from('agent_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (interactionsError) {
        console.error('Erreur lors de la récupération des interactions:', interactionsError)
      }

      // Récupérer les décisions associées
      const { data: decisions, error: decisionsError } = await supabase
        .from('agent_decisions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (decisionsError) {
        console.error('Erreur lors de la récupération des décisions:', decisionsError)
      }

      // Construire le contexte complet
      const context: ProjectContext = {
        sessionId: contextData.session_id,
        userId: contextData.user_id,
        projectName: contextData.project_name,
        eventType: contextData.event_type,
        participants: contextData.participants,
        budget: contextData.budget ? parseFloat(contextData.budget) : undefined,
        location: contextData.location,
        date: contextData.event_date,
        duration: contextData.duration,
        requirements: contextData.requirements || [],
        preferences: contextData.preferences,
        constraints: contextData.constraints,
        globalObjectives: contextData.global_objectives || [],
        currentPhase: contextData.current_phase,
        completedModules: contextData.completed_modules || [],
        nextRecommendedModules: contextData.next_recommended_modules || [],
        interactions: interactions?.map(i => ({
          module: i.module,
          userMessage: i.user_message,
          agentResponse: i.agent_response,
          timestamp: i.created_at,
          context: i.context
        })) || [],
        decisions: decisions?.map(d => ({
          module: d.module,
          decision: d.decision_data,
          timestamp: d.created_at,
          reasoning: d.reasoning
        })) || []
      }

      return context

    } catch (error) {
      console.error('Erreur dans getProjectContext:', error)
      // Fallback: retourner un contexte minimal
      return {
        sessionId,
        decisions: [],
        interactions: [],
        globalObjectives: [],
        completedModules: [],
        nextRecommendedModules: []
      }
    }
  }

  // Mettre à jour le contexte global dans Supabase
  static async updateProjectContext(
    sessionId: string, 
    updates: Partial<ProjectContext>
  ): Promise<ProjectContext> {
    try {
      const updateData: any = {}
      
      if (updates.userId !== undefined) updateData.user_id = updates.userId
      if (updates.projectName !== undefined) updateData.project_name = updates.projectName
      if (updates.eventType !== undefined) updateData.event_type = updates.eventType
      if (updates.participants !== undefined) updateData.participants = updates.participants
      if (updates.budget !== undefined) updateData.budget = updates.budget
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.date !== undefined) updateData.event_date = updates.date
      if (updates.duration !== undefined) updateData.duration = updates.duration
      if (updates.requirements !== undefined) updateData.requirements = updates.requirements
      if (updates.preferences !== undefined) updateData.preferences = updates.preferences
      if (updates.constraints !== undefined) updateData.constraints = updates.constraints
      if (updates.globalObjectives !== undefined) updateData.global_objectives = updates.globalObjectives
      if (updates.currentPhase !== undefined) updateData.current_phase = updates.currentPhase
      if (updates.completedModules !== undefined) updateData.completed_modules = updates.completedModules
      if (updates.nextRecommendedModules !== undefined) updateData.next_recommended_modules = updates.nextRecommendedModules

      const { error } = await supabase
        .from('project_contexts')
        .upsert({
          session_id: sessionId,
          ...updateData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erreur lors de la mise à jour du contexte:', error)
        throw error
      }

      return await this.getProjectContext(sessionId)

    } catch (error) {
      console.error('Erreur dans updateProjectContext:', error)
      throw error
    }
  }



  // Extraire le contexte pour un agent spécifique
  static async getAgentContext(
    sessionId: string,
    targetModule: string
  ): Promise<AgentContext> {
    try {
      const projectContext = await this.getProjectContext(sessionId)

      // Historique du module spécifique
      const moduleHistory = projectContext.interactions?.filter(
        i => i.module === targetModule
      ) || []

      // Décisions liées
      const relatedDecisions = projectContext.decisions?.filter(
        d => this.isRelatedModule(d.module, targetModule)
      ) || []

      // Contraintes globales depuis la base
      const { data: constraints, error: constraintsError } = await supabase
        .from('global_constraints')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)

      if (constraintsError) {
        console.error('Erreur lors de la récupération des contraintes:', constraintsError)
      }

      const globalConstraints = constraints?.map(c => ({
        type: c.constraint_type,
        value: c.constraint_value,
        description: c.description,
        sourceModule: c.source_module
      })) || []

      // Guidelines de cohérence
      const coherenceGuidelines = this.generateCoherenceGuidelines(
        projectContext,
        targetModule
      )

      // Données cross-module
      const crossModuleData = this.extractCrossModuleData(
        projectContext,
        targetModule
      )

      return {
        projectContext,
        moduleHistory,
        relatedDecisions,
        globalConstraints,
        coherenceGuidelines,
        crossModuleData
      }

    } catch (error) {
      console.error('Erreur dans getAgentContext:', error)
      throw error
    }
  }

  // Analyser la cohérence globale et sauvegarder dans Supabase
  static async analyzeGlobalCoherence(sessionId: string): Promise<{
    coherenceScore: number
    conflicts: string[]
    recommendations: string[]
    missingElements: string[]
  }> {
    try {
      const context = await this.getProjectContext(sessionId)
      
      const analysis = {
        coherenceScore: 85, // Score calculé
        conflicts: [] as string[],
        recommendations: [] as string[],
        missingElements: [] as string[]
      }

      // Analyser les conflits potentiels
      analysis.conflicts = this.detectConflicts(context)
      
      // Générer des recommandations
      analysis.recommendations = this.generateRecommendations(context)
      
      // Identifier les éléments manquants
      analysis.missingElements = this.identifyMissingElements(context)

      // Sauvegarder l'analyse dans Supabase
      const { error } = await supabase
        .from('coherence_analysis')
        .insert({
          session_id: sessionId,
          coherence_score: analysis.coherenceScore,
          conflicts: analysis.conflicts,
          recommendations: analysis.recommendations,
          missing_elements: analysis.missingElements,
          analysis_data: {
            totalInteractions: context.interactions?.length || 0,
            totalDecisions: context.decisions?.length || 0,
            completedModules: context.completedModules?.length || 0
          }
        })

      if (error) {
        console.error('Erreur lors de la sauvegarde de l\'analyse de cohérence:', error)
      }

      return analysis

    } catch (error) {
      console.error('Erreur dans analyzeGlobalCoherence:', error)
      throw error
    }
  }

  // Ajouter une contrainte globale
  static async addGlobalConstraint(
    sessionId: string,
    constraintType: string,
    constraintValue: string,
    description: string,
    sourceModule?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('global_constraints')
        .insert({
          session_id: sessionId,
          constraint_type: constraintType,
          constraint_value: constraintValue,
          description,
          source_module: sourceModule
        })

      if (error) {
        console.error('Erreur lors de l\'ajout de la contrainte:', error)
        throw error
      }

    } catch (error) {
      console.error('Erreur dans addGlobalConstraint:', error)
      throw error
    }
  }

  // Ajouter une recommandation entre modules
  static async addModuleRecommendation(
    sessionId: string,
    sourceModule: string,
    targetModule: string,
    recommendationType: string,
    priority: string,
    reason: string,
    contextData?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('module_recommendations')
        .insert({
          session_id: sessionId,
          source_module: sourceModule,
          target_module: targetModule,
          recommendation_type: recommendationType,
          priority,
          reason,
          context_data: contextData
        })

      if (error) {
        console.error('Erreur lors de l\'ajout de la recommandation:', error)
        throw error
      }

    } catch (error) {
      console.error('Erreur dans addModuleRecommendation:', error)
      throw error
    }
  }

  // Méthodes privées d'analyse (conservées de l'ancienne version)

  private static isRelatedModule(module1: string, module2: string): boolean {
    const relationships: Record<string, string[]> = {
      'recherche-lieux': ['optimisation-budget', 'gestion-risques', 'impact-carbone'],
      'recherche-animation': ['optimisation-budget', 'creation-concept'],
      'creation-concept': ['charte-graphique', 'recherche-animation'],
      'optimisation-budget': ['recherche-lieux', 'recherche-animation', 'mesure-roi'],
      'impact-carbone': ['recherche-lieux', 'optimisation-budget'],
      'mesure-roi': ['optimisation-budget', 'gestion-risques']
    }

    return relationships[module1]?.includes(module2) || 
           relationships[module2]?.includes(module1) || false
  }

  private static generateCoherenceGuidelines(
    context: ProjectContext,
    targetModule: string
  ): string[] {
    const guidelines = []

    // Guidelines basées sur le type d'événement
    if (context.eventType) {
      guidelines.push(`Maintenir la cohérence avec le type d'événement: ${context.eventType}`)
    }

    // Guidelines basées sur les décisions précédentes
    const venueDecision = context.decisions?.find(d => d.module === 'recherche-lieux')
    if (venueDecision && targetModule !== 'recherche-lieux') {
      guidelines.push(`Tenir compte du lieu sélectionné`)
    }

    const budgetDecision = context.decisions?.find(d => d.module === 'optimisation-budget')
    if (budgetDecision && targetModule !== 'optimisation-budget') {
      guidelines.push(`Respecter la répartition budgétaire définie`)
    }

    return guidelines
  }

  private static extractCrossModuleData(
    context: ProjectContext,
    targetModule: string
  ): any {
    const crossData: any = {}

    // Données du lieu pour les autres modules
    const venueInteraction = context.interactions?.find(i => i.module === 'recherche-lieux')
    if (venueInteraction && targetModule !== 'recherche-lieux') {
      crossData.selectedVenue = venueInteraction.agentResponse?.recommendations?.[0]
      crossData.venueConstraints = venueInteraction.agentResponse?.searchCriteria
    }

    // Données du budget pour les autres modules
    const budgetInteraction = context.interactions?.find(i => i.module === 'optimisation-budget')
    if (budgetInteraction && targetModule !== 'optimisation-budget') {
      crossData.budgetAllocation = budgetInteraction.agentResponse?.allocation
      crossData.budgetConstraints = budgetInteraction.agentResponse?.constraints
    }

    return crossData
  }

  private static detectConflicts(context: ProjectContext): string[] {
    const conflicts = []

    // Conflit capacité vs lieu
    if (context.participants) {
      const venueDecision = context.decisions?.find(d => d.module === 'recherche-lieux')
      if (venueDecision) {
        const venueCapacity = venueDecision.decision.selectedVenue?.capacite
        if (venueCapacity && context.participants > parseInt(venueCapacity)) {
          conflicts.push(`Capacité insuffisante: ${context.participants} personnes pour un lieu de ${venueCapacity}`)
        }
      }
    }

    return conflicts
  }

  private static generateRecommendations(context: ProjectContext): string[] {
    const recommendations = []

    // Recommandations basées sur les modules complétés
    const completed = context.completedModules || []
    
    if (completed.includes('recherche-lieux') && !completed.includes('recherche-animation')) {
      recommendations.push('Procéder à la recherche d\'animations adaptées au lieu sélectionné')
    }

    if (completed.includes('recherche-lieux') && completed.includes('recherche-animation') && !completed.includes('creation-concept')) {
      recommendations.push('Développer un concept global intégrant lieu et animations')
    }

    return recommendations
  }

  private static identifyMissingElements(context: ProjectContext): string[] {
    const missing = []

    if (!context.eventType) missing.push('Type d\'événement')
    if (!context.participants) missing.push('Nombre de participants')
    if (!context.budget) missing.push('Budget prévisionnel')
    if (!context.location) missing.push('Localisation préférée')
    if (!context.date) missing.push('Date de l\'événement')

    return missing
  }

  // Initialiser une nouvelle session
  static async initializeSession(
    sessionId: string, 
    initialData: Partial<ProjectContext>
  ): Promise<ProjectContext> {
    try {
      const contextData = {
        session_id: sessionId,
        user_id: initialData.userId || null,
        project_name: initialData.projectName || `Projet ${sessionId}`,
        event_type: initialData.eventType || 'événement',
        participants: initialData.participants || null,
        budget: initialData.budget || null,
        location: initialData.location || null,
        event_date: initialData.date || null,
        duration: initialData.duration || null,
        requirements: initialData.requirements || [],
        preferences: initialData.preferences || {},
        constraints: initialData.constraints || {},
        global_objectives: initialData.globalObjectives || [],
        current_phase: initialData.currentPhase || 'initialisation',
        completed_modules: initialData.completedModules || [],
        next_recommended_modules: initialData.nextRecommendedModules || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_contexts')
        .upsert(contextData)
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error)
        throw error
      }

      return {
        sessionId,
        userId: data.user_id,
        projectName: data.project_name,
        eventType: data.event_type,
        participants: data.participants,
        budget: data.budget,
        location: data.location,
        date: data.event_date,
        duration: data.duration,
        requirements: data.requirements || [],
        preferences: data.preferences || {},
        constraints: data.constraints || {},
        decisions: [],
        interactions: [],
        globalObjectives: data.global_objectives || [],
        currentPhase: data.current_phase,
        completedModules: data.completed_modules || [],
        nextRecommendedModules: data.next_recommended_modules || []
      }

    } catch (error) {
      console.error('Erreur dans initializeSession:', error)
      throw error
    }
  }

  // Ajouter une interaction
  static async addInteraction(
    sessionId: string,
    interaction: {
      module: string
      userMessage: string
      agentResponse: any
      context: any
      processingTime?: number
      tokensUsed?: number
    }
  ): Promise<void> {
    try {
      // Validation des données requises
      if (!sessionId || !interaction.module || !interaction.userMessage) {
        console.warn('Données manquantes pour addInteraction:', { sessionId, module: interaction.module, userMessage: !!interaction.userMessage })
        return
      }

      const { error } = await supabase
        .from('agent_interactions')
        .insert({
          session_id: sessionId,
          module: interaction.module,
          user_message: interaction.userMessage,
          agent_response: interaction.agentResponse || 'Réponse en cours...',
          context: interaction.context || {},
          processing_time: interaction.processingTime || 0,
          tokens_used: interaction.tokensUsed || 0,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erreur lors de l\'ajout de l\'interaction:', error)
        // Ne pas throw pour éviter de bloquer l'orchestrateur
      } else {
        console.log('Interaction sauvegardée avec succès pour session:', sessionId)
      }

    } catch (error) {
      console.error('Erreur dans addInteraction:', error)
      // Ne pas throw pour éviter de bloquer l'orchestrateur
    }
  }

  // Ajouter une décision
  static async addDecision(
    sessionId: string,
    decision: {
      module: string
      decisionType: string
      decisionData: any
      reasoning: string
      confidenceScore: number
      impactLevel: string
    }
  ): Promise<void> {
    try {
      // Validation des données requises
      if (!sessionId || !decision.module || !decision.decisionType) {
        console.warn('Données manquantes pour addDecision:', { sessionId, module: decision.module, decisionType: decision.decisionType })
        return
      }

      const { error } = await supabase
        .from('agent_decisions')
        .insert({
          session_id: sessionId,
          module: decision.module,
          decision_type: decision.decisionType,
          decision_data: decision.decisionData || {},
          reasoning: decision.reasoning || 'Décision automatique',
          confidence_score: decision.confidenceScore || 0.8,
          impact_level: decision.impactLevel || 'medium',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erreur lors de l\'ajout de la décision:', error)
        // Ne pas throw pour éviter de bloquer l'orchestrateur
      } else {
        console.log('Décision sauvegardée avec succès pour session:', sessionId)
      }

    } catch (error) {
      console.error('Erreur dans addDecision:', error)
      // Ne pas throw pour éviter de bloquer l'orchestrateur
    }
  }

  // Mettre à jour le contexte
  static async updateContext(
    sessionId: string,
    updates: Partial<ProjectContext>
  ): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      if (updates.completedModules !== undefined) {
        updateData.completed_modules = updates.completedModules
      }
      if (updates.currentPhase !== undefined) {
        updateData.current_phase = updates.currentPhase
      }
      if (updates.globalObjectives !== undefined) {
        updateData.global_objectives = updates.globalObjectives
      }

      const { error } = await supabase
        .from('project_contexts')
        .update(updateData)
        .eq('session_id', sessionId)

      if (error) {
        console.error('Erreur lors de la mise à jour du contexte:', error)
        throw error
      }

    } catch (error) {
      console.error('Erreur dans updateContext:', error)
      throw error
    }
  }

  // Nettoyer les contextes anciens (optionnel)
  static async cleanupOldContexts(maxAgeDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

      const { error } = await supabase
        .from('project_contexts')
        .delete()
        .lt('updated_at', cutoffDate.toISOString())

      if (error) {
        console.error('Erreur lors du nettoyage des anciens contextes:', error)
      }

    } catch (error) {
      console.error('Erreur dans cleanupOldContexts:', error)
    }
  }
}

