/**
 * Utilitaires pour extraire les informations visuelles des messages
 */

/**
 * Extrait le style visuel à partir du message
 * @param message Message de l'utilisateur
 * @returns Style visuel identifié
 */
export function extractStyle(message: string): string {
  // Liste des styles courants à rechercher
  const styles = [
    { keywords: ['moderne', 'contemporain', 'épuré', 'minimaliste'], value: 'moderne et minimaliste' },
    { keywords: ['élégant', 'luxueux', 'premium', 'sophistiqué'], value: 'élégant et sophistiqué' },
    { keywords: ['corporatif', 'professionnel', 'business', 'entreprise'], value: 'professionnel et corporatif' },
    { keywords: ['créatif', 'artistique', 'coloré', 'dynamique'], value: 'créatif et dynamique' },
    { keywords: ['rétro', 'vintage', 'nostalgique', 'ancien'], value: 'rétro et vintage' },
    { keywords: ['futuriste', 'tech', 'high-tech', 'innovant'], value: 'futuriste et high-tech' },
    { keywords: ['naturel', 'organique', 'écologique', 'vert'], value: 'naturel et écologique' },
    { keywords: ['festif', 'célébration', 'fête', 'joyeux'], value: 'festif et joyeux' },
    { keywords: ['sérieux', 'formel', 'institutionnel', 'académique'], value: 'sérieux et formel' },
    { keywords: ['photo', 'réaliste', 'photographie', 'réalisme'], value: 'photoréaliste' }
  ];
  
  // Convertir le message en minuscules pour la recherche
  const messageLower = message.toLowerCase();
  
  // Rechercher des mentions explicites de style
  const styleMatch = messageLower.match(/style\s+(\w+(\s+\w+){0,3})/i);
  if (styleMatch && styleMatch[1]) {
    return styleMatch[1];
  }
  
  // Rechercher des correspondances avec les styles prédéfinis
  for (const style of styles) {
    for (const keyword of style.keywords) {
      if (messageLower.includes(keyword)) {
        return style.value;
      }
    }
  }
  
  // Style par défaut si aucun n'est trouvé
  return 'moderne et professionnel';
}

/**
 * Extrait les couleurs à partir du message et du contexte
 * @param message Message de l'utilisateur
 * @param context Contexte de la demande
 * @returns Tableau de couleurs identifiées
 */
