-- Activity Logs Table
-- This table tracks all user actions in the system for audit purposes
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NULL,
    `user_id` INT NOT NULL,
    `user_name` VARCHAR(100) NULL COMMENT 'Cached user name for historical reference',
    `action` VARCHAR(50) NOT NULL COMMENT 'create, update, delete, login, logout',
    `entity_type` VARCHAR(50) NOT NULL COMMENT 'sale, purchase, transaction, user, tank, pump, etc.',
    `entity_id` INT NULL,
    `description` TEXT,
    `old_values` JSON NULL COMMENT 'Previous values before update',
    `new_values` JSON NULL COMMENT 'New values after update',
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_station (station_id),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_date (created_at),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;