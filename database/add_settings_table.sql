-- Create Settings Table Migration
-- Run this to add the settings table to your existing database
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NULL COMMENT 'NULL for global settings, specific ID for station settings',
    `section` VARCHAR(50) NOT NULL COMMENT 'general, finance, sales, etc.',
    `key_name` VARCHAR(100) NOT NULL,
    `value` TEXT,
    `type` ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_setting` (`station_id`, `key_name`),
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Insert some default settings
INSERT INTO `settings` (
        `station_id`,
        `section`,
        `key_name`,
        `value`,
        `type`
    )
VALUES (
        NULL,
        'general',
        'app_name',
        'PetroDiesel ERP',
        'string'
    ),
    (NULL, 'general', 'currency', 'IQD', 'string'),
    (
        NULL,
        'general',
        'timezone',
        'Asia/Baghdad',
        'string'
    ),
    (
        NULL,
        'finance',
        'enable_credit_sales',
        '1',
        'boolean'
    ),
    (NULL, 'finance', 'tax_rate', '0', 'integer'),
    (
        NULL,
        'sales',
        'require_worker_assignment',
        '1',
        'boolean'
    ) ON DUPLICATE KEY
UPDATE `value` =
VALUES(`value`);