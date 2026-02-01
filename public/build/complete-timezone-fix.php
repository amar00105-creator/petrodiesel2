<?php

/**
 * Complete Timezone Fix Script
 * This script will:
 * 1. Update timezone in database
 * 2. Test API endpoint
 * 3. Provide clear instructions
 */

require_once __DIR__ . '/../app/Config/Database.php';

echo "<html><head><meta charset='UTF-8'><style>
body { font-family: Arial; padding: 20px; background: #f0f0f0; }
.box { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h1 { color: #2196F3; }
h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
.success { color: #4CAF50; font-weight: bold; }
.error { color: #f44336; font-weight: bold; }
.info { background: #E3F2FD; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
</style></head><body>";

echo "<h1>🔧 Complete Timezone Fix</h1>";

// Step 1: Update Database
echo "<div class='box'><h2>Step 1: Update Database</h2>";
try {
    $db = \App\Config\Database::connect();

    // Check current
    $stmt = $db->query("SELECT * FROM settings WHERE key_name = 'timezone'");
    $current = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($current) {
        echo "<p>Current timezone: <code>{$current['value']}</code></p>";

        if ($current['value'] !== 'Africa/Khartoum') {
            $stmt = $db->prepare("UPDATE settings SET value = 'Africa/Khartoum', section = 'general' WHERE key_name = 'timezone'");
            $stmt->execute();
            echo "<p class='success'>✅ Updated to Africa/Khartoum</p>";
        } else {
            echo "<p class='success'>✅ Already set to Africa/Khartoum</p>";
        }
    } else {
        // Insert
        $stmt = $db->prepare("INSERT INTO settings (station_id, section, key_name, value, type) VALUES (NULL, 'general', 'timezone', 'Africa/Khartoum', 'string')");
        $stmt->execute();
        echo "<p class='success'>✅ Inserted Africa/Khartoum</p>";
    }

    // Verify
    $stmt = $db->query("SELECT value FROM settings WHERE key_name = 'timezone'");
    $final = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Final Value: <code>{$final['value']}</code></p>";
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: {$e->getMessage()}</p>";
}
echo "</div>";

// Step 2: Test PHP Timezone
echo "<div class='box'><h2>Step 2: PHP Server Timezone</h2>";
echo "<p>Current PHP Timezone: <code>" . date_default_timezone_get() . "</code></p>";
echo "<p>Current Server Time: <code>" . date('Y-m-d H:i:s') . "</code></p>";
echo "</div>";

// Step 3: Test API
echo "<div class='box'><h2>Step 3: Test API Endpoint</h2>";
echo "<p>Testing: <code>/api/server-time</code></p>";
echo "<div id='api-test'>Testing...</div>";
echo "<script>
fetch('/PETRODIESEL2/public/api/server-time')
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            document.getElementById('api-test').innerHTML = `
                <p class='success'>✅ API Works!</p>
                <p>Timezone: <code>\${data.timezone}</code></p>
                <p>Date: <code>\${data.date}</code></p>
                <p>Time: <code>\${data.time}</code></p>
            `;
        } else {
            document.getElementById('api-test').innerHTML = '<p class=\"error\">❌ API returned error</p>';
        }
    })
    .catch(err => {
        document.getElementById('api-test').innerHTML = '<p class=\"error\">❌ API Failed: ' + err.message + '</p>';
    });
</script>";
echo "</div>";

// Step 4: Instructions
echo "<div class='box'><h2>Step 4: Final Steps</h2>";
echo "<div class='info'>";
echo "<p><strong>1. Make sure you ran:</strong></p>";
echo "<code>npm run build</code>";
echo "<p><strong>2. Clear browser cache:</strong></p>";
echo "<p>Press <code>Ctrl + Shift + R</code> on any page</p>";
echo "<p><strong>3. Check the header:</strong></p>";
echo "<p>The time should now match server time (Africa/Khartoum timezone)</p>";
echo "<p><strong>4. If still not working:</strong></p>";
echo "<p>Open browser console (F12) and check for errors related to <code>/api/server-time</code></p>";
echo "</div>";
echo "</div>";

echo "</body></html>";
