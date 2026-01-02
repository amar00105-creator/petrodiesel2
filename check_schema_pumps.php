<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;
$db = Database::connect();

function describeTable($db, $table) {
    echo "Table: $table\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo " - " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
    } catch (PDOException $e) {
        echo " - Table not found or error.\n";
    }
    echo "\n";
}

describeTable($db, 'pumps');
describeTable($db, 'counters');
describeTable($db, 'workers');
describeTable($db, 'tanks');
