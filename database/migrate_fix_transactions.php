<?php
// database/migrate_fix_transactions.php

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();
    echo "Starting Transactions Fix Migration...\n";

    // 1. Rename 'expense_categories' to 'transaction_categories' if it exists and target doesn't
    // Check if expense_categories exists
    $checkOld = $db->query("SHOW TABLES LIKE 'expense_categories'");
    $checkNew = $db->query("SHOW TABLES LIKE 'transaction_categories'");

    if ($checkOld->rowCount() > 0 && $checkNew->rowCount() == 0) {
        $db->exec("RENAME TABLE expense_categories TO transaction_categories");
        echo "✅ Renamed 'expense_categories' to 'transaction_categories'.\n";
    } elseif ($checkNew->rowCount() > 0) {
        echo "ℹ️ 'transaction_categories' already exists.\n";
    } else {
        // Create it if neither exists (fallback)
        $sql = "CREATE TABLE IF NOT EXISTS `transaction_categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `station_id` INT NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `type` ENUM('operational', 'administrative', 'salary', 'maintenance', 'other', 'income', 'sale') DEFAULT 'other',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $db->exec($sql);
        echo "✅ Created 'transaction_categories' table.\n";
    }

    // 2. Add 'category_id' to 'transactions' table if missing
    $stmt = $db->query("SHOW COLUMNS FROM transactions LIKE 'category_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE transactions ADD COLUMN category_id INT NULL AFTER amount");
        // Add FK
        $db->exec("ALTER TABLE transactions ADD CONSTRAINT fk_trx_category FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL");
        echo "✅ Added 'category_id' to 'transactions' table.\n";
    } else {
        echo "ℹ️ 'category_id' column already exists in 'transactions'.\n";
    }

    echo "Fix Migration Completed Successfully.\n";
} catch (PDOException $e) {
    echo "❌ Fix Migration Error: " . $e->getMessage() . "\n";
}
