<?php

require_once __DIR__ . '/../app/Config/Constants.php';
require_once __DIR__ . '/index.php'; // Load autoloader from index

use App\Models\User;

echo "Creating user...\n";

$userModel = new User();

// Check if user exists
$existing = $userModel->findByEmail('admin@example.com');
if ($existing) {
    echo "User admin@example.com already exists.\n";
    // Update password just in case
    $pdo = $userModel->db; // accessing protected/public db if possible, or just re-create
    // Since db is protected in Model, we can't access it directly unless public.
    // Let's just create a new one using the model's create method or direct PDO if needed.
    // Actually User model has update but we don't have the ID easily if we didn't fetch it properly (wait findByEmail returns it)
    
    $newHash = password_hash('password123', PASSWORD_DEFAULT);
    $userModel->update($existing['id'], [
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'role' => 'manager',
        'password_hash' => $newHash,
        'status' => 'active'
    ]);
    echo "Password updated for existing user.\n";
} else {
    $data = [
        'station_id' => 1, // Assume station 1 exists, or try NULL if this fails.
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password_hash' => password_hash('password123', PASSWORD_DEFAULT),
        'role' => 'manager',
        'status' => 'active'
    ];
    
    try {
        $id = $userModel->create($data);
        echo "User created with ID: $id\n";
    } catch (Exception $e) {
        echo "Error creating user: " . $e->getMessage() . "\n";
        // Try with station_id NULL
        $data['station_id'] = null;
        try {
            $id = $userModel->create($data);
            echo "User created with ID: $id (Station ID NULL)\n";
        } catch (Exception $e2) {
             echo "Error creating user (Retry): " . $e2->getMessage() . "\n";
        }
    }
}
