<?php
require 'app/Config/Database.php';
$db = App\Config\Database::connect();
echo "Suppliers Count: " . $db->query('SELECT COUNT(*) FROM suppliers')->fetchColumn() . "\n";
echo "Customers Count: " . $db->query('SELECT COUNT(*) FROM customers')->fetchColumn() . "\n";
$first = $db->query('SELECT * FROM suppliers LIMIT 1')->fetch(\PDO::FETCH_ASSOC);
if ($first) echo "Sample Supplier: " . json_encode($first) . "\n";
