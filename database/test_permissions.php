<?php
require_once __DIR__ . '/../app/Helpers/AuthHelper.php';
require_once __DIR__ . '/../app/Config/Database.php';

use App\Helpers\AuthHelper;
use App\Config\Database;

// Mock session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db = Database::connect();

// 1. Create a Test Role (Restricted)
echo "Creating Test Role...\n";
$db->exec("DELETE FROM roles WHERE name = 'Restricted Test Role'");
$stmt = $db->prepare("INSERT INTO roles (name, description, permissions, is_system) VALUES (?, ?, ?, ?)");
$stmt->execute(['Restricted Test Role', 'Only View Sales', json_encode(['sales.view']), 0]);
$roleId = $db->lastInsertId();
echo "Role Created (ID: $roleId)\n";

// 2. Create/Update a Test User
echo "Creating Test User...\n";
$db->exec("DELETE FROM users WHERE email = 'testuser@example.com'");
$stmt = $db->prepare("INSERT INTO users (name, email, role, role_id, status) VALUES (?, ?, ?, ?, ?)");
$stmt->execute(['Test User', 'testuser@example.com', 'custom', $roleId, 'active']);
$userId = $db->lastInsertId();
echo "User Created (ID: $userId)\n";

// 3. Simulate Login
echo "Simulating Login...\n";
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

AuthHelper::login($user);

// 4. Test Permissions
echo "Testing Permissions:\n";

$canViewSales = AuthHelper::can('sales.view');
echo " - Can View Sales? " . ($canViewSales ? "YES (Pass)" : "NO (Fail)") . "\n";

$canDeleteSales = AuthHelper::can('sales.delete');
echo " - Can Delete Sales? " . (!$canDeleteSales ? "NO (Pass)" : "YES (Fail - Should be restricted)") . "\n";

$canViewPurchases = AuthHelper::can('purchases.view');
echo " - Can View Purchases? " . (!$canViewPurchases ? "NO (Pass)" : "YES (Fail - Should be restricted)") . "\n";

// Cleanup
$db->exec("DELETE FROM users WHERE id = $userId");
$db->exec("DELETE FROM roles WHERE id = $roleId");
echo "Test data cleaned up.\n";
