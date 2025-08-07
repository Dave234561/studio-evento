'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  data?: any
}

interface ModuleChatProps {
  module: string
  moduleName: string
  moduleDescription: string
}

const moduleConfig = {
  'cahier-des-charges': {
    name: 'Cahier des charges',
    description: 'Génération de cahiers des charges complets pour événements',
    placeholder: 'Décrivez votre projet d\'événement...',
    color: 'bg-blue-500'
  },
  'recherche-lieux': {
    name: 'Recherche de lieux',
    description: 'Recommandation de lieux événementiels adaptés',
    placeholder: 'Je cherche un lieu pour...',
    color: 'bg-green-500'
  },
  'recherche-animation': {
    name: 'Recherche d\'animations',
    description: 'Sélection d\'animations et activités événementielles',
    placeholder: 'Je souhaite des animations pour...',
    color: 'bg-purple-500'
  },
  'creation-concept': {
    name: 'Création de concept',
    description: 'Développement de concepts événementiels innovants',
    placeholder: 'Aidez-moi à créer un concept pour...',
    color: 'bg-pink-500'
  },
  'charte-graphique': {
    name: 'Charte graphique',
    description: 'Création d\'identités visuelles pour événements',
    placeholder: 'Je veux créer une charte graphique pour...',
    color: 'bg-indigo-500'
  },
  'impact-carbone': {
    name: 'Réduction impact carbone',
    description: 'Analyse et réduction de l\'empreinte carbone',
    placeholder: 'Comment réduire l\'impact carbone de...',
    color: 'bg-emerald-500'
  },
  'mesure-roi': {
    name: 'Mesure du ROI',
    description: 'Analyse du retour sur investissement',
    placeholder: 'Calculez le ROI de...',
    color: 'bg-amber-500'
  },
  'gestion-risques': {
    name: 'Gestion des risques',
    description: 'Identification et mitigation des risques',
    placeholder: 'Analysez les risques de...',
    color: 'bg-red-500'
  },
  'optimisation-budget': {
    name: 'Optimisation du budget',
    description: 'Optimisation et répartition budgétaire',
    placeholder: 'Optimisez le budget pour...',
    color: 'bg-cyan-500'
  }
}

export default function ModuleChat({ module, moduleName, moduleDescription }: ModuleChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const config = moduleConfig[module as keyof typeof moduleConfig] || {
    name: moduleName,
    description: moduleDescription,
    placeholder: 'Posez votre question...',
    color: 'bg-gray-500'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Message de bienvenue
    const welcomeMessage: Message = {
      id: '1',
      type: 'agent',
      content: `Bonjour ! Je suis l'agent spécialisé en ${config.name.toLowerCase()}. ${config.description}. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [module])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/modules/${module}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          context: {
            previousMessages: messages.slice(-5) // Derniers 5 messages pour contexte
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'agent')
      }

      const data = await response.json()
      
      // Extraire la vraie réponse de l'agent depuis la structure de l'orchestrateur
      let agentContent = 'Réponse reçue avec succès'
      
      if (data.response?.analysis) {
        agentContent = data.response.analysis
      } else if (data.response?.recommendations) {
        // Pour les agents qui retournent des recommandations
        agentContent = data.response.analysis || 'Recommandations générées avec succès'
      } else if (data.data?.analysis) {
        agentContent = data.data.analysis
      } else if (typeof data.response === 'string') {
        agentContent = data.response
      }
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentContent,
        timestamp: new Date(),
        data: data.response || data.data
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${config.color} text-white p-4 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link 
            href="/studio-evento.html" 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{config.name}</h1>
            <p className="text-white/90 text-sm">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'agent' && (
                <div className={`${config.color} p-2 rounded-full flex-shrink-0`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`${config.color} p-2 rounded-full flex-shrink-0`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border shadow-sm rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-gray-600">L'agent analyse votre demande...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`${config.color} text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

