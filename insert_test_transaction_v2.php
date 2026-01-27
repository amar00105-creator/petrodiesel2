<?php
// Insert Test Transaction (Fixed Schema)
$config = require 'app/Config/db_config.php';
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4", $config['username'], $config['password']);

    // 1. Get First Safe
    $safe = $pdo->query("SELECT * FROM safes LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if (!$safe) die("No safe found.");

    echo "Inserting into Safe: {$safe['name']} (ID: {$safe['id']})\n";

    // 2. Insert Transaction for TODAY
    // Removed 'category_name', kept standard fields
    $sql = "INSERT INTO transactions (
        station_id, type, amount, description, 
        date, created_at, 
        to_type, to_id
    ) VALUES (
        ?, 'income', 9999, 'TEST VERIFICATION ENTRY - تجربة حية', 
        NOW(), NOW(), 
        'safe', ?
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$safe['station_id'], $safe['id']]);

    echo "Transaction Inserted! ID: " . $pdo->lastInsertId() . "\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
