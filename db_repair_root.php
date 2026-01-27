<?php
// Standalone Database Repair Script
// Place this in the project root: C:\xampp\htdocs\PETRODIESEL2\db_repair_root.php

$host = 'localhost';
$db_name = 'petrodiesel_db';
$username = 'root';
$password = '';

echo "<h1>Database Repair Tool</h1>";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully.<br>";

    // 1. Check if 'invoice_number' column exists in 'sales'
    $stmt = $conn->query("SHOW COLUMNS FROM sales LIKE 'invoice_number'");
    $exists = $stmt->fetch();

    if (!$exists) {
        echo "Column 'invoice_number' missing. Adding it...<br>";

        // Add Column
        $conn->exec("ALTER TABLE sales ADD COLUMN invoice_number VARCHAR(50) DEFAULT NULL AFTER id");
        echo "Column added.<br>";

        // Backfill Data
        echo "Backfilling existing sales...<br>";
        $stmt = $conn->query("SELECT id, created_at FROM sales");
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $updateStmt = $conn->prepare("UPDATE sales SET invoice_number = ? WHERE id = ?");

        $count = 0;
        foreach ($sales as $sale) {
            // Generate basic invoice number for old records
            $date = $sale['created_at'] ?? date('Y-m-d H:i:s');
            $year = date('y', strtotime($date));
            $month = date('m', strtotime($date));
            $invoiceNum = 'S' . $year . $month . $sale['id'];

            $updateStmt->execute([$invoiceNum, $sale['id']]);
            $count++;
        }
        echo "Updated $count records.<br>";
        echo "<h2 style='color: green;'>Success! Database Fixed.</h2>";
    } else {
        echo "<h2 style='color: blue;'>Column 'invoice_number' already exists. No changes needed.</h2>";
    }
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Connection failed: " . $e->getMessage() . "</h2>";
}
