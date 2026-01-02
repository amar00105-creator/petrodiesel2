<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;

try {
    $db = Database::connect();
    echo "Connected to database.\n";

    // Add current_worker_id to counters
    echo "Adding current_worker_id to counters...\n";
    $sql = "ALTER TABLE counters ADD COLUMN IF NOT EXISTS current_worker_id INT NULL DEFAULT NULL AFTER current_reading";
    $db->exec($sql);
    
    // Add FK
    $sql = "ALTER TABLE counters ADD CONSTRAINT fk_counter_worker FOREIGN KEY IF NOT EXISTS (current_worker_id) REFERENCES workers(id) ON DELETE SET NULL";
    $db->exec($sql);
    
    echo "Migration successful: Added current_worker_id to counters.\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
