<?php
// Run migration for tank_calibrations table
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    echo "Running migration: create_tank_calibrations.sql\n\n";

    $sql = file_get_contents(__DIR__ . '/create_tank_calibrations.sql');

    $db->exec($sql);

    echo "✓ Migration completed successfully!\n";
    echo "Table 'tank_calibrations' has been created.\n";
} catch (PDOException $e) {
    echo "✗ Migration failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
