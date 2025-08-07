import { NextRequest, NextResponse } from 'next/server';
import { visualIdentityOpenAIAgent } from '../../../../lib/agents/visual-identity-openai';
import type { VisualRequest } from '../../../../types/visual-identity';

/**
 * Endpoint API pour l'agent d'identité visuelle utilisant DALL-E 3 via OpenAI
 * @param req Requête entrante
 * @returns Réponse avec les propositions visuelles
 */
export async function POST(req: NextRequest) {
  try {
    console.log(`🎨 [API] Visual Identity endpoint called`);
    
    // Parser le body de la requête
    const body = await req.json();
    const { message, context } = body;
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message manquant dans la requête'
      }, { status: 400 });
    }
    
    console.log(`🎨 [API] Processing visual request: ${message.substring(0, 100)}...`);
    
    // Construire la demande visuelle à partir du message et du contexte
    const visualRequest: VisualRequest = {
      eventType: context?.eventType || extractEventType(message),
      style: extractStyle(message),
      colors: extractColors(message),
      elements: extractElements(message),
      purpose: extractPurpose(message),
      context: {
        organization: context?.organization || extractOrganization(message),
        location: context?.location || extractLocation(message),
        audience: context?.audience || extractAudience(message),
        ...context
      }
    };
    
    console.log(`🎨 [API] Visual request constructed:`, visualRequest);
    
    // Générer les propositions visuelles
    const response = await visualIdentityOpenAIAgent.generateVisualProposals(visualRequest);
    
    console.log(`🎨 [API] Generated ${response.proposals.length} proposals`);
    
    return NextResponse.json({
      success: true,
      module: 'visual-identity',
      data: response
    });
  } catch (error) {
    console.error(`❌ [API] Error in visual identity endpoint:`, error);
    
    return NextResponse.json({
      success: false,
      error: `Erreur lors de la génération des visuels: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}

/**
 * Extrait le type de visuel du message
 * @param message Message de l'utilisateur
 * @returns Type de visuel
 */
function extractVisualType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bannière') || lowerMessage.includes('banner')) {
    return 'bannière';
  } else if (lowerMessage.includes('logo')) {
    return 'logo';
  } else if (lowerMessage.includes('affiche') || lowerMessage.includes('poster')) {
    return 'affiche';
  } else if (lowerMessage.includes('arrière-plan') || lowerMessage.includes('background')) {
    return 'arrière-plan';
  }
  
  return 'bannière'; // Par défaut
}

/**
 * Extrait le style du message
 * @param message Message de l'utilisateur
 * @returns Style demandé
 */
function extractStyle(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('moderne') || lowerMessage.includes('modern')) {
    return 'moderne et professionnel';
  } else if (lowerMessage.includes('créatif') || lowerMessage.includes('creative')) {
    return 'créatif et dynamique';
  } else if (lowerMessage.includes('innovant') || lowerMessage.includes('innovative')) {
    return 'avant-gardiste et innovant';
  } else if (lowerMessage.includes('professionnel') || lowerMessage.includes('professional')) {
    return 'professionnel et corporate';
  }
  
  return 'moderne et professionnel'; // Par défaut
}

/**
 * Extrait les couleurs du message
 * @param message Message de l'utilisateur
 * @returns Couleurs demandées
 */
function extractColors(message: string): string[] {
  const colors: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Couleurs courantes
  const colorMap: { [key: string]: string } = {
    'bleu': '#1E88E5',
    'blue': '#1E88E5',
    'rouge': '#F44336',
    'red': '#F44336',
    'vert': '#4CAF50',
    'green': '#4CAF50',
    'orange': '#FF9800',
    'violet': '#9C27B0',
    'purple': '#9C27B0',
    'jaune': '#FFEB3B',
    'yellow': '#FFEB3B',
    'blanc': '#FFFFFF',
    'white': '#FFFFFF',
    'noir': '#000000',
    'black': '#000000'
  };
  
  for (const [colorName, colorCode] of Object.entries(colorMap)) {
    if (lowerMessage.includes(colorName)) {
      colors.push(colorCode);
    }
  }
  
  // Si aucune couleur trouvée, utiliser les couleurs par défaut
  if (colors.length === 0) {
    return ['#1E88E5', '#FFFFFF']; // Bleu et blanc par défaut
  }
  
  return colors;
}

/**
 * Extrait l'organisation du message
 * @param message Message de l'utilisateur
 * @returns Nom de l'organisation
 */
function extractOrganization(message: string): string {
  // Rechercher des patterns comme "pour [Organisation]" ou "[Organisation]"
  const orgPatterns = [
    /pour\s+([A-Z][a-zA-Z\s]+)/i,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/
  ];
  
  for (const pattern of orgPatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      return match[1].trim();
    }
  }
  
  return 'Votre organisation';
}

/**
 * Extrait le type d'événement du message
 * @param message Message de l'utilisateur
 * @returns Type d'événement
 */
function extractEventType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const eventTypes = [
    'séminaire', 'seminar', 'conférence', 'conference', 'formation', 'training',
    'workshop', 'atelier', 'réunion', 'meeting', 'événement', 'event',
    'soirée', 'party', 'gala', 'lancement', 'launch'
  ];
  
  for (const eventType of eventTypes) {
    if (lowerMessage.includes(eventType)) {
      return eventType;
    }
  }
  
  return 'événement';
}

/**
 * Extrait la localisation du message
 * @param message Message de l'utilisateur
 * @returns Localisation
 */
function extractLocation(message: string): string | undefined {
  // Rechercher des patterns de ville
  const locationPatterns = [
    /à\s+([A-Z][a-zA-Z\s-]+)/i,
    /in\s+([A-Z][a-zA-Z\s-]+)/i,
    /(Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Bordeaux|Lille)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * Extrait l'audience du message
 * @param message Message de l'utilisateur
 * @returns Audience
 */
function extractAudience(message: string): string | undefined {
  // Rechercher des patterns de nombre de personnes
  const audiencePatterns = [
    /(\d+)\s*personnes?/i,
    /(\d+)\s*participants?/i,
    /(\d+)\s*invités?/i
  ];
  
  for (const pattern of audiencePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return `${match[1]} personnes`;
    }
  }
  
  return undefined;
}

/**
 * Extrait les exigences additionnelles du message
 * @param message Message de l'utilisateur
 * @returns Exigences additionnelles
 */
function extractAdditionalRequirements(message: string): string[] {
  const requirements: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('haute résolution') || lowerMessage.includes('high resolution')) {
    requirements.push('Haute résolution');
  }
  
  if (lowerMessage.includes('impression') || lowerMessage.includes('print')) {
    requirements.push('Optimisé pour impression');
  }
  
  if (lowerMessage.includes('réseaux sociaux') || lowerMessage.includes('social media')) {
    requirements.push('Optimisé pour réseaux sociaux');
  }
  
  return requirements;
}

/**
 * Extrait les éléments visuels demandés du message
 * @param message Message de l'utilisateur
 * @returns Éléments visuels
 */
function extractElements(message: string): string[] {
  const elements: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('logo') || lowerMessage.includes('identité')) {
    elements.push('logo');
  }
  
  if (lowerMessage.includes('affiche') || lowerMessage.includes('poster')) {
    elements.push('affiche');
  }
  
  if (lowerMessage.includes('invitation') || lowerMessage.includes('carton')) {
    elements.push('invitation');
  }
  
  if (lowerMessage.includes('bannière') || lowerMessage.includes('banner')) {
    elements.push('bannière');
  }
  
  if (lowerMessage.includes('brochure') || lowerMessage.includes('flyer')) {
    elements.push('brochure');
  }
  
  // Si aucun élément spécifique n'est mentionné, retourner des éléments par défaut
  if (elements.length === 0) {
    elements.push('identité visuelle', 'affiche');
  }
  
  return elements;
}

/**
 * Extrait l'objectif/but de la demande visuelle
 * @param message Message de l'utilisateur
 * @returns Objectif de la demande
 */
function extractPurpose(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('communication') || lowerMessage.includes('promouvoir')) {
    return 'Communication et promotion';
  }
  
  if (lowerMessage.includes('invitation') || lowerMessage.includes('inviter')) {
    return 'Invitation et engagement';
  }
  
  if (lowerMessage.includes('branding') || lowerMessage.includes('image de marque')) {
    return 'Renforcement de marque';
  }
  
  if (lowerMessage.includes('signalétique') || lowerMessage.includes('décoration')) {
    return 'Signalétique et décoration';
  }
  
  // Par défaut
  return 'Communication événementielle';
}

