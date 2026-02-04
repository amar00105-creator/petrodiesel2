<?php
// public/update_timezone.php

require_once __DIR__ . '/../app/Config/Database.php';

$desired_timezone = 'Africa/Khartoum'; // Sudan Time

echo "<h1>Updating Timezone to $desired_timezone</h1>";

try {
    $db = \App\Config\Database::connect();

    // 1. Check if exists
    $stmt = $db->prepare("SELECT * FROM settings WHERE key_name = 'timezone' AND station_id IS NULL");
    $stmt->execute();
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $update = $db->prepare("UPDATE settings SET value = ? WHERE key_name = 'timezone' AND station_id IS NULL");
        $update->execute([$desired_timezone]);
        echo "Updated existing setting.<br>";
    } else {
        // Insert
        $insert = $db->prepare("INSERT INTO settings (key_name, value, station_id) VALUES ('timezone', ?, NULL)");
        $insert->execute([$desired_timezone]);
        echo "Inserted new setting.<br>";
    }

    echo "<strong style='color:green'>Success! Timezone set to $desired_timezone.</strong><br>";
    echo "<a href='test_timezone.php'>Check Diagnostic Again</a>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
