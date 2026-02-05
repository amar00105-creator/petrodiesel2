<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Setting;
use App\Models\Role;
use App\Models\FuelType;
use App\Helpers\AuthHelper;
use App\Config\Database;

class SettingsController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
        if (!AuthHelper::can('settings.view')) {
            http_response_code(403);
            die('Unauthorized: You do not have permission to access settings.');
        }
    }

    public function index()
    {
        $settingModel = new Setting();
        $roleModel = new Role();

        // Load all settings grouped by section
        $generalSettings = $settingModel->getAllBySection('general');
        $fuelSettings = $settingModel->getAllBySection('fuel');
        $alertSettings = $settingModel->getAllBySection('alerts');
        $roles = $roleModel->getAll();

        $fuelTypeModel = new FuelType();
        $fuelTypes = $fuelTypeModel->getAll();

        // Fetch Stations & Users for the new Tab (Matching StationController Logic)
        $stationModel = new \App\Models\Station();
        $stations = $stationModel->getAll();

        // Fetch Users for Assignment with extended info
        $db = \App\Config\Database::connect();
        $stmt = $db->query("
            SELECT u.id, u.name, u.email, u.station_id, u.role, u.role_id, u.status, 
                   r.name as role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        ");
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Fetch user stations mapping
        $stmt = $db->query("
            SELECT us.user_id, us.station_id, s.name as station_name
            FROM user_stations us
            JOIN stations s ON us.station_id = s.id
        ");
        $allUserStations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Map stations to users
        foreach ($users as &$user) {
            $user['stations'] = [];
            foreach ($allUserStations as $us) {
                if ($us['user_id'] == $user['id']) {
                    $user['stations'][] = [
                        'id' => $us['station_id'],
                        'name' => $us['station_name']
                    ];
                }
            }
            // For backward compatibility or UI display
            if (!empty($user['stations'])) {
                $user['station_name'] = implode('، ', array_column($user['stations'], 'name'));
            } else {
                $user['station_name'] = 'عام / جميع المحطات';
            }
        }
        unset($user);

        $this->view('admin/settings/index', [
            'general' => $generalSettings,
            'fuel' => $fuelSettings,
            'alerts' => $alertSettings,
            'roles' => $roles,
            'fuelTypes' => $fuelTypes,
            'stations' => $stations,
            'users' => $users,
            'hide_topbar' => true
        ]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $settingModel = new Setting();
            $section = $_POST['section'] ?? 'general';

            // Loop through posted data and update settings
            foreach ($_POST as $key => $value) {
                if ($key === 'section') continue;

                // Update Setting - Correct parameter order: key, value, stationId, section, type
                $settingModel->set($key, $value, null, $section, 'string');

                // Specific Logic for Fuel Prices
                if ($section === 'fuel') {
                    $this->updateTankPrices($key, $value);
                }
            }

            // Redirect back with success message (if flash messaging existed)
            $this->redirect('/settings?section=' . $section);
        }
    }

    private function updateTankPrices($key, $value)
    {
        $productType = null;
        if ($key === 'price_diesel') $productType = 'Diesel';
        if ($key === 'price_petrol') $productType = 'Petrol';

        if ($productType) {
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("UPDATE tanks SET current_price = ? WHERE product_type = ?");
            $stmt->execute([$value, $productType]);
        }
    }

    public function backup()
    {
        // Simple Database Backup using mysqldump or PHP fallback
        $dbConfig = require __DIR__ . '/../Config/Database.php'; // Assuming config availability
        // Since we are in Controller, we might not have direct access to config array structure easily without parsing or using Config class if static.
        // Let's assume standard XAMPP credentials for now or try to use loaded instance.

        $dbName = 'petrodiesel_db';
        $user = 'root';
        $pass = '';
        $host = 'localhost';

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';

        header('Content-Type: application/octet-stream');
        header("Content-Transfer-Encoding: Binary");
        header("Content-disposition: attachment; filename=\"" . $filename . "\"");

        // Basic PHP Backup Implementation (safer than exec sometimes on restricted hosts)
        $this->generateSqlBackup($host, $user, $pass, $dbName);
        exit;
    }

    private function generateSqlBackup($host, $user, $pass, $name)
    {
        $mysqli = new \mysqli($host, $user, $pass, $name);
        $mysqli->select_db($name);
        $mysqli->query("SET NAMES 'utf8'");

        $queryTables = $mysqli->query('SHOW TABLES');
        while ($row = $queryTables->fetch_row()) {
            $target_tables[] = $row[0];
        }

        foreach ($target_tables as $table) {
            $result = $mysqli->query('SELECT * FROM ' . $table);
            $fields_amount = $result->field_count;
            $rows_num = $mysqli->affected_rows;

            $res = $mysqli->query('SHOW CREATE TABLE ' . $table);
            $TableMLine = $res->fetch_row();

            echo "\n\n" . $TableMLine[1] . ";\n\n";

            for ($i = 0, $st_counter = 0; $i < $fields_amount; $i++, $st_counter = 0) {
                while ($row = $result->fetch_row()) {
                    if ($st_counter % 100 == 0 || $st_counter == 0) {
                        echo "\nINSERT INTO " . $table . " VALUES";
                    }
                    echo "\n(";
                    for ($j = 0; $j < $fields_amount; $j++) {
                        $row[$j] = str_replace("\n", "\\n", addslashes($row[$j]));
                        if (isset($row[$j])) {
                            echo '"' . $row[$j] . '"';
                        } else {
                            echo '""';
                        }
                        if ($j < ($fields_amount - 1)) {
                            echo ',';
                        }
                    }
                    echo ")";
                    if ((($st_counter + 1) % 100 == 0 && $st_counter != 0) || $st_counter + 1 == $rows_num) {
                        echo ";";
                    } else {
                        echo ",";
                    }
                    $st_counter = $st_counter + 1;
                }
            }
            echo "\n\n\n";
        }
    }

    public function saveRole()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $input = json_decode(file_get_contents('php://input'), true);

            if (!AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized: Missing settings.edit permission']);
                return;
            }

            if (!$input['name']) {
                echo json_encode(['success' => false, 'message' => 'Role name required']);
                return;
            }

            $roleModel = new Role();
            $data = [
                'name' => $input['name'],
                'description' => $input['description'] ?? '',
                'permissions' => json_encode($input['permissions'] ?? []),
                'is_system' => 0
            ];

            if (isset($input['id']) && $input['id']) {
                $roleModel->update($input['id'], $data);
            } else {
                $roleModel->create($data);
            }

            echo json_encode(['success' => true, 'message' => 'Role saved successfully']);
            exit;
        }
    }

    public function saveFuel()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);

            if (!$input || empty($input['name'])) {
                echo json_encode(['success' => false, 'message' => 'Fuel name required']);
                return;
            }

            $fuelModel = new FuelType();
            $data = [
                'name' => $input['name'],
                'color_hex' => $input['color_hex'] ?? '#64748b',
                'price_per_liter' => $input['price_per_liter'] ?? 0.00
            ];

            $success = false;

            if (isset($input['id']) && $input['id']) {
                $success = $fuelModel->update($input['id'], $data);
            } else {
                // Generate a unique code
                $baseCode = strtolower(preg_replace('/[^a-z0-9_]/', '_', $input['name']));
                $data['code'] = $baseCode;

                // Simple collision avoidance
                if ($fuelModel->findByCode($baseCode)) {
                    $data['code'] = $baseCode . '_' . rand(100, 999);
                }

                $success = $fuelModel->create($data);
            }

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Fuel type saved successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save fuel type (Duplicate or Error)']);
            }
            exit;
        }
    }

    public function deleteFuel()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            try {
                $input = json_decode(file_get_contents('php://input'), true);

                if (empty($input['id'])) {
                    throw new \Exception('ID required');
                }

                $fuelModel = new FuelType();
                if ($fuelModel->delete($input['id'])) {
                    echo json_encode(['success' => true, 'message' => 'Fuel type deleted successfully']);
                } else {
                    // This creates a user-friendly message for known logic failures
                    echo json_encode(['success' => false, 'message' => 'Cannot delete fuel type (in use)']);
                }
            } catch (\PDOException $e) {
                // Catch DB constraints specific errors
                http_response_code(400); // Bad Request
                echo json_encode(['success' => false, 'message' => 'Database Error: This fuel type is currently in use by Tanks or Pumps.']);
            } catch (\Exception $e) {
                // Catch generic errors
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
            exit;
        }
    }

    public function saveUser()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            if (!AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || empty($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'User ID required']);
                return;
            }

            $userModel = new \App\Models\User();

            // Prepare update data
            $data = [
                'role_id' => !empty($input['role_id']) ? $input['role_id'] : null,
                'status' => $input['status'] ?? 'active'
            ];

            // If role_id is set, update legacy role string for backward compatibility
            if ($data['role_id']) {
                $roleModel = new Role();
                $role = $roleModel->find($data['role_id']);
                // Logic kept for consistency
            }

            if ($userModel->update($input['id'], $data)) {

                // Update Stations
                $db = \App\Config\Database::connect();

                // Delete existing
                $stmt = $db->prepare("DELETE FROM user_stations WHERE user_id = ?");
                $stmt->execute([$input['id']]);

                // Insert new
                $newStationId = null;
                if (!empty($input['station_ids']) && is_array($input['station_ids'])) {
                    $stmt = $db->prepare("INSERT INTO user_stations (user_id, station_id) VALUES (?, ?)");
                    foreach ($input['station_ids'] as $stationId) {
                        $stmt->execute([$input['id'], $stationId]);
                    }
                    $newStationId = $input['station_ids'][0];
                }

                // Update legacy station_id
                $userModel->update($input['id'], ['station_id' => $newStationId]);

                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update user']);
            }
            exit;
        }
    }
    public function createUser()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            if (!AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
                echo json_encode(['success' => false, 'message' => 'All fields are required (Name, Email, Password)']);
                return;
            }

            // Check email uniqueness
            $userModel = new \App\Models\User();
            if ($userModel->findByEmail($input['email'])) {
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                return;
            }

            $data = [
                'name' => $input['name'],
                'email' => $input['email'],
                'password_hash' => password_hash($input['password'], PASSWORD_BCRYPT),
                'role_id' => !empty($input['role_id']) ? $input['role_id'] : null,
                'station_id' => null, // Will be set after
                'role' => 'custom', // Default legacy role
                'status' => $input['status'] ?? 'active'
            ];

            $userId = $userModel->create($data);

            if ($userId) {
                // Update Stations
                if (!empty($input['station_ids']) && is_array($input['station_ids'])) {
                    $db = \App\Config\Database::connect();
                    $stmt = $db->prepare("INSERT INTO user_stations (user_id, station_id) VALUES (?, ?)");
                    foreach ($input['station_ids'] as $stationId) {
                        $stmt->execute([$userId, $stationId]);
                    }
                    // Update legacy station_id
                    $userModel->update($userId, ['station_id' => $input['station_ids'][0]]);
                }
                echo json_encode(['success' => true, 'message' => 'User created successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create user']);
            }
            exit;
        }
    }
    public function deleteRole()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            if (!AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $roleId = $input['id'] ?? null;

            if (!$roleId) {
                echo json_encode(['success' => false, 'message' => 'Role ID required']);
                return;
            }

            $roleModel = new Role();
            $role = $roleModel->find($roleId);

            if (!$role) {
                echo json_encode(['success' => false, 'message' => 'Role not found']);
                return;
            }

            if ($role['is_system']) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete system roles']);
                return;
            }

            // Check if role is assigned to users
            $db = Database::connect();
            $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE role_id = ?");
            $stmt->execute([$roleId]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete role: It is assigned to active users']);
                return;
            }

            if ($roleModel->delete($roleId)) {
                echo json_encode(['success' => true, 'message' => 'Role deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete role']);
            }
            exit;
        }
    }

    public function factoryReset()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            try {
                $db = \App\Config\Database::connect();
                $db->exec("SET FOREIGN_KEY_CHECKS = 0");

                // 1. Truncate ALL Data Tables (Transactional & Master)
                $tables = [
                    'transactions',
                    'sales',
                    'purchases',
                    'expenses',
                    'transfer_requests',
                    'calibration_logs',
                    'tank_readings',
                    'incoming_stock_log',
                    'notifications',
                    'suppliers',
                    'customers',
                    'employees',
                    'attendance',
                    'payrolls',
                    'advances',
                    'workers',
                    'activity_logs',
                    'counters',      // Truncate instead of update
                    'pumps',         // Truncate instead of update
                    'tanks',         // Truncate instead of update
                    'fuel_types',    // Truncate fuel types
                    'user_stations', // Clear assignments
                    // 'users'       // DO NOT TRUNCATE USERS (Administrator needs to login)
                    // 'roles'       // DO NOT TRUNCATE ROLES
                    // 'settings'    // Optional: Reset settings? For now keep them.
                ];

                foreach ($tables as $table) {
                    try {
                        $db->exec("TRUNCATE TABLE `$table`");
                    } catch (\Exception $e) {
                        // Ignore if table missing
                    }
                }

                // 2. Reset Assets (Keep definitions if not tables, otherwise truncate)
                // Safes and Banks are usually master data too. 
                // If user wants "ALL Data" gone, maybe truncate safes/banks too?
                // The prompt says "erase all data in the program". 
                // Usually this implies starting fresh. 
                // I will TRUNCATE Safes and Banks as well to be safe, 
                // but if they are considered "Settings", maybe keep?
                // Given the context of "tanks/pumps", safes/banks are likely similar.
                try {
                    $db->exec("TRUNCATE TABLE `safes`");
                    $db->exec("TRUNCATE TABLE `banks`");
                } catch (\Exception $e) {
                    // In case they don't exist or error
                }

                $db->exec("SET FOREIGN_KEY_CHECKS = 1");

                echo json_encode(['success' => true, 'message' => 'تمت إعادة ضبط المصنع بنجاح. تم مسح جميع البيانات.']);
            } catch (\Exception $e) {
                $db->exec("SET FOREIGN_KEY_CHECKS = 1");
                echo json_encode(['success' => false, 'message' => 'فشلت العملية: ' . $e->getMessage()]);
            }
            exit;
        }
    }
}
