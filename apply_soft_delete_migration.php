<?php
require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    echo "Checking 'pumps' table...\n";
    try {
        $db->exec("ALTER TABLE pumps ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
        echo "Added deleted_at to pumps.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Column deleted_at already exists in pumps.\n";
        } else {
            echo "Error checking pumps: " . $e->getMessage() . "\n";
        }
    }

    echo "Checking 'counters' table...\n";
    try {
        $db->exec("ALTER TABLE counters ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
        echo "Added deleted_at to counters.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Column deleted_at already exists in counters.\n";
        } else {
            echo "Error checking counters: " . $e->getMessage() . "\n";
        }
    }

    echo "Migration completed.\n";
} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
