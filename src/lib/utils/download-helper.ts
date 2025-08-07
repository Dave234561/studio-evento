import fs from 'fs';
import path from 'path';
import type { 
  VisualResponse, 
  VisualProposal, 
  DownloadRequest, 
  DownloadResponse 
} from '../../types/visual-identity';

/**
 * Utilitaire pour le téléchargement des visuels générés
 */
export class DownloadHelper {
  private static readonly TEMP_DIR = '/tmp/studio-evento-visuals';
  
  /**
   * Prépare les fichiers pour le téléchargement à partir d'une réponse visuelle
   * @param visualResponse Réponse de l'agent d'identité visuelle
   * @param proposalId ID de la proposition à télécharger
   * @returns URLs de téléchargement
   */
  static async prepareProposalForDownload(
    visualResponse: VisualResponse, 
    proposalId: string
  ): Promise<DownloadResponse> {
    try {
      // Créer le répertoire temporaire s'il n'existe pas
      if (!fs.existsSync(this.TEMP_DIR)) {
        fs.mkdirSync(this.TEMP_DIR, { recursive: true });
      }
      
      // Trouver la proposition correspondante
      const proposal = visualResponse.proposals.find(p => p.id === proposalId);
      if (!proposal) {
        return {
          success: false,
          error: `Proposition non trouvée: ${proposalId}`
        };
      }
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileId = `${proposalId}_${timestamp}`;
      const filename = `${fileId}.png`;
      const filePath = path.join(this.TEMP_DIR, filename);
      
      // Télécharger l'image
      await this.downloadImage(proposal.imageUrl, filePath);
      
      // Créer les métadonnées
      const metadataFilename = `${fileId}_metadata.json`;
      const metadataPath = path.join(this.TEMP_DIR, metadataFilename);
      const metadata = {
        proposalId: proposal.id,
        description: proposal.description,
        prompt: proposal.prompt,
        metadata: proposal.metadata,
        generatedAt: visualResponse.metadata.timestamp,
        requestId: visualResponse.metadata.requestId
      };
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      return {
        success: true,
        downloadUrl: `/api/download?file=${filename}`,
        filename: filename
      };
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error preparing proposal for download:`, error);
      return {
        success: false,
        error: `Erreur lors de la préparation du téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
  
  /**
   * Prépare toutes les propositions pour le téléchargement
   * @param visualResponse Réponse de l'agent d'identité visuelle
   * @returns URLs de téléchargement pour toutes les propositions
   */
  static async prepareAllProposalsForDownload(
    visualResponse: VisualResponse
  ): Promise<{ [proposalId: string]: DownloadResponse }> {
    const results: { [proposalId: string]: DownloadResponse } = {};
    
    for (const proposal of visualResponse.proposals) {
      results[proposal.id] = await this.prepareProposalForDownload(visualResponse, proposal.id);
    }
    
    return results;
  }
  
  /**
   * Traite une demande de téléchargement spécifique
   * @param request Demande de téléchargement
   * @param visualResponse Réponse de l'agent d'identité visuelle
   * @returns Réponse de téléchargement
   */
  static async processDownloadRequest(
    request: DownloadRequest,
    visualResponse: VisualResponse
  ): Promise<DownloadResponse> {
    try {
      // Créer le répertoire temporaire s'il n'existe pas
      if (!fs.existsSync(this.TEMP_DIR)) {
        fs.mkdirSync(this.TEMP_DIR, { recursive: true });
      }
      
      // Trouver la proposition correspondante
      const proposal = visualResponse.proposals.find(p => p.id === request.proposalId);
      if (!proposal) {
        return {
          success: false,
          error: `Proposition non trouvée: ${request.proposalId}`
        };
      }
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileId = `${request.proposalId}_${timestamp}`;
      const filename = `${fileId}.${request.format}`;
      const filePath = path.join(this.TEMP_DIR, filename);
      
      // Télécharger et traiter l'image selon les options
      await this.downloadAndProcessImage(
        proposal.imageUrl, 
        filePath, 
        request.format, 
        request.quality
      );
      
      // Créer les métadonnées si demandé
      if (request.includeMetadata) {
        const metadataFilename = `${fileId}_metadata.json`;
        const metadataPath = path.join(this.TEMP_DIR, metadataFilename);
        const metadata = {
          proposalId: proposal.id,
          description: proposal.description,
          prompt: proposal.prompt,
          metadata: proposal.metadata,
          generatedAt: visualResponse.metadata.timestamp,
          requestId: visualResponse.metadata.requestId,
          downloadOptions: request
        };
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      }
      
      return {
        success: true,
        downloadUrl: `/api/download?file=${filename}`,
        filename: filename
      };
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error processing download request:`, error);
      return {
        success: false,
        error: `Erreur lors du traitement de la demande de téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
  
  /**
   * Télécharge une image depuis une URL
   * @param url URL de l'image
   * @param outputPath Chemin de sortie
   */
  private static async downloadImage(url: string, outputPath: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error downloading image:`, error);
      throw error;
    }
  }
  
  /**
   * Télécharge et traite une image selon les options spécifiées
   * @param url URL de l'image
   * @param outputPath Chemin de sortie
   * @param format Format de sortie
   * @param quality Qualité demandée
   */
  private static async downloadAndProcessImage(
    url: string, 
    outputPath: string, 
    format: 'png' | 'jpg' | 'pdf',
    quality: 'standard' | 'high'
  ): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Pour l'instant, on sauvegarde directement l'image
      // Dans une version future, on pourrait ajouter du traitement d'image
      // selon le format et la qualité demandés
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      
      console.log(`✅ [DOWNLOAD] Image processed and saved: ${outputPath}`);
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error downloading and processing image:`, error);
      throw error;
    }
  }
  
  /**
   * Récupère un fichier pour le téléchargement
   * @param filename Nom du fichier
   * @returns Chemin complet du fichier
   */
  static getFilePath(filename: string): string {
    const filePath = path.join(this.TEMP_DIR, filename);
    
    // Vérifier que le fichier existe et est dans le répertoire temporaire
    if (!fs.existsSync(filePath) || !filePath.startsWith(this.TEMP_DIR)) {
      throw new Error(`Fichier non trouvé: ${filename}`);
    }
    
    return filePath;
  }
  
  /**
   * Nettoie les fichiers temporaires anciens
   * @param maxAgeHours Âge maximum en heures (défaut: 24h)
   */
  static cleanupOldFiles(maxAgeHours: number = 24): void {
    try {
      if (!fs.existsSync(this.TEMP_DIR)) {
        return;
      }
      
      const files = fs.readdirSync(this.TEMP_DIR);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.TEMP_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ [DOWNLOAD] Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error(`❌ [DOWNLOAD] Error cleaning up old files:`, error);
    }
  }
}

