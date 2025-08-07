import { Prisma } from '@prisma/client'

// Agent Types
export type AgentType = 'ORCHESTRATOR' | 'STORYTELLING' | 'RSE' | 'VENUE' | 'BRIEF_GENERATOR' | 'VISUAL_IDENTITY'

export interface Agent {
  type: AgentType
  name: string
  description: string
  model: 'sonnet-4' | 'opus-4'
  capabilities: string[]
  icon: string
  color: string
}

// Message Types
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  agentType?: AgentType
  model?: string
  tokens?: number
  latency?: number
  timestamp: Date
  context?: any
  metadata?: any
}

// Conversation Types
export interface Conversation {
  id: string
  title?: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId: string
  projectId?: string
}

// Project Types
export interface Project {
  id: string
  title: string
  description?: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED'
  budget?: number
  deadline?: Date
  venue?: string
  attendees?: number
  eventType?: string
  requirements?: any
  constraints?: any
  createdAt: Date
  updatedAt: Date
  userId: string
}

// Agent Response Types
export interface AgentResponse {
  content: string
  agentType: AgentType
  model: string
  tokens: number
  latency: number
  context?: any
  metadata?: any
  suggestions?: string[]
  nextActions?: string[]
}

// Orchestrator Types
export interface OrchestrationPlan {
  steps: OrchestrationStep[]
  totalEstimatedTime: number
  requiredAgents: AgentType[]
  dependencies: string[]
}

export interface OrchestrationStep {
  id: string
  agentType: AgentType
  action: string
  input: any
  expectedOutput: string
  priority: 'high' | 'medium' | 'low'
  dependencies?: string[]
  estimatedTime: number
}

// Storytelling Types
export interface CreativeConcept {
  title: string
  description: string
  theme: string
  targetAudience: string
  keyElements: string[]
  timeline: string[]
  budget: {
    min: number
    max: number
    recommended: number
  }
  logistics: string[]
  alternatives: string[]
}

// RSE Types
export interface RSEAnalysis {
  carbonFootprint: {
    total: number
    breakdown: {
      transport: number
      catering: number
      venue: number
      materials: number
      waste: number
    }
  }
  recommendations: RSERecommendation[]
  certifications: string[]
  score: number
  improvements: string[]
}

export interface RSERecommendation {
  category: string
  description: string
  impact: 'high' | 'medium' | 'low'
  implementation: string
  cost: number
  savings: number
  timeline: string
}

// Venue Types
export interface VenueRecommendation {
  id: string
  name: string
  location: {
    address: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  capacity: number
  amenities: string[]
  pricing: {
    base: number
    currency: string
    includes: string[]
  }
  availability: Date[]
  photos: string[]
  rating: number
  reviews: number
  sustainability: {
    score: number
    certifications: string[]
  }
  accessibility: string[]
  technical: {
    av: boolean
    wifi: boolean
    parking: number
    catering: boolean
  }
}

// Brief Types
export interface EventBrief {
  id: string
  title: string
  objective: string
  target: {
    audience: string
    size: number
    demographics: string[]
  }
  logistics: {
    date: Date
    duration: string
    venue: string
    format: string
  }
  budget: {
    total: number
    breakdown: {
      venue: number
      catering: number
      entertainment: number
      technical: number
      marketing: number
      other: number
    }
  }
  requirements: {
    technical: string[]
    catering: string[]
    entertainment: string[]
    branding: string[]
    sustainability: string[]
  }
  timeline: {
    milestone: string
    date: Date
    responsible: string
    status: 'pending' | 'in_progress' | 'completed'
  }[]
  deliverables: string[]
  constraints: string[]
  success_metrics: string[]
}

// Cache Types
export interface CacheEntry {
  key: string
  value: any
  embedding?: string
  agentType: AgentType
  model: string
  expiresAt: Date
  hitCount: number
  lastAccess: Date
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    tokens?: number
    latency?: number
    model?: string
    cached?: boolean
  }
}

// Configuration Types
export interface AgentConfig {
  model: 'sonnet-4' | 'opus-4'
  temperature: number
  maxTokens: number
  systemPrompt: string
  examples?: Array<{
    input: string
    output: string
  }>
  tools?: string[]
  caching: {
    enabled: boolean
    ttl: number
    semantic: boolean
  }
}

// Database Types (extending Prisma)
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    conversations: true
    projects: true
  }
}>

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true
    user: true
    project: true
  }
}>

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    user: true
    conversations: true
    documents: true
  }
}>

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type AgentCapabilities = {
  [K in AgentType]: {
    model: 'sonnet-4' | 'opus-4'
    strengths: string[]
    useCases: string[]
    limitations: string[]
  }
}