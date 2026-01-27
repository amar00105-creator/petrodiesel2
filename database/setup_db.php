<?php
// database/setup_db.php

$host = 'localhost';
$username = 'root';
$password = ''; // As per config
$db_name = 'petrodiesel_db_new';

try {
    // Enable Multi-Statements for executing the entire SQL file at once
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
    ];

    // 1. Connect without DB
    $pdo = new PDO("mysql:host=$host", $username, $password, $options);

    echo "Cleaning up old database state...\n";
    // Drop the database to clear corrupt tablespace files
    $pdo->exec("DROP DATABASE IF EXISTS `$db_name`");
    echo "Dropped database '$db_name'.\n";

    echo "Creating database '$db_name'...\n";
    $pdo->exec("CREATE DATABASE `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // 2. Select DB
    $pdo->exec("USE `$db_name`");
    echo "Selected database '$db_name'.\n";

    // 3. Read schema.sql
    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        die("Error: schema.sql not found at $schemaFile\n");
    }

    echo "Reading schema from $schemaFile...\n";
    $sql = file_get_contents($schemaFile);

    echo "Executing full schema...\n";
    $pdo->exec($sql);

    echo "Schema imported successfully.\n";

    // 4. Seed Default Data 
    echo "Seeding default data...\n";

    // Default Station
    // Since we dropped DB, it's definitely empty.
    $pdo->exec("INSERT INTO stations (id, name, address, phone) VALUES (1, 'Main Station', 'Headquarters', '000-000-0000')");
    echo " - Default Station created.\n";

    // Default Admin User
    $adminEmail = 'admin@petrodiesel.net';
    $adminPass = password_hash('admin123', PASSWORD_DEFAULT);
    $insertUser = $pdo->prepare("INSERT INTO users (station_id, name, email, password_hash, role, status) VALUES (1, 'System Admin', ?, ?, 'super_admin', 'active')");
    $insertUser->execute([$adminEmail, $adminPass]);
    echo " - Default Admin user created.\n   Email: $adminEmail\n   Password: admin123\n";

    echo "Database setup finished successfully!\n";
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage() . "\n");
}
