<?php
// Fix DB Script for Tanks accessible via Browser
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

header('Content-Type: text/plain');

try {
    $db = Database::connect();

    echo "Starting Tanks Database Update...\n\n";

    // Tanks
    try {
        echo "Checking 'tanks' table... ";
        $db->exec("ALTER TABLE tanks ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
        echo "OK: Added deleted_at to tanks.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "SKIP: Column deleted_at already exists in tanks.\n";
        } else {
            echo "ERROR: " . $e->getMessage() . "\n";
        }
    }

    echo "\nDatabase Update Completed.\n";
} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
