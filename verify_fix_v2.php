<?php
// Verify Fix with Session Mock
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Mock Session
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_name'] = 'Admin';
$_SESSION['station_id'] = 1;
$_SESSION['role'] = 'super_admin';

// Mock GET
$_GET['action'] = 'financial_flow';
$_GET['source_type'] = 'safe';
$_GET['source_id'] = '1';
$_GET['group_sales'] = 'daily';
$_GET['start_date'] = '2026-01-01';
$_GET['end_date'] = '2026-01-24';

// Environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_HOST'] = 'localhost'; // For db_config

// Autoloader (Copied from index.php)
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) require $file;
});

// Load Controller
require_once 'app/Config/Constants.php'; // Defines BASE_URL etc
try {
    $controller = new \App\Controllers\ReportsController();
    echo "Controller instantiated.\n";
    $controller->getFinancialFlow();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
