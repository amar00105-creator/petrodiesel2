<?php

/**
 * Migration runner for adding tank update tracking to calibration_logs
 */

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    echo "Starting migration: Add tank update tracking to calibration_logs\n";
    echo "=================================================================\n\n";

    // Read and execute the SQL migration file
    $sqlFile = __DIR__ . '/add_tank_update_tracking_to_calibration_logs.sql';

    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: $sqlFile");
    }

    $sql = file_get_contents($sqlFile);

    // Split by semicolon but be careful with stored procedures
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function ($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );

    foreach ($statements as $statement) {
        if (empty($statement)) continue;

        echo "Executing: " . substr($statement, 0, 100) . "...\n";
        $db->exec($statement);
        echo "✓ Success\n\n";
    }

    echo "Migration completed successfully!\n";
    echo "Added columns:\n";
    echo "  - tank_updated (BOOLEAN)\n";
    echo "  - previous_volume (DECIMAL)\n";
    echo "  - Index on tank_updated\n";
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
