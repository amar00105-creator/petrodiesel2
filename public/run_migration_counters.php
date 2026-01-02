<?php
require_once __DIR__ . '/../app/Config/Database.php';
use App\Config\Database;

try {
    $db = Database::connect();
    
    // Add current_worker_id to counters
    $sql = "ALTER TABLE counters ADD COLUMN IF NOT EXISTS current_worker_id INT NULL DEFAULT NULL AFTER current_reading";
    $db->exec($sql);
    
    // Add FK (Clean way that works even if exists usually, or use raw SQL check)
    // MySQL doesn't support IF NOT EXISTS in ADD CONSTRAINT easily, so wrap in try/catch or procedure.
    // For simplicity in this environment, we'll try adding it and catch duplicates.
    try {
        $sql = "ALTER TABLE counters ADD CONSTRAINT fk_counter_worker FOREIGN KEY (current_worker_id) REFERENCES workers(id) ON DELETE SET NULL";
        $db->exec($sql);
    } catch (PDOException $ex) {
        // Ignored if already exists
    }
    
    echo "Migration successful: Added current_worker_id to counters.";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
