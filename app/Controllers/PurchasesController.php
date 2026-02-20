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

    private function getSettings()
    {
        $settingModel = new \App\Models\Setting();
        return $settingModel->getAllBySection('general');
    }

    public function index()
    {
        $user = AuthHelper::user();
        // Filter by current station for everyone (including Super Admin to respect switcher)
        $stationId = $user['station_id'];

        $purchaseModel = new Purchase();

        // Global View: Fetch ALL purchases regardless of station or role
        $purchases = $purchaseModel->getAll('all');

        // Fetch Tanks for Discharge Modal (only local tanks if station is set)
        $tankModel = new Tank();
        $tanks = ($user['station_id']) ? $tankModel->getAll($user['station_id']) : [];

        $settings = $this->getSettings();

        $this->view('purchases/index', [
            'purchases' => $purchases,
            'tanks' => $tanks,
            'settings' => $settings,
            'hide_topbar' => true,
            'page_title' => 'إدارة المشتريات'
        ]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id']; // For creating local purchase

        $supplierModel = new Supplier();
        $suppliers = $supplierModel->getAll(); // Global suppliers

        $db = \App\Config\Database::connect();

        $tanks = [];
        $safes = [];
        $banks = [];

        if ($stationId) {
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
        }

        // Get Drivers for datalist
        $driverModel = new Driver();
        $drivers = $driverModel->getAll();

        // Get Fuel Types
        $fuelTypeModel = new FuelType();
        $fuelTypes = $fuelTypeModel->getAll();

        // Generate Invoice Number
        $prefix = date('ym');
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT invoice_number FROM purchases WHERE invoice_number LIKE ? ORDER BY LENGTH(invoice_number) DESC, invoice_number DESC LIMIT 1");
        $stmt->execute([$prefix . '%']);
        $lastInvoice = $stmt->fetchColumn();

        if ($lastInvoice) {
            $sequence = intval($lastInvoice) + 1;
            $invoiceNumber = (string)$sequence;
        } else {
            $invoiceNumber = $prefix . '1';
        }

        $this->view('purchases/create', [
            'suppliers' => $suppliers,
            'tanks' => $tanks,
            'drivers' => $drivers,
            'safes' => $safes,
            'banks' => $banks,
            'status' => 'success',
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

            // Central Purchase Logic:
            // If Super Admin AND no station_id passed (or explicitly null), treat as Central.
            // But currently form doesn't send station_id.
            // We assume if logged in user has station_id, it's local. 
            // If Super Admin wants central, they shouldn't select a tank?

            if (AuthHelper::isSuperAdmin()) {
                // If they provided station_id (future), use it.
                // If NO TANK selected -> Central Purchase. 
                // DB integrity requires station_id not null.
                if (empty($data['tank_id'])) {
                    $data['station_id'] = $user['station_id'] ?? 1; // Default to user station or 1
                } else {
                    $data['station_id'] = $user['station_id'] ?? 1; // Fallback to current user station
                }
            } else {
                $data['station_id'] = $user['station_id'] ?? 1;
            }

            try {
                // Validation
                $missingFields = [];
                if (empty($data['supplier_id'])) $missingFields[] = 'المورد';
                if (empty($data['volume_ordered']) || $data['volume_ordered'] <= 0) $missingFields[] = 'الكمية';
                if (empty($data['price_per_liter']) || $data['price_per_liter'] <= 0) $missingFields[] = 'السعر';

                // New Validation: Driver and Truck are MANDATORY
                if (empty($data['driver_name']) && empty($data['driver_id'])) $missingFields[] = 'السائق';
                if (empty($data['truck_number'])) $missingFields[] = 'رقم الشاحنة';

                // Modified: Tank is OPTIONAL for Central Purchase
                // Fuel Type is MANDATORY if no tank
                if (empty($data['tank_id']) && empty($data['fuel_type_id'])) {
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

                // --- NEW: Create Transaction if Paid Immediately ---
                if (($data['paid_amount'] ?? 0) > 0) {
                    $transactionModel = new \App\Models\Transaction();
                    $transactionModel->create([
                        'station_id' => $data['station_id'],
                        'type' => 'expense',
                        'amount' => $data['paid_amount'],
                        'from_type' => $data['payment_source_type'] ?? null,
                        'from_id' => $data['payment_source_id'] ?? null,
                        'to_type' => null,
                        'to_id' => null,
                        'description' => 'سداد فاتورة مشتريات #' . $purchaseModel->db->lastInsertId(),
                        'related_entity_type' => 'supplier',
                        'related_entity_id' => $data['supplier_id'],
                        'date' => date('Y-m-d'),
                        'created_by' => $user['id']
                    ]);
                }
                // --------------------------------------------------

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

            $purchaseModel = new \App\Models\Purchase();

            // Use the model's getPending method which properly JOINs fuel_types
            // to get fuel_type name and fuel_color_hex
            $pendingPurchases = $purchaseModel->getPending($stationId);

            // Map field names to match frontend expectations
            $pendingPurchases = array_map(function ($p) {
                // Ensure fuel_type field exists (model returns it from JOIN)
                if (empty($p['fuel_type']) && !empty($p['fuel_type_name'])) {
                    $p['fuel_type'] = $p['fuel_type_name'];
                }
                // Map fuel_color to fuel_color_hex for frontend
                if (!empty($p['fuel_color'])) {
                    $p['fuel_color_hex'] = $p['fuel_color'];
                }
                // Use resolved driver name if available
                if (!empty($p['driver_name_resolved'])) {
                    $p['driver_name'] = $p['driver_name_resolved'];
                }
                return $p;
            }, $pendingPurchases);

            echo json_encode(['success' => true, 'data' => $pendingPurchases]);
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
            $supplierInvoiceNo = $data['supplier_invoice_no'] ?? null;

            // Ensure supplier_invoice_no column exists
            try {
                $db->exec("ALTER TABLE purchases ADD COLUMN supplier_invoice_no VARCHAR(100) NULL");
            } catch (\Exception $e) {
                // Column already exists, ignore
            }

            // 1. Update Purchase Status + optional supplier invoice number
            $sql = "UPDATE purchases SET status = 'completed', offloading_end = NOW()";
            $params = [];
            if ($supplierInvoiceNo) {
                $sql .= ", supplier_invoice_no = ?";
                $params[] = $supplierInvoiceNo;
            }
            $sql .= " WHERE id = ?";
            $params[] = $purchaseId;
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            // 2. Distribute to Tanks
            $tankModel = new Tank();
            foreach ($tanks as $dist) {
                if ($dist['quantity'] > 0) {
                    // Validate and Update Tank Stock
                    $result = $tankModel->updateVolume($dist['id'], $dist['quantity'], true);
                    if (is_array($result) && !$result['success']) {
                        throw new \Exception($result['message']);
                    }

                    // Log Offload
                    try {
                        $stmt = $db->prepare("INSERT INTO purchase_offloads (purchase_id, tank_id, quantity) VALUES (?, ?, ?)");
                        $stmt->execute([$purchaseId, $dist['id'], $dist['quantity']]);
                    } catch (\Exception $e) {
                        // Ignore
                    }
                }
            }

            // 3. Transactions (Inventory In / Expense Recognition for Station)
            // The Supplier Liability was already recorded at "Order" time (Global).
            // Now we record the "Station Expense" for P&L reporting.
            // This transaction should be:
            // Type: Expense
            // Amount: value of discharged fuel
            // Description: Purchase Discharge
            // To: Null (or internal clearing account if we had double-entry, but for now just expense record)

            $transactionModel = new \App\Models\Transaction();

            // Calculate value of discharged fuel
            // We need price_per_liter from purchase
            $stmt = $db->prepare("SELECT price_per_liter, supplier_id, invoice_number FROM purchases WHERE id = ?");
            $stmt->execute([$purchaseId]);
            $purchaseInfo = $stmt->fetch(\PDO::FETCH_ASSOC);
            $price = $purchaseInfo['price_per_liter'] ?? 0;

            foreach ($tanks as $dist) {
                if ($dist['quantity'] > 0) {
                    $amount = $dist['quantity'] * $price;

                    // Get station_id from Tank
                    $stmt = $db->prepare("SELECT station_id FROM tanks WHERE id = ?");
                    $stmt->execute([$dist['id']]);
                    $tankStationId = $stmt->fetchColumn();

                    $transactionModel->create([
                        'station_id' => $tankStationId, // The station receiving the fuel
                        'type' => 'expense',
                        'amount' => $amount,
                        'category_id' => null, // Or a specific "Fuel Purchase" category if exists
                        'description' => "تفريغ وقود - فاتورة #" . ($purchaseInfo['invoice_number'] ?? $purchaseId),
                        'date' => date('Y-m-d'),
                        'created_by' => $user['id'],
                        // Important: We do NOT set to_type/to_id as Supplier, because that would double-count the liability.
                        // This is purely for the Station's Expense Report.
                        'related_entity_type' => 'purchase_discharge', // continuous tracking
                        'related_entity_id' => $purchaseId
                    ]);
                }
            }

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

            // 1. Validate first
            $tank = $tankModel->find($tankId);
            if ($tank) {
                $newVolume = (float)$tank['current_volume'] + (float)$actualQty;
                if ($newVolume < 0) {
                    $this->redirect('/purchases?error=' . urlencode('الكمية أكبر من المخزون المتاح'));
                    return;
                }
                if ($newVolume > (float)$tank['capacity_liters']) {
                    $this->redirect('/purchases?error=' . urlencode('الكمية ستتجاوز سعة الخزان'));
                    return;
                }
            }

            // 2. Update Tank
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

        // Check permission
        if (!AuthHelper::can('purchases.delete')) {
            echo json_encode(['success' => false, 'message' => 'غير مصرح']);
            return;
        }

        $id = $_POST['id'];
        $db = \App\Config\Database::connect();

        try {
            $db->beginTransaction();

            // 1. Get purchase details before deleting
            $stmt = $db->prepare("SELECT * FROM purchases WHERE id = ?");
            $stmt->execute([$id]);
            $purchase = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$purchase) {
                echo json_encode(['success' => false, 'message' => 'الفاتورة غير موجودة']);
                return;
            }

            // 2. Reverse Supplier Balance
            if (!empty($purchase['supplier_id'])) {
                $balanceToReverse = $purchase['total_cost'] - ($purchase['paid_amount'] ?? 0);
                if ($balanceToReverse != 0) {
                    $stmt = $db->prepare("UPDATE suppliers SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$balanceToReverse, $purchase['supplier_id']]);
                }
            }

            // 3. Delete related transactions
            $stmt = $db->prepare("DELETE FROM transactions WHERE related_entity_type = 'supplier' AND related_entity_id = ? AND description LIKE ?");
            $stmt->execute([$purchase['supplier_id'], '%#' . $id . '%']);

            // Also delete discharge transactions
            $stmt = $db->prepare("DELETE FROM transactions WHERE related_entity_type = 'purchase_discharge' AND related_entity_id = ?");
            $stmt->execute([$id]);

            // 4. Restore tank volume if purchase was completed (discharged)
            if ($purchase['status'] === 'completed') {
                // Check purchase_offloads table for distributed quantities
                try {
                    $stmt = $db->prepare("SELECT tank_id, quantity FROM purchase_offloads WHERE purchase_id = ?");
                    $stmt->execute([$id]);
                    $offloads = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                    foreach ($offloads as $offload) {
                        $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume - ?) WHERE id = ?");
                        $stmt->execute([$offload['quantity'], $offload['tank_id']]);
                    }

                    // Delete offload records
                    $stmt = $db->prepare("DELETE FROM purchase_offloads WHERE purchase_id = ?");
                    $stmt->execute([$id]);
                } catch (\Exception $e) {
                    // purchase_offloads table might not exist, ignore
                }
            }

            // 5. Delete the purchase record
            $stmt = $db->prepare("DELETE FROM purchases WHERE id = ?");
            $stmt->execute([$id]);

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'تم حذف الفاتورة وعكس جميع الحركات المالية']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            echo json_encode(['success' => false, 'message' => 'خطأ: ' . $e->getMessage()]);
        }
        exit;
    }

    public function delete()
    {
        // Check permission
        if (!AuthHelper::can('purchases.delete')) {
            $this->redirect('/purchases?error=access_denied');
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->redirect('/purchases');
            return;
        }

        $db = \App\Config\Database::connect();

        try {
            $db->beginTransaction();

            // 1. Get purchase details
            $stmt = $db->prepare("SELECT * FROM purchases WHERE id = ?");
            $stmt->execute([$id]);
            $purchase = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$purchase) {
                $this->redirect('/purchases?error=not_found');
                return;
            }

            // 2. Reverse Supplier Balance
            if (!empty($purchase['supplier_id'])) {
                $balanceToReverse = $purchase['total_cost'] - ($purchase['paid_amount'] ?? 0);
                if ($balanceToReverse != 0) {
                    $stmt = $db->prepare("UPDATE suppliers SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$balanceToReverse, $purchase['supplier_id']]);
                }
            }

            // 3. Delete related transactions
            $stmt = $db->prepare("DELETE FROM transactions WHERE related_entity_type = 'supplier' AND related_entity_id = ? AND description LIKE ?");
            $stmt->execute([$purchase['supplier_id'], '%#' . $id . '%']);

            $stmt = $db->prepare("DELETE FROM transactions WHERE related_entity_type = 'purchase_discharge' AND related_entity_id = ?");
            $stmt->execute([$id]);

            // 4. Restore tank volume if completed
            if ($purchase['status'] === 'completed') {
                try {
                    $stmt = $db->prepare("SELECT tank_id, quantity FROM purchase_offloads WHERE purchase_id = ?");
                    $stmt->execute([$id]);
                    $offloads = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                    foreach ($offloads as $offload) {
                        $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume - ?) WHERE id = ?");
                        $stmt->execute([$offload['quantity'], $offload['tank_id']]);
                    }

                    $stmt = $db->prepare("DELETE FROM purchase_offloads WHERE purchase_id = ?");
                    $stmt->execute([$id]);
                } catch (\Exception $e) {
                    // purchase_offloads table might not exist
                }
            }

            // 5. Delete the purchase
            $stmt = $db->prepare("DELETE FROM purchases WHERE id = ?");
            $stmt->execute([$id]);

            $db->commit();
            $this->redirect('/purchases?success=deleted');
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $this->redirect('/purchases?error=' . urlencode($e->getMessage()));
        }
    }

    public function edit()
    {
        // Check permission
        if (!AuthHelper::can('purchases.edit')) {
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
                    status = ?,
                    created_at = ?
                    WHERE id = ?";

            $tankId = !empty($_POST['tank_id']) ? $_POST['tank_id'] : null;
            $fuelTypeId = !empty($_POST['fuel_type_id']) ? $_POST['fuel_type_id'] : null;

            // Handle Date
            $createdAt = $_POST['purchase_date'] ?? date('Y-m-d');
            if (strlen($createdAt) === 10) $createdAt .= ' ' . date('H:i:s');

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
                $createdAt,
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
                    // Validate and Update Tank Stock
                    $result = $tankModel->updateVolume($distribution['id'], $distribution['quantity'], true);
                    if (is_array($result) && !$result['success']) {
                        throw new \Exception($result['message']);
                    }

                    // Insert into purchase_offloads
                    $stmt = $db->prepare("INSERT INTO purchase_offloads (purchase_id, tank_id, quantity) VALUES (?, ?, ?)");
                    $stmt->execute([$purchaseId, $distribution['id'], $distribution['quantity']]);
                }
            }

            // 3. Update Supplier Balance
            $supplierModel = new Supplier();
            $supplierModel->updateBalance($purchaseData['supplier_id'], $purchaseData['total_cost']);

            // --- NEW: Create Transaction if Paid Immediately ---
            if (($purchaseData['paid_amount'] ?? 0) > 0) {
                $transactionModel = new \App\Models\Transaction();
                $transactionModel->create([
                    'station_id' => $purchaseData['station_id'],
                    'type' => 'expense',
                    'amount' => $purchaseData['paid_amount'],
                    'from_type' => $purchaseData['payment_source_type'] ?? null,
                    'from_id' => $purchaseData['payment_source_id'] ?? null,
                    'to_type' => null,
                    'to_id' => null,
                    'description' => 'سداد فاتورة تفريغ #' . $purchaseId,
                    'related_entity_type' => 'supplier',
                    'related_entity_id' => $purchaseData['supplier_id'],
                    'date' => date('Y-m-d'),
                    'created_by' => $user['id']
                ]);
            }
            // --------------------------------------------------

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
