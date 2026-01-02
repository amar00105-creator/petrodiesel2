<?php
// Allow CORS for Flutter Web Development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoloader
spl_autoload_register(function ($class) {
    // Project-specific namespace prefix
    $prefix = 'App\\';

    // Base directory for the namespace prefix
    $base_dir = __DIR__ . '/../app/';

    // Does the class use the namespace prefix?
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        // no, move to the next registered autoloader
        return;
    }

    // Get the relative class name
    $relative_class = substr($class, $len);

    // Replace the namespace prefix with the base directory, replace namespace
    // separators with directory separators in the relative class name, append
    // with .php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // If the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});

require_once __DIR__ . '/../app/Config/Constants.php';

use App\Core\Router;

// Define Routes
$router = new Router();

$router->add('GET', '/login', 'AuthController', 'login');
$router->add('POST', '/login', 'AuthController', 'login');
$router->add('GET', '/logout', 'AuthController', 'logout');

// Station Management Routes
$router->add('GET', '/stations', 'StationController', 'index');
$router->add('GET', '/stations/create', 'StationController', 'create');
$router->add('POST', '/stations/create', 'StationController', 'create');
$router->add('GET', '/stations/edit', 'StationController', 'edit');
$router->add('POST', '/stations/update', 'StationController', 'update');
$router->add('POST', '/stations/delete', 'StationController', 'delete');

// Protected Routes
// We can handle protection inside the controller or use a middleware approach in router
// For simplicity, we check in controller constructor or method
$router->add('GET', '/', 'HomeController', 'index');

// Purchases Routes
$router->add('GET', '/purchases', 'PurchasesController', 'index');
$router->add('GET', '/purchases/create', 'PurchasesController', 'create');
$router->add('POST', '/purchases/store', 'PurchasesController', 'store');
$router->add('GET', '/purchases/offload', 'PurchasesController', 'offload');
$router->add('POST', '/purchases/processOffload', 'PurchasesController', 'processOffload');
$router->add('GET', '/purchases/getDriver', 'PurchasesController', 'getDriver');
// Supplier Management
$router->add('GET', '/purchases/suppliers', 'PurchasesController', 'suppliers');
$router->add('GET', '/purchases/api', 'PurchasesController', 'handleApi');
$router->add('POST', '/purchases/api', 'PurchasesController', 'handleApi');

// Sales Routes
$router->add('GET', '/sales', 'SalesController', 'index');
$router->add('GET', '/sales/create', 'SalesController', 'create');
$router->add('POST', '/sales/store', 'SalesController', 'store');
$router->add('GET', '/sales/getCounterDetails', 'SalesController', 'getCounterDetails');
// Customer Management
$router->add('GET', '/sales/customers', 'SalesController', 'customers');
$router->add('GET', '/sales/api', 'SalesController', 'handleApi');
$router->add('POST', '/sales/api', 'SalesController', 'handleApi');

// Tank Routes
$router->add('GET', '/tanks', 'TankController', 'index');
$router->add('GET', '/tanks/create', 'TankController', 'create');
$router->add('POST', '/tanks/store', 'TankController', 'store');
$router->add('GET', '/tanks/calibration', 'TankController', 'calibration');
$router->add('POST', '/tanks/saveCalibration', 'TankController', 'saveCalibration');

// Pumps Routes
$router->add('GET', '/pumps', 'PumpController', 'index');
$router->add('GET', '/pumps/create', 'PumpController', 'create');
$router->add('POST', '/pumps/store', 'PumpController', 'store');
$router->add('GET', '/pumps/manage', 'PumpController', 'manage');
$router->add('POST', '/pumps/updateCounter', 'PumpController', 'updateCounter');

// Expenses Routes
$router->add('GET', '/expenses', 'ExpensesController', 'index');
$router->add('GET', '/expenses/create', 'ExpensesController', 'create');

// Finance & Accounting Routes
$router->add('GET', '/finance', 'FinanceController', 'index');
$router->add('GET', '/accounting', 'FinanceController', 'index'); // Alias for user request
$router->add('POST', '/finance/createSafe', 'FinanceController', 'createSafe');
$router->add('POST', '/finance/createBank', 'FinanceController', 'createBank');
$router->add('POST', '/finance/transfer', 'FinanceController', 'transfer');
$router->add('POST', '/expenses/store', 'ExpensesController', 'store');

// Settings Routes
$router->add('GET', '/settings', 'SettingsController', 'index');
$router->add('POST', '/settings/update', 'SettingsController', 'update');

// Roles Routes
$router->add('GET', '/roles', 'RolesController', 'index');
$router->add('GET', '/roles/create', 'RolesController', 'create');
$router->add('POST', '/roles/create', 'RolesController', 'create');
$router->add('GET', '/roles/edit', 'RolesController', 'edit');
$router->add('POST', '/roles/update', 'RolesController', 'update');
$router->add('POST', '/roles/delete', 'RolesController', 'delete');

// HR Routes
$router->add('GET', '/hr', 'HRController', 'index');
$router->add('GET', '/hr/api', 'HRController', 'handleApi');
$router->add('POST', '/hr/api', 'HRController', 'handleApi');

// API V1 Routes (Mobile App)
$router->add('POST', '/api/v1/login', 'Api\AuthController', 'login');
$router->add('POST', '/api/v1/logout', 'Api\AuthController', 'logout');
$router->add('GET', '/api/v1/summary', 'Api\DashboardController', 'summary');
$router->add('GET', '/api/v1/tanks', 'Api\DashboardController', 'tanks');
$router->add('GET', '/api/v1/pumps', 'Api\SalesController', 'pumps');
$router->add('GET', '/api/v1/customers', 'Api\SalesController', 'customers');
$router->add('GET', '/api/v1/sales/history', 'Api\SalesController', 'history');
$router->add('POST', '/api/v1/sales/record', 'Api\SalesController', 'store');

// Finance API
$router->add('GET', '/api/v1/finance/balances', 'Api\FinanceController', 'balances');
$router->add('POST', '/api/v1/finance/transaction', 'Api\FinanceController', 'transaction');
$router->add('GET', '/api/v1/finance/history', 'Api\FinanceController', 'history');

// Dispatch
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
