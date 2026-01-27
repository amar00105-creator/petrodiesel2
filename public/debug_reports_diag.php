<?php
// Retrieve configuration
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Reports Debugger</h1>";

// 1. Check Root Path
$root = dirname(__DIR__);
echo "<p>Root Path: $root</p>";

// 2. Load Config/Init
if (!file_exists($root . '/app/Config/Constants.php')) {
    die("❌ Constants.php not found at " . $root . '/app/Config/Constants.php');
}
require_once $root . '/app/Config/Constants.php';

// 3. Autoload / Manual Includes
// Mimic index.php or Controller loading
require_once $root . '/app/Core/Controller.php';
require_once $root . '/app/Core/Database.php'; // Check filename!
require_once $root . '/app/Config/Database.php';

// 4. Try Loading ReportsController
$controllerPath = $root . '/app/Controllers/ReportsController.php';
if (!file_exists($controllerPath)) {
    die("❌ ReportsController.php not found at $controllerPath");
}

echo "<p>✅ ReportsController file found.</p>";

try {
    require_once $controllerPath;
    echo "<p>✅ ReportsController file included.</p>";
} catch (Throwable $e) {
    echo "<div style='color:red'>Measured Crash during include: " . $e->getMessage() . "</div>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    exit;
}

// 5. Instantiate
try {
    // Mock AuthHelper if needed, or just let it fail but catch it
    // ReportsController constructor calls AuthHelper::requireLogin()
    // We might need to mock AuthHelper::requireLogin to do nothing for this test

    // Quick Hack: process raw file content? No, better to see where it fails.

    if (!class_exists('App\Controllers\ReportsController')) {
        die("❌ Class App\Controllers\ReportsController not found.");
    }

    echo "<p>✅ Class exists. Attempting instantiation (may fail due to Auth or Models)...</p>";

    // We can't easily instantiate if it requires Auth.
    // However, we can check if the file syntax is valid and dependencies are met.
    // The previous error was likely "Class 'App\Models\Purchase' not found".
    // Instantiation will trigger constructor -> new Purchase().

    // Let's manually check the deps that ReportsController uses
    $models = ['Sale', 'Tank', 'Supplier', 'Customer', 'Transaction', 'Purchase', 'Worker'];
    foreach ($models as $m) {
        $mPath = $root . '/app/Models/' . $m . '.php';
        if (file_exists($mPath)) {
            echo "<p>✅ Model file $m.php found.</p>";
            require_once $mPath;
            if (class_exists("App\\Models\\$m")) {
                echo "<p>   - Class App\\Models\\$m exists.</p>";
            } else {
                echo "<p style='color:red'>   - ❌ Class App\\Models\\$m NOT found!</p>";
            }
        } else {
            echo "<p style='color:red'>❌ Model file $m.php NOT found!</p>";
        }
    }
} catch (Throwable $e) {
    echo "<div style='color:red'>Crash: " . $e->getMessage() . "</div>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
