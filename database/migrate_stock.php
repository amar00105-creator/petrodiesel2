<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "Starting Stock & Tanks Migration...\n";

// 1. Add 'variance' to tank_readings if not exists
try {
    $stmt = $db->query("SHOW COLUMNS FROM tank_readings LIKE 'variance'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE tank_readings ADD COLUMN variance DECIMAL(10, 2) DEFAULT 0.00 AFTER volume_liters");
        echo "✅ Added 'variance' column to 'tank_readings'.\n";
    } else {
        echo "ℹ️ 'variance' column already exists in 'tank_readings'.\n";
    }
} catch (PDOException $e) {
    echo "❌ Error updating tank_readings: " . $e->getMessage() . "\n";
}

// 2. Add offloading timestamps to purchases
try {
    $stmt = $db->query("SHOW COLUMNS FROM purchases LIKE 'offloading_start'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE purchases ADD COLUMN offloading_start DATETIME NULL AFTER status");
        $db->exec("ALTER TABLE purchases ADD COLUMN offloading_end DATETIME NULL AFTER offloading_start");
        echo "✅ Added offloading timestamps to 'purchases'.\n";
    } else {
        echo "ℹ️ Offloading timestamps already exist in 'purchases'.\n";
    }
} catch (PDOException $e) {
    echo "❌ Error updating purchases: " . $e->getMessage() . "\n";
}

// 3. Create purchase_offloads table for split offloading
$sql = "CREATE TABLE IF NOT EXISTS purchase_offloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    tank_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    offload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (tank_id) REFERENCES tanks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

try {
    $db->exec($sql);
    echo "✅ Created/Verified 'purchase_offloads' table.\n";
} catch (PDOException $e) {
    echo "❌ Error creating purchase_offloads table: " . $e->getMessage() . "\n";
}

echo "Migration Completed.\n";
