<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Database Connection Test</h2>";

$configPath = __DIR__ . '/app/Config/db_config.php';

if (!file_exists($configPath)) {
    echo "<p style='color:red'>Error: app/Config/db_config.php not found!</p>";
    echo "<p>Please ensure you have created this file with your live database credentials.</p>";
    exit;
}

$config = require $configPath;

echo "<p>Found config file. Attempting connection to host: <strong>" . ($config['host'] ?? 'unknown') . "</strong>...</p>";

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green; font-weight:bold'>✅ Connection Successful!</p>";

    // Test Query
    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetchColumn();
    echo "<p>Database Version: $version</p>";
} catch (PDOException $e) {
    echo "<p style='color:red; font-weight:bold'>❌ Connection Failed:</p>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
