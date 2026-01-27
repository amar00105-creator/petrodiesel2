<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();
    $sql = file_get_contents(__DIR__ . '/migrate_roles.sql');

    // Split by semicolon if multiple statements, but prepared statements might not like multiple queries at once depending on driver
    // For this simple script, let's try execute raw if PDO allows, or split.
    // PDO::exec handles multiple if emulation is on, but let's be safe and split manually or use a loop.

    // Simple split by ; at end of line
    $statements = explode(';', $sql);

    foreach ($statements as $stmt) {
        $stmt = trim($stmt);
        if (!empty($stmt)) {
            $db->exec($stmt);
        }
    }

    echo "Migration successful!";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
    exit(1); // Exit with error code
}
