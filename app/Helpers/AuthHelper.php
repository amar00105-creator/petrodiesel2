<?php

namespace App\Helpers;

class AuthHelper
{

    public static function startSession()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login($user)
    {
        self::startSession();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role']; // Legacy role string
        $_SESSION['station_id'] = $user['station_id'];
        
        // Load Permissions
        $permissions = [];
        
        // 1. If Super Admin (legacy string or role name), give all
        if ($user['role'] === 'super_admin' || $user['role'] === 'admin') {
            $permissions = ['*'];
        } 
        // 2. If role_id exists (new system)
        elseif (!empty($user['role_id'])) {
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("SELECT permissions FROM roles WHERE id = ?");
            $stmt->execute([$user['role_id']]);
            $roleData = $stmt->fetch();
            if ($roleData && !empty($roleData['permissions'])) {
                $permissions = json_decode($roleData['permissions'], true);
            }
        }
        
        $_SESSION['permissions'] = $permissions;
    }

    public static function logout()
    {
        self::startSession();
        session_destroy();
    }

    public static function isLoggedIn()
    {
        self::startSession();
        return isset($_SESSION['user_id']);
    }

    public static function user()
    {
        self::startSession();
        return [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'guest',
            'station_id' => $_SESSION['station_id'] ?? null,
        ];
    }
    
    public static function can($permission)
    {
        self::startSession();
        $myPermissions = $_SESSION['permissions'] ?? [];
        
        // Super Admin check (wildcard)
        if (in_array('*', $myPermissions)) {
            return true;
        }

        // Specific Permission check
        return !empty($myPermissions[$permission]);
    }

    public static function requireLogin()
    {
        if (!self::isLoggedIn()) {
            header('Location: ' . BASE_URL . '/login');
            exit();
        }
    }

    public static function isAdmin()
    {
        self::startSession();
        return ($_SESSION['user_role'] ?? 'guest') === 'super_admin' || self::can('*');
    }
}
