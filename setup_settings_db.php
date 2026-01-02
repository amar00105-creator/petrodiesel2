<?php
require_once __DIR__ . '/app/Config/Database.php';
use App\Config\Database;

try {
    $db = Database::connect();
    echo "Connected to database.\n";

    // 1. Create Roles Table
    echo "Creating roles table...\n";
    $sqlRoles = "CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        permissions TEXT, -- JSON storage of permissions
        is_system BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sqlRoles);
    
    // Insert default roles if they don't exist
    $stmt = $db->query("SELECT COUNT(*) FROM roles");
    if ($stmt->fetchColumn() == 0) {
        $defaultPermissions = json_encode([
            'dashboard_view' => true,
            'sales_view' => true,
            'sales_create' => true,
            'purchases_view' => true,
            'reports_view' => true,
            'settings_view' => true,
            'users_manage' => true
        ]);
        
        $viewerPermissions = json_encode([
            'dashboard_view' => true,
            'sales_view' => true
        ]);

        $sql = "INSERT INTO roles (name, description, permissions, is_system) VALUES 
                ('Super Admin', 'Full access to everything', :perm_admin, 1),
                ('Manager', 'Station Manager', :perm_manager, 1),
                ('Cashier', 'Sales only', :perm_cashier, 1)";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':perm_admin' => json_encode(['*']), // Wildcard for super admin
            ':perm_manager' => $defaultPermissions,
            ':perm_cashier' => $viewerPermissions
        ]);
        echo "Default roles inserted.\n";
    }

    // 2. Create Settings Table
    echo "Creating settings table...\n";
    $sqlSettings = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id INT NULL, -- NULL = Global setting
        section VARCHAR(50) NOT NULL, -- e.g., 'fuel', 'alerts', 'general'
        key_name VARCHAR(50) NOT NULL,
        value TEXT,
        type VARCHAR(20) DEFAULT 'string', -- string, integer, boolean, json
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting (station_id, section, key_name)
    )";
    $db->exec($sqlSettings);

    // 3. Update Users Table
    echo "Updating users table...\n";
    // Check if role_id column exists
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'role_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE users ADD COLUMN role_id INT NULL AFTER role");
        $db->exec("ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL");
        echo "Added role_id to users.\n";
    }

    // Migrate existing roles to role_id if possible
    // This assumes existing users have a 'role' string column like 'super_admin' or 'viewer'
    // We map: super_admin -> 1, viewer -> 3 (Cashier) approx.
    // Ideally we fetch role IDs by name
    
    $superAdminRole = $db->query("SELECT id FROM roles WHERE name = 'Super Admin'")->fetchColumn();
    if ($superAdminRole) {
        $db->exec("UPDATE users SET role_id = $superAdminRole WHERE role = 'super_admin'");
    }

    echo "Database setup completed successfully!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
