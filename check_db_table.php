<?php
// Check DB Tables
$config = require 'app/Config/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to DB: {$config['db_name']}\n";

    $tables = $pdo->query("SHOW TABLES LIKE 'calibration_tables'")->fetchAll();
    if (count($tables) > 0) {
        echo "Table 'calibration_tables' EXISTS.\n";
        // Check columns
        $columns = $pdo->query("DESCRIBE calibration_tables")->fetchAll(PDO::FETCH_COLUMN);
        echo "Columns: " . implode(", ", $columns) . "\n";
    } else {
        echo "Table 'calibration_tables' DOES NOT EXIST.\n";

        // Create it if missing?
        echo "Attempting to create table...\n";
        $sql = "CREATE TABLE `calibration_tables` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `tank_id` int(11) NOT NULL,
          `height_mm` decimal(10,2) NOT NULL,
          `volume_liters` decimal(10,2) NOT NULL,
          `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `tank_id` (`tank_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

        $pdo->exec($sql);
        echo "Table created successfully!\n";
    }
} catch (PDOException $e) {
    echo "DB ERROR: " . $e->getMessage() . "\n";
}
