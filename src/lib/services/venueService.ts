import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Venue = {
  id: number;
  nom: string;
  localite: string;
  code_postal?: string;
  capacite?: number;
  description?: string;
  type_lieu?: string;
  prix_min?: number;
  prix_max?: number;
}

export interface VenueSearchCriteria {
  city?: string
  capacity?: number
  region?: string
  limit?: number
}

export class VenueService {
  /**
   * Recherche des venues selon les critères spécifiés
   */
  static async searchVenues(criteria: VenueSearchCriteria = {}): Promise<Venue[]> {
    try {
      if (!supabase) {
        console.warn('Supabase not initialized, returning empty venues list');
        return [];
      }

      let query = supabase
        .from('venues_abc')
        .select('*')

      // Filtrer par ville/localité
      if (criteria.city) {
        query = query.ilike('localite', `%${criteria.city}%`)
      }

      // Filtrer par région (code postal)
      if (criteria.region) {
        query = query.ilike('code_postal', `${criteria.region}%`)
      }

      // Filtrer par capacité (extraction du nombre de la chaîne capacite)
      if (criteria.capacity) {
        // Note: capacite est stocké comme string, on fait une recherche approximative
        query = query.or(`capacite.ilike.%${criteria.capacity}%,capacite.ilike.%${Math.floor(criteria.capacity / 10) * 10}%`)
      }

      // Limiter les résultats
      const limit = criteria.limit || 20
      query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('Erreur lors de la recherche de venues:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur dans VenueService.searchVenues:', error)
      return []
    }
  }

  /**
   * Récupère toutes les venues d'une ville spécifique
   */
  static async getVenuesByCity(city: string): Promise<Venue[]> {
    return this.searchVenues({ city, limit: 50 })
  }

  /**
   * Récupère les venues par capacité minimale
   */
  static async getVenuesByCapacity(minCapacity: number): Promise<Venue[]> {
    return this.searchVenues({ capacity: minCapacity, limit: 30 })
  }

  /**
   * Récupère une venue par son ID
   */
  static async getVenueById(id: number): Promise<Venue | null> {
    try {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('venues_abc')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération de la venue:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur dans VenueService.getVenueById:', error)
      return null
    }
  }

  /**
   * Formate les venues pour l'affichage dans les prompts des agents
   */
  static formatVenuesForAgent(venues: Venue[]): string {
    if (venues.length === 0) {
      return "Aucune venue trouvée dans notre base de données."
    }

    return venues.map((venue, index) => {
      const capacite = venue.capacite || 'Non spécifiée'
      const localite = venue.localite || 'Localité non spécifiée'
      
      return `${index + 1}. ${venue.nom}
   📍 Localité: ${localite}
   👥 Capacité: ${capacite}
   📮 Code postal: ${venue.code_postal || 'Non spécifié'}`
    }).join('\n\n')
  }

  /**
   * Extrait les critères de recherche d'un prompt utilisateur
   */
  static extractCriteriaFromPrompt(prompt: string): VenueSearchCriteria {
    const criteria: VenueSearchCriteria = {}

    // Extraction de la ville
    const cityMatch = prompt.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s-]+?)(?:\s|,|\.|\?|!|$)/i)
    if (cityMatch) {
      criteria.city = cityMatch[1].trim()
    }

    // Extraction de la capacité
    const capacityMatch = prompt.match(/(\d+)\s*(?:personnes?|participants?|invités?|places?)/i)
    if (capacityMatch) {
      criteria.capacity = parseInt(capacityMatch[1])
    }

    return criteria
  }
}

