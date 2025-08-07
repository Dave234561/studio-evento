import type { 
  VisualRequest, 
  VisualResponse, 
  VisualProposal,
  VisualIdentityConfig, 
  DownloadOptions 
} from '../../types/visual-identity';

/**
 * Agent d'identité visuelle pour Studio Evento utilisant l'outil Manus
 * Génère 3 propositions visuelles cohérentes pour les événements
 */
export class VisualIdentityManusAgent {
  private config: VisualIdentityConfig;

  constructor() {
    // Configuration par défaut
    this.config = {
      model: "manus-image-generator",
      defaultStyle: "moderne et professionnel",
      defaultColors: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
      defaultDimensions: {
        "bannière": { width: 1200, height: 628 },
        "logo": { width: 512, height: 512 },
        "affiche": { width: 800, height: 1200 },
        "arrière-plan": { width: 1920, height: 1080 }
      },
      supportedFormats: ["png", "jpg"],
      maxProposals: 3
    };
  }

  /**
   * Génère 3 propositions visuelles pour un événement
   * @param request Demande de génération visuelle
   * @returns Réponse avec 3 propositions
   */
  async generateVisualProposals(request: VisualRequest): Promise<VisualResponse> {
    const startTime = Date.now();
    const requestId = `visual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎨 [VISUAL-MANUS] Starting visual generation for request: ${requestId}`);
    
