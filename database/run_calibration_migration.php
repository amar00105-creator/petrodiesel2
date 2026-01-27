<?php

/**
 * Migration Runner: Update calibration_tables to use millimeters
 */

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    echo "Starting migration: Update calibration_tables...\n\n";

    // Check if column needs updating
    $stmt = $db->query("SHOW COLUMNS FROM calibration_tables LIKE 'reading_cm'");
    $needsUpdate = $stmt->fetch();

    if ($needsUpdate) {
        echo "Found 'reading_cm' column. Starting migration...\n";

        // Step 1: Rename column
        echo "1. Renaming column to height_mm...\n";
        $db->exec("ALTER TABLE calibration_tables 
                   CHANGE COLUMN reading_cm height_mm DECIMAL(10, 2) NOT NULL
                   COMMENT 'Height in millimeters'");
        echo "   ✓ Column renamed\n";

        // Step 2: Convert data (cm to mm)
        echo "2. Converting existing data from cm to mm (×10)...\n";
        $db->exec("UPDATE calibration_tables SET height_mm = height_mm * 10");
        echo "   ✓ Data converted\n";

        // Step 3: Add indexes
        echo "3. Adding performance indexes...\n";
        $db->exec("CREATE INDEX IF NOT EXISTS idx_tank_height ON calibration_tables(tank_id, height_mm)");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_tank_id ON calibration_tables(tank_id)");
        echo "   ✓ Indexes created\n";

        echo "\n✅ Migration completed successfully!\n";
        echo "Calibration table now uses millimeters (mm) instead of centimeters (cm).\n";
    } else {
        // Check if already migrated
        $stmt = $db->query("SHOW COLUMNS FROM calibration_tables LIKE 'height_mm'");
        $alreadyMigrated = $stmt->fetch();

        if ($alreadyMigrated) {
            echo "✓ Column 'height_mm' already exists. Migration already completed.\n";
        } else {
            echo "❌ Error: Unable to find column 'reading_cm' or 'height_mm'\n";
            exit(1);
        }
    }
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
