<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();

echo "<h1>Database Debugger</h1>";

// 1. Check Stations
echo "<h2>Stations</h2>"; // FK check
$stmt = $db->query("SELECT * FROM stations");
$stations = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (empty($stations)) {
    echo "<p style='color:red'>WARNING: No stations found! ID 1 might not exist.</p>";
    // Attempt to create default station if missing
    try {
        $db->exec("INSERT INTO stations (id, name) VALUES (1, 'Default Station')");
        echo "<p style='color:green'>Created Default Station (ID 1).</p>";
    } catch (PDOException $e) {
        echo "<p>Could not create default station: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<pre>" . print_r($stations, true) . "</pre>";
}

// 2. Check Pumps Schema details
echo "<h2>Pumps Table Schema</h2>";
$stmt = $db->query("SHOW COLUMNS FROM pumps");
echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
    echo "<tr>";
    foreach ($col as $val) echo "<td>$val</td>";
    echo "</tr>";
}
echo "</table>";

// 3. Test Insert
echo "<h2>Test Insert Pump</h2>";
try {
    // Try inserting with Station ID 1 and a valid tank (find one first)
    $tanks = $db->query("SELECT id FROM tanks LIMIT 1")->fetchAll();
    if (empty($tanks)) {
        echo "No tanks found to link to. Cannot test insert.";
    } else {
        $tankId = $tanks[0]['id'];
        echo "Attempting to insert 'Test Pump' linked to Tank ID $tankId...<br>";
        
        $sql = "INSERT INTO pumps (station_id, tank_id, name) VALUES (1, $tankId, 'TEST_PUMP_DEBUG')";
        $db->exec($sql);
        $id = $db->lastInsertId();
        echo "<p style='color:green'>SUCCESS: Inserted Test Pump with ID: $id</p>";
        
        // Cleanup
        $db->exec("DELETE FROM pumps WHERE id = $id");
        echo "Deleted test pump.";
    }
} catch (PDOException $e) {
    echo "<p style='color:red'>INSERT FAILED: " . $e->getMessage() . "</p>";
}
