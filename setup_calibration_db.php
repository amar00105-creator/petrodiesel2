<?php
require_once __DIR__ . '/app/Config/Constants.php';
require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "Starting Database Setup...\n";

// 1. Create calibration_logs table
$sqlRaw = "CREATE TABLE IF NOT EXISTS calibration_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tank_id INT NOT NULL,
    user_id INT NULL,
    calibration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Readings
    stick_reading_cm DECIMAL(10, 2),
    sensor_reading_liters DECIMAL(10, 2),
    temperature_c DECIMAL(5, 2) NULL,
    
    -- Analysis
    actual_volume_liters DECIMAL(10, 2), -- Calculated from stick
    variance_liters DECIMAL(10, 2),
    error_percentage DECIMAL(5, 2),
    
    -- Result
    status ENUM('pass', 'warning', 'fail') DEFAULT 'pass',
    correction_factor DECIMAL(5, 4) DEFAULT 1.0000,
    report_json JSON NULL,
    notes TEXT NULL,
    
    INDEX (tank_id),
    FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE
)";

try {
    $db->exec($sqlRaw);
    echo "Table 'calibration_logs' check/create: OK\n";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}

// 2. Add Shape columns to Tanks table
$columnsToAdd = [
    'shape' => "VARCHAR(50) DEFAULT 'horizontal_cylinder'", // horizontal_cylinder, vertical_cylinder, rectangular
    'diameter' => "DECIMAL(10, 2) NULL",
    'length' => "DECIMAL(10, 2) NULL",
    'width' => "DECIMAL(10, 2) NULL",
    'height' => "DECIMAL(10, 2) NULL" // For rectangular, or vertical height
];

foreach ($columnsToAdd as $col => $def) {
    try {
        // Check if exists
        $check = $db->query("SHOW COLUMNS FROM tanks LIKE '$col'");
        if ($check->rowCount() == 0) {
            $db->exec("ALTER TABLE tanks ADD COLUMN $col $def");
            echo "Added column '$col' to tanks table.\n";
        } else {
            echo "Column '$col' already exists in tanks.\n";
        }
    } catch (PDOException $e) {
        echo "Error adding column $col: " . $e->getMessage() . "\n";
    }
}

echo "Database Setup Complete.\n";
