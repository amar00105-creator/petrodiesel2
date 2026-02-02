<?php

// Load timezone from database
$timezoneSet = false;
try {
    require_once __DIR__ . '/../app/Config/Database.php';
    $db = \App\Config\Database::connect();
    $stmt = $db->prepare("SELECT value FROM settings WHERE key_name = 'timezone' AND station_id IS NULL LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result && !empty($result['value'])) {
        $timezone = $result['value'];
        date_default_timezone_set($timezone);
        $timezoneSet = true;

        // Sync MySQL Timezone
        $offset = date('P');
        $db->exec("SET time_zone = '$offset'");
    }
} catch (Exception $e) {
    // Silence errors but continue
}

// Fallback if not set
if (!$timezoneSet) {
    date_default_timezone_set('Africa/Khartoum');
}

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
$router->add('POST', '/auth/verify_password', 'AuthController', 'verify_password');

// API Routes
$router->add('GET', '/api/server-time', 'ApiController', 'getServerTime');

// Station Management Routes
$router->add('GET', '/stations', 'StationController', 'index');
$router->add('GET', '/stations/create', 'StationController', 'create');
$router->add('POST', '/stations/create', 'StationController', 'create');
$router->add('GET', '/stations/edit', 'StationController', 'edit');
$router->add('POST', '/stations/update', 'StationController', 'update');
$router->add('POST', '/stations/delete', 'StationController', 'delete');
$router->add('POST', '/stations/save_ajax', 'StationController', 'save_ajax');
$router->add('POST', '/stations/delete_ajax', 'StationController', 'delete_ajax');
$router->add('POST', '/stations/assign_user', 'StationController', 'assign_user');

// Protected Routes
// We can handle protection inside the controller or use a middleware approach in router
// For simplicity, we check in controller constructor or method
$router->add('GET', '/', 'HomeController', 'index');
$router->add('POST', '/switchStation', 'HomeController', 'switchStation');

// Purchases Routes
$router->add('GET', '/purchases', 'PurchasesController', 'index');
$router->add('GET', '/purchases/create', 'PurchasesController', 'create');
$router->add('GET', '/purchases/edit', 'PurchasesController', 'edit'); // Added missing route
$router->add('POST', '/purchases/update', 'PurchasesController', 'update'); // Added missing route
$router->add('POST', '/purchases/store', 'PurchasesController', 'store');
$router->add('GET', '/purchases/offload', 'PurchasesController', 'offload');
$router->add('POST', '/purchases/processOffload', 'PurchasesController', 'processOffload');
$router->add('GET', '/purchases/getDriver', 'PurchasesController', 'getDriver');
$router->add('GET', '/purchases/getPending', 'PurchasesController', 'getPending');
$router->add('POST', '/purchases/processDischarge', 'PurchasesController', 'processDischarge');
$router->add('POST', '/purchases/storeDischarge', 'PurchasesController', 'storeDischarge'); // Keep for legacy/direct if needed
$router->add('POST', '/purchases/delete_ajax', 'PurchasesController', 'delete_ajax');

// Sales Routes
$router->add('GET', '/sales', 'SalesController', 'index');
$router->add('GET', '/sales/edit', 'SalesController', 'edit'); // Edit page
$router->add('GET', '/sales/invoice', 'SalesController', 'invoice'); // Invoice page
$router->add('GET', '/sales/create', 'SalesController', 'create');
$router->add('POST', '/sales/store', 'SalesController', 'store');
$router->add('GET', '/sales/getCounterDetails', 'SalesController', 'getCounterDetails');
$router->add('GET', '/sales/getNextInvoiceNumber', 'SalesController', 'getNextInvoiceNumber');
$router->add('POST', '/sales/delete_ajax', 'SalesController', 'delete_ajax');

