<?php

namespace App\Core;

class Controller
{
    public function view($view, $data = [], $layout = 'main')
    {
        // Inject Global Header Data
        if (!isset($data['user'])) {
            $data['user'] = \App\Helpers\AuthHelper::user();
        }

        // Fetch common data if logged in
        if ($data['user']['id']) {
            if (!isset($data['allStations'])) {
                if (\App\Helpers\AuthHelper::isSuperAdmin()) {
                    $db = \App\Config\Database::connect();
                    $stmt = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
                    $data['allStations'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                } else {
                    // For non-admin users, provide only their assigned stations
                    $stationIds = \App\Helpers\AuthHelper::getUserStationIds();
                    if (!empty($stationIds)) {
                        $db = \App\Config\Database::connect();
                        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
                        $stmt = $db->prepare("SELECT id, name FROM stations WHERE id IN ($placeholders) ORDER BY name ASC");
                        $stmt->execute($stationIds);
                        $data['allStations'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                    }
                }
            }
            if (!isset($data['stats'])) {
                $db = \App\Config\Database::connect();
                // Count users active in last 5 minutes
                $stmt = $db->query("SELECT COUNT(*) FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
                $activeUsers = $stmt->fetchColumn();
                $data['stats'] = ['activeUsers' => $activeUsers];
            }
            if (!isset($data['autoLockMinutes'])) {
                // Manually query to avoid full model overhead if possible, or use model
                $db = \App\Config\Database::connect();
                $stmt = $db->prepare("SELECT value FROM settings WHERE key_name = 'auto_lock_minutes' AND station_id IS NULL");
                $stmt->execute();
                $val = $stmt->fetchColumn();
                $data['autoLockMinutes'] = $val ? (int)$val : 0;
            }

            // Consume just_logged_in flag (one-time after login)
            if (!empty($_SESSION['just_logged_in'])) {
                $data['justLoggedIn'] = true;
                unset($_SESSION['just_logged_in']);
            }
            // Consume just_switched_station flag (one-time after station switch)
            if (!empty($_SESSION['just_switched_station'])) {
                $data['justSwitchedStation'] = true;
                unset($_SESSION['just_switched_station']);
            }
        }

        // Extract data to variables
        extract($data);

        $viewPath = __DIR__ . "/../../views/" . $view . ".php";
        $layoutPath = __DIR__ . "/../../views/layouts/" . $layout . ".php";

        if (file_exists($viewPath)) {
            // If layout is requested, render view into a variable, then include layout
            if ($layout) {
                $child_view = $viewPath;
                if (file_exists($layoutPath)) {
                    require_once $layoutPath;
                } else {
                    die("Layout '$layout' does not exist.");
                }
            } else {
                require_once $viewPath;
            }
        } else {
            die("View '$view' does not exist.");
        }
    }

    public function model($model)
    {
        $modelClass = "App\\Models\\" . $model;
        if (class_exists($modelClass)) {
            return new $modelClass();
        } else {
            die("Model '$model' not found.");
        }
    }

    public function redirect($url)
    {
        // If url doesn't start with http, prepend BASE_URL
        if (strpos($url, 'http') !== 0) {
            $url = BASE_URL . $url;
        }
        header("Location: " . $url);
        exit();
    }

    public function isAjax()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
}
