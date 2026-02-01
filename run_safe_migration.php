<?php

/**
 * Migration Runner for Safes Multi-Level Support
 * Run this file in browser: http://localhost/PETRODIESEL2/run_safe_migration.php
 */

require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

echo "<h1>Running Safes Multi-Level Migration</h1>";
echo "<pre>";

try {
    $db = Database::connect();

    // 1. Make station_id nullable
    echo "1. Making station_id nullable...\n";
    $db->exec("ALTER TABLE safes MODIFY COLUMN station_id INT(11) NULL");
    echo "✓ station_id is now nullable\n\n";

    // 2. Add account_scope column
    echo "2. Adding account_scope column...\n";
    $db->exec("ALTER TABLE safes ADD COLUMN account_scope ENUM('local', 'global') NOT NULL DEFAULT 'local' AFTER station_id");
    echo "✓ account_scope column added\n\n";

    // 3. Add is_active column
    echo "3. Adding is_active column...\n";
    $db->exec("ALTER TABLE safes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER balance");
    echo "✓ is_active column added\n\n";

    // 4. Add indexes
    echo "4. Adding indexes...\n";
    $db->exec("ALTER TABLE safes ADD INDEX idx_scope_station (account_scope, station_id)");
    echo "✓ idx_scope_station index added\n";

    $db->exec("ALTER TABLE safes ADD INDEX idx_active (is_active)");
    echo "✓ idx_active index added\n\n";

    // 5. Update existing records
    echo "5. Updating existing records to 'local' scope...\n";
    $stmt = $db->exec("UPDATE safes SET account_scope = 'local' WHERE account_scope IS NULL OR account_scope = 'local'");
    echo "✓ Updated existing records\n\n";

    echo "<strong style='color: green;'>✅ Migration completed successfully!</strong>\n\n";

    // Show updated table structure
    echo "Updated table structure:\n";
    $stmt = $db->query("DESCRIBE safes");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo str_pad("Field", 20) . str_pad("Type", 30) . str_pad("Null", 10) . str_pad("Default", 15) . "\n";
    echo str_repeat("-", 75) . "\n";

    foreach ($columns as $col) {
        echo str_pad($col['Field'], 20) .
            str_pad($col['Type'], 30) .
            str_pad($col['Null'], 10) .
            str_pad($col['Default'] ?? 'NULL', 15) . "\n";
    }
} catch (Exception $e) {
    echo "<strong style='color: red;'>❌ Error: " . $e->getMessage() . "</strong>\n";
    echo "\nIf you see 'Duplicate column name' error, it means the migration was already run.\n";
}

echo "</pre>";
echo "<p><a href='/PETRODIESEL2/public/finance'>Go to Finance Page</a></p>";
