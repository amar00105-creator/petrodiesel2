<?php
// Script to verify that Supplier Updates are interacting with the correct DB table
// Run via CLI or Browser

require_once __DIR__ . '/../app/Config/Constants.php';
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

// Bypass Autoloader by manual include if needed, or simple PDO
echo "Connecting to Database...\n";
try {
    $db = Database::connect();
} catch (\Exception $e) {
    die("DB Connection Failed: " . $e->getMessage());
}

// 1. Get a random supplier
$stmt = $db->query("SELECT * FROM suppliers LIMIT 1");
$supplier = $stmt->fetch();

if (!$supplier) {
    die("No suppliers found in DB to test.\n");
}

echo "Found Supplier ID: " . $supplier['id'] . "\n";
echo "Current Name: " . $supplier['name'] . "\n";

// 2. Simulate Update
$newName = $supplier['name'] . "_TEST_" . rand(100, 999);
$newPhone = "05" . rand(10000000, 99999999);

echo "Attempting to update to Name: $newName, Phone: $newPhone\n";

$sql = "UPDATE suppliers SET name = :name, phone = :phone WHERE id = :id";
$updateStmt = $db->prepare($sql);
$success = $updateStmt->execute([
    ':name' => $newName,
    ':phone' => $newPhone,
    ':id' => $supplier['id']
]);

if ($success) {
    echo "Update executed successfully.\n";
} else {
    echo "Update failed.\n";
    print_r($updateStmt->errorInfo());
}

// 3. Verify
$verifyStmt = $db->prepare("SELECT * FROM suppliers WHERE id = ?");
$verifyStmt->execute([$supplier['id']]);
$updated = $verifyStmt->fetch();

echo "Verifying DB State...\n";
echo "New Name in DB: " . $updated['name'] . "\n";
echo "New Phone in DB: " . $updated['phone'] . "\n";

if ($updated['name'] === $newName) {
    echo "TEST PASSED: Database updated correctly.\n";
    // Revert
    $db->prepare("UPDATE suppliers SET name = ?, phone = ? WHERE id = ?")->execute([$supplier['name'], $supplier['phone'], $supplier['id']]);
    echo "Reverted changes.\n";
} else {
    echo "TEST FAILED: Name mismatch.\n";
}
