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
        $stationIds = AuthHelper::getUserStationIds();

        // Get dashboard data aggregated from all user's assigned stations
        $dashboardData = $this->getDashboardData($stationIds);

        // allStations is handled centrally by base Controller for all roles

        // Active Users Count - Real-time
        $activeUsersCount = 0;
        try {
            $db = Database::connect();
            $stmt = $db->query("SELECT COUNT(*) FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
            $activeUsersCount = $stmt->fetchColumn();
        } catch (\Exception $e) {
            $activeUsersCount = 0;
        }

        // Data for Add Expense Modal - use first assigned station or current station
        $currentStationId = $user['station_id'] ?? (!empty($stationIds) ? $stationIds[0] : null);
        $transactionCategoryModel = new \App\Models\TransactionCategory();
        $safeModel = new \App\Models\Safe();
        $bankModel = new \App\Models\Bank();
        $supplierModel = new \App\Models\Supplier();
        $customerModel = new \App\Models\Customer();

        // Pass data to view (allStations is handled by base Controller)
        $this->view('home/index', [
            'user' => $user,
            'data' => $dashboardData,
            'activeUsersCount' => $activeUsersCount,
            'hide_topbar' => true,
            // Injected Data for Modal
            'categories' => $transactionCategoryModel->getAll(),
            'safes' => $safeModel->getAll($currentStationId),
            'banks' => $bankModel->getAll($currentStationId),
            'suppliers' => $supplierModel->getAll($currentStationId),
            'customers' => $customerModel->getAll($currentStationId)
        ]);
    }

    private function getDashboardData($stationIds)
    {
        $data = [];

        // Handle empty station IDs
        if (empty($stationIds)) {
            return [
                'todaySales' => 0,
                'safeBalance' => 0,
                'petrolStock' => ['current' => 0, 'capacity' => 0],
                'dieselStock' => ['current' => 0, 'capacity' => 0],
                'gasStock' => ['current' => 0, 'capacity' => 0],
                'totalStockCapacity' => 0,
                'totalStockCurrent' => 0,
                'todayIncoming' => 0,
                'wells' => [],
                'recentSales' => [],
                'station' => ['name' => 'No Access', 'logo_url' => null],
                'todayExpenses' => 0,
                'todayPetrolVolume' => 0,
                'todayDieselVolume' => 0,
                'bankBalance' => 0
            ];
        }

        // 1. Today's sales total (aggregated from all assigned stations)
        $data['todaySales'] = $this->getTodaySales($stationIds);

        // 2. Safe balance (aggregated)
        $data['safeBalance'] = $this->getSafeBalance($stationIds);

        // 3. Fuel stocks (Dynamic via available fuel_types, aggregated)
        $fuelTypeModel = new \App\Models\FuelType();
        $allFuels = $fuelTypeModel->getAll();

        $data['petrolStock'] = ['current' => 0, 'capacity' => 0];
        $data['dieselStock'] = ['current' => 0, 'capacity' => 0];
        $data['gasStock'] = ['current' => 0, 'capacity' => 0];

        $totalCurrent = 0;
        $totalCapacity = 0;

        foreach ($allFuels as $fuel) {
            $stock = $this->getFuelStockById($stationIds, $fuel['id']);

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

        // 4. Today's fuel incoming (Purchases) - aggregated
        $data['todayIncoming'] = $this->getTodayIncoming($stationIds);

        // 5. All wells current status - from all assigned stations
        $data['wells'] = $this->getAllWellsStatus($stationIds);

        // 6. Recent sales (last 5) - from all assigned stations
        $data['recentSales'] = $this->getRecentSales($stationIds);

        // 7. Station info details - use first station or show multi-station label
        $data['station'] = $this->getStationInfo($stationIds[0] ?? null);

        // 8. Today's expenses - aggregated
        $data['todayExpenses'] = $this->getTodayExpenses($stationIds);

        // 9. Volume sold today by fuel type - aggregated
        $volumeByType = $this->getTodayVolumeByFuelType($stationIds);
        $data['todayPetrolVolume'] = $volumeByType['petrol'];
        $data['todayDieselVolume'] = $volumeByType['diesel'];

        // 10. Bank balance - aggregated
        $data['bankBalance'] = $this->getBankBalance($stationIds);

        return $data;
    }

    private function getTodaySales($stationIds)
    {
        if (empty($stationIds)) return 0;

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT COALESCE(SUM(total_amount), 0) as total 
                  FROM sales 
                  WHERE station_id IN ($placeholders) AND sale_date = CURDATE()";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getSafeBalance($stationIds)
    {
        if (empty($stationIds)) return 0;

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT COALESCE(SUM(balance), 0) as total 
                  FROM safes 
                  WHERE station_id IN ($placeholders)";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getFuelStockById($stationIds, $fuelTypeId)
    {
        if (empty($stationIds)) return ['current' => 0, 'capacity' => 0];

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $params = array_merge($stationIds, [$fuelTypeId]);
        $query = "SELECT 
                    COALESCE(SUM(current_volume), 0) as current,
                    COALESCE(SUM(capacity_liters), 0) as capacity
                  FROM tanks 
                  WHERE station_id IN ($placeholders) AND fuel_type_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
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

    private function getTodayIncoming($stationIds)
    {
        if (empty($stationIds)) return 0;

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT COALESCE(SUM(volume_received), 0) as total 
                  FROM purchases 
                  WHERE station_id IN ($placeholders) AND DATE(created_at) = CURDATE()";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getAllWellsStatus($stationIds)
    {
        if (empty($stationIds)) return [];

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT t.id, t.name, ft.name as product_type, t.current_volume, t.capacity_liters 
                  FROM tanks t
                  LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                  WHERE t.station_id IN ($placeholders)";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getRecentSales($stationIds)
    {
        if (empty($stationIds)) return [];

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
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
                  WHERE s.station_id IN ($placeholders)
                  ORDER BY s.created_at DESC
                  LIMIT 5";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
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

    private function getTodayExpenses($stationIds)
    {
        if (empty($stationIds)) return 0;

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT COALESCE(SUM(amount), 0) as total 
                  FROM transactions 
                  WHERE type = 'expense' 
                  AND DATE(created_at) = CURDATE()
                  AND (from_type = 'safe' AND from_id IN (SELECT id FROM safes WHERE station_id IN ($placeholders)))";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getTodayVolumeByFuelType($stationIds)
    {
        if (empty($stationIds)) return ['petrol' => 0, 'diesel' => 0];

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT 
                    COALESCE(SUM(CASE WHEN ft.name LIKE '%Petrol%' OR ft.name LIKE '%Benzien%' OR ft.name LIKE '%بنزين%' THEN s.volume_sold ELSE 0 END), 0) as petrol,
                    COALESCE(SUM(CASE WHEN ft.name LIKE '%Diesel%' OR ft.name LIKE '%ديزل%' OR ft.name LIKE '%جاز%' THEN s.volume_sold ELSE 0 END), 0) as diesel
                  FROM sales s
                  LEFT JOIN counters c ON s.counter_id = c.id
                  LEFT JOIN pumps p ON c.pump_id = p.id
                  LEFT JOIN tanks t ON p.tank_id = t.id
                  LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                  WHERE s.station_id IN ($placeholders) AND s.sale_date = CURDATE()";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function getBankBalance($stationIds)
    {
        if (empty($stationIds)) return 0;

        $db = Database::connect();
        $placeholders = implode(',', array_fill(0, count($stationIds), '?'));
        $query = "SELECT COALESCE(SUM(balance), 0) as total 
                  FROM banks 
                  WHERE station_id IN ($placeholders)";
        $stmt = $db->prepare($query);
        $stmt->execute($stationIds);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    public function switchStation()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        $user = AuthHelper::user();
        $data = json_decode(file_get_contents('php://input'), true);
        $stationId = $data['station_id'] ?? null;

        // Super admin can switch to any station (including 'all')
        // Non-admin users can only switch to their assigned stations
        if ($user['role'] !== 'super_admin') {
            $assignedStations = AuthHelper::getUserStationIds();
            if (!in_array($stationId, $assignedStations)) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                return;
            }
        }

        if ($stationId) {
            AuthHelper::switchStation($stationId);
            $_SESSION['just_switched_station'] = true; // Trigger welcome overlay
            session_write_close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid Station ID']);
        }
        exit;
    }
}
