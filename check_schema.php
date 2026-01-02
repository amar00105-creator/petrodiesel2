<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();

function checkTable($db, $table) {
    echo "Checking $table:\n";
    try {
        $stmt = $db->query("SHOW COLUMNS FROM $table");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo implode(", ", $cols) . "\n";
    } catch (Exception $e) {
        echo "Table $table not found.\n";
    }
}

checkTable($db, 'pumps');
checkTable($db, 'counters');
checkTable($db, 'workers');
checkTable($db, 'tanks');
checkTable($db, 'settings');
