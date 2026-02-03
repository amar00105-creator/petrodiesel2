<?php
// Display errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Database Check</h1>";

try {
    require_once __DIR__ . '/../app/Config/Database.php';
    $db = \App\Config\Database::connect();
    echo "<p style='color:green'>Database Connection: OK</p>";
} catch (Exception $e) {
    die("<p style='color:red'>Database Connection Failed: " . $e->getMessage() . "</p>");
}

$tables = [
    'safes',
    'banks',
    'transactions',
    'transaction_categories',
    'suppliers',
    'customers',
    'stations',
    'users'
];

foreach ($tables as $table) {
    try {
        $stmt = $db->query("SELECT 1 FROM $table LIMIT 1");
        echo "<p style='color:green'>Table '$table': OK</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'>Table '$table': FAILED - " . $e->getMessage() . "</p>";
    }
}

// Check specific columns used in FinanceController
echo "<h2>Column Checks</h2>";
$checks = [
    "SELECT id, name FROM stations LIMIT 1" => "Station Columns",
    "SELECT * FROM transactions LIMIT 1" => "Transaction Columns",
    "SELECT * FROM safes WHERE account_scope = 'local' LIMIT 1" => "Safe Scopes"
];

foreach ($checks as $query => $desc) {
    try {
        $db->query($query);
        echo "<p style='color:green'>$desc: OK</p>";
    } catch (Exception $e) {
        echo "<p style='color:red'>$desc: FAILED - " . $e->getMessage() . "</p>";
    }
}

echo "<h3>Done.</h3>";
