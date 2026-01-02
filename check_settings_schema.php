<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();

echo "--- Stations Table ---\n";
try {
    $cols = $db->query("SHOW COLUMNS FROM stations")->fetchAll(PDO::FETCH_COLUMN);
    print_r($cols);
} catch (Exception $e) { echo "Table 'stations' not found.\n"; }

echo "\n--- Users Table ---\n";
try {
    $cols = $db->query("SHOW COLUMNS FROM users")->fetchAll(PDO::FETCH_COLUMN);
    print_r($cols);
} catch (Exception $e) { echo "Table 'users' not found.\n"; }

echo "\n--- Settings Table ---\n";
try {
    $cols = $db->query("SHOW COLUMNS FROM settings")->fetchAll(PDO::FETCH_COLUMN);
    print_r($cols);
} catch (Exception $e) { echo "Table 'settings' not found.\n"; }
