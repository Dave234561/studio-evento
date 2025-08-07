import { NextRequest, NextResponse } from 'next/server'
import { OrchestratorAgent } from '@/lib/agents/orchestrator'
import { VenueAgentSimple } from '@/lib/agents/venue-simple'
import { VenueAgent } from '@/lib/agents/venue'
import { conceptAgent } from '@/lib/agents/concept'
import { briefAgent } from '@/lib/agents/brief'

/**
 * Endpoint API pour l'orchestrateur central
 * @param req Requête entrante
 * @returns Réponse de l'orchestrateur
 */

// Mapping des modules Studio Evento
const moduleMapping = {
  'gestion-risques': 'gestion-risques',
  'recherche-lieux': 'recherche-lieux', 
  'recherche-animations': 'recherche-animations',
  'synthese-brief': 'synthese-brief',
  'conception-creative': 'conception-creative',
  'design-evenement': 'design-evenement',
  'empreinte-carbone': 'empreinte-carbone',
  'analyse-roi': 'analyse-roi',
  'gestion-budget': 'gestion-budget',
  'visual-identity': 'visual-identity',
  
  // Anciens noms pour compatibilité
  'cahier-des-charges': 'synthese-brief',
  'recherche-animation': 'recherche-animations',
  'creation-concept': 'conception-creative',
  'charte-graphique': 'design-evenement',
  'impact-carbone': 'empreinte-carbone',
  'mesure-roi': 'analyse-roi',
  'optimisation-budget': 'gestion-budget',
  'identite-visuelle': 'visual-identity'
};

/**
 * Endpoint API pour l'orchestrateur central
 * Coordonne les différents agents spécialisés
 */
