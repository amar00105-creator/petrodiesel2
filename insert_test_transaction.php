<?php
// Insert Test Transaction
$config = require 'app/Config/db_config.php';
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4", $config['username'], $config['password']);

    // 1. Get First Safe
    $safe = $pdo->query("SELECT * FROM safes LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if (!$safe) die("No safe found.");

    echo "Inserting into Safe: {$safe['name']} (ID: {$safe['id']})\n";

    // 2. Insert Transaction for TODAY
    $sql = "INSERT INTO transactions (
        station_id, type, amount, category_name, description, 
        date, created_at, 
        to_type, to_id, 
        user_id
    ) VALUES (
        ?, 'income', 9999, 'تجربة نظام', 'TEST VERIFICATION ENTRY - تجربة حية', 
        NOW(), NOW(), 
        'safe', ?, 
        1
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$safe['station_id'], $safe['id']]);

    echo "Transaction Inserted! ID: " . $pdo->lastInsertId() . "\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
