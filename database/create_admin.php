<?php

/**
 * Create/Reset Admin User
 * Run this file once to create a new admin user
 */

require_once __DIR__ . '/../app/Config/Database.php';

try {
    $db = App\Config\Database::connect();

    echo "<pre style='font-family: Consolas, monospace; font-size: 14px; padding: 20px; background: #1e293b; color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 50px auto;'>";
    echo "Creating new admin user...\n\n";

    // New credentials
    $email = 'admin@petrodiesel.com';
    $password = 'Admin@2026';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $existingUser = $stmt->fetch();

    if ($existingUser) {
        // Update existing user password
        $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        $stmt->execute([$hashedPassword, $email]);
        echo "✓ Password updated for existing user.\n";
    } else {
        // Get first station
        $stmt = $db->query("SELECT id FROM stations LIMIT 1");
        $station = $stmt->fetch();
        $stationId = $station ? $station['id'] : 1;

        // Create new user
        $sql = "INSERT INTO users (station_id, name, email, password_hash, role, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $stationId,
            'مدير النظام',
            $email,
            $hashedPassword,
            'admin',
            'active'
        ]);
        echo "✓ New admin user created successfully!\n";
    }

    echo "\n========================================\n";
    echo "   بيانات تسجيل الدخول (Login Credentials)\n";
    echo "========================================\n\n";
    echo "📧 Email:    <span style='color: #10b981; font-weight: bold;'>$email</span>\n";
    echo "🔑 Password: <span style='color: #f59e0b; font-weight: bold;'>$password</span>\n";
    echo "\n========================================\n";
    echo "✅ You can now login at:\n";
    echo "   <a href='/PETRODIESEL2/public/login' style='color: #60a5fa;'>http://localhost/PETRODIESEL2/public/login</a>\n";
    echo "========================================\n";
    echo "</pre>";
} catch (PDOException $e) {
    echo "<pre style='font-family: Consolas, monospace; font-size: 14px; padding: 20px; background: #fee2e2; color: #dc2626; border-radius: 12px; max-width: 600px; margin: 50px auto;'>";
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "</pre>";
    exit(1);
}
