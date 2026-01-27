<?php
require_once __DIR__ . '/../app/Config/Database.php';
$db = \App\Config\Database::connect();
$stmt = $db->query("DESCRIBE transactions");
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
