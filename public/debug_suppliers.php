<?php
require_once __DIR__ . '/../app/Config/db_config.php';

try {
    $dsn = "mysql:host={$host};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h1>Suppliers Debug</h1>";

    // 1. Check all suppliers
    $stmt = $pdo->query("SELECT id, name, station_id FROM suppliers");
    $suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h2>All Suppliers (" . count($suppliers) . ")</h2>";
    echo "<pre>";
    print_r($suppliers);
    echo "</pre>";

    // 2. Check stations
    $stmt = $pdo->query("SELECT id, name FROM stations");
    $stations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h2>Stations</h2>";
    echo "<pre>";
    print_r($stations);
    echo "</pre>";
} catch (PDOException $e) {
    echo "Connection Error: " . $e->getMessage();
}
