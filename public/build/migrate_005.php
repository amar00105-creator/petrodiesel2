<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

header('Content-Type: text/plain');

try {
    $db = Database::connect();
    echo "Applying Migration 005_create_tank_transfers...\n";

    $sql = file_get_contents(__DIR__ . '/../database/migrations/005_create_tank_transfers.sql');
    $db->exec($sql);

    echo "Migration Applied Successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
