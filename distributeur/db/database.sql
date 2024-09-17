-- Connectez-vous à la base de données
\connect db_distributeur

-- Créez la table "doctor" avec une séquence (pour l'auto-incrément)
CREATE TABLE IF NOT EXISTS "doctor" (
    id SERIAL PRIMARY KEY,
    doctor_name VARCHAR(255) NOT NULL,
);
