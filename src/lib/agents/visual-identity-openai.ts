import OpenAI from 'openai';
import type { 
  VisualRequest, 
  VisualResponse, 
  VisualProposal,
  VisualIdentityConfig, 
  DownloadOptions 
} from '../../types/visual-identity';

/**
 * Agent d'identité visuelle pour Studio Evento utilisant DALL-E 3 via l'API OpenAI directe
 * Génère 3 propositions visuelles cohérentes pour les événements
 */
export class VisualIdentityOpenAIAgent {
  private openai: OpenAI;
  private config: VisualIdentityConfig;

  constructor() {
    // Initialiser le client OpenAI avec l'API key depuis les variables d'environnement
    const apiKey = process.env.OPENAI_API_KEY;
    
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.openai.com/v1' // Forcer l'API OpenAI standard
    });

    // Configuration par défaut
    this.config = {
      model: "dall-e-3",
      defaultStyle: "moderne et professionnel",
      defaultColors: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
      defaultDimensions: {
        "bannière": { width: 1792, height: 1024 },
        "logo": { width: 1024, height: 1024 },
        "affiche": { width: 1024, height: 1792 },
        "arrière-plan": { width: 1792, height: 1024 }
      },
      supportedFormats: ["png"],
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
    
    console.log(`🎨 [VISUAL-OPENAI] Starting visual generation for request: ${requestId}`);
    
    try {
      // Adapter la demande pour optimiser la génération
      const adaptedRequest = this.adaptRequest(request);
      
      // Générer les 3 propositions en séquence (DALL-E 3 ne supporte que n=1)
      const proposals: VisualProposal[] = [];
      
      for (let i = 1; i <= 3; i++) {
        console.log(`🎨 [VISUAL-OPENAI] Generating proposal ${i}/3...`);
        const proposal = await this.generateSingleProposal(adaptedRequest, i, requestId);
        proposals.push(proposal);
      }
      
      const totalProcessingTime = Date.now() - startTime;
      
      console.log(`✅ [VISUAL-OPENAI] Generated ${proposals.length} proposals in ${totalProcessingTime}ms`);
      
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
      console.error(`❌ [VISUAL-OPENAI] Error generating proposals:`, error);
      
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
   * Génère une proposition visuelle avec DALL-E 3
   * @param request Demande adaptée
   * @param proposalNumber Numéro de la proposition (1, 2, ou 3)
   * @param requestId ID de la requête
   * @returns Proposition visuelle
   */
  private async generateSingleProposal(
    request: VisualRequest, 
    proposalNumber: number, 
    requestId: string
  ): Promise<VisualProposal> {
    const proposalStartTime = Date.now();
    
    try {
      // Construire le prompt selon le style de la proposition
      const prompt = this.buildPromptForProposal(request, proposalNumber);
      
      // Déterminer les dimensions et le format DALL-E 3
      const dalleSize = this.getDalleSizeForVisualType(request.visualType || "bannière");
      const dalleStyle = this.getDalleStyleForProposal(proposalNumber);
      
      console.log(`🎨 [VISUAL-OPENAI] Generating with prompt: ${prompt.substring(0, 100)}...`);
      console.log(`🎨 [VISUAL-OPENAI] Size: ${dalleSize}, Style: ${dalleStyle}`);
      
      // Générer l'image via DALL-E 3
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: dalleSize as any,
        style: dalleStyle as any,
        quality: "hd"
      });
      
      const proposalId = `${requestId}_proposal_${proposalNumber}`;
      const imageUrl = response.data?.[0]?.url || "";
      const processingTime = Date.now() - proposalStartTime;
      
      console.log(`✅ [VISUAL-OPENAI] Generated proposal ${proposalNumber} in ${processingTime}ms`);
      
      // Construire et retourner la proposition
      return {
        id: proposalId,
        imageUrl: imageUrl,
        prompt: prompt,
        description: this.getProposalDescription(proposalNumber, request),
        metadata: {
          model: "dall-e-3",
          processingTime: processingTime,
          dimensions: this.config.defaultDimensions[request.visualType || "bannière"] || 
                     this.config.defaultDimensions["bannière"],
          format: "png",
          parameters: {
            style: dalleStyle,
            quality: "hd",
            proposalNumber: proposalNumber,
            size: dalleSize
          }
        },
        downloadUrls: {
          original: imageUrl, // URL directe de DALL-E 3
          thumbnail: imageUrl // Même URL pour la miniature
        }
      };
    } catch (error) {
      console.error(`❌ [VISUAL-OPENAI] Error generating proposal ${proposalNumber}:`, error);
      
      return {
        id: `${requestId}_proposal_${proposalNumber}_error`,
        imageUrl: "",
        prompt: this.buildPromptForProposal(request, proposalNumber),
        description: `Erreur lors de la génération de la proposition ${proposalNumber}`,
        metadata: {
          model: "dall-e-3",
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
   * @returns Prompt optimisé pour DALL-E 3
   */
  private buildPromptForProposal(request: VisualRequest, proposalNumber: number): string {
    const styleApproach = this.getStyleForProposal(proposalNumber);
    const visualTypeDesc = this.getVisualTypeDescription(request.visualType || "bannière");
    
    // Construire un prompt optimisé pour DALL-E 3
    let prompt = `Create a ${styleApproach} ${visualTypeDesc} for ${request.eventType} event`;
    
    if (request.organization && request.organization !== "Votre organisation") {
      prompt += ` for ${request.organization}`;
    }
    
    if (request.location) {
      prompt += ` in ${request.location}`;
    }
    
    // Ajouter les couleurs
    if (request.colors && request.colors.length > 0) {
      const colorNames = this.convertHexToColorNames(request.colors);
      prompt += `. Use ${colorNames.join(' and ')} color scheme`;
    }
    
    // Ajouter les spécificités selon la proposition
    const specificApproach = this.getApproachForProposal(proposalNumber);
    prompt += `. ${specificApproach}`;
    
    // Ajouter les contraintes de qualité
    prompt += `. High-quality professional design, clean typography, balanced composition, modern aesthetic`;
    
    // Limiter la longueur du prompt (DALL-E 3 a une limite)
    if (prompt.length > 1000) {
      prompt = prompt.substring(0, 997) + "...";
    }
    
    return prompt;
  }

  /**
   * Convertit les codes hex en noms de couleurs
   * @param hexColors Codes couleur hex
   * @returns Noms de couleurs
   */
  private convertHexToColorNames(hexColors: string[]): string[] {
    const colorMap: { [key: string]: string } = {
      '#1E88E5': 'blue',
      '#4285F4': 'blue',
      '#FFFFFF': 'white',
      '#F44336': 'red',
      '#4CAF50': 'green',
      '#FF9800': 'orange',
      '#9C27B0': 'purple',
      '#FFEB3B': 'yellow',
      '#000000': 'black'
    };
    
    return hexColors.map(hex => {
      const upperHex = hex.toUpperCase();
      return colorMap[upperHex] || 'blue';
    });
  }

  /**
   * Retourne la taille DALL-E 3 pour un type de visuel
   * @param visualType Type de visuel
   * @returns Taille DALL-E 3
   */
  private getDalleSizeForVisualType(visualType: string): string {
    const sizeMap: { [key: string]: string } = {
      "bannière": "1792x1024",
      "logo": "1024x1024", 
      "affiche": "1024x1792",
      "arrière-plan": "1792x1024"
    };
    return sizeMap[visualType] || "1792x1024";
  }

  /**
   * Retourne le style DALL-E 3 pour une proposition
   * @param proposalNumber Numéro de la proposition
   * @returns Style DALL-E 3
   */
  private getDalleStyleForProposal(proposalNumber: number): string {
    // DALL-E 3 supporte "vivid" et "natural"
    return proposalNumber === 3 ? "vivid" : "natural";
  }

  /**
   * Retourne le style pour une proposition donnée
   * @param proposalNumber Numéro de la proposition
   * @returns Style de la proposition
   */
  private getStyleForProposal(proposalNumber: number): string {
    const styles = [
      "professional and clean modern",
      "creative and dynamic contemporary", 
      "innovative and avant-garde futuristic"
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
      "Focus on clarity, readability and professional appeal for broad audience",
      "Emphasize creativity with asymmetric composition and modern visual effects",
      "Bold and distinctive design that stands out with cutting-edge concepts"
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
      "bannière": "banner design",
      "logo": "logo design",
      "affiche": "poster design",
      "arrière-plan": "background design"
    };
    return descriptions[visualType] || descriptions["bannière"];
  }
}

// Instance singleton de l'agent
export const visualIdentityOpenAIAgent = new VisualIdentityOpenAIAgent();

