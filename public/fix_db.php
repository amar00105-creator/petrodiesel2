<?php
// Fix Database Schema via Browser
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;

$db = Database::connect();

echo "<h1>Fixing Database Schema</h1>";

try {
    // 1. Fix Tanks Table (Add current_price)
    $stmt = $db->query("SHOW COLUMNS FROM tanks LIKE 'current_price'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE tanks ADD COLUMN current_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER current_volume");
        echo "<p style='color: green'>✅ Added 'current_price' column to 'tanks'.</p>";
    } else {
        echo "<p style='color: blue'>ℹ️ 'current_price' already exists in 'tanks'.</p>";
    }

    // 2. Fix Purchases Table (Add offloading columns)
    $stmt = $db->query("SHOW COLUMNS FROM purchases LIKE 'offloading_start'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE purchases ADD COLUMN offloading_start DATETIME NULL AFTER status");
        $db->exec("ALTER TABLE purchases ADD COLUMN offloading_end DATETIME NULL AFTER offloading_start");
        echo "<p style='color: green'>✅ Added offloading timestamps to 'purchases'.</p>";
    } else {
        echo "<p style='color: blue'>ℹ️ Offloading timestamps already exist in 'purchases'.</p>";
    }

    // 3. Create purchase_offloads table
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
    $db->exec($sql);
    echo "<p style='color: green'>✅ Verified 'purchase_offloads' table.</p>";

    // 4. Add variance to tank_readings
    $stmt = $db->query("SHOW COLUMNS FROM tank_readings LIKE 'variance'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE tank_readings ADD COLUMN variance DECIMAL(10, 2) DEFAULT 0.00 AFTER volume_liters");
        echo "<p style='color: green'>✅ Added 'variance' column to 'tank_readings'.</p>";
    } else {
        echo "<p style='color: blue'>ℹ️ 'variance' column already exists in 'tank_readings'.</p>";
    }

} catch (PDOException $e) {
    echo "<p style='color: red'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<br><hr><a href='/PETRODIESEL/public/tanks'>Go Back to Tanks Dashboard</a>";
