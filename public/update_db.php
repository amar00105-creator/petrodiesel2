<?php
// Display errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Database Schema Update</h1>";

try {
    require_once __DIR__ . '/../app/Config/Database.php';
    $db = \App\Config\Database::connect();
    echo "<p style='color:green'>Database Connection: OK</p>";
} catch (Exception $e) {
    die("<p style='color:red'>Database Connection Failed: " . $e->getMessage() . "</p>");
}

// 1. Update SAFES Table
try {
    $stmt = $db->query("SHOW COLUMNS FROM safes LIKE 'account_scope'");
    if ($stmt->fetch()) {
        echo "<p style='color:orange'>Column 'account_scope' already exists in 'safes'.</p>";
    } else {
        $db->exec("ALTER TABLE safes ADD COLUMN account_scope ENUM('local', 'global') DEFAULT 'local' AFTER station_id");
        echo "<p style='color:green'>ADDED 'account_scope' to 'safes'.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Failed to update 'safes': " . $e->getMessage() . "</p>";
}

// 2. Update BANKS Table
try {
    $stmt = $db->query("SHOW COLUMNS FROM banks LIKE 'account_scope'");
    if ($stmt->fetch()) {
        echo "<p style='color:orange'>Column 'account_scope' already exists in 'banks'.</p>";
    } else {
        $db->exec("ALTER TABLE banks ADD COLUMN account_scope ENUM('local', 'global') DEFAULT 'local' AFTER station_id");
        echo "<p style='color:green'>ADDED 'account_scope' to 'banks'.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Failed to update 'banks': " . $e->getMessage() . "</p>";
}

echo "<h3>Update Complete. Try opening the Accounting page now.</h3>";
