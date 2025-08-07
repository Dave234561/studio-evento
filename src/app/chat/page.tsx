'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Clock, Zap, Sparkles, Leaf, MapPin, FileText, Users, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Message, AgentType } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessage extends Message {
  isLoading?: boolean
}

const AGENT_ICONS = {
  ORCHESTRATOR: <Users className="w-4 h-4" />,
  STORYTELLING: <Sparkles className="w-4 h-4" />,
  RSE: <Leaf className="w-4 h-4" />,
  VENUE: <MapPin className="w-4 h-4" />,
  BRIEF_GENERATOR: <FileText className="w-4 h-4" />,
  VISUAL_IDENTITY: <Image className="w-4 h-4" />
}

const AGENT_COLORS = {
  ORCHESTRATOR: 'bg-blue-500',
  STORYTELLING: 'bg-purple-500',
  RSE: 'bg-green-500',
  VENUE: 'bg-red-500',
  BRIEF_GENERATOR: 'bg-yellow-500',
  VISUAL_IDENTITY: 'bg-pink-500'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userId] = useState('user-demo-123') // Demo user ID
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      content: `👋 Bonjour ! Je suis l'écosystème EventAI Pro, votre intelligence artificielle dédiée à la planification d'événements d'exception.

Je coordonne 5 agents spécialisés :
• **Orchestrateur** (Sonnet 4) - Coordination intelligente
• **Storytelling** (Opus 4) - Concepts créatifs innovants  
• **RSE** (Opus 4) - Analyse environnementale
• **Lieu** (Sonnet 4) - Recommandations de venues
• **Brief Generator** (Sonnet 4) - Documents techniques

**Comment puis-je vous aider avec votre projet événementiel ?**

*Exemples : "Je veux organiser un séminaire d'entreprise innovant", "Analysez l'impact environnemental de mon événement", "Trouvez-moi des lieux originaux à Paris"*`,
      role: 'assistant',
      agentType: 'ORCHESTRATOR',
      model: 'sonnet-4',
      timestamp: new Date()
    }])
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: 'loading',
      content: 'Traitement en cours...',
      role: 'assistant',
      agentType: 'ORCHESTRATOR',
      model: 'sonnet-4',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          userId,
          context: {
            timestamp: new Date(),
            userAgent: navigator.userAgent
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      
      if (result.success) {
        // Remove loading message and add response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'loading')
          return [
            ...filtered,
            {
              id: result.message?.id || Date.now().toString(),
              content: result.message?.content || result.response || 'Réponse générée',
              role: 'assistant',
              agentType: result.message?.agentType || 'ORCHESTRATOR',
              model: result.message?.model || 'claude-3-5-sonnet',
              tokens: result.message?.tokens,
              latency: result.message?.latency,
              timestamp: new Date(),
              metadata: result.message?.metadata || result.metadata
            }
          ]
        })
        
        if (result.conversationId) {
          setConversationId(result.conversationId)
        }
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'loading')
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
            role: 'assistant',
            agentType: 'ORCHESTRATOR',
            model: 'sonnet-4',
            timestamp: new Date()
          }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map((line, index) => (
        <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />
      ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EventAI Pro</h1>
                <p className="text-sm text-gray-500">Chat Multi-Agents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {messages.length > 1 ? `${messages.length - 1} messages` : 'Nouveau chat'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0",
                    message.agentType ? AGENT_COLORS[message.agentType] : 'bg-gray-500'
                  )}>
                    {message.agentType ? AGENT_ICONS[message.agentType] : <Bot className="w-4 h-4" />}
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[70%] rounded-lg px-4 py-3",
                  message.role === 'user' 
                    ? "bg-blue-500 text-white ml-12" 
                    : "bg-gray-50 text-gray-900"
                )}>
                  {message.role === 'assistant' && message.agentType && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {message.agentType}
                      </Badge>
                      {message.model && (
                        <Badge variant="outline" className="text-xs">
                          {message.model}
                        </Badge>
                      )}
                      {message.isLoading && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    {message.role === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      message.isLoading ? (
                        <p className="text-gray-500">Analyse en cours...</p>
                      ) : (
                        formatContent(message.content)
                      )
                    )}
                  </div>
                  
                  {message.role === 'assistant' && !message.isLoading && (
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      {message.tokens && (
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{message.tokens} tokens</span>
                        </div>
                      )}
                      {message.latency && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{message.latency}ms</span>
                        </div>
                      )}
                      {message.metadata?.cached && (
                        <Badge variant="outline" className="text-xs">
                          Cachée
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Décrivez votre projet événementiel..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Claude Sonnet 4
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Claude Opus 4
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}