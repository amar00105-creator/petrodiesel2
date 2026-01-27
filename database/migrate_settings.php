<?php

/**
 * Migration Script: Create Settings Table
 * Run this file once to add the settings table to your database
 */

require_once __DIR__ . '/../app/Config/Database.php';

try {
    $db = App\Config\Database::connect();

    echo "Creating settings table...\n";

    // Create settings table
    $sql = "CREATE TABLE IF NOT EXISTS `settings` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $db->exec($sql);
    echo "✓ Settings table created successfully!\n\n";

    // Insert default settings
    echo "Inserting default settings...\n";

    $defaultSettings = [
        [NULL, 'general', 'app_name', 'PetroDiesel ERP', 'string'],
        [NULL, 'general', 'currency', 'IQD', 'string'],
        [NULL, 'general', 'timezone', 'Asia/Baghdad', 'string'],
        [NULL, 'finance', 'enable_credit_sales', '1', 'boolean'],
        [NULL, 'finance', 'tax_rate', '0', 'integer'],
        [NULL, 'sales', 'require_worker_assignment', '1', 'boolean']
    ];

    $insertSql = "INSERT INTO `settings` (`station_id`, `section`, `key_name`, `value`, `type`) 
                  VALUES (?, ?, ?, ?, ?) 
                  ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)";

    $stmt = $db->prepare($insertSql);

    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
        echo "  ✓ Added: {$setting[2]} = {$setting[3]}\n";
    }

    echo "\n✅ Migration completed successfully!\n";
    echo "You can now access the settings page.\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
