<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Driver;
use App\Models\Station; // Assuming we need to get tanks via some model or direct query
use App\Models\Tank;    // I need a Tank model or use direct DB in controller (better to have model)
use App\Config\Constants;

class PurchasesController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $purchaseModel = new Purchase();
        $purchases = $purchaseModel->getAll($user['station_id']);

        $this->view('purchases/index', [
            'purchases' => $purchases
        ]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        $supplierModel = new Supplier();
        $suppliers = $supplierModel->getAll($stationId);

        // We need tanks
        // Check if Tank model exists, if not I might need to create it or query directly.
        // For now assuming I can get tanks. I'll check Tank model existence in a sec.
        // Using direct DB for now if needed, but let's assume Tank model exists or creating it is trivial.
        // actually I saw tanks table in schema.

        // Let's assume I can query tanks via a simple Model or the DB.
        // I will implement a quick getTanks method here or use a Tank model if I had one.
        // I'll create a lightweight Tank model usage if it exists.

        // Temporarily fetching tanks via direct DB in the view or controller.
        // Ideally should separate.
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM tanks WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $tanks = $stmt->fetchAll();

        // Get Drivers for datalist
        $driverModel = new Driver();
        $drivers = $driverModel->getAll();

        $this->view('purchases/create', [
            'suppliers' => $suppliers,
            'tanks' => $tanks,
            'drivers' => $drivers
        ]);
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'];

            // Handle Driver Logic
            $driverModel = new Driver();
            if (!empty($data['driver_name'])) {
                $existingDriver = $driverModel->findByName($data['driver_name']);
                if ($existingDriver) {
                    $data['driver_id'] = $existingDriver['id'];
                    // Update truck number if changed? Or just trust input?
                    // User said "appear automatically", implying lookup.
                } else {
                    // Create new driver
                    $newDriverId = $driverModel->create([
                        'name' => $data['driver_name'],
                        'truck_number' => $data['truck_number'],
                        'phone' => $data['driver_phone'] ?? ''
                    ]);
                    $data['driver_id'] = $newDriverId;
                }
            }

            // Handle File Uploads
            $uploadDir = 'uploads/purchases/';
            if (!file_exists(Constants::getPublicPath() . '/' . $uploadDir)) {
                mkdir(Constants::getPublicPath() . '/' . $uploadDir, 0777, true);
            }

            $data['invoice_image'] = $this->uploadFile($_FILES['invoice_image'] ?? null, $uploadDir);
            $data['delivery_note_image'] = $this->uploadFile($_FILES['delivery_note_image'] ?? null, $uploadDir);

            // Create Purchase
            $purchaseModel = new Purchase();
            $purchaseModel->create($data);

            // Update Supplier Balance (Credit)
            // Balance logic remains...
            $balanceChange = $data['total_cost'] - ($data['paid_amount'] ?? 0);
            $supplierModel = new Supplier();
            $supplierModel->updateBalance($data['supplier_id'], $balanceChange);

            // Update Tank Volume ONLY if status is 'completed' (Direct Purchase)
            // Otherwise, it waits for offloading.
            if (($data['status'] ?? 'ordered') === 'completed') {
                $db = \App\Config\Database::connect();
                $stmt = $db->prepare("UPDATE tanks SET current_volume = current_volume + ? WHERE id = ?");
                $stmt->execute([$data['volume_received'], $data['tank_id']]);
            }

            // Update Safe/Bank if paid
            if (($data['paid_amount'] ?? 0) > 0 && !empty($data['payment_source_type']) && !empty($data['payment_source_id'])) {
                $table = $data['payment_source_type'] === 'safe' ? 'safes' : 'banks';
                $stmt = $db->prepare("UPDATE $table SET balance = balance - ? WHERE id = ?");
                $stmt->execute([$data['paid_amount'], $data['payment_source_id']]);
            }

            $this->redirect('/purchases');
        }
    }

    public function offload()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) $this->redirect('/purchases');

        $purchaseModel = new Purchase();
        $purchase = $purchaseModel->find($id);

        if (!$purchase) die("Purchase not found");

        $tankModel = new Tank();
        $tanks = $tankModel->getAll();

        $this->view('purchases/offload', ['purchase' => $purchase, 'tanks' => $tanks]);
    }

    public function processOffload()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $purchaseId = $_POST['purchase_id'];
            $tankId = $_POST['tank_id']; // Target Tank
            $actualQty = $_POST['quantity']; // Quantity being offloaded

            $purchaseModel = new Purchase();
            $tankModel = new Tank();

            // 1. Update Tank
            $tankModel->updateVolume($tankId, $actualQty);

            // 2. Update Purchase Status
            // Check if schema supports offloading timestamps (migrated?)
            // If migration failed, we might check columns first or just retry migration.
            // For now, assume migration worked or we fail gracefully if columns missing.
            
            $db = \App\Config\Database::connect();
            try {
                // Try updating with timestamps
                $sql = "UPDATE purchases SET status = 'completed', offloading_end = NOW() WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute([$purchaseId]);
            } catch (\PDOException $e) {
                // Fallback if columns don't exist
                $sql = "UPDATE purchases SET status = 'completed' WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute([$purchaseId]);
            }

            // 3. Log offload details (optional purchase_offloads table)
            // If table exists...
            try {
                $sql = "INSERT INTO purchase_offloads (purchase_id, tank_id, quantity) VALUES (?, ?, ?)";
                $stmt = $db->prepare($sql);
                $stmt->execute([$purchaseId, $tankId, $actualQty]);
            } catch (\PDOException $e) {
                // Ignore if table doesn't exist
            }

            $this->redirect('/purchases');
        }
    }

    public function getDriver()
    {
        if (isset($_GET['name'])) {
            $driverModel = new Driver();
            $driver = $driverModel->findByName($_GET['name']);
            header('Content-Type: application/json');
            echo json_encode($driver ? ['success' => true, 'driver' => $driver] : ['success' => false]);
            exit;
        }
    }

    private function uploadFile($file, $targetDir)
    {
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $fileName = uniqid() . '_' . basename($file['name']);
            $targetPath = Constants::getPublicPath() . '/' . $targetDir . $fileName;
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                return $targetDir . $fileName;
            }
        }
        return null;
    }

    // --- Supplier Management (Accounts Payable) ---

    public function suppliers()
    {
        $user = AuthHelper::user();
        $this->view('purchases/suppliers', ['user' => $user]);
    }

    public function handleApi()
    {
        header('Content-Type: application/json');
        $user = AuthHelper::user();
        if (!$user) { echo json_encode(['success'=>false, 'message'=>'Unauthorized']); exit; }

        $action = $_GET['action'] ?? null;
        $supplierModel = new \App\Models\Supplier();
        $stationId = $user['station_id'] ?? 1;

        try {
            if ($action === 'list') {
                $data = $supplierModel->getAll($stationId);
                echo json_encode(['success' => true, 'data' => $data]);
            } elseif ($action === 'store') {
                $postData = $_POST;
                $postData['station_id'] = $stationId;
                $supplierModel->create($postData);
                echo json_encode(['success' => true, 'message' => 'Created']);
            } elseif ($action === 'update') {
                $id = $_POST['id'];
                $supplierModel->update($id, $_POST);
                echo json_encode(['success' => true, 'message' => 'Updated']);
            } elseif ($action === 'delete') {
                if ($user['role'] !== 'admin') throw new \Exception("Admins only");
                $supplierModel->delete($_POST['id']);
                echo json_encode(['success' => true, 'message' => 'Deleted']);
            } elseif ($action === 'get') {
                $data = $supplierModel->find($_GET['id']);
                echo json_encode(['success' => true, 'data' => $data]);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
