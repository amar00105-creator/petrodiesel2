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
        $_SESSION['user_role'] = $user['role']; // Legacy role string or specific
        $_SESSION['station_id'] = $user['station_id'];

        // Load Permissions
        $permissions = [];

        // Check database for role definition
        if (!empty($user['role_id'])) {
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("SELECT permissions, is_system FROM roles WHERE id = ?");
            $stmt->execute([$user['role_id']]);
            $roleData = $stmt->fetch();

            if ($roleData) {
                // If system admin role or permissions has wildcard
                if ($roleData['is_system'] && $user['role'] === 'super_admin') {
                    $permissions = ['*'];
                } elseif (!empty($roleData['permissions'])) {
                    $jsonPerms = json_decode($roleData['permissions'], true);
                    if (is_array($jsonPerms)) {
                        $permissions = $jsonPerms;
                    }
                }
            }
        }
        // Fallback for Legacy Super Admin without role_id
        elseif ($user['role'] === 'super_admin') {
            $permissions = ['*'];
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
        // Prefer active_station_id if set (for switching), otherwise default station_id
        $currentStationId = $_SESSION['active_station_id'] ?? ($_SESSION['station_id'] ?? null);

        // Auto-select first station for Super Admin if none selected
        if (!$currentStationId && self::isAdmin()) {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $firstStation = $stmt->fetch();
            if ($firstStation) {
                $currentStationId = $firstStation['id'];
                $_SESSION['active_station_id'] = $currentStationId; // Persist selection
            }
        }

        return [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'guest',
            'station_id' => $currentStationId,
            'original_station_id' => $_SESSION['station_id'] ?? null // Keep track of assigned station
        ];
    }

    public static function switchStation($stationId)
    {
        self::startSession();
        // verify permission? Controller should check if super admin.
        $_SESSION['active_station_id'] = $stationId;
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
        return in_array($permission, $myPermissions);
    }

    public static function requireLogin()
    {
        if (!self::isLoggedIn()) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Session expired', 'redirect' => BASE_URL . '/login']);
                exit;
            }

            // Also check for JSON content type header as modern fetch might not set X-Requested-With
            $headers = getallheaders();
            if ((isset($headers['Content-Type']) && strpos($headers['Content-Type'], 'application/json') !== false) ||
                (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
                (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
            ) {
                header('Content-Type: application/json');
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Session expired', 'redirect' => BASE_URL . '/login']);
                exit;
            }

            header('Location: ' . BASE_URL . '/login');
            exit();
        }

        // Update user's last activity timestamp
        self::updateActivity();
    }

    public static function updateActivity()
    {
        self::startSession();
        if (isset($_SESSION['user_id'])) {
            try {
                $db = \App\Config\Database::connect();
                $stmt = $db->prepare("UPDATE users SET last_activity = NOW() WHERE id = ?");
                $stmt->execute([$_SESSION['user_id']]);
            } catch (\Exception $e) {
                // Silently fail to avoid breaking the application
                // This might happen if the column doesn't exist yet
            }
        }
    }

    public static function isAdmin()
    {
        self::startSession();
        return ($_SESSION['user_role'] ?? 'guest') === 'super_admin' || self::can('*');
    }
}
