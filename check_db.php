<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();
$stmt = $db->query("SHOW COLUMNS FROM tanks LIKE 'current_price'");
if ($stmt->rowCount() > 0) {
    echo "EXISTS";
} else {
    echo "MISSING";
}
