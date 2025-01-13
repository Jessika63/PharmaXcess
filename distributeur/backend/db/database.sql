connect db_distributeur

CREATE DATABASE doctors_db;

CREATE TABLE IF NOT EXISTS "doctors" (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL;
    rpps_code VARCHAR(50) NOT NULL,
    sector VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL;
);
