'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudioEvento() {
  const router = useRouter()
  
  useEffect(() => {
    // Rediriger vers le fichier HTML statique
    window.location.href = '/studio-evento.html'
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>🎬 Studio Evento</h2>
        <p>Redirection en cours...</p>
      </div>
    </div>
  )
}

