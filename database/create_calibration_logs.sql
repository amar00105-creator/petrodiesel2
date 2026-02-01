-- Create calibration_logs table for smart calibration feature
CREATE TABLE IF NOT EXISTS `calibration_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tank_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `stick_reading_cm` DECIMAL(10, 2) NOT NULL COMMENT 'Manual stick reading in centimeters',
    `calculated_volume_liters` DECIMAL(10, 2) NOT NULL COMMENT 'Calculated volume based on geometry',
    `sensor_reading_liters` DECIMAL(10, 2) DEFAULT 0 COMMENT 'Automatic sensor reading for comparison',
    `variance_liters` DECIMAL(10, 2) DEFAULT 0 COMMENT 'Difference between calculated and sensor',
    `error_percent` DECIMAL(5, 2) DEFAULT 0 COMMENT 'Error percentage',
    `temperature_c` DECIMAL(5, 2) DEFAULT 25 COMMENT 'Fuel temperature in Celsius',
    `status` ENUM('pass', 'warning', 'fail') DEFAULT 'pass' COMMENT 'Calibration result status',
    `notes` TEXT COMMENT 'Additional notes',
    `dimensions_json` TEXT COMMENT 'Tank dimensions used in calculation',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Add index for faster queries on tank_id
CREATE INDEX idx_calibration_logs_tank_id ON calibration_logs(tank_id);
CREATE INDEX idx_calibration_logs_created_at ON calibration_logs(created_at);