/**
 * Configuration de l'agent d'identité visuelle
 */
export interface VisualIdentityConfig {
  model: string;
  defaultStyle: string;
  defaultColors: string[];
  defaultDimensions: {
    [key: string]: { width: number, height: number }
  };
  supportedFormats?: string[];
  maxProposals?: number;
}

/**
 * Contexte de la demande visuelle
 */
export interface VisualContext {
  organization?: string;
  theme?: string;
  date?: string;
  location?: string;
  audience?: string;
  [key: string]: any;
}

/**
 * Paramètres de la demande visuelle
 */
export interface VisualRequest {
  eventType: string;
  style: string;
  colors: string[];
  elements: string[];
  purpose: string;
  context?: VisualContext;
  visualType?: string;
  organization?: string;
  location?: string;
}

/**
 * Détails d'une proposition visuelle
 */
export interface ProposalDetail {
  imageUrl: string;
  prompt: string;
  metadata: {
    model: string;
    processingTime: number;
    dimensions: { width: number, height: number };
    format: string;
    parameters: any;
  };
}

/**
 * Réponse de l'agent d'identité visuelle avec 3 propositions
 */
export interface VisualResponse {
  success: boolean;
  proposals: VisualProposal[];
  metadata: {
    totalProcessingTime: number;
    requestId: string;
    timestamp: string;
    model?: string;
    version?: string;
    error?: string;
  };
}

/**
 * Une proposition visuelle individuelle
 */
export interface VisualProposal {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  metadata: {
    model: string;
    processingTime: number;
    dimensions: { width: number, height: number };
    format: string;
    parameters: any;
  };
  downloadUrls: {
    original: string;
    thumbnail: string;
    highRes?: string;
  };
}

/**
 * Options de téléchargement pour les visuels
 */
export interface DownloadOptions {
  format: 'png' | 'jpg' | 'pdf';
  quality?: 'standard' | 'high';
  includeMetadata?: boolean;
  proposalNumber?: number;
}



/**
 * Réponse API pour l'agent d'identité visuelle
 */
export interface VisualIdentityApiResponse {
  success: boolean;
  data?: VisualResponse;
  error?: string;
  module: 'visual-identity';
}

/**
 * Paramètres de téléchargement
 */
export interface DownloadRequest {
  proposalId: string;
  format: 'png' | 'jpg' | 'pdf';
  quality: 'standard' | 'high';
  includeMetadata?: boolean;
}

/**
 * Réponse de téléchargement
 */
export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * Styles visuels disponibles
 */
export type VisualStyle = 
  | 'corporate'
  | 'creative'
  | 'modern'
  | 'elegant'
  | 'playful'
  | 'minimalist'
  | 'luxury'
  | 'tech'
  | 'artistic';

/**
 * Types de visuels générables
 */
export type VisualType = 
  | 'banner'
  | 'logo'
  | 'background'
  | 'poster'
  | 'invitation'
  | 'social-media'
  | 'presentation'
  | 'flyer';

