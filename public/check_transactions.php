<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "<h1>Transactions Check</h1>";

$stmt = $db->query("SELECT * FROM transactions ORDER BY id DESC LIMIT 10");
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h2>Last 10 Transactions (" . count($transactions) . ")</h2>";
if (empty($transactions)) {
    echo "<p style='color:red'>No transactions found in database.</p>";
} else {
    echo "<table border='1' cellpadding='5' style='border-collapse:collapse;'>";
    echo "<tr><th>ID</th><th>Type</th><th>Amount</th><th>Description</th><th>Date</th><th>Station ID</th></tr>";
    foreach ($transactions as $t) {
        echo "<tr>";
        echo "<td>{$t['id']}</td>";
        echo "<td>{$t['type']}</td>";
        echo "<td>{$t['amount']}</td>";
        echo "<td>{$t['description']}</td>";
        echo "<td>{$t['date']}</td>";
        echo "<td>{$t['station_id']}</td>";
        echo "</tr>";
    }
    echo "</table>";
}
