'use client'

import { useState } from 'react'
import { MessageCircle, Sparkles, Leaf, MapPin, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const agents = [
    {
      name: 'Orchestrateur',
      description: 'Coordination intelligente de tous les agents',
      icon: <Users className="w-6 h-6" />,
      model: 'Claude Sonnet 4',
      color: 'bg-blue-500'
    },
    {
      name: 'Storytelling',
      description: 'Création de concepts événementiels innovants',
      icon: <Sparkles className="w-6 h-6" />,
      model: 'Claude Opus 4',
      color: 'bg-purple-500'
    },
    {
      name: 'RSE',
      description: 'Analyse d\'impact environnemental et recommandations',
      icon: <Leaf className="w-6 h-6" />,
      model: 'Claude Opus 4',
      color: 'bg-green-500'
    },
    {
      name: 'Lieu',
      description: 'Recherche et recommandations de lieux événementiels',
      icon: <MapPin className="w-6 h-6" />,
      model: 'Claude Sonnet 4',
      color: 'bg-red-500'
    },
    {
      name: 'Brief Generator',
      description: 'Génération automatique de briefs techniques',
      icon: <FileText className="w-6 h-6" />,
      model: 'Claude Sonnet 4',
      color: 'bg-yellow-500'
    }
  ]

  const handleStartChat = () => {
    setIsLoading(true)
    // Redirection vers l'interface de chat
    window.location.href = '/chat'
  }

  return (
    <div className="min-h-screen">
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
                <p className="text-sm text-gray-500">Intelligence Événementielle</p>
              </div>
            </div>
            <Button onClick={handleStartChat} disabled={isLoading}>
              {isLoading ? 'Initialisation...' : 'Commencer'}
              <MessageCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              L'Intelligence Artificielle au Service de vos 
              <span className="gradient-primary bg-clip-text text-transparent"> Événements</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Architecture multi-agents custom avec Claude Sonnet 4 et Opus 4. 
              Storytelling créatif, analyse RSE approfondie et coordination intelligente 
              pour des événements d'exception.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Claude Sonnet 4
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Claude Opus 4
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Multi-Agents
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Architecture Custom
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartChat}
                disabled={isLoading}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Initialisation...' : 'Démarrer votre Projet'}
                <MessageCircle className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/studio-evento'}
                variant="outline"
                className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                🎬 Studio Evento MVP
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Écosystème Multi-Agents
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cinq agents spécialisés travaillent en synergie pour créer des événements d'exception
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      {agent.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {agent.model}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {agent.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Créativité Opus 4</h4>
              <p className="text-gray-600">
                Concepts innovants et storytelling créatif avec la puissance de Claude Opus 4
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Analyse RSE</h4>
              <p className="text-gray-600">
                Évaluation complète de l'impact environnemental et recommandations durables
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Coordination Intelligente</h4>
              <p className="text-gray-600">
                Orchestration seamless entre tous les agents pour une expérience fluide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">EventAI Pro</span>
          </div>
          <p className="text-gray-400 mb-4">
            Architecture Custom Multi-Agents • Claude Sonnet 4 + Opus 4
          </p>
          <p className="text-sm text-gray-500">
            © 2025 Manus AI • Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  )
}