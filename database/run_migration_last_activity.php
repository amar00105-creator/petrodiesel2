<?php

/**
 * Migration Runner: Add last_activity column to users table
 * Run this file once to add the last_activity tracking
 */

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    echo "Starting migration: Add last_activity to users table...\n";

    // Check if column already exists
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'last_activity'");
    $exists = $stmt->fetch();

    if ($exists) {
        echo "✓ Column 'last_activity' already exists. Skipping...\n";
    } else {
        // Add the column
        $db->exec("ALTER TABLE users ADD COLUMN last_activity TIMESTAMP NULL DEFAULT NULL AFTER status");
        echo "✓ Column 'last_activity' added successfully!\n";

        // Update existing active users
        $db->exec("UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE status = 'active'");
        echo "✓ Updated existing users with current timestamp\n";
    }

    echo "\n✅ Migration completed successfully!\n";
    echo "Active users will now be tracked in real-time (last 5 minutes activity).\n";
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
