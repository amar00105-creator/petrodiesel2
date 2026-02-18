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
        $db = \App\Config\Database::connect();
        $user = AuthHelper::user();
        $isSuperAdmin = AuthHelper::isSuperAdmin();
        $userPermissions = $_SESSION['permissions'] ?? [];

        // Load all settings grouped by section
        $generalSettings = $settingModel->getAllBySection('general');
        $fuelSettings = $settingModel->getAllBySection('fuel');
        $alertSettings = $settingModel->getAllBySection('alerts');

        $fuelTypeModel = new FuelType();
        $fuelTypes = $fuelTypeModel->getAll();

        // Only load roles, users, stations if user has security tab access
        $roles = [];
        $users = [];
        $stations = [];

        // STRICT: Only super admin can access roles & users (security tab)
        $canAccessSecurity = $isSuperAdmin;

        if ($canAccessSecurity) {
            $roleModel = new Role();
            $roles = $roleModel->getAll();

            // Fetch Stations
            $stationModel = new \App\Models\Station();
            if ($isSuperAdmin) {
                $stations = $stationModel->getAll();
            } else {
                // Non-super-admin: show only their assigned stations from user_stations table
                $stmtUserStations = $db->prepare("
                    SELECT s.* FROM stations s
                    JOIN user_stations us ON s.id = us.station_id
                    WHERE us.user_id = ?
                ");
                $stmtUserStations->execute([$user['id']]);
                $stations = $stmtUserStations->fetchAll(\PDO::FETCH_ASSOC);
                // Fallback to legacy station_id if no user_stations entries
                if (empty($stations) && $user['station_id']) {
                    $currentStation = $stationModel->find($user['station_id']);
                    $stations = $currentStation ? [$currentStation] : [];
                }
            }

            // Fetch Users — non-super-admin only sees users in their own stations
            if ($isSuperAdmin) {
                $userSql = "SELECT u.id, u.name, u.username, u.email, u.station_id, u.role, u.role_id, u.status, 
                                   r.name as role_name 
                            FROM users u
                            LEFT JOIN roles r ON u.role_id = r.id";
                $stmt = $db->prepare($userSql);
                $stmt->execute();
            } else {
                // Only show users that share at least one station with the current user
                $userSql = "SELECT DISTINCT u.id, u.name, u.username, u.email, u.station_id, u.role, u.role_id, u.status, 
                                   r.name as role_name 
                            FROM users u
                            LEFT JOIN roles r ON u.role_id = r.id
                            LEFT JOIN user_stations us ON u.id = us.user_id
                            WHERE us.station_id IN (
                                SELECT station_id FROM user_stations WHERE user_id = ?
                            ) OR u.station_id = ?";
                $stmt = $db->prepare($userSql);
                $stmt->execute([$user['id'], $user['original_station_id'] ?? $user['station_id']]);
            }
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch user stations mapping
            $stmtMapping = $db->query("
                SELECT us.user_id, us.station_id, s.name as station_name
                FROM user_stations us
                JOIN stations s ON us.station_id = s.id
            ");
            $allUserStations = $stmtMapping->fetchAll(\PDO::FETCH_ASSOC);

            // Map stations to users
            foreach ($users as &$u) {
                $u['stations'] = [];
                foreach ($allUserStations as $us) {
                    if ($us['user_id'] == $u['id']) {
                        $u['stations'][] = [
                            'id' => $us['station_id'],
                            'name' => $us['station_name']
                        ];
                    }
                }
                if (!empty($u['stations'])) {
                    $u['station_name'] = implode('، ', array_column($u['stations'], 'name'));
                } else {
                    $u['station_name'] = 'عام / جميع المحطات';
                }
            }
            unset($u);
        } else {
            // For stations tab (non-security), load minimal station data
            $canAccessStations = in_array('settings.stations', $userPermissions) || in_array('*', $userPermissions);
            if ($canAccessStations) {
                $stationModel = new \App\Models\Station();
                if ($isSuperAdmin) {
                    $stations = $stationModel->getAll();
                } else {
                    $stmtUserStations = $db->prepare("
                        SELECT s.* FROM stations s
                        JOIN user_stations us ON s.id = us.station_id
                        WHERE us.user_id = ?
                    ");
                    $stmtUserStations->execute([$user['id']]);
                    $stations = $stmtUserStations->fetchAll(\PDO::FETCH_ASSOC);
                    if (empty($stations) && $user['station_id']) {
                        $currentStation = $stationModel->find($user['station_id']);
                        $stations = $currentStation ? [$currentStation] : [];
                    }
                }
            }
        }

        $this->view('admin/settings/index', [
            'general' => $generalSettings,
            'fuel' => $fuelSettings,
            'alerts' => $alertSettings,
            'roles' => $roles,
            'fuelTypes' => $fuelTypes,
            'stations' => $stations,
            'users' => $users,
            'isSuperAdmin' => $isSuperAdmin,
            'userPermissions' => $userPermissions,
            'hide_topbar' => true
        ]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Permission check: require settings.edit
            if (!AuthHelper::can('settings.edit') && !AuthHelper::isSuperAdmin()) {
                http_response_code(403);
                die('Unauthorized: Missing settings.edit permission');
            }

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
        // Permission check
        if (!AuthHelper::isSuperAdmin() && !AuthHelper::can('settings.backup')) {
            http_response_code(403);
            die('غير مصرح: لا تملك صلاحية النسخ الاحتياطي');
        }

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

            // STRICT: Only super admin can manage roles
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه إدارة الأدوار']);
                exit;
            }

            $isEditing = isset($input['id']) && $input['id'];

            if (empty($input['name'])) {
                echo json_encode(['success' => false, 'message' => 'Role name required']);
                exit;
                return;
            }

            // Privilege escalation prevention
            $permissions = $input['permissions'] ?? [];
            if (is_string($permissions)) {
                $permissions = json_decode($permissions, true) ?? [];
            }

            if (!AuthHelper::isSuperAdmin()) {
                // Non-super-admin cannot assign wildcard (*) permission
                if (in_array('*', $permissions)) {
                    echo json_encode(['success' => false, 'message' => 'غير مصرح: لا يمكنك منح صلاحيات المدير العام']);
                    exit;
                    return;
                }

                // Non-super-admin cannot assign permissions they don't have themselves
                $myPermissions = $_SESSION['permissions'] ?? [];
                if (!in_array('*', $myPermissions)) {
                    foreach ($permissions as $perm) {
                        if (!in_array($perm, $myPermissions)) {
                            echo json_encode(['success' => false, 'message' => 'غير مصرح: لا يمكنك منح صلاحية (' . $perm . ') لأنك لا تملكها']);
                            exit;
                            return;
                        }
                    }
                }

                // Cannot edit system roles
                if ($isEditing) {
                    $roleModel = new Role();
                    $existingRole = $roleModel->find($input['id']);
                    if ($existingRole && $existingRole['is_system']) {
                        echo json_encode(['success' => false, 'message' => 'غير مصرح: لا يمكنك تعديل أدوار النظام']);
                        exit;
                        return;
                    }
                }
            }

            try {
                $roleModel = new Role();
                $permissionsJson = json_encode($permissions);

                $data = [
                    'name' => $input['name'],
                    'description' => $input['description'] ?? '',
                    'permissions' => $permissionsJson,
                    'is_system' => 0
                ];

                if ($isEditing) {
                    $roleModel->update($input['id'], $data);
                } else {
                    $roleModel->create($data);
                }

                echo json_encode(['success' => true, 'message' => 'تم حفظ الدور بنجاح']);
            } catch (\Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
            exit;
        }
    }


    public function saveFuel()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // Permission check
            if (!AuthHelper::isSuperAdmin() && !AuthHelper::can('settings.fuel') && !AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: لا تملك صلاحية تعديل الوقود']);
                exit;
                return;
            }

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
            $fuelId = null;
            $oldPrice = null;
            $newPrice = $data['price_per_liter'];

            if (isset($input['id']) && $input['id']) {
                // Get old price before update
                $existingFuel = $fuelModel->find($input['id']);
                if ($existingFuel) {
                    $oldPrice = $existingFuel['price_per_liter'];
                }
                $success = $fuelModel->update($input['id'], $data);
                $fuelId = $input['id'];
            } else {
                // Generate a unique code
                $baseCode = strtolower(preg_replace('/[^a-z0-9_]/', '_', $input['name']));
                $data['code'] = $baseCode;

                // Simple collision avoidance
                if ($fuelModel->findByCode($baseCode)) {
                    $data['code'] = $baseCode . '_' . rand(100, 999);
                }

                $success = $fuelModel->create($data);
                $fuelId = $fuelModel->getLastInsertId();
            }

            // Log price change if price was modified or it's a new fuel type
            if ($success && $fuelId && ($oldPrice === null || floatval($oldPrice) != floatval($newPrice))) {
                $this->logPriceChange($fuelId, $input['name'], $oldPrice, $newPrice);
            }

            // ALWAYS Propagate new price to linked tanks (Ensure consistency)
            if ($success && $fuelId) {
                try {
                    $db = \App\Config\Database::connect();

                    // We must use fuel_type_id because product_type column was dropped in migration
                    if ($fuelId) {
                        $stmt = $db->prepare("UPDATE tanks SET current_price = ? WHERE fuel_type_id = ?");
                        $stmt->execute([$newPrice, $fuelId]);

                        // Log for debugging
                        error_log("Forced update tanks price to $newPrice where fuel_type_id = $fuelId");
                    }
                } catch (\Exception $e) {
                    error_log("Failed to propagate price to tanks: " . $e->getMessage());
                }
            }

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Fuel type saved successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save fuel type (Duplicate or Error)']);
            }
            exit;
        }
    }

    /**
     * Log fuel price change to history table
     */
    private function logPriceChange($fuelTypeId, $fuelName, $oldPrice, $newPrice)
    {
        try {
            $db = Database::connect();
            $userId = $_SESSION['user_id'] ?? null;
            $userName = $_SESSION['user_name'] ?? 'System';

            $stmt = $db->prepare("
                INSERT INTO fuel_price_history (fuel_type_id, fuel_name, old_price, new_price, changed_by, changed_by_name)
                VALUES (:fuel_type_id, :fuel_name, :old_price, :new_price, :changed_by, :changed_by_name)
            ");
            $stmt->execute([
                ':fuel_type_id' => $fuelTypeId,
                ':fuel_name' => $fuelName,
                ':old_price' => $oldPrice,
                ':new_price' => $newPrice,
                ':changed_by' => $userId,
                ':changed_by_name' => $userName
            ]);
        } catch (\Exception $e) {
            // Silently fail - price logging shouldn't break save operation
            error_log("Price history log failed: " . $e->getMessage());
        }
    }

    public function deleteFuel()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // Permission check
            if (!AuthHelper::isSuperAdmin() && !AuthHelper::can('settings.fuel') && !AuthHelper::can('settings.edit')) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: لا تملك صلاحية حذف الوقود']);
                exit;
                return;
            }

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

            // STRICT: Only super admin can manage users
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه تعديل المستخدمين']);
                exit;
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

            // Only super admin can change name and password
            if (AuthHelper::isSuperAdmin()) {
                // Update name if provided
                if (!empty($input['name'])) {
                    $data['name'] = trim($input['name']);
                }

                // Update password if provided (non-empty means super admin wants to change it)
                if (!empty($input['password'])) {
                    $data['password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
                }

                // Update username if provided
                if (array_key_exists('username', $input)) {
                    $data['username'] = !empty($input['username']) ? trim($input['username']) : null;
                }
            }

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

            // STRICT: Only super admin can create users
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه إنشاء مستخدمين']);
                exit;
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
                'username' => !empty($input['username']) ? trim($input['username']) : null,
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

            // STRICT: Only super admin can delete roles
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه حذف الأدوار']);
                exit;
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

    public function deleteUser()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // STRICT: Only super admin can delete users
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه حذف المستخدمين']);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['id'] ?? null;

            if (!$userId) {
                echo json_encode(['success' => false, 'message' => 'User ID required']);
                return;
            }

            // Cannot delete yourself
            if ($userId == ($_SESSION['user_id'] ?? null)) {
                echo json_encode(['success' => false, 'message' => 'لا يمكنك حذف حسابك الخاص']);
                return;
            }

            $userModel = new \App\Models\User();
            $user = $userModel->find($userId);

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'User not found']);
                return;
            }

            try {
                $db = Database::connect();

                // Clean up user_stations
                $stmt = $db->prepare("DELETE FROM user_stations WHERE user_id = ?");
                $stmt->execute([$userId]);

                // Delete the user
                if ($userModel->delete($userId)) {
                    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
                }
            } catch (\Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
            exit;
        }
    }

    public function factoryReset()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // CRITICAL: Only super admin can factory reset
            if (!AuthHelper::isSuperAdmin()) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح: فقط المدير العام يمكنه إعادة ضبط المصنع']);
                exit;
                return;
            }

            try {
                // Parse JSON input
                $input = json_decode(file_get_contents('php://input'), true);

                // 1. Verify credentials
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                $sections = $input['sections'] ?? [];

                if (empty($email) || empty($password)) {
                    echo json_encode(['success' => false, 'message' => 'يرجى إدخال البريد الإلكتروني وكلمة المرور']);
                    exit;
                }

                // Authenticate user
                $userModel = new \App\Models\User();
                $user = $userModel->findByEmail($email);

                if (!$user || !password_verify($password, $user['password_hash'])) {
                    echo json_encode(['success' => false, 'message' => 'بيانات الدخول غير صحيحة']);
                    exit;
                }

                // Check if any section is selected
                $selectedSections = array_filter($sections, fn($v) => $v === true);
                if (empty($selectedSections)) {
                    echo json_encode(['success' => false, 'message' => 'يرجى تحديد قسم واحد على الأقل']);
                    exit;
                }

                $db = \App\Config\Database::connect();
                $db->exec("SET FOREIGN_KEY_CHECKS = 0");

                // Define table mappings for each section
                $sectionTables = [
                    'sales' => ['sales'],
                    'purchases' => ['purchases', 'incoming_stock_log'],
                    'tanks_pumps' => ['tanks', 'pumps', 'counters', 'tank_readings', 'tank_calibrations', 'calibration_logs'],
                    'transactions' => ['transactions', 'expenses', 'transfer_requests'],
                    'safes_banks' => ['safes', 'banks'],
                    'hr' => ['employees', 'attendance', 'payrolls', 'advances', 'workers', 'drivers'],
                    'customers_suppliers' => ['customers', 'suppliers'],
                    'fuel_types' => ['fuel_types']
                ];

                $truncatedTables = [];

                foreach ($sections as $sectionKey => $isSelected) {
                    if ($isSelected && isset($sectionTables[$sectionKey])) {
                        foreach ($sectionTables[$sectionKey] as $table) {
                            try {
                                $db->exec("TRUNCATE TABLE `$table`");
                                $truncatedTables[] = $table;
                            } catch (\Exception $e) {
                                // Ignore if table doesn't exist
                            }
                        }
                    }
                }

                // Always clear activity logs and notifications if any section is selected
                if (!empty($truncatedTables)) {
                    try {
                        $db->exec("TRUNCATE TABLE `activity_logs`");
                        $db->exec("TRUNCATE TABLE `notifications`");
                    } catch (\Exception $e) {
                        // Ignore
                    }
                }

                $db->exec("SET FOREIGN_KEY_CHECKS = 1");

                $count = count($truncatedTables);
                echo json_encode([
                    'success' => true,
                    'message' => "تمت إعادة ضبط المصنع بنجاح. تم مسح {$count} جدول من البيانات."
                ]);
            } catch (\Exception $e) {
                echo json_encode(['success' => false, 'message' => 'فشلت العملية: ' . $e->getMessage()]);
            }
            exit;
        }
    }

    /**
     * Get activity logs for the API
     */
    public function getActivityLogs()
    {
        header('Content-Type: application/json');

        // Permission check
        if (!AuthHelper::isSuperAdmin() && !AuthHelper::can('settings.activity')) {
            echo json_encode(['success' => false, 'message' => 'غير مصرح: لا تملك صلاحية عرض سجل العمليات']);
            exit;
            return;
        }

        try {
            $logModel = new \App\Models\ActivityLog();
            $stationId = $_SESSION['station_id'] ?? null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

            $logs = $logModel->getRecent($limit, $stationId);

            echo json_encode([
                'success' => true,
                'logs' => $logs
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ في جلب السجلات: ' . $e->getMessage()
            ]);
        }
        exit;
    }
}
