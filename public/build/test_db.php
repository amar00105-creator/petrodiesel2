<?php
// Simple Database Connection Test
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Test</h1>";

// Load config
$configPath = __DIR__ . '/../app/Config/db_config.php';
if (!file_exists($configPath)) {
    die("Config file not found at: $configPath");
}

$config = require $configPath;

echo "<p>Environment detected as: <strong>" . (in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1']) ? 'LOCAL' : 'LIVE') . "</strong></p>";

// Validate config
$requiredKeys = ['host', 'db_name', 'username', 'password'];
$missingKeys = [];
foreach ($requiredKeys as $key) {
    if (!isset($config[$key])) {
        $missingKeys[] = $key;
    }
}

if (!empty($missingKeys)) {
    echo "<h2 style='color: red;'>Configuration Error</h2>";
    echo "<p>Missing keys in db_config.php: " . implode(', ', $missingKeys) . "</p>";
    echo "<p>Please ensure your db_config.php returns an array with ALL these keys: host, db_name, username, password.</p>";
    die();
}

echo "<p>Attempting to connect with:</p>";
echo "<ul>";
echo "<li>Host: " . htmlspecialchars($config['host']) . "</li>";
echo "<li>Database: " . htmlspecialchars($config['db_name']) . "</li>";
echo "<li>User: " . htmlspecialchars($config['username']) . "</li>";
echo "</ul>";

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h2 style='color: green;'>Connection Successful!</h2>";
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Connection Failed</h2>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";

    // Attempt fallback to check if credentials are valid but DB name is wrong
    if ($e->getCode() == 1044 || strpos($e->getMessage(), '1044') !== false || strpos($e->getMessage(), 'Access denied') !== false) {
        echo "<hr><h3>Diagnostics</h3>";
        echo "<p>Attempting to connect without database name to list available databases...</p>";
        try {
            $dsn_fallback = "mysql:host={$config['host']};charset=utf8mb4";
            $pdo_fallback = new PDO($dsn_fallback, $config['username'], $config['password']);
            $pdo_fallback->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            echo "<p style='color: green;'><strong>Credentials are VALID!</strong> The issue is likely the Database Name or Permissions.</p>";

            $stmt = $pdo_fallback->query("SHOW DATABASES");
            $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

            echo "<p>Available Databases for this user:</p>";
            echo "<ul>";
            foreach ($databases as $db) {
                echo "<li>" . htmlspecialchars($db) . "</li>";
            }
            echo "</ul>";
            echo "<p>Please update <code>db_name</code> in <code>app/Config/db_config.php</code> to match one of the above.</p>";
        } catch (PDOException $e2) {
            echo "<p style='color: red;'>Could not list databases. Error: " . htmlspecialchars($e2->getMessage()) . "</p>";
            echo "<p>This likely means the user '<strong>" . htmlspecialchars($config['username']) . "</strong>' requires specific permissions assigned in cPanel.</p>";
        }
    }
}
