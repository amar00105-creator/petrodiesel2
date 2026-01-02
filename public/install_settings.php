<?php
// Standalone installer for Settings table

// 1. Basic Autoloader for Config/Database
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();
    echo "<h1>Database Connected Successfully</h1>";

    // 2. Create Table SQL
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id INT NULL,
        section VARCHAR(50) NOT NULL DEFAULT 'general',
        key_name VARCHAR(100) NOT NULL,
        value TEXT,
        type VARCHAR(20) DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_section (section),
        INDEX idx_key (key_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $db->exec($sql);
    echo "<div style='color: green; margin: 10px 0;'>Build Table 'settings': SUCCESS</div>";

    // 3. Seed Default Data (optional)
    // Check if empty
    $stmt = $db->query("SELECT COUNT(*) FROM settings");
    if ($stmt->fetchColumn() == 0) {
        $defaults = [
            // General
            ['section' => 'general', 'key' => 'app_name', 'value' => 'PetroDiesel ERP', 'type' => 'string'],
            ['section' => 'general', 'key' => 'language', 'value' => 'ar', 'type' => 'string'],
            // Fuel
            ['section' => 'fuel', 'key' => 'price_diesel', 'value' => '0', 'type' => 'string'], // or integer/float
            ['section' => 'fuel', 'key' => 'price_petrol', 'value' => '0', 'type' => 'string'],
            // Alerts
            ['section' => 'alerts', 'key' => 'low_stock_threshold', 'value' => '1000', 'type' => 'integer'],
            ['section' => 'alerts', 'key' => 'calibration_alert_days', 'value' => '30', 'type' => 'integer'],
        ];

        $insert = $db->prepare("INSERT INTO settings (section, key_name, value, type) VALUES (?, ?, ?, ?)");
        
        foreach ($defaults as $d) {
            $insert->execute([$d['section'], $d['key'], $d['value'], $d['type']]);
            echo "<div>Inserted default: {$d['key']}</div>";
        }
    } else {
        echo "<div>Table already has data. Skipping seeds.</div>";
    }

    echo "<h2>Installation Complete. You can now visit <a href='/PETRODIESEL/public/settings'>/settings</a></h2>";

} catch (PDOException $e) {
    echo "<h1 style='color: red'>Error: " . $e->getMessage() . "</h1>";
    die();
}
