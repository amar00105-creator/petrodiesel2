<?php
$config = require __DIR__ . '/app/Config/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT id, name FROM customers LIMIT 5");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "--- Customers ---\n";
    foreach ($customers as $c) {
        echo "ID: {$c['id']} | Name: {$c['name']}\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
