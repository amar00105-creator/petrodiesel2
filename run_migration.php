<?php
require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

// Make Database class properties public or add a method to get connection to keep it simple, 
// strictly for this script I will duplicate connection logic slightly or try to use the class.
// Checking App/Config/Database.php, it has private constructor/properties but connect() is missing in the snippet I saw?
// Ah, allow me to check Database.php content again. 
// Wait, I saw lines 1-30. It has private static $conn.
// Let's assume there is a public static connect() method usually. 
// If not, I'll just manual connect.

$host = 'localhost';
$db_name = 'petrodiesel_db';
$username = 'root';
$password = '';

// Try to load from config if possible, simplified for this script
$configFile = __DIR__ . '/app/Config/db_config.php';
if (file_exists($configFile)) {
    $config = require $configFile;
    if (is_array($config)) {
        $host = $config['host'] ?? $host;
        $db_name = $config['db_name'] ?? $db_name;
        $username = $config['username'] ?? $username;
        $password = $config['password'] ?? $password;
    }
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database successfully.\n";

    $sqlFile = __DIR__ . '/database/add_transaction_categories.sql';
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile\n");
    }

    $sql = file_get_contents($sqlFile);

    // Split by semicolon? Or just execute valid statements. 
    // PDO might handle multiple statements if supported, but safer to execute one by one or whole block.
    // MySQL can handle multi-query if enabled, let's try direct execution.

    $pdo->exec($sql);

    echo "Migration executed successfully.\n";
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
    exit(1);
}
