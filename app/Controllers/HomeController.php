<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Config\Database;
use App\Helpers\AuthHelper;

class HomeController extends Controller
{
    // Removed cached $db

    public function __construct()
    {
        AuthHelper::requireLogin();
        // Removed cached DB connection
    }

    public function index()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        // Get dashboard data
        $dashboardData = $this->getDashboardData($stationId);

        // Check if Super Admin to pass all stations list
        $allStations = [];
        if ($user['role'] === 'super_admin') {
            $db = Database::connect();
            $stmt = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
            $allStations = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        // Active Users Count - Real-time
        $activeUsersCount = 0;
        try {
            $db = Database::connect();
            $stmt = $db->query("SELECT COUNT(*) FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
            $activeUsersCount = $stmt->fetchColumn();
        } catch (\Exception $e) {
            $activeUsersCount = 0;
        }

        // Pass data to view
        $this->view('home/index', [
            'user' => $user,
            'data' => $dashboardData,
            'allStations' => $allStations,
            'activeUsersCount' => $activeUsersCount,
            'hide_topbar' => true
        ]);
    }

    private function getDashboardData($stationId)
    {
        $data = [];

        // 1. Today's sales total
        $data['todaySales'] = $this->getTodaySales($stationId);

        // 2. Safe balance
        $data['safeBalance'] = $this->getSafeBalance($stationId);

        // 3. Fuel stocks (Dynamic via available fuel_types)
        $fuelTypeModel = new \App\Models\FuelType();
        $allFuels = $fuelTypeModel->getAll();

        $data['petrolStock'] = ['current' => 0, 'capacity' => 0];
        $data['dieselStock'] = ['current' => 0, 'capacity' => 0];
        $data['gasStock'] = ['current' => 0, 'capacity' => 0];

        $totalCurrent = 0;
        $totalCapacity = 0;

        foreach ($allFuels as $fuel) {
            $stock = $this->getFuelStockById($stationId, $fuel['id']);

            if (stripos($fuel['name'], 'Petrol') !== false || stripos($fuel['name'], 'Benzien') !== false || stripos($fuel['name'], 'بنزين') !== false) {
                $data['petrolStock']['current'] += $stock['current'];
                $data['petrolStock']['capacity'] += $stock['capacity'];
            } elseif (stripos($fuel['name'], 'Diesel') !== false || stripos($fuel['name'], 'ديزل') !== false || stripos($fuel['name'], 'جاز') !== false) {
                $data['dieselStock']['current'] += $stock['current'];
                $data['dieselStock']['capacity'] += $stock['capacity'];
            } elseif (stripos($fuel['name'], 'Gas') !== false || stripos($fuel['name'], 'غاز') !== false) {
                $data['gasStock']['current'] += $stock['current'];
                $data['gasStock']['capacity'] += $stock['capacity'];
            }

            $totalCurrent += $stock['current'];
            $totalCapacity += $stock['capacity'];
        }

        $data['totalStockCapacity'] = $totalCapacity;
        $data['totalStockCurrent'] = $totalCurrent;

        // 4. Today's fuel incoming (Purchases)
        $data['todayIncoming'] = $this->getTodayIncoming($stationId);

        // 5. All wells current status
        $data['wells'] = $this->getAllWellsStatus($stationId);

        // 6. Recent sales (last 5)
        $data['recentSales'] = $this->getRecentSales($stationId);

        // 7. Station info details
        $data['station'] = $this->getStationInfo($stationId);

        return $data;
    }

    private function getTodaySales($stationId)
    {
        $db = Database::connect();
        $query = "SELECT COALESCE(SUM(total_amount), 0) as total 
                  FROM sales 
                  WHERE station_id = ? AND sale_date = CURDATE()";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getSafeBalance($stationId)
    {
        $db = Database::connect();
        $query = "SELECT COALESCE(SUM(balance), 0) as total 
                  FROM safes 
                  WHERE station_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getFuelStockById($stationId, $fuelTypeId)
    {
        $db = Database::connect();
        $query = "SELECT 
                    COALESCE(SUM(current_volume), 0) as current,
                    COALESCE(SUM(capacity_liters), 0) as capacity
                  FROM tanks 
                  WHERE station_id = ? AND fuel_type_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId, $fuelTypeId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    // Deprecated
    private function getFuelStock($stationId, $productType)
    {
        $db = Database::connect();
        $query = "SELECT 
                    COALESCE(SUM(t.current_volume), 0) as current,
                    COALESCE(SUM(t.capacity_liters), 0) as capacity
                  FROM tanks t
                  JOIN fuel_types ft ON t.fuel_type_id = ft.id
                  WHERE t.station_id = ? AND ft.name LIKE ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId, "%$productType%"]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function getTodayIncoming($stationId)
    {
        $db = Database::connect();
        $query = "SELECT COALESCE(SUM(volume_received), 0) as total 
                  FROM purchases 
                  WHERE station_id = ? AND DATE(created_at) = CURDATE()";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getAllWellsStatus($stationId)
    {
        $db = Database::connect();
        $query = "SELECT t.id, t.name, ft.name as product_type, t.current_volume, t.capacity_liters 
                  FROM tanks t
                  LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                  WHERE t.station_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getRecentSales($stationId)
    {
        $db = Database::connect();
        $query = "SELECT 
                    s.id,
                    c.name as counter_name,
                    p.name as pump_name, 
                    w.name as worker_name,
                    s.volume_sold,
                    s.total_amount,
                    s.payment_method,
                    DATE_FORMAT(s.created_at, '%H:%i') as time
                  FROM sales s
                  LEFT JOIN counters c ON c.id = s.counter_id
                  LEFT JOIN pumps p ON p.id = c.pump_id
                  LEFT JOIN workers w ON w.id = s.worker_id
                  WHERE s.station_id = ?
                  ORDER BY s.created_at DESC
                  LIMIT 5";
        $stmt = $db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getStationInfo($stationId)
    {
        if (!$stationId) {
            return ['name' => 'إدارة النظام', 'logo_url' => null];
        }
        $db = Database::connect();
        $stmt = $db->prepare("SELECT name, logo_url, address FROM stations WHERE id = ?");
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    public function switchStation()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        $user = AuthHelper::user();
        if ($user['role'] !== 'super_admin') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $stationId = $data['station_id'] ?? null;

        if ($stationId) {
            AuthHelper::switchStation($stationId);
            session_write_close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid Station ID']);
        }
        exit;
    }
}
