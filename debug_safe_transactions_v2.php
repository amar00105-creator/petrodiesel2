<?php
// Debug Safe Transactions - Phase 2
$config = require 'app/Config/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);

    // 1. Get First Safe
    $idx = $pdo->query("SELECT * FROM safes LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if (!$idx) die("No safes found.\n");

    echo "SAFE: {$idx['id']} - {$idx['name']}\n";

    // 2. Count Total Transactions for this Safe (Ignoring Date)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE (to_type = 'safe' AND to_id = ?) OR (from_type = 'safe' AND from_id = ?)");
    $stmt->execute([$idx['id'], $idx['id']]);
    $count = $stmt->fetchColumn();
    echo "Total Transactions (Any Date): $count\n";

    if ($count > 0) {
        // 3. Sample Data
        $stmt = $pdo->prepare("SELECT id, type, amount, date, created_at, to_type, from_type FROM transactions WHERE (to_type = 'safe' AND to_id = ?) OR (from_type = 'safe' AND from_id = ?) LIMIT 5");
        $stmt->execute([$idx['id'], $idx['id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "\nSample Rows:\n";
        foreach ($rows as $r) {
            echo "ID: {$r['id']} | Type: {$r['type']} | Amt: {$r['amount']} | Date: " . ($r['date'] ?? 'NULL') . " | Created: {$r['created_at']} | To: {$r['to_type']} | From: {$r['from_type']}\n";
        }
    } else {
        echo "No transactions found at all for this safe.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
