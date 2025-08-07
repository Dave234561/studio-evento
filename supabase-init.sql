-- Script d'initialisation des tables Supabase pour Studio Evento Admin

-- Table pour stocker les prompts des agents
CREATE TABLE IF NOT EXISTS agent_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name VARCHAR(50) UNIQUE NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 2000,
  system_prompt TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100) NOT NULL
);

-- Table pour les utilisateurs admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_agent_prompts_name ON agent_prompts(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_active ON agent_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des prompts actifs (public)
CREATE POLICY IF NOT EXISTS "Allow read active prompts" ON agent_prompts
  FOR SELECT USING (is_active = true);

-- Politique pour permettre toutes les opérations aux admins
CREATE POLICY IF NOT EXISTS "Allow all for admins" ON agent_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email' 
      AND is_admin = true
    )
  );

-- Politique pour les utilisateurs admin
CREATE POLICY IF NOT EXISTS "Allow admin users read" ON admin_users
  FOR SELECT USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Insérer l'utilisateur admin principal
INSERT INTO admin_users (email, is_admin) 
VALUES ('cherubindavid@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER IF NOT EXISTS update_agent_prompts_updated_at 
  BEFORE UPDATE ON agent_prompts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE agent_prompts IS 'Stockage des prompts système pour les agents Studio Evento';
COMMENT ON TABLE admin_users IS 'Utilisateurs autorisés à administrer les prompts';
COMMENT ON COLUMN agent_prompts.agent_name IS 'Nom unique de l''agent (ex: ORCHESTRATEUR, CONCEPT)';
COMMENT ON COLUMN agent_prompts.agent_type IS 'Type d''agent pour le routage (ex: orchestrator, concept)';
COMMENT ON COLUMN agent_prompts.model IS 'Modèle IA utilisé (ex: claude-3-5-sonnet-20241022)';
COMMENT ON COLUMN agent_prompts.temperature IS 'Température pour la génération (0.0 à 1.0)';
COMMENT ON COLUMN agent_prompts.system_prompt IS 'Prompt système complet de l''agent';

