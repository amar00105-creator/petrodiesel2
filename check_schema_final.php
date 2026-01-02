<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;
$db = Database::connect();

function desc($table, $db) {
    echo "--- $table ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            echo $row['Field'] . " | " . $row['Type'] . "\n";
        }
    } catch(PDOException $e) { echo "Missing\n"; }
    echo "\n";
}

desc('stations', $db);
desc('users', $db);
desc('settings', $db);
