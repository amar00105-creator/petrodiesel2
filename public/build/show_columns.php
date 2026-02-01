<?php
require_once __DIR__ . '/../app/Config/Database.php';

$db = \App\Config\Database::connect();

echo "<h2>Tank Calibrations Table Structure</h2>";

$stmt = $db->query("DESCRIBE tank_calibrations");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
foreach ($columns as $col) {
    echo "<tr>";
    echo "<td><strong>{$col['Field']}</strong></td>";
    echo "<td>{$col['Type']}</td>";
    echo "<td>{$col['Null']}</td>";
    echo "<td>{$col['Key']}</td>";
    echo "<td>{$col['Default']}</td>";
    echo "<td>{$col['Extra']}</td>";
    echo "</tr>";
}
echo "</table>";

echo "<hr><h3>Sample Data:</h3>";
$stmt = $db->query("SELECT * FROM tank_calibrations ORDER BY created_at DESC LIMIT 3");
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>" . print_r($data, true) . "</pre>";
