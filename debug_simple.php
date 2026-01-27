<?php
// debug_simple.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/app/Config/Database.php';

try {
    echo "Connecting to DB...\n";
    $db = \App\Config\Database::connect();
    echo "Connected.\n";

    echo "Testing getTodaySales query...\n";
    // Mimic HomeController::getTodaySales
    $stationId = 1;
    $query = "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE station_id = ? AND sale_date = CURDATE()";
    $stmt = $db->prepare($query);
    $stmt->execute([$stationId]);
    $result = $stmt->fetch(\PDO::FETCH_ASSOC);
    echo "Sales Total: " . $result['total'] . "\n";

    echo "Testing getTodayIncoming query...\n";
    // Mimic HomeController::getTodayIncoming which uses DATE(created_at)
    $query2 = "SELECT COALESCE(SUM(volume_received), 0) as total FROM purchases WHERE station_id = ? AND DATE(created_at) = CURDATE()";
    $stmt2 = $db->prepare($query2);
    $stmt2->execute([$stationId]);
    $result2 = $stmt2->fetch(\PDO::FETCH_ASSOC);
    echo "Incoming Total: " . $result2['total'] . "\n";

    echo "Tests Passed.\n";
} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
