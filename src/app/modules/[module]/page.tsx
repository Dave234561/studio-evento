import { notFound } from 'next/navigation'
import ModuleChat from '@/components/ModuleChat'

interface ModulePageProps {
  params: {
    module: string
  }
}

const validModules = [
  'synthese-brief',
  'recherche-lieux',
  'recherche-animations',
  'conception-creative',
  'design-evenement',
  'empreinte-carbone',
  'analyse-roi',
  'gestion-risques',
  'gestion-budget'
]

const moduleInfo = {
  'synthese-brief': {
    name: 'Synthèse et brief',
    description: 'Génération de briefs événementiels complets et structurés'
  },
  'recherche-lieux': {
    name: 'Recherche de lieux',
    description: 'Recommandation de lieux événementiels adaptés'
  },
  'recherche-animations': {
    name: 'Recherche d\'animations',
    description: 'Sélection d\'animations et activités événementielles'
  },
  'conception-creative': {
    name: 'Conception créative',
    description: 'Développement de concepts événementiels innovants'
  },
  'design-evenement': {
    name: 'Design d\'événement',
    description: 'Création d\'identités visuelles pour événements'
  },
  'empreinte-carbone': {
    name: 'Empreinte carbone',
    description: 'Analyse et réduction de l\'impact environnemental'
  },
  'analyse-roi': {
    name: 'Analyse ROI',
    description: 'Mesure du retour sur investissement'
  },
  'gestion-risques': {
    name: 'Gestion des risques',
    description: 'Identification et mitigation des risques'
  },
  'gestion-budget': {
    name: 'Gestion du budget',
    description: 'Optimisation et répartition budgétaire'
  }
}

export default function ModulePage({ params }: ModulePageProps) {
  const { module } = params

  // Vérifier que le module existe
  if (!validModules.includes(module)) {
    notFound()
  }

  const info = moduleInfo[module as keyof typeof moduleInfo]

  return (
    <ModuleChat
      module={module}
      moduleName={info.name}
      moduleDescription={info.description}
    />
  )
}

export function generateStaticParams() {
  return validModules.map((module) => ({
    module,
  }))
}

export function generateMetadata({ params }: ModulePageProps) {
  const { module } = params
  
  if (!validModules.includes(module)) {
    return {
      title: 'Module non trouvé - Studio Evento'
    }
  }

  const info = moduleInfo[module as keyof typeof moduleInfo]
  
  return {
    title: `${info.name} - Studio Evento`,
    description: info.description
  }
}

