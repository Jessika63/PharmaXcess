CREATE TABLE IF NOT EXISTS vending_machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    status ENUM('operational', 'under maintenance', 'out of service') DEFAULT 'operational'
);