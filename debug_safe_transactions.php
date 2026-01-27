<?php
// Debug Safe Transactions
$config = require 'app/Config/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);

    // 1. Get First Safe
    $idx = $pdo->query("SELECT * FROM safes LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if (!$idx) {
        die("No safes found in DB.\n");
    }
    echo "Testing with Safe: {$idx['name']} (ID: {$idx['id']})\n";

    // 2. Check Transactions (Direct Query)
    $sql = "SELECT * FROM transactions 
            WHERE (to_type = 'safe' AND to_id = ?) 
               OR (from_type = 'safe' AND from_id = ?)
            LIMIT 5";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$idx['id'], $idx['id']]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($rows) . " transactions via raw SQL.\n";
    print_r($rows);

    // 3. Check Transactions Table Structure (Enum types?)
    $cols = $pdo->query("DESCRIBE transactions")->fetchAll(PDO::FETCH_COLUMN);
    echo "Columns: " . implode(', ', $cols) . "\n";
} catch (PDOException $e) {
    echo "DB Error: " . $e->getMessage();
}
