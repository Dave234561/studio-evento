'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { LogOut, User, CreditCard, Settings } from 'lucide-react'

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.[0].toUpperCase() || 'U'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {getInitials()}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {profile?.display_name || user.email}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {profile?.display_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              {profile?.subscription_plan && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profile.subscription_plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    profile.subscription_plan === 'module' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {profile.subscription_plan === 'premium' ? 'Premium' :
                     profile.subscription_plan === 'module' ? 'Module unique' :
                     'Gratuit'}
                  </span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to account page
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <User className="w-4 h-4" />
                Mon compte
              </button>

              {profile?.subscription_plan === 'free' && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to pricing page
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <CreditCard className="w-4 h-4" />
                  Passer au Premium
                </button>
              )}

              {profile?.is_admin && (
                <a
                  href="/admin"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Administration
                </a>
              )}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 py-1">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}