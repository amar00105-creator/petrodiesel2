<?php
header('Content-Type: text/plain');

$files = [
    '../app/Helpers/ViteHelper.php',
    '../views/layouts/main.php',
    'build/.vite/manifest.json'
];

echo "=== Deployment Verification ===\n";
echo "Server Time: " . date('Y-m-d H:i:s') . "\n\n";

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "[OK] $file exists.\n";
        echo "     Last Modified: " . date('Y-m-d H:i:s', filemtime($file)) . "\n";

        if ($file === '../app/Helpers/ViteHelper.php') {
            $content = file_get_contents($file);
            if (strpos($content, '?v={$version}') === false) {
                echo "     [PASS] Cache busting removed (Correct).\n";
            } else {
                echo "     [FAIL] Old version detected (Timestamp present).\n";
            }
        }

        if ($file === 'build/.vite/manifest.json') {
            $content = file_get_contents($file);
            $manifest = json_decode($content, true);
            if (isset($manifest['resources/js/main.jsx']['file'])) {
                echo "     [PASS] Manifest valid. Main file: " . $manifest['resources/js/main.jsx']['file'] . "\n";
            } else {
                echo "     [FAIL] Manifest invalid or missing main entry.\n";
            }
        }

        if ($file === '../views/layouts/main.php') {
            $content = file_get_contents($file);
            if (strpos($content, 'onclick="window.location.href=') !== false && strpos($content, '<a href=') === false) {
                echo "     [PASS] Sidebar uses onclick (Correct).\n";
            } else {
                echo "     [WARN] Sidebar might still contain <a> tags.\n";
            }
        }
    } else {
        echo "[MISSING] $file not found!\n";
    }
    echo "--------------------------\n";
}
