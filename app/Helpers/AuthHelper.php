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
        // Get all assigned stations first
        $assignedStations = self::getUserStationIds();

        // Prefer active_station_id if set (for switching), otherwise default station_id
        $currentStationId = $_SESSION['active_station_id'] ?? ($_SESSION['station_id'] ?? null);

        // Validation for Non-Super Admin:
        // Ensure currentStationId is actually assigned to the user
        if (!self::isSuperAdmin() && !in_array($currentStationId, $assignedStations)) {
            // If unauthorized station in session, fallback to first assigned station
            $currentStationId = !empty($assignedStations) ? $assignedStations[0] : null;
            $_SESSION['active_station_id'] = $currentStationId; // Correct the session
        }

        // Auto-select first station if none selected (for ANY logged-in user)
        // This covers: super admins, and regular users with no station assigned
        if (!$currentStationId) {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $firstStation = $stmt->fetch();
            if ($firstStation) {
                $currentStationId = $firstStation['id'];
                $_SESSION['active_station_id'] = $currentStationId; // Persist selection

                // Also auto-assign this station to user_stations if not already assigned
                $userId = $_SESSION['user_id'] ?? null;
                if ($userId && !self::isSuperAdmin()) {
                    try {
                        $checkStmt = $db->prepare("SELECT COUNT(*) FROM user_stations WHERE user_id = ?");
                        $checkStmt->execute([$userId]);
                        if ($checkStmt->fetchColumn() == 0) {
                            $insertStmt = $db->prepare("INSERT INTO user_stations (user_id, station_id) VALUES (?, ?)");
                            $insertStmt->execute([$userId, $currentStationId]);
                            // Also update legacy station_id
                            $updateStmt = $db->prepare("UPDATE users SET station_id = ? WHERE id = ?");
                            $updateStmt->execute([$currentStationId, $userId]);
                        }
                    } catch (\Exception $e) {
                        // Silently fail - station display is still corrected
                        error_log('AuthHelper: Auto-assign station failed: ' . $e->getMessage());
                    }
                }
            }
        }

        return [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'guest',
            'station_id' => $currentStationId,
            'station_name' => self::getStationName($currentStationId),
            'original_station_id' => $_SESSION['station_id'] ?? null,
            'station_ids' => $assignedStations,
            'permissions' => $_SESSION['permissions'] ?? []
        ];
    }

    public static function switchStation($stationId)
    {
        self::startSession();
        // verify permission? Controller should check if super admin.
        $_SESSION['active_station_id'] = $stationId;
    }

    /**
     * Get all station IDs assigned to current user via user_stations table
     * Super admin gets all stations, regular users get their assigned stations
     * @return array Array of station IDs
     */
    public static function getUserStationIds()
    {
        self::startSession();
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            return [];
        }

        // Super admin sees all stations
        if (self::isSuperAdmin()) {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id FROM stations ORDER BY id ASC");
            return array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'id');
        }

        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("
            SELECT DISTINCT station_id 
            FROM user_stations 
            WHERE user_id = ?
            ORDER BY station_id ASC
        ");
        $stmt->execute([$userId]);
        $stationIds = array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'station_id');

        // Fallback to legacy station_id if no entries in user_stations
        if (empty($stationIds) && !empty($_SESSION['station_id'])) {
            $stationIds = [$_SESSION['station_id']];
        }

        return $stationIds;
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
        if (in_array($permission, $myPermissions)) {
            return true;
        }

        // Recursive fallback for granular permissions:
        // If checking for 'reports.stats.view' and user has 'reports.stats' or 'reports', allow it.
        $parts = explode('.', $permission);
        while (count($parts) > 1) {
            array_pop($parts);
            $basePermission = implode('.', $parts);
            if (in_array($basePermission, $myPermissions)) {
                return true;
            }
        }

        return false;
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

    /**
     * Get the station name for a given station ID
     */
    public static function getStationName($stationId)
    {
        if (!$stationId || $stationId === 'all') {
            return null;
        }
        try {
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("SELECT name FROM stations WHERE id = ?");
            $stmt->execute([$stationId]);
            $result = $stmt->fetchColumn();
            return $result ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function isAdmin()
    {
        self::startSession();
        $role = $_SESSION['user_role'] ?? 'guest';
        $perms = $_SESSION['permissions'] ?? [];
        return $role === 'super_admin' || in_array('*', $perms);
    }

    public static function isSuperAdmin()
    {
        return self::isAdmin();
    }
}
