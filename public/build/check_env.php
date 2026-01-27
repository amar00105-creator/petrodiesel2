<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Environment Check</h1>";

// 1. Check BASE_URL
require_once __DIR__ . '/../app/Config/Constants.php';
echo "<p>BASE_URL: " . BASE_URL . "</p>";

// 2. Check Database
echo "<h2>Database Check</h2>";
try {
    require_once __DIR__ . '/../app/Config/Database.php';
    require_once __DIR__ . '/../app/Config/db_config.php';
    $db = \App\Config\Database::connect();
    echo "<p style='color:green'>Database Connection Successful</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>Database Error: " . $e->getMessage() . "</p>";
}

// 3. Check Views
echo "<h2>Views Check</h2>";
$viewPath = __DIR__ . '/../views/home/index.php';
if (file_exists($viewPath)) {
    echo "<p style='color:green'>View 'home/index.php' exists.</p>";
} else {
    echo "<p style='color:red'>View 'home/index.php' MISSING at $viewPath</p>";
}

// 4. Check Build Manifest
echo "<h2>Build Manifest Check</h2>";
$manifestPath = __DIR__ . '/build/.vite/manifest.json';
if (file_exists($manifestPath)) {
    echo "<p style='color:green'>Manifest exists.</p>";
    $manifest = json_decode(file_get_contents($manifestPath), true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "<p>Manifest is valid JSON.</p>";
        if (isset($manifest['resources/js/main.jsx'])) {
            echo "<p>Entry 'resources/js/main.jsx' found.</p>";
            $entry = $manifest['resources/js/main.jsx'];
            $file = __DIR__ . '/build/' . $entry['file'];
            if (file_exists($file)) {
                echo "<p style='color:green'>Asset file exists: {$entry['file']}</p>";
            } else {
                echo "<p style='color:red'>Asset file MISSING: {$entry['file']}</p>";
            }
        } else {
            echo "<p style='color:red'>Entry 'resources/js/main.jsx' NOT found in manifest.</p>";
        }
    } else {
        echo "<p style='color:red'>Manifest JSON Invalid.</p>";
    }
} else {
    echo "<p style='color:red'>Manifest MISSING at $manifestPath</p>";
}

// 5. Check PHP Extensions
echo "<h2>PHP Extensions</h2>";
$exts = get_loaded_extensions();
echo "<p>Loaded: " . implode(', ', $exts) . "</p>";
