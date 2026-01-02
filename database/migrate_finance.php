<?php
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;

try {
    $db = Database::connect();
    echo "Starting Finance Migration...\n";

    // 1. Safes (Treasury / Cash on Hand)
    // One station might have multiple safes (Main Safe, Shop Safe, etc)
    $sql = "CREATE TABLE IF NOT EXISTS `safes` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `station_id` INT NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `balance` DECIMAL(15, 2) DEFAULT 0.00,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "- Created 'safes' table.\n";

    // 2. Banks (Bank Accounts)
    $sql = "CREATE TABLE IF NOT EXISTS `banks` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `station_id` INT NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `account_number` VARCHAR(100),
        `balance` DECIMAL(15, 2) DEFAULT 0.00,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "- Created 'banks' table.\n";

    // 3. Expense Categories
    $sql = "CREATE TABLE IF NOT EXISTS `expense_categories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `station_id` INT NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `type` ENUM('operational', 'administrative', 'salary', 'maintenance', 'other') DEFAULT 'other',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "- Created 'expense_categories' table.\n";

    // 4. Financial Transactions (The Ledger)
    // Tracks movements: Deposit, Withdrawal, Transfer, Expense, Income
    $sql = "CREATE TABLE IF NOT EXISTS `transactions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `station_id` INT NOT NULL,
        `type` ENUM('deposit', 'withdrawal', 'transfer', 'expense', 'income', 'sale_deposit') NOT NULL,
        `amount` DECIMAL(15, 2) NOT NULL,
        
        `from_type` ENUM('safe', 'bank', 'customer', 'external') NULL,
        `from_id` INT NULL,
        
        `to_type` ENUM('safe', 'bank', 'supplier', 'expense', 'external') NULL,
        `to_id` INT NULL,
        
        `description` TEXT,
        `reference_number` VARCHAR(100) NULL,
        `date` DATE NOT NULL,
        `created_by` INT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $db->exec($sql);
    echo "- Created 'transactions' table.\n";

    // Seed Ledger with initial Default Safe/Bank if empty
    // Check if any safe exists
    $stmt = $db->query("SELECT count(*) FROM safes");
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO safes (station_id, name, balance) VALUES (1, 'Main Safe (الخزينة الرئيسية)', 0.00)");
        echo "- Seeded Default Safe.\n";
    }

    // Seed Expense Categories
    $stmt = $db->query("SELECT count(*) FROM expense_categories");
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO expense_categories (station_id, name, type) VALUES 
            (1, 'Salaries (مرتبات)', 'salary'),
            (1, 'Electricity (كهرباء)', 'operational'),
            (1, 'Maintenance (صيانة)', 'maintenance'),
            (1, 'Hospitality (ضيافة)', 'administrative')
        ");
        echo "- Seeded Default Expense Categories.\n";
    }

    echo "Migration Completed Successfully.\n";

} catch (PDOException $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
}
