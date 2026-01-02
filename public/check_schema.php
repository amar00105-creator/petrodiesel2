<?php
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;
$db = Database::connect();

function describe($db, $table) {
    try {
        $stmt = $db->query("DESCRIBE $table");
        echo "<b>$table</b><br>";
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
            echo $col['Field'] . " - " . $col['Type'] . "<br>";
        }
        echo "<hr>";
    } catch (Exception $e) {
        echo "$table not found<br><hr>";
    }
}

describe($db, 'pumps');
describe($db, 'counters');
