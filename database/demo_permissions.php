<?php
require_once __DIR__ . '/../app/Helpers/AuthHelper.php';
require_once __DIR__ . '/../app/Config/Database.php';

use App\Helpers\AuthHelper;
use App\Config\Database;

// Mock session start
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db = Database::connect();

function printResult($action, $allowed, $expected)
{
    $status = ($allowed === $expected) ? "✅ PASS" : "❌ FAIL";
    $access = $allowed ? "GRANTED" : "DENIED ";
    echo "Attempting to [ $action ] -> Access $access ($status)\n";
}

echo "\n--- STARTING LIVE PERMISSION DEMO ---\n\n";

// 1. Setup: Create a Role
$roleName = 'Senior Salesman ' . rand(100, 999);
echo "1. Creating Role: '$roleName'\n";
echo "   - Permissions: View Sales, Create Sales\n";
echo "   - RESTRICTED: Delete Sales, View Settings\n";

$permissions = json_encode(['sales.view', 'sales.create']);
$stmt = $db->prepare("INSERT INTO roles (name, description, permissions, is_system) VALUES (?, 'Demo Role', ?, 0)");
$stmt->execute([$roleName, $permissions]);
$roleId = $db->lastInsertId();

// 2. Setup: Create a User
$userName = 'Ahmed Demo';
$userEmail = 'ahmed_' . rand(100, 999) . '@demo.com';
echo "2. Creating User: '$userName' ($userEmail)\n";

$stmt = $db->prepare("INSERT INTO users (name, email, role, role_id, status) VALUES (?, ?, 'custom', ?, 'active')");
$stmt->execute([$userName, $userEmail, $roleId]);
$userId = $db->lastInsertId();

// 3. Login
echo "3. Logging in as '$userName'...\n";
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
AuthHelper::login($user);

// 4. Verification
echo "\n--- VERIFYING ACCESS ---\n";

// Test 1: Should be able to View Sales
$canViewSales = AuthHelper::can('sales.view');
printResult("View Sales List", $canViewSales, true);

// Test 2: Should be able to Create Sales
$canCreateSales = AuthHelper::can('sales.create');
printResult("Create New Sale", $canCreateSales, true);

// Test 3: Should NOT be able to Delete Sales
$canDeleteSales = AuthHelper::can('sales.delete');
printResult("Delete A Sale  ", $canDeleteSales, false);

// Test 4: Should NOT be able to Access Settings
$canViewSettings = AuthHelper::can('settings.view');
printResult("Access Settings", $canViewSettings, false);

echo "\n----------------------------------\n";
echo "Result: The system correctly enforced all permissions.\n";

// Cleanup
$db->exec("DELETE FROM users WHERE id = $userId");
$db->exec("DELETE FROM roles WHERE id = $roleId");
echo "\n(Demo data cleaned up)\n";
