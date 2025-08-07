// Service de recherche MCP temporairement désactivé
// Pour activer : npm install @modelcontextprotocol/sdk axios cheerio

export interface SearchResult {
  title: string
  url: string
  snippet: string
  domain: string
  relevanceScore: number
}

export class McpSearchService {
  static async search(query: string, options?: {
    maxResults?: number
    domains?: string[]
  }): Promise<SearchResult[]> {
    console.warn('McpSearchService désactivé - dépendances manquantes');
    return [];
  }

  static async enrichContext(userMessage: string): Promise<any> {
    console.warn('McpSearchService désactivé - dépendances manquantes');
    return null;
  }
}

export default McpSearchService;