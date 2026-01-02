<?php

namespace App\Controllers\Api;

use App\Core\Controller;
use App\Helpers\JwtHelper;
use App\Models\Sale;
use App\Models\Counter;
use App\Config\Database;

class SalesController extends Controller
{
    private $user;
    private $db;

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

    public function pumps()
    {
        $userId = $this->user['user_id'];
        
        // querying pumps/counters assigned to this worker
        $query = "SELECT 
                    c.id as counter_id, 
                    c.current_reading, 
                    p.name as pump_name, 
                    t.current_price, 
                    t.product_type 
                  FROM counters c
                  JOIN pumps p ON c.pump_id = p.id
                  JOIN tanks t ON p.tank_id = t.id
                  WHERE c.current_worker_id = ?";
                  
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $counters = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->jsonResponse(['status' => true, 'data' => $counters]);
    }

    public function customers()
    {
        $stationId = $this->user['station_id'] ?? null;
        if (!$stationId) {
             // Fallback or error if station_id is strict. 
             // Workers usually belong to a station.
             // If implicit global, maybe allow null.
        }

        // Use Customer model
        $customerModel = new \App\Models\Customer();
        $customers = $customerModel->getAll($stationId);
        
        $this->jsonResponse(['status' => true, 'data' => $customers]);
    }

    public function history()
    {
        $userId = $this->user['user_id'];
        
        // Fetch last 20 sales for this worker
        $query = "SELECT 
                    s.id, 
                    s.volume_sold, 
                    s.total_amount, 
                    s.payment_method, 
                    s.created_at,
                    p.name as pump_name,
                    t.product_type
                  FROM sales s
                  JOIN counters c ON s.counter_id = c.id
                  JOIN pumps p ON c.pump_id = p.id
                  JOIN tanks t ON p.tank_id = t.id
                  WHERE s.worker_id = ?
                  ORDER BY s.created_at DESC
                  LIMIT 20";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $history = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $this->jsonResponse(['status' => true, 'data' => $history]);
    }

    public function store()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Basic Validation
        if (!isset($input['counter_id']) || !isset($input['current_reading'])) {
            $this->jsonResponse(['status' => false, 'message' => 'Missing fields'], 400);
        }

        $counterId = $input['counter_id'];
        $currentReading = $input['current_reading'];
        $paymentMethod = $input['payment_method'] ?? 'cash';
        $customerId = $input['customer_id'] ?? null;
        
        // 1. Get Counter & Tank Info
        $stmt = $this->db->prepare("
            SELECT c.current_reading as previous_reading, t.current_price, t.product_type, t.id as tank_id, p.station_id 
            FROM counters c
            JOIN pumps p ON c.pump_id = p.id
            JOIN tanks t ON p.tank_id = t.id
            WHERE c.id = ?
        ");
        $stmt->execute([$counterId]);
        $info = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$info) {
             $this->jsonResponse(['status' => false, 'message' => 'Counter not found'], 404);
        }

        if ($currentReading < $info['previous_reading']) {
            $this->jsonResponse(['status' => false, 'message' => 'Current reading cannot be less than previous'], 400);
        }

        // 2. Calculations
        $volumeSold = $currentReading - $info['previous_reading'];
        $totalAmount = $volumeSold * $info['current_price'];
        
        // 3. Save Sale
        $saleData = [
            'station_id' => $info['station_id'],
            'counter_id' => $counterId,
            'worker_id' => $this->user['user_id'], // Logged in worker
            'volume_sold' => $volumeSold,
            'unit_price' => $info['current_price'],
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'customer_id' => $customerId,
            'opening_reading' => $info['previous_reading'],
            'closing_reading' => $currentReading,
            'sale_date' => date('Y-m-d'), // Assuming structure has sale_date
            // 'created_at' is usually auto
        ];

        $saleModel = new Sale();
        // Assume create method handles array insertion
        $saleModel->create($saleData);

        // 4. Update Counter
        $stmt = $this->db->prepare("UPDATE counters SET current_reading = ? WHERE id = ?");
        $stmt->execute([$currentReading, $counterId]);

        // 5. Deduct from Tank
        $stmt = $this->db->prepare("UPDATE tanks SET current_volume = current_volume - ? WHERE id = ?");
        $stmt->execute([$volumeSold, $info['tank_id']]);

        // 6. Financial Updates
        if ($paymentMethod === 'cash') {
            // Add to first safe of station (simplified logic from SalesController)
            $stmt = $this->db->prepare("UPDATE safes SET balance = balance + ? WHERE station_id = ? ORDER BY id ASC LIMIT 1");
            $stmt->execute([$totalAmount, $info['station_id']]);
        } elseif ($paymentMethod === 'credit' && $customerId) {
            $stmt = $this->db->prepare("UPDATE customers SET balance = balance + ? WHERE id = ?");
            $stmt->execute([$totalAmount, $customerId]);
        }

        $this->jsonResponse(['status' => true, 'message' => 'Sale recorded successfully', 'id' => $this->db->lastInsertId()]);
    }

    private function jsonResponse($data, $code = 200)
    {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}
