CREATE TABLE IF NOT EXISTS primary_doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_relationship VARCHAR(50),
    contact_phone VARCHAR(15),
    contact_email VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    insurance_id INT NOT NULL,
    primary_doctor_id INT,
    emergency_contact_id INT,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    allergies_list VARCHAR(200),
    chronic_conditions VARCHAR(200),
    medical_history VARCHAR(300),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_id) REFERENCES insurance(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_doctor_id) REFERENCES primary_doctor(id) ON DELETE SET NULL,
    FOREIGN KEY (emergency_contact_id) REFERENCES emergency_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS insurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    insurer_name VARCHAR(100) NOT NULL,
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    insurance_type VARCHAR(50),
    start_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



