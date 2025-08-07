-- EventAI Pro Database Initialization Script
-- This script sets up the initial database configuration

-- Create vector extension for semantic search (if available)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create full text search configuration for French
-- CREATE TEXT SEARCH CONFIGURATION fr (COPY = french);

-- Create indexes for better performance
-- These will be created automatically by Prisma migrations

-- Insert demo data for development
INSERT INTO "users" ("id", "email", "name", "createdAt", "updatedAt") VALUES
('demo-user-123', 'demo@eventai.pro', 'Utilisateur Demo', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Insert sample project types
-- This could be extended with more event types
CREATE TABLE IF NOT EXISTS "event_types" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "event_types" ("id", "name", "description", "category") VALUES
('seminar', 'Séminaire', 'Séminaire d\'entreprise', 'corporate'),
('conference', 'Conférence', 'Conférence professionnelle', 'corporate'),
('workshop', 'Atelier', 'Atelier de formation', 'education'),
('launch', 'Lancement', 'Lancement de produit', 'marketing'),
('team-building', 'Team Building', 'Événement de cohésion d\'équipe', 'corporate'),
('gala', 'Gala', 'Événement de prestige', 'social'),
('trade-show', 'Salon', 'Salon professionnel', 'marketing'),
('meeting', 'Réunion', 'Réunion d\'entreprise', 'corporate')
ON CONFLICT ("id") DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
-- (These would be handled by Prisma in production)

-- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON "conversations"("userId");
-- CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON "messages"("conversationId");
-- CREATE INDEX IF NOT EXISTS idx_projects_user_id ON "projects"("userId");
-- CREATE INDEX IF NOT EXISTS idx_cache_key ON "cache"("key");
-- CREATE INDEX IF NOT EXISTS idx_cache_agent_type ON "cache"("agentType");

-- Analytics table for better insights
CREATE TABLE IF NOT EXISTS "usage_analytics" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "agent_type" TEXT,
    "model_used" TEXT,
    "tokens_consumed" INTEGER,
    "response_time" INTEGER,
    "success" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "metadata" JSONB
);

-- Create index for analytics
-- CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON "usage_analytics"("user_id");
-- CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON "usage_analytics"("event_type");
-- CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON "usage_analytics"("created_at");

-- Sample venues data (French locations)
CREATE TABLE IF NOT EXISTS "venues" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "capacity" INTEGER,
    "type" TEXT,
    "amenities" TEXT[],
    "coordinates" POINT,
    "rating" DECIMAL(3,2),
    "price_range" TEXT,
    "sustainability_score" INTEGER,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Insert sample venues
INSERT INTO "venues" ("id", "name", "city", "address", "capacity", "type", "amenities", "rating", "price_range", "sustainability_score") VALUES
('paris-palais-congres', 'Palais des Congrès', 'Paris', 'Place de la Porte Maillot', 3000, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'parking'], 4.2, 'premium', 75),
('lyon-confluence', 'Centre de Congrès Lyon', 'Lyon', 'Quai Charles de Gaulle', 2500, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'accessibility'], 4.5, 'premium', 85),
('marseille-villa-mediterranee', 'Villa Méditerranée', 'Marseille', 'Esplanade du J4', 800, 'cultural_venue', ARRAY['wifi', 'catering', 'sea_view', 'modern_architecture'], 4.3, 'high', 80),
('toulouse-zenith', 'Zénith Toulouse', 'Toulouse', 'Allées Paul Feuga', 5000, 'concert_hall', ARRAY['wifi', 'av_equipment', 'parking', 'accessibility'], 4.0, 'medium', 65),
('nice-acropolis', 'Acropolis Nice', 'Nice', 'Esplanade Kennedy', 2000, 'convention_center', ARRAY['wifi', 'catering', 'av_equipment', 'sea_view'], 4.4, 'premium', 78)
ON CONFLICT ("id") DO NOTHING;

-- RSE factors table for carbon footprint calculations
CREATE TABLE IF NOT EXISTS "carbon_factors" (
    "id" TEXT PRIMARY KEY,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "unit" TEXT NOT NULL,
    "factor" DECIMAL(10,6) NOT NULL,
    "source" TEXT,
    "year" INTEGER,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Insert ADEME carbon factors (simplified)
INSERT INTO "carbon_factors" ("id", "category", "subcategory", "unit", "factor", "source", "year") VALUES
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
ON CONFLICT ("id") DO NOTHING;

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eventai;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eventai;

-- Create views for analytics
CREATE OR REPLACE VIEW "conversation_stats" AS
SELECT 
    u."name" as user_name,
    u."email" as user_email,
    COUNT(c."id") as total_conversations,
    COUNT(DISTINCT DATE(c."createdAt")) as active_days,
    AVG(msg_count.message_count) as avg_messages_per_conversation,
    MAX(c."createdAt") as last_conversation
FROM "users" u
LEFT JOIN "conversations" c ON u."id" = c."userId"
LEFT JOIN (
    SELECT 
        m."conversationId",
        COUNT(*) as message_count
    FROM "messages" m
    GROUP BY m."conversationId"
) msg_count ON c."id" = msg_count."conversationId"
GROUP BY u."id", u."name", u."email";

-- Create materialized view for performance metrics
-- CREATE MATERIALIZED VIEW IF NOT EXISTS "agent_performance" AS
-- SELECT 
--     m."agentType",
--     m."model",
--     COUNT(*) as total_calls,
--     AVG(m."latency") as avg_latency,
--     AVG(m."tokens") as avg_tokens,
--     DATE(m."createdAt") as date
-- FROM "messages" m
-- WHERE m."agentType" IS NOT NULL
-- GROUP BY m."agentType", m."model", DATE(m."createdAt");

-- Create function to refresh materialized view
-- CREATE OR REPLACE FUNCTION refresh_agent_performance()
-- RETURNS void AS $$
-- BEGIN
--     REFRESH MATERIALIZED VIEW "agent_performance";
-- END;
-- $$ LANGUAGE plpgsql;

-- Schedule refresh (would need pg_cron extension)
-- SELECT cron.schedule('refresh-agent-performance', '0 */6 * * *', 'SELECT refresh_agent_performance()');

COMMIT;