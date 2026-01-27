<?php
// debug_connection.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Database Connection Debugger</h2>";

// Test 1: TCP/IP (127.0.0.1)
echo "<h3>Test 1: TCP/IP (127.0.0.1)</h3>";
try {
    $conn = new PDO("mysql:host=127.0.0.1;port=3306", "root", "");
    echo "✅ Connected successfully via 127.0.0.1<br>";
} catch (PDOException $e) {
    echo "❌ Failed: " . $e->getMessage() . "<br>";
}

// Test 2: Localhost (Socket/Pipe)
echo "<h3>Test 2: Localhost (default)</h3>";
try {
    $conn = new PDO("mysql:host=localhost", "root", "");
    echo "✅ Connected successfully via localhost<br>";
} catch (PDOException $e) {
    echo "❌ Failed: " . $e->getMessage() . "<br>";
}

// Test 3: Check Current Config
echo "<h3>Test 3: App Configuration</h3>";
$config = require 'app/Config/db_config.php';
echo "Config Host: " . htmlspecialchars($config['host']) . "<br>";
echo "Config DB: " . htmlspecialchars($config['db_name']) . "<br>";

try {
    $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['db_name'] . ";charset=utf8mb4";
    $conn = new PDO($dsn, $config['username'], $config['password']);
    echo "✅ App Config works!<br>";
} catch (PDOException $e) {
    echo "❌ App Config Failed: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<b>Advice:</b><br>";
echo "If all fail (Error 2002 'actively refused'), your MySQL service is likely STOPPED in XAMPP Control Panel.<br>";
echo "Please Open XAMPP -> Start MySQL.";
