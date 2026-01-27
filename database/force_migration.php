<?php
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

try {
    echo "Attempting to add role_id column...\n";
    $db->exec("ALTER TABLE users ADD COLUMN role_id INT NULL AFTER role");
    echo "Success: role_id added.\n";
} catch (Exception $e) {
    echo "Notice (role_id): " . $e->getMessage() . "\n";
}

try {
    echo "Attempting to add foreign key...\n";
    $db->exec("ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL");
    echo "Success: Foreign key added.\n";
} catch (Exception $e) {
    echo "Notice (FK): " . $e->getMessage() . "\n";
}
