'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'

function TestAuthContent() {
  const { user, loading, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState({
    id: 'test',
    icon: '🧪',
    challenge: 'Test de l\'authentification',
    description: 'Module de test'
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Test de l'authentification Firebase</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">État de l'authentification</h2>
            {user ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">✅ Utilisateur connecté</p>
                <p className="text-sm text-gray-600 mt-2">Email : {user.email}</p>
                <p className="text-sm text-gray-600">UID : {user.uid}</p>
                <button
                  onClick={signOut}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700">⚠️ Non connecté</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test du modal</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ouvrir le modal d'authentification
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Menu utilisateur</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <UserMenu />
            </div>
          </div>

          <AuthModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false)
              alert('Authentification réussie !')
            }}
            selectedModule={selectedModule}
          />
        </div>
      </div>
    </div>
  )
}

export default function TestAuthPage() {
  return (
    <AuthProvider>
      <TestAuthContent />
    </AuthProvider>
  )
}