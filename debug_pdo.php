<?php
$host = 'localhost';
$db_name = 'petrodiesel_db';
$username = 'root';
$password = '';

if (file_exists(__DIR__ . '/app/Config/db_config.php')) {
    $config = require __DIR__ . '/app/Config/db_config.php';
    $host = $config['host'] ?? $host;
    $db_name = $config['db_name'] ?? $db_name;
    $username = $config['username'] ?? $username;
    $password = $config['password'] ?? $password;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    echo "Suppliers: " . $conn->query("SELECT COUNT(*) FROM suppliers")->fetchColumn() . "\n";
    echo "Customers: " . $conn->query("SELECT COUNT(*) FROM customers")->fetchColumn() . "\n";
    $s = $conn->query("SELECT id, name FROM suppliers LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    echo "First Supplier: " . ($s ? json_encode($s) : "NONE") . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
