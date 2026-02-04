<?php
// Fix DB Script accessible via Browser
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

header('Content-Type: text/plain');

try {
    $db = Database::connect();

    echo "Starting Database Update...\n\n";

    // Pumps
    try {
        echo "Checking 'pumps' table... ";
        $db->exec("ALTER TABLE pumps ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
        echo "OK: Added deleted_at to pumps.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "SKIP: Column deleted_at already exists in pumps.\n";
        } else {
            echo "ERROR: " . $e->getMessage() . "\n";
        }
    }

    // Counters
    try {
        echo "Checking 'counters' table... ";
        $db->exec("ALTER TABLE counters ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
        echo "OK: Added deleted_at to counters.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "SKIP: Column deleted_at already exists in counters.\n";
        } else {
            echo "ERROR: " . $e->getMessage() . "\n";
        }
    }

    echo "\nDatabase Update Completed.\n";
    echo "You can now delete this file or ignore it.";
} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
