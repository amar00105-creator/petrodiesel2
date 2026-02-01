<?php
require_once __DIR__ . '/app/Config/Database.php';

echo "=== Updating Timezone to Africa/Khartoum ===\n\n";

try {
    $db = \App\Config\Database::connect();

    // Check current value
    echo "1. Current timezone setting:\n";
    $stmt = $db->query("SELECT * FROM settings WHERE key_name = 'timezone'");
    $current = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($current) {
        echo "   Old Value: {$current['value']}\n\n";
    } else {
        echo "   No timezone setting found!\n\n";
    }

    // Update
    echo "2. Updating timezone...\n";
    $stmt = $db->prepare("UPDATE settings SET value = 'Africa/Khartoum', section = 'general' WHERE key_name = 'timezone'");
    $stmt->execute();

    echo "   ✅ Updated successfully!\n\n";

    // Verify
    echo "3. Verifying new value:\n";
    $stmt = $db->query("SELECT * FROM settings WHERE key_name = 'timezone'");
    $new = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($new) {
        echo "   New Value: {$new['value']}\n";
        echo "   Section: {$new['section']}\n";
        echo "   Updated At: {$new['updated_at']}\n\n";
    }

    echo "✅ Done! Now refresh your browser and check the header.\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
