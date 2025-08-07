import Anthropic from '@anthropic-ai/sdk'

export interface AgentConfig {
  name: string
  description: string
  model: string
  temperature: number
  maxTokens: number
}

export abstract class AnthropicAgent {
  protected client: Anthropic
  protected config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })
  }

  protected abstract getSystemPrompt(): string
  
  abstract process(input: any): Promise<any>

  // Méthode utilitaire pour les appels basiques à Claude
  protected async generateResponse(messages: Array<{role: 'user' | 'assistant', content: string}>, customSystemPrompt?: string): Promise<string> {
    try {
      const result = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: customSystemPrompt || this.getSystemPrompt(),
        messages
      })

      return result.content[0]?.type === 'text' ? result.content[0].text : ''
    } catch (error) {
      console.error(`Erreur dans ${this.config.name}:`, error)
      throw error
    }
  }
}