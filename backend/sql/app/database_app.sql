-- Création de la DB centralisée pour l'application
CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- Table utilisateurs (fusion users + profile)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    mot_de_passe VARCHAR(255) NULL,
    date_naissance DATE,
    poids FLOAT,
    taille FLOAT,
    groupe_sanguin VARCHAR(10),
    telephone VARCHAR(20),
    numero_securite_sociale VARCHAR(20),
    adresse TEXT,
    contact_urgence_nom VARCHAR(150),
    contact_urgence_tel VARCHAR(20),
    role ENUM('admin', 'user', 'professional') DEFAULT 'user',
    profile_type ENUM('parent','enfant','epoux','autre','moi') DEFAULT 'moi',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) NULL,
    reset_token_expiration DATETIME NULL
);

-- Table relations entre profiles
CREATE TABLE IF NOT EXISTS profile_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_profile_id INT NOT NULL,
    sub_profile_id INT NOT NULL,
    FOREIGN KEY (main_profile_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_profile_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    UNIQUE (main_profile_id, sub_profile_id)
);

-- Maladies
CREATE TABLE IF NOT EXISTS maladies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom VARCHAR(150),
    description TEXT,
    symptomes TEXT,
    date_debut DATE,
    examens TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Traitements
CREATE TABLE IF NOT EXISTS traitements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maladie_id INT,
    nom VARCHAR(150),
    debut DATE,
    fin DATE,
    dosage VARCHAR(100),
    duree VARCHAR(100),
    effets_secondaires TEXT,
    FOREIGN KEY (maladie_id) REFERENCES maladies(id) ON DELETE CASCADE
);

-- Hospitalisations
CREATE TABLE IF NOT EXISTS hospitalisations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    type VARCHAR(100),
    description TEXT,
    dates VARCHAR(100),
    service VARCHAR(100),
    hopital VARCHAR(150),
    medecin VARCHAR(150),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Allergies
CREATE TABLE IF NOT EXISTS allergies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    nom VARCHAR(150),
    debut DATE,
    medicaments TEXT,
    gravite VARCHAR(50),
    symptomes TEXT,
    commentaires TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Antécédents
CREATE TABLE IF NOT EXISTS antecedents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    maladie VARCHAR(150),
    membre VARCHAR(100),
    severite VARCHAR(50),
    traitement TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Médecins
CREATE TABLE IF NOT EXISTS medecins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    nom VARCHAR(150),
    specialite VARCHAR(150),
    hopital VARCHAR(150),
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Ordonnances
CREATE TABLE IF NOT EXISTS ordonnances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    fichier VARCHAR(255),
    medecin_nom VARCHAR(255),
    date_prescription DATE,
    date_expiration DATE,
    medicaments JSON,
    statut ENUM('active', 'expiree', 'utilisee') DEFAULT 'active',
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Documents (uploaded files metadata)
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    title VARCHAR(255),
    filename VARCHAR(255),
    size INT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'processing',
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alarmes
CREATE TABLE IF NOT EXISTS alarmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    time VARCHAR(10) NOT NULL,
    days JSON NOT NULL,
    sound VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    dosage VARCHAR(100) NOT NULL,
    next_alarm DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- prescription reminders
CREATE TABLE IF NOT EXISTS prescription_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    ordonnance_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    sound VARCHAR(100) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (ordonnance_id) REFERENCES ordonnances(id) ON DELETE CASCADE
);

-- Distributeurs
CREATE TABLE IF NOT EXISTS distributeurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150),
    latitude FLOAT,
    longitude FLOAT,
    adresse TEXT
);

-- Commandes Click & Collect
CREATE TABLE IF NOT EXISTS commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    ordonnance_id INT NOT NULL,
    statut ENUM('en_attente', 'valide', 'refuse', 'retire') DEFAULT 'en_attente',
    raison_refus TEXT NULL,
    contenu_qr TEXT NULL,
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (ordonnance_id) REFERENCES ordonnances(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_id (utilisateur_id),
    INDEX idx_ordonnance_id (ordonnance_id),
    INDEX idx_statut (statut)
);

