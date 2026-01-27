<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Driver;
use App\Models\Station; // Assuming we need to get tanks via some model or direct query
use App\Models\Tank;    // I need a Tank model or use direct DB in controller (better to have model)
use App\Models\FuelType;
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
        $stationId = $user['station_id'];

        $purchaseModel = new Purchase();
        $purchases = $purchaseModel->getAll($stationId);

        // Fetch Tanks for Discharge Modal
        $tankModel = new Tank();
        $tanks = $tankModel->getAll($stationId);

        $this->view('purchases/index', [
            'purchases' => $purchases,
            'tanks' => $tanks,
            'hide_topbar' => true,
            'page_title' => 'إدارة المشتريات'
        ]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        $supplierModel = new Supplier();
        $suppliers = $supplierModel->getAll($stationId);

        $db = \App\Config\Database::connect();

        // Get Tanks
        $stmt = $db->prepare("SELECT * FROM tanks WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $tanks = $stmt->fetchAll();

        // Get Safes
        $stmt = $db->prepare("SELECT * FROM safes WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $safes = $stmt->fetchAll();

        // Get Banks
        $stmt = $db->prepare("SELECT * FROM banks WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $banks = $stmt->fetchAll();

        // Get Drivers for datalist
        $driverModel = new Driver();
        $drivers = $driverModel->getAll();

        // Get Fuel Types
        $fuelTypeModel = new FuelType();
        $fuelTypes = $fuelTypeModel->getAll();

        // Generate Invoice Number
        $prefix = date('ym'); // e.g. 2601
        $db = \App\Config\Database::connect();

        // Find the max invoice number starting with this prefix
        // We look for numbers that look like '2601%' 
        // Assuming invoice_number is a string, we might need to cast or carefully select
        $stmt = $db->prepare("SELECT invoice_number FROM purchases WHERE invoice_number LIKE ? ORDER BY LENGTH(invoice_number) DESC, invoice_number DESC LIMIT 1");
        $stmt->execute([$prefix . '%']);
        $lastInvoice = $stmt->fetchColumn();

        if ($lastInvoice) {
            // Extract the sequence
            // If 26011, then we increment to 26012
            // If user has formatted it differently before, this might break, but we assume the standard format from now on.
            // Let's just strip non-numeric or assume it's numeric.
            $sequence = intval($lastInvoice) + 1;
            $invoiceNumber = (string)$sequence;
        } else {
            // First one for this month: 26011 (YYMM + 1)
            $invoiceNumber = $prefix . '1';
        }

        $this->view('purchases/create', [
            'suppliers' => $suppliers,
            'tanks' => $tanks,
            'drivers' => $drivers,
            'safes' => $safes,
            'banks' => $banks,
            'status' => 'success', // Add status to prevent undefined index if used
            'invoiceNumber' => $invoiceNumber,
            'fuelTypes' => $fuelTypes,
            'hide_topbar' => true
        ]);
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'] ?? 1; // Fallback to 1 if superadmin/null

            try {
                // Validation
                $missingFields = [];
                if (empty($data['supplier_id'])) $missingFields[] = 'المورد';
                if (empty($data['volume_ordered']) || $data['volume_ordered'] <= 0) $missingFields[] = 'الكمية';
                if (empty($data['price_per_liter']) || $data['price_per_liter'] <= 0) $missingFields[] = 'السعر';

                // New Validation: Driver and Truck are MANDATORY
                if (empty($data['driver_name']) && empty($data['driver_id'])) $missingFields[] = 'السائق';
                if (empty($data['truck_number'])) $missingFields[] = 'رقم الشاحنة';

                if (empty($data['fuel_type_id']) && empty($data['tank_id'])) {
                    $missingFields[] = 'نوع الوقود';
                }

                if (!empty($missingFields)) {
                    throw new \Exception("الرجاء تعبئة الحقول الإلزامية: " . implode(', ', $missingFields));
                }

                // Handle Driver Logic
                $driverModel = new Driver();
                if (!empty($data['driver_name'])) {
                    $existingDriver = $driverModel->findByName($data['driver_name']);
                    if ($existingDriver) {
                        $data['driver_id'] = $existingDriver['id'];
                    } else {
                        $newDriverId = $driverModel->create([
                            'name' => $data['driver_name'],
                            'truck_number' => $data['truck_number'],
                            'phone' => $data['driver_phone'] ?? ''
                        ]);
                        $data['driver_id'] = $newDriverId;
                    }
                }

                // Ensure driver_id is null if empty (prevents FK error with empty string)
                if (empty($data['driver_id'])) {
                    $data['driver_id'] = null;
                }

                // Handle File Uploads
                $uploadDir = 'uploads/purchases/';
                if (!file_exists(Constants::getPublicPath() . '/' . $uploadDir)) {
                    if (!mkdir(Constants::getPublicPath() . '/' . $uploadDir, 0777, true)) {
                        // Proceed without upload if mkdir fails, or log warning
                    }
                }

                $data['invoice_image'] = $this->uploadFile($_FILES['invoice_image'] ?? null, $uploadDir);
                $data['delivery_note_image'] = $this->uploadFile($_FILES['delivery_note_image'] ?? null, $uploadDir);

                // If tank_id is empty, set to null
                if (empty($data['tank_id'])) {
                    $data['tank_id'] = null;
                } else {
                    // Ensure fuel_type_id is set if tank is selected
                    if (empty($data['fuel_type_id'])) {
                        $db = \App\Config\Database::connect();
                        $stmt = $db->prepare("SELECT fuel_type_id FROM tanks WHERE id = ?");
                        $stmt->execute([$data['tank_id']]);
                        $fetchedFuelId = $stmt->fetchColumn();
                        if ($fetchedFuelId) {
                            $data['fuel_type_id'] = $fetchedFuelId;
                        }
                    }
                }

                // Final Fallback: if still no fuel_type_id, try to get the first available one to prevent FK crash
                if (empty($data['fuel_type_id'])) {
                    $db = \App\Config\Database::connect();
                    $stmt = $db->query("SELECT id FROM fuel_types LIMIT 1");
                    $data['fuel_type_id'] = $stmt->fetchColumn();
                }

                // Create Purchase
                // Ensure status is 'ordered' so it appears in pending discharge
                $data['status'] = 'ordered';

                // Set volume_received to match volume_ordered if not provided (initial state)
                if (!isset($data['volume_received']) || $data['volume_received'] === '') {
                    $data['volume_received'] = $data['volume_ordered'];
                }

                $purchaseModel = new Purchase();
                $purchaseModel->create($data);

                // Update Supplier Balance (Credit)
                $balanceChange = $data['total_cost'] - ($data['paid_amount'] ?? 0);
                $supplierModel = new Supplier();
                $supplierModel->updateBalance($data['supplier_id'], $balanceChange);

                if ($this->isAjax()) {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'تم حفظ الفاتورة بنجاح']);
                    exit;
                }

                $this->redirect('/purchases');
            } catch (\Exception $e) {
                if ($this->isAjax()) {
                    header('Content-Type: application/json');
                    http_response_code(500); // Send 500 but with JSON body
                    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
                    exit;
                }
                $this->redirect('/purchases/create?error=' . urlencode($e->getMessage()));
            }
        }
    }

    public function isAjax()
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'
            || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
    }

    // API: Get Pending Projects (Shipments)
    public function getPending()
    {
        ob_clean();
        header('Content-Type: application/json');
        try {
            $user = AuthHelper::user();
            $stationId = $user['station_id'] ?? 1;

            $db = \App\Config\Database::connect();
            // Fetch purchases that are not 'completed' (or 'discharged')
            $stmt = $db->prepare("
                SELECT p.*, s.name as supplier_name, d.name as driver_name, ft.name as fuel_type
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                LEFT JOIN drivers d ON p.driver_id = d.id
                LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
                WHERE p.station_id = ? AND p.status = 'ordered'
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$stationId]);
            $purchases = $stmt->fetchAll();

            echo json_encode(['success' => true, 'data' => $purchases]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // API: Process Discharge (From Modal)
    public function processDischarge()
    {
        ob_clean();
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);
        $user = AuthHelper::user();

        try {
            $db = \App\Config\Database::connect();
            $db->beginTransaction();

            $purchaseId = $data['purchase_id'];
            $tanks = $data['tanks']; // Array of {id, quantity}

            // 1. Update Purchase Status
            $stmt = $db->prepare("UPDATE purchases SET status = 'completed', offloading_end = NOW() WHERE id = ?");
            $stmt->execute([$purchaseId]);

            // 2. Distribute to Tanks
            $tankModel = new Tank();
            foreach ($tanks as $dist) {
                if ($dist['quantity'] > 0) {
                    // Update Tank Stock
                    $tankModel->updateVolume($dist['id'], $dist['quantity']);

                    // Log Offload
                    // Check if purchase_offloads exists, create if not or ignore?
                    // Assuming it exists or we skip.
                    try {
                        $stmt = $db->prepare("INSERT INTO purchase_offloads (purchase_id, tank_id, quantity) VALUES (?, ?, ?)");
                        $stmt->execute([$purchaseId, $dist['id'], $dist['quantity']]);
                    } catch (\Exception $e) {
                        // Ignore
                    }
                }
            }

            // 3. Transactions? (Inventory In) - Optional for now as Tank Volume is updated.

            $db->commit();
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // ... (keep existing methods like storeDischarge for direct discharge if needed, or remove) ...



    public function offload()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) $this->redirect('/purchases');

        $purchaseModel = new Purchase();
        $purchase = $purchaseModel->find($id);

        if (!$purchase) die("Purchase not found");

        $tankModel = new Tank();
        $tanks = $tankModel->getAll();

        $this->view('purchases/offload', [
            'purchase' => $purchase,
            'tanks' => $tanks,
            'hide_topbar' => true
        ]);
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

    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        // Check permission if needed
        if (!AuthHelper::can('purchases_delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $purchaseModel = new Purchase();

        try {
            // Check if delete method exists in Purchase model, if not, use direct DB
            // Assuming direct DB or Model->delete()
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("DELETE FROM purchases WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Delete failed']);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function delete()
    {
        // Check permission
        if (!AuthHelper::can('purchases_delete')) {
            $this->redirect('/purchases?error=access_denied');
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->redirect('/purchases');
            return;
        }

        $purchaseModel = new Purchase();
        $purchase = $purchaseModel->find($id);

        if (!$purchase) {
            $this->redirect('/purchases?error=not_found');
            return;
        }

        // Delete the purchase
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("DELETE FROM purchases WHERE id = ?");
        $stmt->execute([$id]);

        $this->redirect('/purchases?success=deleted');
    }

    public function edit()
    {
        // Check permission
        if (!AuthHelper::can('purchases_edit')) {
            $this->redirect('/purchases?error=access_denied');
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->redirect('/purchases');
            return;
        }

        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        $purchaseModel = new Purchase();
        $purchase = $purchaseModel->find($id);

        if (!$purchase) {
            $this->redirect('/purchases?error=not_found');
            return;
        }

        $supplierModel = new Supplier();
        $suppliers = $supplierModel->getAll($stationId);

        $db = \App\Config\Database::connect();

        // Get Tanks
        $stmt = $db->prepare("SELECT * FROM tanks WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $tanks = $stmt->fetchAll();

        // Get Drivers
        $driverModel = new Driver();
        $drivers = $driverModel->getAll();

        // Get Fuel Types
        $fuelTypeModel = new FuelType();
        $fuelTypes = $fuelTypeModel->getAll();

        $this->view('purchases/edit', [
            'purchase' => $purchase,
            'suppliers' => $suppliers,
            'tanks' => $tanks,
            'drivers' => $drivers,
            'fuelTypes' => $fuelTypes,
            'hide_topbar' => true
        ]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'] ?? null;
            if (!$id) {
                $this->redirect('/purchases');
                return;
            }

            $db = \App\Config\Database::connect();

            $sql = "UPDATE purchases SET 
                    supplier_id = ?,
                    tank_id = ?,
                    fuel_type_id = ?,
                    driver_name = ?,
                    truck_number = ?,
                    volume_ordered = ?,
                    volume_received = ?,
                    price_per_liter = ?,
                    total_cost = ?,
                    status = ?
                    WHERE id = ?";

            $tankId = !empty($_POST['tank_id']) ? $_POST['tank_id'] : null;
            $fuelTypeId = !empty($_POST['fuel_type_id']) ? $_POST['fuel_type_id'] : null;

            $stmt = $db->prepare($sql);
            $stmt->execute([
                $_POST['supplier_id'],
                $tankId,
                $fuelTypeId,
                $_POST['driver_name'],
                $_POST['truck_number'],
                $_POST['volume_ordered'],
                $_POST['volume_received'] ?? $_POST['volume_ordered'],
                $_POST['price_per_liter'],
                $_POST['total_cost'],
                $_POST['status'] ?? 'in_transit',
                $id
            ]);

            $this->redirect('/purchases?success=updated');
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
    public function storeDischarge()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return;
        }

        $user = AuthHelper::user();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            // Fallback to POST if not JSON
            $data = $_POST;
        }

        $db = \App\Config\Database::connect();
        $db->beginTransaction();

        try {
            // 1. Create Purchase Record (Completed)
            $purchaseModel = new Purchase();
            $purchaseData = [
                'station_id' => $user['station_id'] ?? 1,
                'supplier_id' => $data['supplier_id'],
                'tank_id' => 0, // 0 or null for multi-tank? Let's use 0 or the first tank if needed, but 0 is safer if schema allows.
                // Schema check: tank_id is NOT NULL usually. Let's use the first tank from offloads or a dummy if needed. 
                // Let's assume we use the first tank ID for reference or handle it. 
                // Actually, let's use the first tank in the distribution list.
                'driver_id' => $data['driver_id'] ?? null,
                'truck_number' => $data['truck_number'] ?? '',
                'driver_name' => $data['driver_name'] ?? '',
                'invoice_number' => $data['invoice_number'],
                'volume_ordered' => $data['total_quantity'],
                'volume_received' => $data['total_quantity'], // Assumed full reception for now
                'price_per_liter' => $data['price_per_liter'] ?? 0,
                'total_cost' => ($data['total_quantity'] * ($data['price_per_liter'] ?? 0)),
                'paid_amount' => 0, // Assuming credit or paid later for now, strictly discharge logic? 
                // User didn't specify payment logic in this modal, assume Credit/Later or allow fields.
                // For simplified "Discharge", we focus on Stock.
                'status' => 'completed',
                'payment_source_type' => null,
                'payment_source_id' => null
            ];

            // Fix tank_id requirement (if strict)
            if (!empty($data['tanks']) && count($data['tanks']) > 0) {
                $purchaseData['tank_id'] = $data['tanks'][0]['id'];
            }

            // Create Driver if new (simplified logic similar to store)
            if (empty($purchaseData['driver_id']) && !empty($purchaseData['driver_name'])) {
                $driverModel = new Driver();
                $existing = $driverModel->findByName($purchaseData['driver_name']);
                if ($existing) {
                    $purchaseData['driver_id'] = $existing['id'];
                } else {
                    $purchaseData['driver_id'] = $driverModel->create([
                        'name' => $purchaseData['driver_name'],
                        'truck_number' => $purchaseData['truck_number']
                    ]);
                }
            }

            $purchaseId = $purchaseModel->create($purchaseData);

            // 2. Process Distributions (Offloads)
            $tankModel = new Tank();
            foreach ($data['tanks'] as $distribution) {
                if ($distribution['quantity'] > 0) {
                    // Update Tank Stock
                    $tankModel->updateVolume($distribution['id'], $distribution['quantity']);

                    // Insert into purchase_offloads
                    $stmt = $db->prepare("INSERT INTO purchase_offloads (purchase_id, tank_id, quantity) VALUES (?, ?, ?)");
                    $stmt->execute([$purchaseId, $distribution['id'], $distribution['quantity']]);
                }
            }

            // 3. Update Supplier Balance
            $supplierModel = new Supplier();
            $supplierModel->updateBalance($purchaseData['supplier_id'], $purchaseData['total_cost']);

            $db->commit();

            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Shipment discharged successfully']);
        } catch (\Exception $e) {
            $db->rollBack();
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}
