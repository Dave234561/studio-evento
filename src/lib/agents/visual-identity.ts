import OpenAI from 'openai';
import type { 
  VisualRequest, 
  VisualResponse, 
  VisualProposal,
  VisualIdentityConfig, 
  DownloadOptions 
} from '../../types/visual-identity';

/**
 * Agent d'identité visuelle pour Studio Evento
 * Génère 3 propositions visuelles cohérentes pour les événements en utilisant DALL-E 3
 */
export class VisualIdentityAgent {
  private openai;
  private config: VisualIdentityConfig;

  constructor() {
    // Initialiser le client OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
    });

    // Configuration par défaut
    this.config = {
      model: "dall-e-3",
      defaultStyle: "moderne et professionnel",
      defaultColors: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
      defaultDimensions: {
        "bannière": { width: 1200, height: 628 },
        "logo": { width: 512, height: 512 },
        "arrière-plan": { width: 1920, height: 1080 },
        "flyer": { width: 2480, height: 3508 }, // A4 à 300dpi
        "général": { width: 1024, height: 1024 }
      }
    };
  }

  /**
   * Génère trois propositions visuelles distinctes basées sur les paramètres fournis
   * @param request Paramètres de la demande visuelle
   * @returns Réponse contenant 3 propositions visuelles avec métadonnées
   */
  async generateVisualProposals(request: VisualRequest): Promise<VisualResponse> {
    console.log(`🎨 [VISUAL IDENTITY] Generating 3 visual proposals for ${request.eventType} (${request.purpose})`);
    
    const startTime = Date.now();
    const requestId = `visual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Compléter les paramètres manquants avec les valeurs par défaut
    const completeRequest = this.completeRequest(request);
    
    try {
      // Générer 3 propositions avec des variations de style
      const proposalPromises = [
        this.generateSingleProposal(completeRequest, 1, requestId),
        this.generateSingleProposal(completeRequest, 2, requestId),
        this.generateSingleProposal(completeRequest, 3, requestId)
      ];
      
      const proposals = await Promise.all(proposalPromises);
      
      const totalProcessingTime = Date.now() - startTime;
      console.log(`✅ [VISUAL IDENTITY] 3 visual proposals generated in ${totalProcessingTime}ms`);
      
      // Construire et retourner la réponse avec les 3 propositions
      return {
        success: true,
        proposals: proposals,
        metadata: {
          totalProcessingTime: totalProcessingTime,
          requestId: requestId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ [VISUAL IDENTITY] Error generating visual proposals:`, error);
      return {
        success: false,
        proposals: [],
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          requestId: requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  /**
   * Génère une proposition visuelle spécifique
   * @param request Paramètres de la demande visuelle
   * @param proposalNumber Numéro de la proposition (1, 2 ou 3)
   * @param requestId ID de la requête
   * @returns Proposition visuelle avec métadonnées
   */
  private async generateSingleProposal(
    request: VisualRequest, 
    proposalNumber: number, 
    requestId: string
  ): Promise<VisualProposal> {
    const proposalStartTime = Date.now();
    
    // Adapter le style et les éléments selon le numéro de proposition
    const adaptedRequest = this.adaptRequestForProposal(request, proposalNumber);
    
    // Construire le prompt détaillé pour DALL-E 3
    const prompt = this.buildDetailedPrompt(adaptedRequest, proposalNumber);
    
    // Déterminer les dimensions appropriées
    const dimensions = this.getDimensions(adaptedRequest);
    
    // Déterminer le style DALL-E (natural ou vivid)
    const dalleStyle = adaptedRequest.style.includes("photo") || 
                       adaptedRequest.style.includes("réaliste") ? 
                       "natural" : "vivid";
    
    console.log(`🎨 [VISUAL IDENTITY] Generating proposal ${proposalNumber} with style: ${adaptedRequest.style}`);
    
    try {
      // Générer l'image via DALL-E 3
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: `${dimensions.width}x${dimensions.height}` as any,
        style: dalleStyle as any,
        quality: "hd"
      });
      
      const proposalId = `${requestId}_proposal_${proposalNumber}`;
      const imageUrl = response.data?.[0]?.url || "";
      const processingTime = Date.now() - proposalStartTime;
      
      // Construire et retourner la proposition
      return {
        id: proposalId,
        imageUrl: imageUrl,
        prompt: prompt,
        description: this.getProposalDescription(proposalNumber, adaptedRequest),
        metadata: {
          model: "dall-e-3",
          processingTime: processingTime,
          dimensions: dimensions,
          format: "png",
          parameters: {
            style: dalleStyle,
            quality: "hd",
            proposalNumber: proposalNumber
          }
        },
        downloadUrls: {
          original: imageUrl,
          thumbnail: imageUrl, // Pour l'instant, même URL
          highRes: imageUrl
        }
      };
    } catch (error) {
      console.error(`❌ [VISUAL IDENTITY] Error generating proposal ${proposalNumber}:`, error);
      
      // Retourner une proposition d'erreur
      return {
        id: `${requestId}_proposal_${proposalNumber}_error`,
        imageUrl: "",
        prompt: prompt,
        description: `Erreur lors de la génération de la proposition ${proposalNumber}`,
        metadata: {
          model: "dall-e-3",
          processingTime: Date.now() - proposalStartTime,
          dimensions: dimensions,
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
   * Adapte la requête pour créer des variations entre les propositions
   * @param request Requête originale
   * @param proposalNumber Numéro de la proposition
   * @returns Requête adaptée
   */
  private adaptRequestForProposal(request: VisualRequest, proposalNumber: number): VisualRequest {
    // Copier la requête pour ne pas modifier l'originale
    const adaptedRequest = { ...request };
    
    // Adapter le style selon le numéro de proposition
    switch (proposalNumber) {
      case 1:
        // Première proposition: style original, plus classique et professionnel
        adaptedRequest.style = request.style + " avec une approche classique et professionnelle";
        break;
      case 2:
        // Deuxième proposition: style plus créatif et dynamique
        if (request.style.includes("moderne")) {
          adaptedRequest.style = "créatif et dynamique avec des éléments modernes";
        } else if (request.style.includes("élégant")) {
          adaptedRequest.style = "élégant avec une touche artistique contemporaine";
        } else if (request.style.includes("minimaliste")) {
          adaptedRequest.style = "minimaliste avec des accents géométriques";
        } else {
          adaptedRequest.style = "créatif et dynamique " + request.style;
        }
        break;
      case 3:
        // Troisième proposition: style plus audacieux et innovant
        if (request.style.includes("moderne")) {
          adaptedRequest.style = "avant-gardiste et innovant";
        } else if (request.style.includes("élégant")) {
          adaptedRequest.style = "luxueux et premium avec des éléments distinctifs";
        } else if (request.style.includes("minimaliste")) {
          adaptedRequest.style = "épuré avec une approche futuriste";
        } else {
          adaptedRequest.style = "audacieux et innovant " + request.style;
        }
        break;
    }
    
    return adaptedRequest;
  }
  
  /**
   * Génère une description pour chaque proposition
   * @param proposalNumber Numéro de la proposition
   * @param request Requête adaptée
   * @returns Description de la proposition
   */
  private getProposalDescription(proposalNumber: number, request: VisualRequest): string {
    const baseDescription = `Proposition ${proposalNumber} pour ${request.eventType}`;
    
    switch (proposalNumber) {
      case 1:
        return `${baseDescription} - Approche classique et professionnelle, idéale pour un public large et une communication institutionnelle.`;
      case 2:
        return `${baseDescription} - Approche créative et dynamique, parfaite pour attirer l'attention et créer de l'engagement.`;
      case 3:
        return `${baseDescription} - Approche audacieuse et innovante, conçue pour se démarquer et marquer les esprits.`;
      default:
        return baseDescription;
    }
  }
  
  /**
   * Complète la requête avec des valeurs par défaut si nécessaire
   * @param request Requête originale
   * @returns Requête complétée
   */
  private completeRequest(request: VisualRequest): VisualRequest {
    return {
      eventType: request.eventType || "événement",
      style: request.style || this.config.defaultStyle,
      colors: request.colors?.length ? request.colors : this.config.defaultColors,
      elements: request.elements || [],
      purpose: request.purpose || "général",
      context: request.context || {}
    };
  }

  /**
   * Construit un prompt détaillé pour DALL-E 3
   * @param request Paramètres de la demande visuelle
   * @param proposalNumber Numéro de la proposition
   * @returns Prompt détaillé
   */
  private buildDetailedPrompt(request: VisualRequest, proposalNumber: number): string {
    const { eventType, style, colors, elements, purpose, context } = request;
    
    // Construire la description de base
    let prompt = `CONTEXTE SYSTÈME : Agent d'identité visuelle opérant au sein de l'orchestrateur Studio Evento.

TÂCHE : Créer un visuel ${style} pour ${eventType}`;
    
    // Ajouter le contexte si disponible
    if (context) {
      if (context.organization) {
        prompt += ` pour ${context.organization}`;
      }
      if (context.theme) {
        prompt += ` sur le thème "${context.theme}"`;
      }
      if (context.date) {
        prompt += ` qui aura lieu le ${context.date}`;
      }
      if (context.location) {
        prompt += ` à ${context.location}`;
      }
    }
    
    // Ajouter la description du type de visuel
    prompt += `\n\nTYPE DE VISUEL : `;
    switch (purpose) {
      case "bannière":
        prompt += `Bannière pour les réseaux sociaux et le site web. Format optimisé pour la communication digitale.`;
        break;
      case "logo":
        prompt += `Logo temporaire pour l'événement. Doit être distinctif et mémorable.`;
        break;
      case "arrière-plan":
        prompt += `Arrière-plan pour les présentations et écrans. Doit être élégant sans distraire du contenu.`;
        break;
      case "flyer":
        prompt += `Flyer imprimé. Doit être accrocheur et informatif avec une hiérarchie visuelle claire.`;
        break;
      default:
        prompt += `Visuel général pour la communication de l'événement.`;
    }
    
    // Ajouter les couleurs
    if (colors.length) {
      prompt += `\n\nPALETTE DE COULEURS : Utilisez principalement ${colors.join(", ")}.`;
    }
    
    // Ajouter les éléments spécifiques
    if (elements.length) {
      prompt += `\n\nÉLÉMENTS À INCLURE : ${elements.join(", ")}.`;
    }
    
    // Ajouter des instructions spécifiques selon le numéro de proposition
    prompt += `\n\nAPPROCHE SPÉCIFIQUE (Proposition ${proposalNumber}) : `;
    switch (proposalNumber) {
      case 1:
        prompt += `Cette proposition doit être professionnelle et accessible, adaptée à un public large. Privilégiez la clarté et la lisibilité.`;
        break;
      case 2:
        prompt += `Cette proposition doit être créative et dynamique, avec une approche plus moderne et originale. Osez les compositions asymétriques et les effets visuels.`;
        break;
      case 3:
        prompt += `Cette proposition doit être audacieuse et innovante, avec une approche distinctive qui se démarque. Explorez des concepts avant-gardistes.`;
        break;
    }
    
    // Ajouter des instructions générales pour la qualité
    prompt += `\n\nCONSIGNES QUALITÉ :
- Créer une image de haute qualité professionnelle
- Composition équilibrée et harmonieuse
- Typographie lisible et appropriée au contexte
- Respecter strictement la palette de couleurs
- Optimiser pour l'usage ${purpose}
- Style cohérent avec l'identité de l'événement`;
    
    return prompt;
  }

  /**
   * Détermine les dimensions appropriées pour le visuel
   * @param request Paramètres de la demande visuelle
   * @returns Dimensions (largeur et hauteur)
   */
  private getDimensions(request: VisualRequest): { width: number, height: number } {
    const purpose = request.purpose || "général";
    return this.config.defaultDimensions[purpose] || this.config.defaultDimensions["général"];
  }
}

