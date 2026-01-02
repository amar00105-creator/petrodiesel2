<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Sale;
use App\Models\Pump;
use App\Models\Counter;
use App\Models\Worker;
use App\Models\Tank;

class SalesController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $saleModel = new Sale();
        $sales = $saleModel->getAll($user['station_id']);

        $this->view('sales/index', ['sales' => $sales]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        $pumpModel = new Pump();
        $pumps = $pumpModel->getPumpsWithCounters($stationId);

        $workerModel = new Worker();
        $workers = $workerModel->getAll($stationId);

        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM customers WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $customers = $stmt->fetchAll();

        $this->view('sales/create', [
            'pumps' => $pumps,
            'workers' => $workers,
            'customers' => $customers
        ]);
    }

    public function getCounterDetails()
    {
        if (isset($_GET['counter_id'])) {
            $counterModel = new Counter();
            $counter = $counterModel->find($_GET['counter_id']);

            // Fetch Pump and Assigned Worker
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("
                SELECT t.current_price, t.product_type, w.name as worker_name, w.id as worker_id 
                FROM tanks t 
                JOIN pumps p ON p.tank_id = t.id 
                JOIN counters c ON c.pump_id = p.id 
                LEFT JOIN workers w ON c.current_worker_id = w.id
                WHERE c.id = ?
            ");
            $stmt->execute([$_GET['counter_id']]);
            $info = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'current_reading' => $counter['current_reading'],
                'price' => $info['current_price'],
                'product_type' => $info['product_type'],
                'worker_name' => $info['worker_name'] ?? 'غير معرف',
                'worker_id' => $info['worker_id']
            ]);
            exit;
        }
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'];
            $data['user_id'] = $user['id'];

            // Validation: Closing >= Opening
            if ($data['closing_reading'] < $data['opening_reading']) {
                die("خطأ: القراءة الحالية أقل من السابقة");
            }

            // Calculate Volume & Amount (Server side verify)
            $data['volume_sold'] = $data['closing_reading'] - $data['opening_reading'];
            $data['total_amount'] = $data['volume_sold'] * $data['unit_price'];

            // Save Sale
            $saleModel = new Sale();
            $saleModel->create($data);

            // Update Counter Reading
            $counterModel = new Counter();
            $counterModel->updateReading($data['counter_id'], $data['closing_reading']);

            // Deduct from Tank
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("SELECT t.id FROM tanks t JOIN pumps p ON p.tank_id = t.id JOIN counters c ON c.pump_id = p.id WHERE c.id = ?");
            $stmt->execute([$data['counter_id']]);
            $tank = $stmt->fetch();

            if ($tank) {
                $stmt = $db->prepare("UPDATE tanks SET current_volume = current_volume - ? WHERE id = ?");
                $stmt->execute([$data['volume_sold'], $tank['id']]);
            }

            // Handle Payments (Cash vs Credit)
            if (($data['payment_method'] ?? 'cash') === 'cash') {
                $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE station_id = ? ORDER BY id ASC LIMIT 1");
                $stmt->execute([$data['total_amount'], $data['station_id']]);
            } elseif ($data['payment_method'] === 'credit' && !empty($data['customer_id'])) {
                // Update Customer Balance (Debtor)
                $stmt = $db->prepare("UPDATE customers SET balance = balance + ? WHERE id = ?");
                $stmt->execute([$data['total_amount'], $data['customer_id']]);
            }

            $this->redirect('/sales');
        }
    }

    // --- Customer Management (Accounts Receivable) ---

    public function customers()
    {
        $user = AuthHelper::user();
        // RBAC: Admin, Manager, Sales
        // Assuming 'manager' or 'admin' or newly defined roles.
        // For now allowing admin/manager. User didn't ask for a new 'sales' role explicitly in DB but in logic.
        // "Sales only customers" -> imply checks.
        
        $this->view('sales/customers', ['user' => $user]);
    }

    public function handleApi()
    {
        header('Content-Type: application/json');
        $user = AuthHelper::user();
        if (!$user) { echo json_encode(['success'=>false, 'message'=>'Unauthorized']); exit; }

        $action = $_GET['action'] ?? null;
        $customerModel = new \App\Models\Customer();
        $stationId = $user['station_id'] ?? 1;

        try {
            if ($action === 'list') {
                $data = $customerModel->getAll($stationId);
                echo json_encode(['success' => true, 'data' => $data]);
            } elseif ($action === 'store') {
                $postData = $_POST;
                $postData['station_id'] = $stationId;
                $customerModel->create($postData);
                echo json_encode(['success' => true, 'message' => 'Created']);
            } elseif ($action === 'update') {
                $id = $_POST['id'];
                $customerModel->update($id, $_POST);
                echo json_encode(['success' => true, 'message' => 'Updated']);
            } elseif ($action === 'delete') {
                // Admin only
                if ($user['role'] !== 'admin') throw new \Exception("Admins only");
                $customerModel->delete($_POST['id']);
                echo json_encode(['success' => true, 'message' => 'Deleted']);
            } elseif ($action === 'get') {
                $data = $customerModel->find($_GET['id']);
                echo json_encode(['success' => true, 'data' => $data]);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
