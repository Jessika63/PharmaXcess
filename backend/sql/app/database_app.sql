-- Création de la DB centralisée pour l'application
CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- Table utilisateurs (fusion users + profile)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
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

-- Table relations parent-enfant
CREATE TABLE IF NOT EXISTS relations_parent_enfant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    enfant_id INT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (enfant_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Maladies
CREATE TABLE IF NOT EXISTS maladies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom VARCHAR(150),
    description TEXT,
    symptomes TEXT,
    date_debut DATE,
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
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Alarmes
CREATE TABLE IF NOT EXISTS alarmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    medicament VARCHAR(150),
    frequence VARCHAR(50),
    heure TIME,
    statut ENUM('active','inactive') DEFAULT 'active',
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
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
    utilisateur_id INT,
    ordonnance_id INT,
    statut ENUM('en_attente','valide','refuse','retire'),
    contenu_qr TEXT,
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (ordonnance_id) REFERENCES ordonnances(id) ON DELETE CASCADE
);

-- Discussion / Tickets
CREATE TABLE IF NOT EXISTS discussion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    sujet VARCHAR(255),
    statut ENUM('ouvert','ferme'),
    pharmacien_id INT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_fermeture DATETIME,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacien_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
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
    data TEXT,
);

-- QR codes pour profiles
CREATE TABLE IF NOT EXISTS qrcodes_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    code_unique VARCHAR(255) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create event to automatically delete discussions closed more than 7 days ago
CREATE EVENT IF NOT EXISTS delete_old_closed_discussions
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM discussion
  WHERE statut='ferme' AND date_fermeture <= NOW() - INTERVAL 7 DAY;