    try {
      // Adapter la demande pour optimiser la génération
      const adaptedRequest = this.adaptRequest(request);
      
      // Générer les 3 propositions en parallèle
      const proposalPromises = [
        this.generateProposalWithManus(adaptedRequest, 1, requestId),
        this.generateProposalWithManus(adaptedRequest, 2, requestId),
        this.generateProposalWithManus(adaptedRequest, 3, requestId)
      ];
      
      const proposals = await Promise.all(proposalPromises);
      const totalProcessingTime = Date.now() - startTime;
      
      console.log(`✅ [VISUAL-MANUS] Generated ${proposals.length} proposals in ${totalProcessingTime}ms`);
      
      return {
        success: true,
        proposals: proposals,
        metadata: {
          totalProcessingTime: totalProcessingTime,
          requestId: requestId,
          timestamp: new Date().toISOString(),
          model: this.config.model,
          version: "1.0.0"
        }
      };
    } catch (error) {
      console.error(`❌ [VISUAL-MANUS] Error generating proposals:`, error);
      
      return {
        success: false,
        proposals: [],
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          requestId: requestId,
          timestamp: new Date().toISOString(),
          model: this.config.model,
          version: "1.0.0",
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      };
    }
  }

  /**
   * Génère une proposition visuelle avec l'outil Manus
   * @param request Demande adaptée
   * @param proposalNumber Numéro de la proposition (1, 2, ou 3)
   * @param requestId ID de la requête
   * @returns Proposition visuelle
   */
  private async generateProposalWithManus(
    request: VisualRequest, 
    proposalNumber: number, 
    requestId: string
  ): Promise<VisualProposal> {
    const proposalStartTime = Date.now();
    
    try {
      // Construire le prompt selon le style de la proposition
      const prompt = this.buildPromptForProposal(request, proposalNumber);
      
      // Déterminer les dimensions
      const dimensions = this.config.defaultDimensions[request.visualType || "bannière"] || 
                        this.config.defaultDimensions["bannière"];
      
      // Générer l'image avec l'outil Manus (simulation)
      // Dans un vrai environnement, ceci ferait appel à l'outil media_generate_image
      const imageUrl = await this.simulateManusImageGeneration(prompt, dimensions, proposalNumber);
      
      const proposalId = `${requestId}_proposal_${proposalNumber}`;
      const processingTime = Date.now() - proposalStartTime;
      
      return {
        id: proposalId,
        imageUrl: imageUrl,
        prompt: prompt,
        description: this.getProposalDescription(proposalNumber, request),
        metadata: {
          model: this.config.model,
          processingTime: processingTime,
          dimensions: dimensions,
          format: "png",
          parameters: {
            style: this.getStyleForProposal(proposalNumber),
            quality: "high",
            proposalNumber: proposalNumber
          }
        },
        downloadUrls: {
          original: `/api/download?file=${proposalId}.png`,
          thumbnail: `/api/download?file=${proposalId}_thumb.png`
        }
      };
    } catch (error) {
      console.error(`❌ [VISUAL-MANUS] Error generating proposal ${proposalNumber}:`, error);
      
      return {
        id: `${requestId}_proposal_${proposalNumber}_error`,
        imageUrl: "",
        prompt: this.buildPromptForProposal(request, proposalNumber),
        description: `Erreur lors de la génération de la proposition ${proposalNumber}`,
        metadata: {
          model: this.config.model,
          processingTime: Date.now() - proposalStartTime,
          dimensions: this.config.defaultDimensions[request.visualType || "bannière"] || 
                     this.config.defaultDimensions["bannière"],
          format: "png",
          parameters: {
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        },
        downloadUrls: {
          original: "",
          thumbnail: ""
        }
      };
    }
  }

  /**
   * Simule la génération d'image avec l'outil Manus
   * @param prompt Prompt de génération
   * @param dimensions Dimensions de l'image
   * @param proposalNumber Numéro de la proposition
   * @returns URL de l'image générée
   */
  private async simulateManusImageGeneration(
    prompt: string, 
    dimensions: { width: number; height: number }, 
    proposalNumber: number
  ): Promise<string> {
    // Simulation - dans un vrai environnement, ceci utiliserait l'outil media_generate_image
    // Pour la démonstration, on retourne les images déjà générées
    const demoImages = [
      "/demo-visual-1.png",
      "/demo-visual-2.png", 
      "/demo-visual-3.png"
    ];
    
    return demoImages[proposalNumber - 1] || "/demo-visual-1.png";
  }

  /**
   * Adapte la demande pour optimiser la génération
   * @param request Demande originale
   * @returns Demande adaptée
   */
  private adaptRequest(request: VisualRequest): VisualRequest {
    return {
      ...request,
      visualType: request.visualType || "bannière",
      style: request.style || this.config.defaultStyle,
      colors: request.colors && request.colors.length > 0 ? 
              request.colors : this.config.defaultColors,
      organization: request.organization || "Votre organisation",
      eventType: request.eventType || "événement"
    };
  }

  /**
   * Construit le prompt pour une proposition spécifique
   * @param request Demande adaptée
   * @param proposalNumber Numéro de la proposition
   * @returns Prompt optimisé
   */
  private buildPromptForProposal(request: VisualRequest, proposalNumber: number): string {
    const baseContext = `CONTEXTE SYSTÈME : Agent d'identité visuelle opérant au sein de l'orchestrateur Studio Evento.`;
    
    const task = `TÂCHE : Créer un visuel ${this.getStyleForProposal(proposalNumber)} pour ${request.eventType} pour ${request.organization}${request.location ? ` à ${request.location}` : ''}`;
    
    const visualType = `TYPE DE VISUEL : ${this.getVisualTypeDescription(request.visualType || "bannière")}. Format optimisé pour la communication digitale.`;
    
    const colors = `PALETTE DE COULEURS : Utilisez principalement ${request.colors?.slice(0, 2).join(', ')}.`;
    
    const approach = `APPROCHE SPÉCIFIQUE (Proposition ${proposalNumber}) : ${this.getApproachForProposal(proposalNumber)}`;
    
    const quality = `CONSIGNES QUALITÉ :
- Créer une image de haute qualité professionnelle
- Composition équilibrée et harmonieuse
- Typographie lisible et appropriée au contexte
- Respecter strictement la palette de couleurs
- Optimiser pour l'usage ${request.visualType}
- Style cohérent avec l'identité de l'événement`;

    return [baseContext, task, visualType, colors, approach, quality].join('\n\n');
  }

  /**
   * Retourne le style pour une proposition donnée
   * @param proposalNumber Numéro de la proposition
   * @returns Style de la proposition
   */
  private getStyleForProposal(proposalNumber: number): string {
    const styles = [
      "technologique et moderne avec une approche classique et professionnelle",
      "créatif et dynamique avec des éléments modernes", 
      "avant-gardiste et innovant"
    ];
    return styles[proposalNumber - 1] || styles[0];
  }

  /**
   * Retourne l'approche pour une proposition donnée
   * @param proposalNumber Numéro de la proposition
   * @returns Approche de la proposition
   */
  private getApproachForProposal(proposalNumber: number): string {
    const approaches = [
      "Cette proposition doit être professionnelle et accessible, adaptée à un public large. Privilégiez la clarté et la lisibilité.",
      "Cette proposition doit être créative et dynamique, avec une approche plus moderne et originale. Osez les compositions asymétriques et les effets visuels.",
      "Cette proposition doit être audacieuse et innovante, avec une approche distinctive qui se démarque. Explorez des concepts avant-gardistes."
    ];
    return approaches[proposalNumber - 1] || approaches[0];
  }

  /**
   * Retourne la description d'une proposition
   * @param proposalNumber Numéro de la proposition
   * @param request Demande adaptée
   * @returns Description de la proposition
   */
  private getProposalDescription(proposalNumber: number, request: VisualRequest): string {
    const descriptions = [
      `Proposition professionnelle et accessible pour ${request.eventType}, avec un design moderne et épuré qui privilégie la clarté et la lisibilité.`,
      `Proposition créative et dynamique pour ${request.eventType}, avec des éléments visuels modernes et une composition asymétrique innovante.`,
      `Proposition avant-gardiste et audacieuse pour ${request.eventType}, avec un design distinctif qui se démarque par son approche innovante.`
    ];
    return descriptions[proposalNumber - 1] || descriptions[0];
  }

  /**
   * Retourne la description du type de visuel
   * @param visualType Type de visuel
   * @returns Description du type
   */
  private getVisualTypeDescription(visualType: string): string {
    const descriptions: { [key: string]: string } = {
      "bannière": "Bannière pour les réseaux sociaux et le site web",
      "logo": "Logo événementiel temporaire",
      "affiche": "Affiche promotionnelle pour impression",
      "arrière-plan": "Arrière-plan pour présentations et supports digitaux"
    };
    return descriptions[visualType] || descriptions["bannière"];
  }
}

// Instance singleton de l'agent
export const visualIdentityManusAgent = new VisualIdentityManusAgent();

