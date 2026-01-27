<?php
// debug_home.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting Debug...\n";

// Autoloader
spl_autoload_register(function ($class) {
    echo "Autoloading: $class\n";
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    } else {
        echo "Failed to load: $file\n";
    }
});

require_once __DIR__ . '/app/Config/Constants.php';

// Mock AuthHelper
// Since we are CLI, AuthHelper::user() might fail if it relies on Session.
// We need to verify if AuthHelper uses Session.
// Let's inspect AuthHelper first if we can, but likely it does.
// We can mock the session.

session_start();
// Set a dummy user in session for testing if not present
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; // Assuming 1 is admin
    $_SESSION['user_role'] = 'super_admin';
    $_SESSION['station_id'] = 1;
}

try {
    echo "Instantiating HomeController...\n";
    $controller = new \App\Controllers\HomeController();
    echo "Calling index()...\n";
    $controller->index();
    echo "Success!\n";
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
