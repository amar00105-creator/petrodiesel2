<?php
$config = require 'app/Config/db_config.php';
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']}", $config['username'], $config['password']);

    $startDate = '2026-01-01';
    $endDate = '2026-01-24';
    $sourceType = 'safe';
    $sourceId = 1;

    echo "Testing getDailySalesForFinancial Query...\n";
    echo "Params: Type=$sourceType, ID=$sourceId, Start=$startDate, End=$endDate\n";

    $sql = "SELECT s.sale_date as date, SUM(t.amount) as total_amount, COUNT(s.id) as count
            FROM transactions t
            JOIN sales s ON t.related_entity_id = s.id AND t.related_entity_type = 'sales'
            WHERE t.to_type = ? AND t.to_id = ? AND s.sale_date BETWEEN ? AND ?
            GROUP BY s.sale_date
            ORDER BY s.sale_date ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sourceType, $sourceId, $startDate, $endDate]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Rows found: " . count($rows) . "\n";
    print_r($rows);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
