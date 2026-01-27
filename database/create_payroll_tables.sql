CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('user', 'worker', 'driver') NOT NULL,
    entity_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_entity (entity_type, entity_id)
);
CREATE TABLE IF NOT EXISTS payroll_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('user', 'worker', 'driver') NOT NULL,
    entity_id INT NOT NULL,
    type ENUM('advance', 'deduction', 'bonus', 'payment') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);