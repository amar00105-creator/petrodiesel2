<?php
// Debug Web Trace
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Mock Constants and Environment
define('BASE_URL', 'http://localhost/PETRODIESEL2/public');

// Mock Session for AuthHelper
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_name'] = 'Debug User';
$_SESSION['station_id'] = 1;
$_SESSION['role'] = 'super_admin';

// Mock Input
$_GET['action'] = 'financial_flow';
$_GET['source_type'] = 'safe';
$_GET['source_id'] = '1';
$_GET['group_sales'] = 'daily';
$_GET['start_date'] = '2026-01-01';
$_GET['end_date'] = '2026-01-24';

// Capture Output
ob_start();

try {
    // Autoloader
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/app/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) return;
        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) require $file;
    });

    // Helper Mocks if needed (AuthHelper relies on Session, so it should work)

    // Run Controller
    require_once 'app/Controllers/ReportsController.php';
    $controller = new \App\Controllers\ReportsController();
    $controller->getFinancialFlow();
} catch (Throwable $e) {
    echo "FATAL EXCEPTION: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}

$output = ob_get_clean();
echo "--- OUTPUT START ---\n";
echo $output;
echo "\n--- OUTPUT END ---\n";