// Tank Routes
$router->add('GET', '/tanks', 'TankController', 'index');
$router->add('GET', '/tanks/create', 'TankController', 'create');
$router->add('POST', '/tanks/store', 'TankController', 'store');
$router->add('GET', '/tanks/calibration', 'TankController', 'calibration');
$router->add('GET', '/tanks/calibration', 'TankController', 'calibration');
$router->add('POST', '/tanks/saveCalibration', 'TankController', 'saveCalibration');
// Added missing routes
$router->add('POST', '/tanks/update', 'TankController', 'update');
$router->add('POST', '/tanks/delete', 'TankController', 'delete');
$router->add('GET', '/tanks/getCalibrationPoints', 'TankController', 'getCalibrationPoints');
$router->add('POST', '/tanks/addCalibrationPoint', 'TankController', 'addCalibrationPoint');
$router->add('DELETE', '/tanks/deleteCalibrationPoint', 'TankController', 'deleteCalibrationPoint');
$router->add('GET', '/tanks/calculateVolume', 'TankController', 'calculateVolume');
$router->add('GET', '/tanks/calculateHeight', 'TankController', 'calculateHeight');
$router->add('POST', '/tanks/processSmartCalibration', 'TankController', 'processSmartCalibration');

// Simplified Calibration Routes (NEW)
$router->add('POST', '/calibrations/add', 'CalibrationController', 'add');
$router->add('POST', '/calibrations/update', 'CalibrationController', 'update');
$router->add('DELETE', '/calibrations/delete', 'CalibrationController', 'delete');
$router->add('POST', '/calibrations/delete', 'CalibrationController', 'delete');
$router->add('GET', '/calibrations/history', 'CalibrationController', 'getHistory');
$router->add('GET', '/calibrations/all', 'CalibrationController', 'getAll');

// Pumps Routes
$router->add('GET', '/pumps', 'PumpController', 'index');
$router->add('GET', '/pumps/create', 'PumpController', 'create');
$router->add('POST', '/pumps/store', 'PumpController', 'store');
$router->add('GET', '/pumps/manage', 'PumpController', 'manage');
$router->add('GET', '/pumps/edit', 'PumpController', 'edit');
$router->add('POST', '/pumps/updateBulk', 'PumpController', 'updateBulk');
$router->add('POST', '/pumps/updateCounter', 'PumpController', 'updateCounter');

// Expenses Routes
$router->add('GET', '/expenses', 'ExpensesController', 'index');
$router->add('GET', '/expenses/create', 'ExpensesController', 'create');

// Finance & Accounting Routes
$router->add('GET', '/finance', 'FinanceController', 'index');
$router->add('GET', '/accounting', 'FinanceController', 'index'); // Alias for user request
$router->add('GET', '/accounting/banks', 'FinanceController', 'banks');
$router->add('GET', '/accounting/safes', 'FinanceController', 'safes');
$router->add('GET', '/accounting/assets', 'FinanceController', 'assets');
$router->add('POST', '/finance/createSafe', 'FinanceController', 'createSafe');
$router->add('POST', '/finance/createBank', 'FinanceController', 'createBank');
$router->add('POST', '/finance/updateSafe', 'FinanceController', 'updateSafe');
$router->add('POST', '/finance/deleteSafe', 'FinanceController', 'deleteSafe');
$router->add('POST', '/finance/updateBank', 'FinanceController', 'updateBank');
$router->add('POST', '/finance/deleteBank', 'FinanceController', 'deleteBank');
$router->add('POST', '/finance/transfer', 'FinanceController', 'transfer');
$router->add('POST', '/finance/transfer', 'FinanceController', 'transfer');
$router->add('GET', '/finance/getBankDetails', 'FinanceController', 'getBankDetails');
$router->add('GET', '/finance/getSafeDetails', 'FinanceController', 'getSafeDetails');
$router->add('GET', '/finance/reports', 'FinanceController', 'reports'); // AJAX endpoint for Reports page

// Multi-Level Transfer System Routes
$router->add('POST', '/finance/requestTransfer', 'FinanceController', 'requestTransfer');
$router->add('GET', '/finance/transferRequests', 'FinanceController', 'getTransferRequests');
$router->add('POST', '/finance/approveTransfer', 'FinanceController', 'approveTransfer');
$router->add('POST', '/finance/rejectTransfer', 'FinanceController', 'rejectTransfer');
$router->add('GET', '/finance/banksForTransfer', 'FinanceController', 'getBanksForTransfer');

