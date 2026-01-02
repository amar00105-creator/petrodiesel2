<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Config\Database;
use App\Helpers\AuthHelper;

class HomeController extends Controller
{
    private $db;

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->db = Database::connect();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        // Get dashboard data
        $dashboardData = $this->getDashboardData($stationId);

        // Pass data to view
        $this->view('home/index', [
            'user' => $user,
            'data' => $dashboardData
        ]); // Use default 'main' layout
    }

    private function getDashboardData($stationId)
    {
        $data = [];

        // 1. Today's sales total
        $data['todaySales'] = $this->getTodaySales($stationId);

        // 2. Safe balance
        $data['safeBalance'] = $this->getSafeBalance($stationId);

        // 3. Fuel stocks
        $data['petrolStock'] = $this->getFuelStock($stationId, 'Petrol');
        $data['dieselStock'] = $this->getFuelStock($stationId, 'Diesel');
        $data['gasStock'] = $this->getFuelStock($stationId, 'Gas');
        
        // Total Stock value (All)
        $data['totalStockCapacity'] = $data['petrolStock']['capacity'] + $data['dieselStock']['capacity'] + $data['gasStock']['capacity'];
        $data['totalStockCurrent'] = $data['petrolStock']['current'] + $data['dieselStock']['current'] + $data['gasStock']['current'];

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
        $query = "SELECT COALESCE(SUM(total_amount), 0) as total 
                  FROM sales 
                  WHERE station_id = ? AND sale_date = CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getSafeBalance($stationId)
    {
        $query = "SELECT COALESCE(SUM(balance), 0) as total 
                  FROM safes 
                  WHERE station_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getFuelStock($stationId, $productType)
    {
        $query = "SELECT 
                    COALESCE(SUM(current_volume), 0) as current,
                    COALESCE(SUM(capacity_liters), 0) as capacity
                  FROM tanks 
                  WHERE station_id = ? AND product_type = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId, $productType]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function getTodayIncoming($stationId)
    {
        // Status 'completed' or maybe 'arrived' too? Usually completed means actually in tank.
        // Let's count 'completed' for stock in, 'ordered' for expected.
        // User asked for "Today's Incoming Fuel"
        $query = "SELECT COALESCE(SUM(volume_received), 0) as total 
                  FROM purchases 
                  WHERE station_id = ? AND DATE(created_at) = CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getAllWellsStatus($stationId)
    {
        // Get individual tank status
        $query = "SELECT id, name, product_type, current_volume, capacity_liters 
                  FROM tanks 
                  WHERE station_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getRecentSales($stationId)
    {
        $query = "SELECT 
                    s.id,
                    c.name as counter_name,
                    p.name as pump_name, -- JOIN to get pump name from counter?
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
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function getStationInfo($stationId)
    {
        if (!$stationId) {
            return ['name' => 'إدارة النظام', 'logo_url' => null];
        }
        $stmt = $this->db->prepare("SELECT name, logo_url, address FROM stations WHERE id = ?");
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
