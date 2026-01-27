<?php
// Simple script to check DB data
require_once __DIR__ . '/app/Config/Database.php'; // Ad-hoc path adjustment if needed
// Actually, let's just use raw PDO to be self-contained or rely on Autoloader if I include index logic
// Simpler: Just connect and query.

$host = 'localhost';
$db   = 'petrodiesel_db'; // Assuming name, let's check config if not sure but usually it is.
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    $stmt = $pdo->query("SELECT count(*) as count FROM suppliers");
    $suppliers = $stmt->fetch();
    echo "Suppliers Count: " . $suppliers['count'] . "\n";

    $stmt = $pdo->query("SELECT count(*) as count FROM customers");
    $customers = $stmt->fetch();
    echo "Customers Count: " . $customers['count'] . "\n";

    $stmt = $pdo->query("SELECT * FROM suppliers LIMIT 5");
    print_r($stmt->fetchAll());
} catch (\PDOException $e) {
    echo "DB Error: " . $e->getMessage();
}
