CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    dosage VARCHAR(50),
    form VARCHAR(50),
    side_effects VARCHAR(500),
    contraindications VARCHAR(500),
    manufacturer VARCHAR(100),
    expiration_date DATE,
    price DECIMAL(10, 2),
    categories_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (categories_id) REFERENCES categories(id) ON DELETE SET NULL
);