export async function POST(request: NextRequest) {
  try {
    // Extraire les données de la requête
    const body = await request.json();
    const { message, module, context = {} } = body;
    
    // Validation des données
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      );
    }
    
    console.log(`🎭 [ORCHESTRATEUR] Nouvelle demande reçue${module ? ` pour le module ${module}` : ''}`);
    
    // Générer un ID de session unique
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Déterminer le module à utiliser
    const targetModule = module ? moduleMapping[module as keyof typeof moduleMapping] || module : undefined;
    
    // Traiter la demande selon le module spécifié ou via l'orchestrateur
    let agentResponse;
    const startTime = Date.now();
    
    if (targetModule === 'visual-identity') {
      // Rediriger vers l'agent d'identité visuelle
      console.log(`🎨 [ORCHESTRATEUR] Redirection vers l'agent d'identité visuelle`);
      
      const visualIdentityUrl = `http://localhost:3001/api/modules/visual-identity`;
      const visualIdentityResponse = await fetch(visualIdentityUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });
      
      if (!visualIdentityResponse.ok) {
        throw new Error(`Erreur de l'agent d'identité visuelle: ${visualIdentityResponse.status}`);
      }
      
      agentResponse = await visualIdentityResponse.json();
    } 
    else if (targetModule === 'recherche-lieux') {
      // Utiliser l'agent de recherche de lieux
      console.log(`🏢 [ORCHESTRATEUR] Utilisation de l'agent de recherche de lieux`);
      
      try {
        // Essayer d'utiliser l'agent complet avec base de données
        const venueAgent = new VenueAgent();
        const venueResponse = await venueAgent.processRequest({
          message,
          context
        });
        
        // Formater la réponse pour l'interface
        agentResponse = {
          success: true,
          response: venueResponse.analysis,
          analysis: venueResponse.analysis,
          recommendations: venueResponse.recommendations,
          searchCriteria: venueResponse.searchCriteria,
          alternatives: venueResponse.alternatives,
          metadata: {
            module: 'recherche-lieux',
            model: 'claude-3-5-sonnet',
            processingTime: Date.now() - startTime
          }
        };
      } catch (error) {
        console.log(`🏢 [ORCHESTRATEUR] Fallback vers VenueAgentSimple`);
        // En cas d'erreur, utiliser l'agent simple
        const venueAgent = new VenueAgentSimple();
        const response = await venueAgent.processRequest({
          message,
          context
        });
        
        agentResponse = {
          success: true,
          response: response,
          analysis: response,
          recommendations: [],
          metadata: {
            module: 'recherche-lieux',
            model: 'claude-3-5-sonnet',
            processingTime: Date.now() - startTime
          }
        };
      }
    }
    else if (targetModule === 'conception-creative') {
      // Utiliser l'agent de conception créative
      console.log(`🎨 [ORCHESTRATEUR] Utilisation de l'agent de conception créative`);
      
      const conceptResponse = await conceptAgent.processRequest({
        message,
        context
      });
      
      // Formater la réponse pour l'interface
      agentResponse = {
        success: true,
        response: conceptResponse.analysis,
        analysis: conceptResponse.analysis,
        concepts: conceptResponse.concepts,
        recommendations: conceptResponse.recommendations,
        metadata: {
          module: 'conception-creative',
          model: 'claude-3-5-sonnet',
          processingTime: Date.now() - startTime
        }
      };
    }
    else if (targetModule === 'synthese-brief') {
      // Utiliser l'agent de synthèse de brief
      console.log(`📋 [ORCHESTRATEUR] Utilisation de l'agent de synthèse de brief`);
      
      const briefResponse = await briefAgent.processRequest({
        message,
        context
      });
      
      // Formater la réponse pour l'interface
      agentResponse = {
        success: true,
        response: briefResponse.analysis,
        analysis: briefResponse.analysis,
        cahierDesCharges: briefResponse.cahierDesCharges,
        deliverables: briefResponse.deliverables,
        metadata: {
          module: 'synthese-brief',
          model: 'claude-3-5-sonnet',
          processingTime: Date.now() - startTime
        }
      };
    }
    else {
      // Utiliser l'orchestrateur pour analyser et router la demande
      console.log(`🧠 [ORCHESTRATEUR] Analyse de la demande via l'orchestrateur`);
      
      const orchestrator = new OrchestratorAgent();
      const orchestratorResponse = await orchestrator.analyzeRequest(message, context);
      
      // Déterminer si la demande concerne EXPLICITEMENT l'identité visuelle
      const visualKeywords = ['visuel', 'logo', 'bannière', 'affiche', 'flyer', 'graphique', 'charte graphique'];
      const isVisualRequest = visualKeywords.some(keyword => 
        message.toLowerCase().includes(keyword) && 
        (message.toLowerCase().includes('créer') || 
         message.toLowerCase().includes('générer') || 
         message.toLowerCase().includes('concevoir') ||
         message.toLowerCase().includes('designer') ||
         message.toLowerCase().includes('faire'))
      );
      
      if (isVisualRequest) {
        // Rediriger vers l'agent d'identité visuelle
        console.log(`🎨 [ORCHESTRATEUR] Demande visuelle détectée, redirection vers l'agent d'identité visuelle`);
        
        const visualIdentityUrl = `http://localhost:3000/api/modules/visual-identity`;
        const visualIdentityResponse = await fetch(visualIdentityUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message, 
            context: {
              ...context,
              orchestratorAnalysis: orchestratorResponse.response
            }
          })
        });
        
        if (!visualIdentityResponse.ok) {
          throw new Error(`Erreur de l'agent d'identité visuelle: ${visualIdentityResponse.status}`);
        }
        
        agentResponse = await visualIdentityResponse.json();
      } else {
        // Utiliser directement la réponse de l'orchestrateur
        agentResponse = {
          success: true,
          response: orchestratorResponse.response,
          analysis: `Analyse effectuée par l'orchestrateur Sonnet 4 en ${Date.now() - startTime}ms`,
          metadata: {
            model: orchestratorResponse.metadata?.model || 'claude-3-5-sonnet',
            tokens: orchestratorResponse.metadata?.tokens || 150,
            processingTime: Date.now() - startTime
          }
        };
      }
    }
    
    // Calculer le temps de traitement total
    const processingTime = Date.now() - startTime;
    
    // Construire la réponse finale
    const response = {
      success: true,
      sessionId,
      module: targetModule || 'orchestrator',
      response: agentResponse.response || agentResponse.content || 'Réponse générée',
      analysis: agentResponse.analysis || '',
      recommendations: agentResponse.recommendations || [],
      processingTime,
      metadata: {
        ...agentResponse.metadata,
        module: targetModule || 'orchestrator'
      }
    };
    
    console.log(`✅ [ORCHESTRATEUR] Traitement terminé en ${processingTime}ms`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`❌ [ORCHESTRATEUR] Erreur:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        module: 'orchestrator'
      },
      { status: 500 }
    );
  }
}

