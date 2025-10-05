CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    reset_token TEXT,
    reset_token_expiracy TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'operational' NOT NULL CHECK (status IN ('operational', 'under maintenance', 'out of service')),
    location GEOMETRY(POINT, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    assigned_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'inprogress', 'closed'))
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TABLE IF NOT EXISTS ticket_message (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ordonnances (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    doctor_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    medications TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    speciality TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    hospital TEXT NOT NULL,
)

CREATE TABLE IF NOT EXISTS familyDisability (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    familyMember TEXT NOT NULL,
    severity TEXT NOT NULL,
    treatement TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS allergies (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    beginDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    medications TEXT NOT NULL,
    comments TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS medicalHistory (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    beginDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    department TEXT NOT NULL,
    hospital TEXT NOT NULL,
    doctor TEXT NOT NULL,
    medications TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS treatements (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    beginDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dosage TEXT NOT NULL,
    duration TEXT NOT NULL,
    sideEffects TEXT NOT NULL,
    disease TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS diseases (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    beginDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    medications name TEXT NOT NULL,
    examens name TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

CREATE INDEX IF NOT EXISTS idx_location ON machines USING GIST (location);