CREATE TABLE IF NOT EXISTS ordonnance_images_temp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    ordonnance_id INT NULL,
    filename VARCHAR(255),
    image_data LONGBLOB,
    mime_type VARCHAR(100) DEFAULT 'image/png',
    date_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_user_upload (utilisateur_id),
    INDEX idx_ordonnance (ordonnance_id)
);

-- Discussion / Tickets
CREATE TABLE IF NOT EXISTS discussion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    sujet VARCHAR(255),
    statut ENUM('ouvert','en_cours','ferme'),
    professionnel_id  INT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_fermeture DATETIME,
    destinataire ENUM('pharmacien','medecin','all') DEFAULT 'all',
    region VARCHAR(255),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (professionnel_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discussion_id INT,
    auteur_id INT,
    auteur_name VARCHAR(255),
    message TEXT,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussion(id) ON DELETE CASCADE
);

-- Table QR Codes pour ordonnances
CREATE TABLE IF NOT EXISTS qrcodes_ordonnances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    ordonnance_id INT NOT NULL,
    code_unique VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (ordonnance_id) REFERENCES ordonnances(id) ON DELETE CASCADE
);

-- QR codes pour maps
CREATE TABLE IF NOT EXISTS qrcodes_maps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_unique VARCHAR(255) UNIQUE NOT NULL,
    data TEXT
);

-- QR codes pour profiles
CREATE TABLE IF NOT EXISTS qrcodes_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    code_unique VARCHAR(255) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table de suivi des patients par les professionnels
CREATE TABLE IF NOT EXISTS patients_suivis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professionnel_id INT NOT NULL,
    patient_id INT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (professionnel_id, patient_id),
    FOREIGN KEY (professionnel_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Index supplémentaires pour la recherche rapide
CREATE INDEX idx_utilisateur_tel ON utilisateurs(telephone);
CREATE INDEX idx_utilisateur_secu ON utilisateurs(numero_securite_sociale);
CREATE INDEX idx_alarmes_utilisateur ON alarmes(utilisateur_id);
CREATE INDEX idx_alarmes_active ON alarmes(is_active);
CREATE INDEX idx_prescription_reminders_utilisateur ON prescription_reminders(utilisateur_id);
CREATE INDEX idx_prescription_reminders_ordonnance ON prescription_reminders(ordonnance_id);
CREATE INDEX idx_prescription_reminders_due_date ON prescription_reminders(due_date);
CREATE INDEX idx_prescription_reminders_completed ON prescription_reminders(is_completed);
CREATE INDEX idx_documents_utilisateur ON documents(utilisateur_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create event to automatically generate prescription reminders 30 days before expiration
CREATE EVENT IF NOT EXISTS auto_create_prescription_reminders
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    INSERT IGNORE INTO prescription_reminders (
        id,
        utilisateur_id,
        ordonnance_id,
        name,
        due_date,
        sound,
        is_completed,
        priority,
        notes,
        reminder_type
    )
    SELECT
        CONCAT('auto_', o.id),
        o.utilisateur_id,
        o.id,
        CONCAT('Renouvellement: ', COALESCE(o.description, 'Ordonnance')),
        DATE_SUB(o.date_expiration, INTERVAL 30 DAY),
        'Son 1',
        FALSE,
        'high',
        CONCAT('Ordonnance expire le ', o.date_expiration),
        'renewal'
    FROM ordonnances o
    WHERE o.statut = 'active'
        AND o.date_expiration = CURDATE() + INTERVAL 30 DAY;
END;

-- Create event to automatically delete discussions closed more than 7 days ago
CREATE EVENT IF NOT EXISTS delete_old_closed_discussions
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM discussion
  WHERE statut='ferme' AND date_fermeture <= NOW() - INTERVAL 7 DAY;