$router->add('GET', '/expenses/get_entities', 'ExpensesController', 'get_entities');
$router->add('POST', '/expenses/store', 'ExpensesController', 'store');
$router->add('POST', '/finance/storeTransaction', 'FinanceController', 'storeTransaction');
$router->add('POST', '/finance/updateTransaction', 'FinanceController', 'updateTransaction');
$router->add('POST', '/finance/deleteTransaction', 'FinanceController', 'deleteTransaction');
$router->add('POST', '/expenses/delete_ajax', 'ExpensesController', 'delete_ajax');
$router->add('POST', '/expenses/update_ajax', 'ExpensesController', 'update_ajax');

// Reports Routes
$router->add('GET', '/reports', 'ReportsController', 'index');

// Suppliers Routes
$router->add('GET', '/suppliers', 'SupplierController', 'index');
$router->add('POST', '/suppliers/store', 'SupplierController', 'store');
$router->add('POST', '/suppliers/api_create', 'SupplierController', 'api_create');
$router->add('POST', '/suppliers/update_ajax', 'SupplierController', 'update_ajax');
$router->add('POST', '/suppliers/delete_ajax', 'SupplierController', 'delete_ajax');

// Settings Routes
$router->add('GET', '/settings', 'SettingsController', 'index');
$router->add('POST', '/settings/update', 'SettingsController', 'update');
$router->add('POST', '/settings/save_fuel', 'SettingsController', 'saveFuel');
$router->add('POST', '/settings/delete_fuel', 'SettingsController', 'deleteFuel');
$router->add('POST', '/settings/save_role', 'SettingsController', 'saveRole');
$router->add('GET', '/settings/backup', 'SettingsController', 'backup');
$router->add('POST', '/settings/create_user', 'SettingsController', 'createUser');
$router->add('POST', '/settings/save_user', 'SettingsController', 'saveUser');
$router->add('POST', '/settings/delete_role', 'SettingsController', 'deleteRole');

// Roles Routes
$router->add('GET', '/roles', 'RolesController', 'index');
$router->add('GET', '/roles/create', 'RolesController', 'create');
$router->add('POST', '/roles/create', 'RolesController', 'create');
$router->add('GET', '/roles/edit', 'RolesController', 'edit');
$router->add('POST', '/roles/update', 'RolesController', 'update');
$router->add('POST', '/roles/delete', 'RolesController', 'delete');

// Workers Routes
$router->add('GET', '/workers', 'WorkerController', 'index');
$router->add('POST', '/workers/create_ajax', 'WorkerController', 'create_ajax');
$router->add('POST', '/workers/update_ajax', 'WorkerController', 'update_ajax');
$router->add('POST', '/workers/delete_ajax', 'WorkerController', 'delete_ajax');

// HR Routes
$router->add('GET', '/hr', 'HRController', 'index');
$router->add('GET', '/hr/api', 'HRController', 'handleApi');
$router->add('POST', '/hr/api', 'HRController', 'handleApi');

// Missing Pump Routes
$router->add('POST', '/pumps/delete', 'PumpController', 'delete');
$router->add('POST', '/pumps/delete_ajax', 'PumpController', 'delete_ajax');
$router->add('POST', '/pumps/deleteCounter', 'PumpController', 'deleteCounter');
$router->add('POST', '/pumps/updateCounterName', 'PumpController', 'updateCounterName');
$router->add('POST', '/pumps/addCounter', 'PumpController', 'addCounter');
$router->add('POST', '/pumps/update', 'PumpController', 'updatePump'); // For EditPumpModal.jsx
$router->add('POST', '/pumps/updatePump', 'PumpController', 'updatePump'); // For ManagePump.jsx

// Export Routes
$router->add('GET', '/export/financial-flow-pdf', 'ExportController', 'exportFinancialFlowPDF');
$router->add('GET', '/export/financial-flow-excel', 'ExportController', 'exportFinancialFlowExcel');

// Dispatch
$router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