export function extractColors(message: string, context: any): string[] {
  // Couleurs par défaut
  const defaultColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
  
  // Si le contexte contient déjà des couleurs, les utiliser
  if (context?.colors && Array.isArray(context.colors) && context.colors.length > 0) {
    return context.colors;
  }
  
  // Rechercher des codes hexadécimaux
  const hexMatches = message.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g);
  if (hexMatches && hexMatches.length > 0) {
    return hexMatches;
  }
  
  // Rechercher des noms de couleurs
  const colorNames = [
    'rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet', 'rose', 'marron', 
    'gris', 'noir', 'blanc', 'turquoise', 'cyan', 'magenta', 'doré', 'argenté'
  ];
  
  const foundColors = [];
  const messageLower = message.toLowerCase();
  
  for (const color of colorNames) {
    if (messageLower.includes(color)) {
      foundColors.push(color);
    }
  }
  
  // Mapper les noms de couleurs à des codes hexadécimaux
  if (foundColors.length > 0) {
    const colorMap: Record<string, string> = {
      'rouge': '#FF0000',
      'bleu': '#0000FF',
      'vert': '#00FF00',
      'jaune': '#FFFF00',
      'orange': '#FFA500',
      'violet': '#800080',
      'rose': '#FFC0CB',
      'marron': '#A52A2A',
      'gris': '#808080',
      'noir': '#000000',
      'blanc': '#FFFFFF',
      'turquoise': '#40E0D0',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'doré': '#FFD700',
      'argenté': '#C0C0C0'
    };
    
    return foundColors.map(color => colorMap[color] || color);
  }
  
  // Rechercher des thèmes de couleurs
  const themes = [
    { keywords: ['chaud', 'chaleureux', 'automne'], colors: ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B'] },
    { keywords: ['froid', 'hiver', 'glacé'], colors: ['#2196F3', '#03A9F4', '#00BCD4', '#B3E5FC'] },
    { keywords: ['nature', 'écologique', 'vert'], colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#7CB342'] },
    { keywords: ['luxe', 'élégant', 'premium'], colors: ['#212121', '#303030', '#D4AF37', '#FFFFFF'] },
    { keywords: ['tech', 'digital', 'moderne'], colors: ['#3F51B5', '#2196F3', '#03A9F4', '#E0E0E0'] },
    { keywords: ['créatif', 'artistique', 'coloré'], colors: ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5'] }
  ];
  
  for (const theme of themes) {
    for (const keyword of theme.keywords) {
      if (messageLower.includes(keyword)) {
        return theme.colors;
      }
    }
  }
  
  // Si le contexte contient une organisation, essayer de trouver ses couleurs
  if (context?.organization) {
    const orgLower = context.organization.toLowerCase();
    
    // Quelques exemples d'organisations et leurs couleurs
    const orgColors: Record<string, string[]> = {
      'google': ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
      'facebook': ['#1877F2', '#FFFFFF', '#3578E5', '#E7F3FF'],
      'twitter': ['#1DA1F2', '#14171A', '#657786', '#AAB8C2'],
      'coca': ['#F40009', '#FFFFFF', '#000000', '#F40009'],
      'pepsi': ['#004B93', '#E32934', '#FFFFFF', '#004B93']
    };
    
    for (const [org, colors] of Object.entries(orgColors)) {
      if (orgLower.includes(org)) {
        return colors;
      }
    }
  }
  
  // Retourner les couleurs par défaut si rien n'est trouvé
  return defaultColors;
}

/**
 * Extrait les éléments à inclure dans le visuel à partir du message
 * @param message Message de l'utilisateur
 * @returns Tableau d'éléments à inclure
 */
export function extractElements(message: string): string[] {
  const elements = [];
  const messageLower = message.toLowerCase();
  
  // Rechercher des mentions explicites d'éléments
  const elementsMatch = messageLower.match(/avec\s+([^,.]+)/i);
  if (elementsMatch && elementsMatch[1]) {
    elements.push(elementsMatch[1]);
  }
  
  // Rechercher des éléments courants
  const commonElements = [
    { keywords: ['logo'], value: 'logo de l\'entreprise' },
    { keywords: ['date', 'jour'], value: 'date de l\'événement' },
    { keywords: ['lieu', 'endroit', 'location'], value: 'lieu de l\'événement' },
    { keywords: ['photo', 'image'], value: 'photos illustratives' },
    { keywords: ['icône', 'icone', 'icon'], value: 'icônes thématiques' },
    { keywords: ['texte', 'slogan', 'phrase'], value: 'texte principal' },
    { keywords: ['graphique', 'graphe', 'chart'], value: 'éléments graphiques' },
    { keywords: ['motif', 'pattern', 'texture'], value: 'motifs ou textures' }
  ];
  
  for (const element of commonElements) {
    for (const keyword of element.keywords) {
      if (messageLower.includes(keyword)) {
        elements.push(element.value);
        break;
      }
    }
  }
  
  return elements;
}

/**
 * Extrait l'objectif du visuel à partir du message
 * @param message Message de l'utilisateur
 * @returns Objectif identifié
 */
export function extractPurpose(message: string): string {
  const messageLower = message.toLowerCase();
  
  // Rechercher des mentions explicites d'objectif
  const purposeMatch = messageLower.match(/pour\s+(une|un)\s+([^,.]+)/i);
  if (purposeMatch && purposeMatch[2]) {
    return purposeMatch[2];
  }
  
  // Rechercher des objectifs courants
  const purposes = [
    { keywords: ['bannière', 'banner', 'bandeau'], value: 'bannière' },
    { keywords: ['logo', 'logotype', 'emblème'], value: 'logo' },
    { keywords: ['arrière-plan', 'background', 'fond'], value: 'arrière-plan' },
    { keywords: ['flyer', 'tract', 'prospectus'], value: 'flyer' },
    { keywords: ['affiche', 'poster', 'panneau'], value: 'affiche' },
    { keywords: ['invitation', 'carte'], value: 'invitation' },
    { keywords: ['présentation', 'slide', 'diapositive'], value: 'présentation' },
    { keywords: ['couverture', 'cover'], value: 'couverture' },
    { keywords: ['social', 'réseau', 'facebook', 'instagram', 'linkedin'], value: 'réseaux sociaux' }
  ];
  
  for (const purpose of purposes) {
    for (const keyword of purpose.keywords) {
      if (messageLower.includes(keyword)) {
        return purpose.value;
      }
    }
  }
  
  // Objectif par défaut si aucun n'est trouvé
  return 'général';
}

