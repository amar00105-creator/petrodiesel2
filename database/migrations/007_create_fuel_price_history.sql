-- Fuel Price History Table
-- This table tracks all fuel price changes for audit purposes
CREATE TABLE IF NOT EXISTS `fuel_price_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `fuel_type_id` INT NOT NULL,
    `fuel_name` VARCHAR(100) NULL COMMENT 'Cached name for historical reference',
    `old_price` DECIMAL(10, 2) NULL COMMENT 'Price before change, NULL for new fuel',
    `new_price` DECIMAL(10, 2) NOT NULL,
    `changed_by` INT NULL,
    `changed_by_name` VARCHAR(100) NULL COMMENT 'Cached username',
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_price_fuel (fuel_type_id),
    INDEX idx_price_date (changed_at),
    FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;