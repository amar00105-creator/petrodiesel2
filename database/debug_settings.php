<?php
require_once __DIR__ . '/../app/Core/Model.php';
require_once __DIR__ . '/../app/Config/Database.php';
require_once __DIR__ . '/../app/Models/Setting.php';
require_once __DIR__ . '/../app/Models/Role.php';
require_once __DIR__ . '/../app/Models/FuelType.php';

use App\Config\Database;

try {
    echo "1. Connecting to DB...\n";
    $db = Database::connect();
    echo "   - Connected.\n";

    echo "2. Testing Users Query (SettingsController)...\n";
    $stmt = $db->query("
            SELECT u.id, u.name, u.email, u.station_id, u.role, u.role_id, u.status, 
                   s.name as station_name, r.name as role_name 
            FROM users u
            LEFT JOIN stations s ON u.station_id = s.id
            LEFT JOIN roles r ON u.role_id = r.id
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   - Success. Fetched " . count($users) . " users.\n";

    echo "3. Testing Roles Query...\n";
    $stmt = $db->query("SELECT * FROM roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   - Success. Fetched " . count($roles) . " roles.\n";

    echo "ALL CHECKS PASSED. \n";
} catch (Exception $e) {
    echo "\nCRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
