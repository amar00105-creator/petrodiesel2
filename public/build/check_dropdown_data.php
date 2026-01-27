<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "<h1>Data Check</h1>";

// Check Stations
$stmt = $db->query("SELECT * FROM stations");
$stations = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<h2>Stations (" . count($stations) . ")</h2>";
echo "<pre>" . print_r($stations, true) . "</pre>";

// Check Suppliers
$stmt = $db->query("SELECT * FROM suppliers");
$suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<h2>Suppliers (" . count($suppliers) . ")</h2>";
if (empty($suppliers)) {
    echo "<p style='color:red'>No suppliers found in database.</p>";
} else {
    echo "<pre>" . print_r($suppliers, true) . "</pre>";
}

// Check Customers
$stmt = $db->query("SELECT * FROM customers");
$customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<h2>Customers (" . count($customers) . ")</h2>";
if (empty($customers)) {
    echo "<p style='color:red'>No customers found in database.</p>";
} else {
    echo "<pre>" . print_r($customers, true) . "</pre>";
}
