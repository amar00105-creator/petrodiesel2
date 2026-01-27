<?php
$config = require 'app/Config/db_config.php';
$pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']}", $config['username'], $config['password']);
// Check 'users' or 'staff'? AuthController uses 'Staff' model, verify table name there.
// View Staff model? No time. Let's try 'users' first, then 'staff'.
try {
    $row = $pdo->query("SELECT email FROM users LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        echo "User Email: " . $row['email'] . "\n";
    } else {
        echo "No users found in 'users' table.\n";
    }
} catch (Exception $e) {
    echo "Error querying users: " . $e->getMessage() . "\n";
}
