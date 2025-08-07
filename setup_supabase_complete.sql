-- SCRIPT COMPLET DE CONFIGURATION SUPABASE - Studio Evento
-- Ce script crée TOUTES les tables nécessaires depuis zéro
-- À exécuter dans Supabase SQL Editor

-- ========================================
-- ÉTAPE 1: TABLES DE BASE (EventAI Pro)
-- ========================================

-- Table des types d'événements
CREATE TABLE IF NOT EXISTS event_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les types d'événements
INSERT INTO event_types (id, name, description, category) VALUES
('seminar', 'Séminaire', 'Séminaire d''entreprise', 'corporate'),
('conference', 'Conférence', 'Conférence professionnelle', 'corporate'),
('workshop', 'Atelier', 'Atelier de formation', 'education'),
('launch', 'Lancement', 'Lancement de produit', 'marketing'),
('team-building', 'Team Building', 'Événement de cohésion d''équipe', 'corporate'),
('gala', 'Gala', 'Événement de prestige', 'social'),
('trade-show', 'Salon', 'Salon professionnel', 'marketing'),
('meeting', 'Réunion', 'Réunion d''entreprise', 'corporate')
ON CONFLICT (id) DO NOTHING;

-- Table d'analytics pour le monitoring
CREATE TABLE IF NOT EXISTS usage_analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL,
    agent_type TEXT,
    model_used TEXT,
    tokens_consumed INTEGER,
    response_time INTEGER,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- ========================================
-- ÉTAPE 2: TABLES DE DONNÉES MÉTIER
-- ========================================

-- Table des lieux (venues principales)
CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    capacity INTEGER,
    type TEXT,
    amenities TEXT[],
    coordinates POINT,
    rating DECIMAL(3,2),
    price_range TEXT,
    sustainability_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer quelques venues de démonstration
INSERT INTO venues (id, name, city, address, capacity, type, amenities, rating, price_range, sustainability_score) VALUES
('paris-palais-congres', 'Palais des Congrès', 'Paris', 'Place de la Porte Maillot', 3000, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'parking'], 4.2, 'premium', 75),
('lyon-confluence', 'Centre de Congrès Lyon', 'Lyon', 'Quai Charles de Gaulle', 2500, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'accessibility'], 4.5, 'premium', 85),
('marseille-villa-mediterranee', 'Villa Méditerranée', 'Marseille', 'Esplanade du J4', 800, 'cultural_venue', ARRAY['wifi', 'catering', 'sea_view', 'modern_architecture'], 4.3, 'high', 80),
('toulouse-zenith', 'Zénith Toulouse', 'Toulouse', 'Allées Paul Feuga', 5000, 'concert_hall', ARRAY['wifi', 'av_equipment', 'parking', 'accessibility'], 4.0, 'medium', 65),
('nice-acropolis', 'Acropolis Nice', 'Nice', 'Esplanade Kennedy', 2000, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'sea_view'], 4.4, 'premium', 78)
ON CONFLICT (id) DO NOTHING;

