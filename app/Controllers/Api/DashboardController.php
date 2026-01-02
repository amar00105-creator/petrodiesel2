<?php

namespace App\Controllers\Api;

use App\Core\Controller;
use App\Helpers\JwtHelper;
use App\Config\Database;

class DashboardController extends Controller
{
    private $db;
    private $user;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->authenticate();
    }

    private function authenticate()
    {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = JwtHelper::decode($token);
            
            if ($payload) {
                $this->user = $payload;
                return;
            }
        }

        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['status' => false, 'message' => 'Unauthorized']);
        exit;
    }

    public function summary()
    {
        $stationId = $this->user['station_id'];
        
        // Copied/Adapted logic from HomeController
        $data = [
            'todaySales' => $this->getTodaySales($stationId),
            'safeBalance' => $this->getSafeBalance($stationId),
            'todayIncoming' => $this->getTodayIncoming($stationId),
        ];

        // Stock Summary
        $petrol = $this->getFuelStock($stationId, 'Petrol');
        $diesel = $this->getFuelStock($stationId, 'Diesel');
        $gas = $this->getFuelStock($stationId, 'Gas');

        $data['stock'] = [
            'petrol' => $petrol,
            'diesel' => $diesel,
            'gas' => $gas,
            'total_capacity' => $petrol['capacity'] + $diesel['capacity'] + $gas['capacity'],
            'total_current' => $petrol['current'] + $diesel['current'] + $gas['current']
        ];

        $this->jsonResponse(['status' => true, 'data' => $data]);
    }

    public function tanks()
    {
        $stationId = $this->user['station_id'];
        $tanks = $this->getAllWellsStatus($stationId);
        $this->jsonResponse(['status' => true, 'data' => $tanks]);
    }

    private function jsonResponse($data, $code = 200)
    {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode($data);
        exit;
    }

    // --- Private Data Methods (from HomeController) ---

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
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        // Ensure numeric types for calculation
        $result['current'] = (float)$result['current'];
        $result['capacity'] = (float)$result['capacity'];
        return $result;
    }

    private function getTodayIncoming($stationId)
    {
        $query = "SELECT COALESCE(SUM(volume_received), 0) as total 
                  FROM purchases 
                  WHERE station_id = ? AND DATE(created_at) = CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
    }

    private function getAllWellsStatus($stationId)
    {
        $query = "SELECT id, name, product_type, current_volume, capacity_liters 
                  FROM tanks 
                  WHERE station_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
