'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PromptService } from '@/lib/services/promptService'
import { AgentPrompt } from '@/lib/supabase'

export default function AdminPrompts() {
  const [prompts, setPrompts] = useState<AgentPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<AgentPrompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLocalMode, setIsLocalMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification
    const adminEmail = localStorage.getItem('studio_evento_admin_email')
    if (adminEmail !== 'cherubindavid@gmail.com') {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadPrompts()
  }, [router])

  const loadPrompts = async () => {
    try {
      setIsLoading(true)
      
      // Charger tous les prompts
      const allPrompts = await PromptService.getAllPrompts()
      setPrompts(allPrompts)
      
      // Détecter si on est en mode local (prompts par défaut)
      const isLocal = allPrompts.length > 0 && allPrompts[0].updated_by === 'system'
      setIsLocalMode(isLocal)
      
      if (allPrompts.length > 0 && !selectedPrompt) {
        setSelectedPrompt(allPrompts[0])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prompts:', error)
      setMessage('Erreur lors du chargement des prompts')
      setIsLocalMode(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return

    try {
      setIsSaving(true)
      const success = await PromptService.updatePrompt(
        selectedPrompt.agent_name,
        {
          system_prompt: selectedPrompt.system_prompt,
          model: selectedPrompt.model,
          temperature: selectedPrompt.temperature,
          max_tokens: selectedPrompt.max_tokens,
          description: selectedPrompt.description
        },
        'cherubindavid@gmail.com'
      )

      if (success) {
        setMessage('✅ Prompt sauvegardé avec succès!')
        await loadPrompts() // Recharger pour avoir les données à jour
      } else {
        setMessage('❌ Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage('❌ Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('studio_evento_admin_email')
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration Studio Evento</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-500">Gestion des prompts des agents IA</p>
                {isLocalMode && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    <span>⚠️</span>
                    <span>Mode local - Base de données non configurée</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Retour au site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Liste des agents */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Agents</h3>
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => setSelectedPrompt(prompt)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedPrompt?.id === prompt.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-semibold">{prompt.agent_name}</div>
                        <div className="text-xs text-gray-500">{prompt.agent_type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Éditeur de prompt */}
            <div className="lg:col-span-3">
              {selectedPrompt ? (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedPrompt.agent_name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedPrompt.description}
                        </p>
                      </div>
                      <button
                        onClick={handleSavePrompt}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>

                    {message && (
                      <div className={`mb-4 p-3 rounded-md ${
                        message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {message}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Paramètres techniques */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Modèle
                          </label>
                          <input
                            type="text"
                            value={selectedPrompt.model}
                            onChange={(e) => setSelectedPrompt({
                              ...selectedPrompt,
                              model: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Température
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={selectedPrompt.temperature}
                            onChange={(e) => setSelectedPrompt({
                              ...selectedPrompt,
                              temperature: parseFloat(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            min="100"
                            max="8000"
                            step="100"
                            value={selectedPrompt.max_tokens}
                            onChange={(e) => setSelectedPrompt({
                              ...selectedPrompt,
                              max_tokens: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={selectedPrompt.description || ''}
                          onChange={(e) => setSelectedPrompt({
                            ...selectedPrompt,
                            description: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description de l'agent..."
                        />
                      </div>

                      {/* Prompt système */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prompt Système
                        </label>
                        <textarea
                          value={selectedPrompt.system_prompt}
                          onChange={(e) => setSelectedPrompt({
                            ...selectedPrompt,
                            system_prompt: e.target.value
                          })}
                          rows={20}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="Prompt système de l'agent..."
                        />
                      </div>

                      {/* Métadonnées */}
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Métadonnées</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Créé le:</span> {new Date(selectedPrompt.created_at).toLocaleString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Modifié le:</span> {new Date(selectedPrompt.updated_at).toLocaleString('fr-FR')}
                          </div>
                          <div>
                            <span className="font-medium">Modifié par:</span> {selectedPrompt.updated_by}
                          </div>
                          <div>
                            <span className="font-medium">Statut:</span> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              selectedPrompt.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedPrompt.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                    Sélectionnez un agent pour modifier son prompt
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

