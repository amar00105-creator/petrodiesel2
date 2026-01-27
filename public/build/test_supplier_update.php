<?php
// Manual test for SupplierController

require_once __DIR__ . '/../public/index.php'; // Load autoloader and basic setup (but this executes router!)

// Actually, index.php executes router immediately at the end.
// We should copy the autoloader part only or just bypass index.php.

// Let's make a standalone test
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../app/Config/Constants.php';

// Autoloader logic from index.php
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    } else {
        echo "Autoload Failed for $class at $file\n";
    }
});

use App\Controllers\SupplierController;

echo "Instantiating SupplierController...\n";
try {
    $controller = new SupplierController();
    echo "Controller Instantiated.\n";

    // Mock POST request
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST['id'] = 1; // Assuming ID 1 exists
    $_POST['name'] = 'Test Supplier ' . rand(100, 999);
    $_POST['phone'] = '1234567890';

    echo "Calling update_ajax...\n";
    ob_start();
    $controller->update_ajax();
    $output = ob_get_clean();
    echo "Output: " . $output . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
} catch (\Error $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
