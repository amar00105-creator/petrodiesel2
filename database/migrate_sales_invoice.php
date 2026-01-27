<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    // Check if column already exists to avoid errors on re-run
    $stmt = $db->query("SHOW COLUMNS FROM sales LIKE 'invoice_number'");
    $exists = $stmt->fetch();

    if (!$exists) {
        $sql = "ALTER TABLE sales ADD COLUMN invoice_number VARCHAR(20) DEFAULT NULL AFTER id";
        $db->exec($sql);
        echo "Column 'invoice_number' added successfully to 'sales' table.\n";
    } else {
        echo "Column 'invoice_number' already exists.\n";
    }

    // Optional: Index for performance
    $db->exec("CREATE INDEX IF NOT EXISTS idx_invoice_number ON sales(invoice_number)");
    echo "Index created/verified.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