-- Table des lieux étendus (ABC Salles)
CREATE TABLE IF NOT EXISTS venues_abc (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    capacite VARCHAR(50),
    localite VARCHAR(255),
    code_postal VARCHAR(10),
    departement VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des animations
CREATE TABLE IF NOT EXISTS animations (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type_animation VARCHAR(100),
    description TEXT,
    capacite VARCHAR(50),
    duree VARCHAR(50),
    prix VARCHAR(100),
    contact VARCHAR(255),
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des facteurs carbone (ADEME)
CREATE TABLE IF NOT EXISTS carbon_factors (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    subcategory TEXT,
    unit TEXT NOT NULL,
    factor DECIMAL(10,6) NOT NULL,
    source TEXT,
    year INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les facteurs carbone ADEME
INSERT INTO carbon_factors (id, category, subcategory, unit, factor, source, year) VALUES
('transport_train', 'transport', 'train', 'kg_co2_per_km', 0.0146, 'ADEME', 2024),
('transport_car', 'transport', 'voiture', 'kg_co2_per_km', 0.193, 'ADEME', 2024),
('transport_plane_domestic', 'transport', 'avion_domestique', 'kg_co2_per_km', 0.255, 'ADEME', 2024),
('transport_plane_international', 'transport', 'avion_international', 'kg_co2_per_km', 0.150, 'ADEME', 2024),
('catering_meat', 'catering', 'repas_viande', 'kg_co2_per_meal', 5.5, 'ADEME', 2024),
('catering_vegetarian', 'catering', 'repas_vegetarien', 'kg_co2_per_meal', 0.9, 'ADEME', 2024),
('catering_vegan', 'catering', 'repas_vegan', 'kg_co2_per_meal', 0.7, 'ADEME', 2024),
('hotel_night', 'accommodation', 'hotel', 'kg_co2_per_night', 29.0, 'ADEME', 2024),
('paper_a4', 'materials', 'papier_a4', 'kg_co2_per_sheet', 0.0046, 'ADEME', 2024),
('digital_display', 'materials', 'ecran_digital', 'kg_co2_per_hour', 0.0157, 'ADEME', 2024)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- ÉTAPE 3: TABLES DE CONTEXTE (PERSISTANCE)
-- ========================================

-- Table centrale des contextes de projet
CREATE TABLE IF NOT EXISTS project_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    project_name TEXT,
    event_type TEXT,
    participants INTEGER,
    budget DECIMAL(12,2),
    location TEXT,
    event_date DATE,
    duration TEXT,
    requirements TEXT[],
    preferences JSONB DEFAULT '{}',
    constraints JSONB DEFAULT '{}',
    global_objectives TEXT[] DEFAULT '{}',
    current_phase TEXT,
    completed_modules TEXT[] DEFAULT '{}',
    next_recommended_modules TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des interactions utilisateur-agent
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    module TEXT NOT NULL,
    user_message TEXT NOT NULL,
    agent_response JSONB NOT NULL,
    context JSONB DEFAULT '{}',
    processing_time INTEGER,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des décisions des agents
CREATE TABLE IF NOT EXISTS agent_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    module TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    decision_data JSONB NOT NULL,
    reasoning TEXT,
    confidence_score DECIMAL(4,3),
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des recommandations entre modules
CREATE TABLE IF NOT EXISTS module_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    source_module TEXT NOT NULL,
    target_module TEXT NOT NULL,
    recommendation_type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reason TEXT,
    context_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des analyses de cohérence
CREATE TABLE IF NOT EXISTS coherence_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    coherence_score DECIMAL(5,2) NOT NULL CHECK (coherence_score >= 0 AND coherence_score <= 100),
    conflicts TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    missing_elements TEXT[] DEFAULT '{}',
    analysis_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des contraintes globales
CREATE TABLE IF NOT EXISTS global_constraints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    constraint_type TEXT NOT NULL,
    constraint_value TEXT NOT NULL,
    description TEXT,
    source_module TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- ÉTAPE 4: INDEX POUR LES PERFORMANCES
-- ========================================

-- Index pour les tables de base
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);

CREATE INDEX IF NOT EXISTS idx_venues_abc_localite ON venues_abc(localite);
CREATE INDEX IF NOT EXISTS idx_venues_abc_departement ON venues_abc(departement);

CREATE INDEX IF NOT EXISTS idx_animations_type ON animations(type_animation);

-- Index pour les tables de contexte
CREATE INDEX IF NOT EXISTS idx_project_contexts_session_id ON project_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_project_contexts_user_id ON project_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_project_contexts_event_type ON project_contexts(event_type);

CREATE INDEX IF NOT EXISTS idx_agent_interactions_session_id ON agent_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_module ON agent_interactions(module);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_created_at ON agent_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_session_id ON agent_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_module ON agent_decisions(module);

CREATE INDEX IF NOT EXISTS idx_module_recommendations_session_id ON module_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_module_recommendations_target_module ON module_recommendations(target_module);

CREATE INDEX IF NOT EXISTS idx_coherence_analysis_session_id ON coherence_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_global_constraints_session_id ON global_constraints(session_id);

-- ========================================
-- ÉTAPE 5: DONNÉES DE TEST
-- ========================================

-- Insérer une session de test pour vérifier le fonctionnement
INSERT INTO project_contexts (
    session_id, 
    project_name, 
    event_type, 
    participants, 
    budget, 
    location,
    global_objectives,
    completed_modules
) VALUES (
    'test_setup_' || extract(epoch from now())::text,
    'Test Configuration Supabase',
    'séminaire',
    50,
    15000.00,
    'Paris',
    ARRAY['Test de la persistance', 'Validation de la configuration'],
    ARRAY[]::TEXT[]
) ON CONFLICT (session_id) DO NOTHING;

-- Insérer quelques venues ABC de test
INSERT INTO venues_abc (nom, capacite, localite, code_postal, departement) VALUES
('Le 220', '50 pers', 'Paris 15ème', '75015', 'Paris'),
('Espace des Bateliers', '50 pers', 'Strasbourg', '67000', 'Bas-Rhin'),
('MK2 Bibliothèque', '250 pers', 'Paris 13ème', '75013', 'Paris')
ON CONFLICT DO NOTHING;

-- Insérer quelques animations de test
INSERT INTO animations (nom, type_animation, description, capacite, duree, prix) VALUES
('Team Building Escape Game', 'Team Building', 'Escape game collaboratif', '8-12 pers', '2h', '45€/pers'),
('Atelier Cuisine', 'Gastronomie', 'Cours de cuisine en équipe', '10-20 pers', '3h', '85€/pers'),
('Conférence Innovation', 'Conférence', 'Conférence sur l''innovation', '50-200 pers', '1h30', '2500€')
ON CONFLICT DO NOTHING;

-- ========================================
-- ÉTAPE 6: VÉRIFICATION FINALE
-- ========================================

-- Compter les tables créées
DO $$
DECLARE
    table_count INTEGER;
    context_table_count INTEGER;
    test_session_id TEXT;
BEGIN
    -- Compter toutes les tables principales
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN (
        'event_types', 'usage_analytics', 'venues', 'venues_abc', 
        'animations', 'carbon_factors'
    );
    
    -- Compter les tables de contexte
    SELECT COUNT(*) INTO context_table_count
    FROM information_schema.tables 
    WHERE table_name IN (
        'project_contexts', 'agent_interactions', 'agent_decisions',
        'module_recommendations', 'coherence_analysis', 'global_constraints'
    );
    
    RAISE NOTICE '✅ Tables de base créées: %/6', table_count;
    RAISE NOTICE '✅ Tables de contexte créées: %/6', context_table_count;
    
    -- Vérifier les données de test
    SELECT session_id INTO test_session_id
    FROM project_contexts 
    WHERE project_name = 'Test Configuration Supabase'
    LIMIT 1;
    
    IF test_session_id IS NOT NULL THEN
        RAISE NOTICE '✅ Session de test créée: %', test_session_id;
    END IF;
    
    -- Vérifier les venues
    SELECT COUNT(*) INTO table_count FROM venues;
    RAISE NOTICE '✅ Venues principales: % lignes', table_count;
    
    SELECT COUNT(*) INTO table_count FROM venues_abc;
    RAISE NOTICE '✅ Venues ABC: % lignes', table_count;
    
    SELECT COUNT(*) INTO table_count FROM animations;
    RAISE NOTICE '✅ Animations: % lignes', table_count;
    
    SELECT COUNT(*) INTO table_count FROM carbon_factors;
    RAISE NOTICE '✅ Facteurs carbone: % lignes', table_count;
    
    RAISE NOTICE '🎉 CONFIGURATION SUPABASE TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE '📋 Prochaines étapes:';
    RAISE NOTICE '   1. Vérifier les tables dans Table Editor';
    RAISE NOTICE '   2. Tester l''application Studio Evento';
    RAISE NOTICE '   3. Vérifier que les interactions sont sauvegardées';
END $$;

