<?php
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();
echo "Fixing Tanks Schema...\n";

try {
    // Check if column exists
    $stmt = $db->query("SHOW COLUMNS FROM tanks LIKE 'current_price'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE tanks ADD COLUMN current_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER current_volume");
        echo "✅ Added 'current_price' column to 'tanks'.\n";
    } else {
        echo "ℹ️ 'current_price' already exists.\n";
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "Done.\n";
