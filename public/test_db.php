<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Database Connection Test</h1>";

// EDIT THESE WITH YOUR LIVE SERVER DETAILS
$host = '127.0.0.1';
$db_name = 'petrodiesel_db'; // CHANGE THIS
$username = 'root';          // CHANGE THIS
$password = '';              // CHANGE THIS

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h2 style='color:green'>Connection Successful!</h2>";
    echo "Connected to database: " . $db_name;
} catch (PDOException $e) {
    echo "<h2 style='color:red'>Connection Failed</h2>";
    echo "Error: " . $e->getMessage();
}
