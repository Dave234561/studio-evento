-- Ajouter les champs Firebase Auth à la table users existante
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS free_module_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'module', 'premium')),
ADD COLUMN IF NOT EXISTS module_access TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Commentaires pour documentation
COMMENT ON COLUMN users.firebase_uid IS 'UID Firebase de l''utilisateur';
COMMENT ON COLUMN users.display_name IS 'Nom d''affichage de l''utilisateur';
COMMENT ON COLUMN users.photo_url IS 'URL de la photo de profil';
COMMENT ON COLUMN users.free_module_used IS 'ID du module gratuit déjà utilisé';
COMMENT ON COLUMN users.subscription_plan IS 'Plan de souscription : free, module, ou premium';
COMMENT ON COLUMN users.module_access IS 'Liste des modules auxquels l''utilisateur a accès';
COMMENT ON COLUMN users.is_admin IS 'Indique si l''utilisateur est administrateur';

-- Mettre à jour l'utilisateur admin s'il existe déjà
UPDATE users 
SET is_admin = true, 
    subscription_plan = 'premium',
    module_access = ARRAY['all']
WHERE email = 'cherubindavid@gmail.com';