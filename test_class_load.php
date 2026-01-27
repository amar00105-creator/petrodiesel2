<?php
// Simple Class Test
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Loading autoloader...\n";
require_once 'c:/xampp/htdocs/PETRODIESEL2/public/index.php';
// Wait, index.php runs the app. I should just require the class manually to test it or use the autoloader logic.

// Let's copy the autoloader logic here for a clean test
spl_autoload_register(function ($class) {
    echo "Autoloading $class...\n";
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

echo "Instantiating TankCalibration...\n";
try {
    $model = new \App\Models\TankCalibration();
    echo "Class instantiated successfully!\n";

    echo "Calling calculateVolume...\n";
    $res = $model->calculateVolume(1, 1000); // Check if this crashes
    print_r($res);
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
