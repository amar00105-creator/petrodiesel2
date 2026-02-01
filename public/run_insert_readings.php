<?php
// Execute the sample tank readings SQL
require_once __DIR__ . '/../app/Config/Database.php';

$db = \App\Config\Database::connect();

echo "<h2>Inserting Sample Tank Readings</h2>";

try {
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/../database/insert_sample_tank_readings.sql');

    // Split by semicolon for multiple statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    $count = 0;
    foreach ($statements as $statement) {
        if (!empty($statement) && stripos($statement, 'SELECT') !== 0) {
            $db->exec($statement);
            $count++;
        }
    }

    echo "<p style='color: green;'><strong>✅ Success!</strong> Inserted sample readings for all tanks.</p>";

    // Verify
    $stmt = $db->query("SELECT COUNT(*) as total FROM tank_readings");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p><strong>Total readings now in database:</strong> {$result['total']}</p>";

    // Show breakdown by tank
    $stmt = $db->query("
        SELECT 
            t.name as tank_name,
            COUNT(tr.id) as reading_count
        FROM tanks t
        LEFT JOIN tank_readings tr ON t.id = tr.tank_id
        GROUP BY t.id, t.name
        ORDER BY t.id
    ");
    $breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h3>Readings per tank:</h3>";
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>Tank Name</th><th>Readings Count</th></tr>";
    foreach ($breakdown as $row) {
        echo "<tr><td>{$row['tank_name']}</td><td>{$row['reading_count']}</td></tr>";
    }
    echo "</table>";

    echo "<hr>";
    echo "<p><strong>Next step:</strong> Refresh the reports page to see the tank readings!</p>";
    echo "<p><a href='/PETRODIESEL2/public/reports' target='_blank'>Open Reports Page →</a></p>";
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>❌ Error:</strong> " . $e->getMessage() . "</p>";
}
