CREATE TABLE IF NOT EXISTS tank_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_tank_id INT NULL,
    to_tank_id INT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (from_tank_id) REFERENCES tanks(id) ON DELETE
    SET NULL,
        FOREIGN KEY (to_tank_id) REFERENCES tanks(id) ON DELETE
    SET NULL
);