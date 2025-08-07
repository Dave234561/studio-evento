/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les chemins d'importation
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configuration pour les pages statiques
  trailingSlash: true,
  
  // Configuration pour les assets statiques
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configuration pour la génération statique
  // output: 'standalone', // Désactivé temporairement pour Vercel
  
  // Rewrites désactivés temporairement pour debug build Vercel
  // async rewrites() {
  //   return [
  //     {
  //       source: '/studio-evento.html',
  //       destination: '/api/studio-evento',
  //     },
  //   ]
  // },
  
  // Headers pour la sécurité et le CORS
  async headers() {
    return [
      {
        source: '/api/studio-evento',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuration pour Vercel
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
}

module.exports = nextConfig

