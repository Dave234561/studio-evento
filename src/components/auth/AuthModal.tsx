'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedModule?: {
    id: string
    icon: string
    challenge: string
    description: string
  }
}

export function AuthModal({ isOpen, onClose, onSuccess, selectedModule }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {mode === 'login' ? 'Connexion' : 'Créer votre compte gratuit'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {selectedModule && (
            <div className="mt-3 flex items-center gap-2 text-sm text-purple-100">
              <span className="text-2xl">{selectedModule.icon}</span>
              <span>Pour tester : {selectedModule.challenge}</span>
            </div>
          )}
        </div>

        {/* Benefits for register mode */}
        {mode === 'register' && (
          <div className="px-6 py-4 bg-purple-50 border-b">
            <div className="flex items-center gap-3 text-sm text-purple-700">
              <span className="text-green-500">✓</span>
              <span>Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-700 mt-2">
              <span className="text-green-500">✓</span>
              <span>Accès immédiat après inscription</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-700 mt-2">
              <span className="text-green-500">✓</span>
              <span>1 module gratuit au choix</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          {mode === 'login' ? (
            <LoginForm onSuccess={onSuccess} />
          ) : (
            <RegisterForm onSuccess={onSuccess} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Inscrivez-vous gratuitement
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}