-- Migration: Create simplified tank_calibrations table
-- This replaces the complex calibration system with a simple manual entry approach
CREATE TABLE IF NOT EXISTS tank_calibrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tank_id INT NOT NULL,
    user_id INT NOT NULL,
    actual_quantity DECIMAL(10, 2) NOT NULL COMMENT 'الكمية المقاسة يدوياً',
    previous_quantity DECIMAL(10, 2) NOT NULL COMMENT 'الرصيد قبل المعايرة',
    variance DECIMAL(10, 2) NOT NULL COMMENT 'الفرق (+ زيادة / - عجز)',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_tank_date (tank_id, created_at),
    INDEX idx_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;