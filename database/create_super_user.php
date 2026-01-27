<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "--- Creating Super Admin User ---\n";

// 1. Ensure Super Admin Role Exists
$stmt = $db->prepare("SELECT id FROM roles WHERE is_system = 1 OR name = 'Super Admin' LIMIT 1");
$stmt->execute();
$role = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$role) {
    echo "Creating 'Super Admin' Role...\n";
    $stmt = $db->prepare("INSERT INTO roles (name, description, permissions, is_system) VALUES (?, ?, ?, ?)");
    // Wildcard permission for super admin
    $stmt->execute(['Super Admin', 'System Administrator with full access', json_encode(['*']), 1]);
    $roleId = $db->lastInsertId();
} else {
    echo "Found existing 'Super Admin' Role (ID: {$role['id']}).\n";
    $roleId = $role['id'];
}

// 2. Create/Update Super User
$email = 'admin@admin.com';
$password = 'admin123';
$name = 'Super Admin';

// Check if user exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "Updating existing user '$email' to Super Admin...\n";
    $stmt = $db->prepare("UPDATE users SET password_hash = ?, role_id = ?, role = 'super_admin', status = 'active', station_id = NULL WHERE id = ?");
    $stmt->execute([password_hash($password, PASSWORD_BCRYPT), $roleId, $user['id']]);
} else {
    echo "Creating new user '$email'...\n";
    $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role, role_id, status, station_id) VALUES (?, ?, ?, 'super_admin', ?, 'active', NULL)");
    $stmt->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT), $roleId]);
}

echo "\nSUCCESS! Credentials:\n";
echo "Email:    $email\n";
echo "Password: $password\n";
