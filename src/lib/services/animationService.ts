import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Animation = {
  id: string;
  nom: string;
  type: string;
  description?: string;
  prix_min?: number;
  prix_max?: number;
  duree_min?: number;
  duree_max?: number;
  participants_min?: number;
  participants_max?: number;
  materiel_requis?: string;
  espace_requis?: string;
  tags?: string[];
}

export interface AnimationSearchCriteria {
  type?: string
  capacity?: number
  keyword?: string
  limit?: number
}

export class AnimationService {
  /**
   * Recherche des animations selon les critères spécifiés
   */
  static async searchAnimations(criteria: AnimationSearchCriteria = {}): Promise<Animation[]> {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized, returning empty animations list');
        return [];
      }

      let query = supabase
        .from('animations')
        .select('*')

      // Filtrer par type d'animation
      if (criteria.type) {
        query = query.ilike('type', `%${criteria.type}%`)
      }

      // Recherche par mot-clé dans le nom ou la description
      if (criteria.keyword) {
        query = query.or(`nom.ilike.%${criteria.keyword}%,description.ilike.%${criteria.keyword}%`)
      }

      // Filtrer par capacité
      if (criteria.capacity) {
        query = query.or(`capacite.ilike.%${criteria.capacity}%,capacite.ilike.%${Math.floor(criteria.capacity / 10) * 10}%`)
      }

      // Limiter les résultats
      const limit = criteria.limit || 20
      query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('Erreur lors de la recherche d\'animations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur dans AnimationService.searchAnimations:', error)
      return []
    }
  }

  /**
   * Récupère les animations par type
   */
  static async getAnimationsByType(type: string): Promise<Animation[]> {
    return this.searchAnimations({ type, limit: 30 })
  }

  /**
   * Récupère les animations par mot-clé
   */
  static async getAnimationsByKeyword(keyword: string): Promise<Animation[]> {
    return this.searchAnimations({ keyword, limit: 25 })
  }

  /**
   * Récupère une animation par son ID
   */
  static async getAnimationById(id: number): Promise<Animation | null> {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized');
        return null;
      }

      const { data, error } = await supabase
        .from('animations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération de l\'animation:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur dans AnimationService.getAnimationById:', error)
      return null
    }
  }

  /**
   * Récupère tous les types d'animations disponibles
   */
  static async getAnimationTypes(): Promise<string[]> {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized');
        return [];
      }

      const { data, error } = await supabase
        .from('animations')
        .select('type')
        .not('type', 'is', null)

      if (error) {
        console.error('Erreur lors de la récupération des types:', error)
        return []
      }

      // Extraire les types uniques
      const types = Array.from(new Set(data.map(item => item.type).filter(Boolean)))
      return types as string[]
    } catch (error) {
      console.error('Erreur dans AnimationService.getAnimationTypes:', error)
      return []
    }
  }

  /**
   * Formate les animations pour l'affichage dans les prompts des agents
   */
  static formatAnimationsForAgent(animations: Animation[]): string {
    if (animations.length === 0) {
      return "Aucune animation trouvée dans notre base de données."
    }

    return animations.map((animation, index) => {
      const type = animation.type || 'Type non spécifié'
      const description = animation.description 
        ? (animation.description.length > 150 
           ? animation.description.substring(0, 150) + '...' 
           : animation.description)
        : 'Description non disponible'
      
      let details = `${index + 1}. ${animation.nom}
   🎭 Type: ${type}
   📝 Description: ${description}`

      if (animation.participants_min || animation.participants_max) {
        const capacite = animation.participants_min && animation.participants_max
          ? `${animation.participants_min}-${animation.participants_max} personnes`
          : animation.participants_min 
            ? `À partir de ${animation.participants_min} personnes`
            : `Jusqu'à ${animation.participants_max} personnes`
        details += `\n   👥 Capacité: ${capacite}`
      }

      if (animation.duree_min || animation.duree_max) {
        const duree = animation.duree_min && animation.duree_max
          ? `${animation.duree_min}-${animation.duree_max} minutes`
          : animation.duree_min 
            ? `À partir de ${animation.duree_min} minutes`
            : `Jusqu'à ${animation.duree_max} minutes`
        details += `\n   ⏱️ Durée: ${duree}`
      }

      if (animation.prix_min || animation.prix_max) {
        const prix = animation.prix_min && animation.prix_max
          ? `${animation.prix_min}-${animation.prix_max}€`
          : animation.prix_min 
            ? `À partir de ${animation.prix_min}€`
            : `Jusqu'à ${animation.prix_max}€`
        details += `\n   💰 Prix: ${prix}`
      }

      return details
    }).join('\n\n')
  }

  /**
   * Extrait les critères de recherche d'un prompt utilisateur pour les animations
   */
  static extractCriteriaFromPrompt(prompt: string): AnimationSearchCriteria {
    const criteria: AnimationSearchCriteria = {}

    // Types d'animations courants
    const animationTypes = [
      'team building', 'formation', 'spectacle', 'show', 'photo', 'vidéo',
      'jeux', 'cuisine', 'cocktail', 'bien-être', 'durable', 'écologique'
    ]

    // Recherche de type d'animation
    for (const type of animationTypes) {
      if (prompt.toLowerCase().includes(type)) {
        criteria.type = type
        break
      }
    }

    // Extraction de mots-clés généraux
    const keywordMatch = prompt.match(/(?:animation|activité)\s+(?:de\s+)?([a-zA-ZÀ-ÿ\s]+?)(?:\s|,|\.|\?|!|$)/i)
    if (keywordMatch && !criteria.type) {
      criteria.keyword = keywordMatch[1].trim()
    }

    // Extraction de la capacité
    const capacityMatch = prompt.match(/(\d+)\s*(?:personnes?|participants?|invités?)/i)
    if (capacityMatch) {
      criteria.capacity = parseInt(capacityMatch[1])
    }

    return criteria
  }
}

