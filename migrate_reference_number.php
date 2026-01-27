<?php
require 'app/Config/Database.php';
$db = App\Config\Database::connect();
try {
    $db->exec("ALTER TABLE transactions ADD COLUMN reference_number VARCHAR(100) NULL AFTER description");
    echo "Column 'reference_number' added successfully to 'transactions' table.\n";
} catch (PDOException $e) {
    if ($e->getCode() == '42S21') {
        echo "Column 'reference_number' already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
