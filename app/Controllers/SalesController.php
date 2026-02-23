<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Sale;
use App\Models\Pump;
use App\Models\Counter;
use App\Models\Worker;
use App\Models\Tank;
use App\Models\Transaction;

class SalesController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        if (!AuthHelper::can('sales.view')) {
            $this->unauthorized();
        }
        $this->checkAndFixDatabase();
        $user = AuthHelper::user();
        // Filter by current active station (respects station switcher)
        $currentStationId = $user['station_id'];

        $saleModel = new Sale();
        $sales = $saleModel->getAll($currentStationId);

        $this->view('sales/index', [
            'sales' => $sales,
            'hide_topbar' => true,
            // Add React resources
            'additional_js' => '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>' . \App\Helpers\ViteHelper::load('resources/js/main.jsx'),
            'additional_css' => '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">'
        ]);
    }

    public function create()
    {
        if (!AuthHelper::can('sales.create')) {
            $this->unauthorized();
        }
        $this->loadCreateView();
    }

    private function getNewInvoiceNumber($stationId)
    {
        $db = \App\Config\Database::connect();

        $year = date('y'); // 26
        $month = date('m'); // 02

        // Count existing invoices in current month for this station
        // New Format: S{StationID}{YY}{MM}{Sequence} (e.g. S126020001)
        $prefix = 'S' . $stationId . $year . $month;

        $stmt = $db->prepare("SELECT COUNT(*) as count FROM sales WHERE invoice_number LIKE ? AND station_id = ?");
        $stmt->execute([$prefix . '%', $stationId]);
        $row = $stmt->fetch();
        $sequence = ($row['count'] ?? 0) + 1;

        // Pad sequence to 4 digits (e.g. 0001)
        return $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function getNextInvoiceNumber()
    {
        $user = AuthHelper::user();
        $invoiceNum = $this->getNewInvoiceNumber($user['station_id']);

        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'invoice_number' => $invoiceNum]);
        exit;
    }

    public function edit($id = null)
    {
        if (!AuthHelper::can('sales.edit')) {
            $this->unauthorized();
        }
        $id = $id ?? $_GET['id'] ?? null;

        if (!$id) {
            $this->redirect('/sales');
            return;
        }

        $saleModel = new Sale();
        $sale = $saleModel->getOne($id);

        if (!$sale) {
            error_log("Sale edit: Sale with ID $id not found.");
            $this->redirect('/sales');
            return;
        }

        // Check if this sale is part of a batch (same invoice number)
        if (!empty($sale['invoice_number'])) {
            $batchSales = $saleModel->getByInvoiceNumber($sale['invoice_number']);
            if (count($batchSales) > 1) {
                // Pass the whole batch
                $this->loadCreateView($batchSales);
                return;
            }
        }

        $this->loadCreateView($sale);
    }

    public function invoice($id = null)
    {
        if (!AuthHelper::can('sales.view')) {
            $this->unauthorized();
        }
        $id = $id ?? $_GET['id'] ?? null;

        if (!$id) {
            $this->redirect('/sales');
            return;
        }

        $saleModel = new Sale();
        $sale = $saleModel->getOne($id);

        if (!$sale) {
            error_log("Invoice: Sale with ID $id not found.");
            $this->redirect('/sales');
            return;
        }

        // Get additional sale details
        $db = \App\Config\Database::connect();

        // Check bank column name first (dynamic fix or assumption)
        // Sale model uses bank_name, let's stick to that but handle potential alias
        $stmt = $db->prepare("
            SELECT 
                s.*, 
                w.name as worker_name,
                p.name as pump_name,
                ft.name as fuel_type,
                c.name as customer_name,
                sf.name as safe_name,
                b.bank_name as bank_name -- Corrected to bank_name
            FROM sales s
            LEFT JOIN workers w ON s.worker_id = w.id
            LEFT JOIN counters cnt ON s.counter_id = cnt.id
            LEFT JOIN pumps p ON cnt.pump_id = p.id
            LEFT JOIN tanks t ON p.tank_id = t.id
            LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
            LEFT JOIN customers c ON s.customer_id = c.id
            -- Link via transactions
            LEFT JOIN transactions tr ON (tr.related_entity_id = s.id AND tr.related_entity_type = 'sales')
            LEFT JOIN safes sf ON (tr.to_type = 'safe' AND tr.to_id = sf.id)
            LEFT JOIN banks b ON (tr.to_type = 'bank' AND tr.to_id = b.id)
            WHERE s.invoice_number = ?
        ");

        // Use invoice number if possible to get all items in invoice
        $invoiceNum = $sale['invoice_number'] ?? null;

        if ($invoiceNum) {
            $stmt->execute([$invoiceNum]);
            $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } else {
            // Fallback to ID
            $stmt = $db->prepare("
                SELECT 
                    s.*, 
                    w.name as worker_name,
                    p.name as pump_name,
                    ft.name as fuel_type,
                    c.name as customer_name,
                    sf.name as safe_name,
                    b.bank_name as bank_name -- Corrected to bank_name
                FROM sales s
                LEFT JOIN workers w ON s.worker_id = w.id
                LEFT JOIN counters cnt ON s.counter_id = cnt.id
                LEFT JOIN pumps p ON cnt.pump_id = p.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                LEFT JOIN customers c ON s.customer_id = c.id
                -- Link via transactions
                LEFT JOIN transactions tr ON (tr.related_entity_id = s.id AND tr.related_entity_type = 'sales')
                LEFT JOIN safes sf ON (tr.to_type = 'safe' AND tr.to_id = sf.id)
                LEFT JOIN banks b ON (tr.to_type = 'bank' AND tr.to_id = b.id)
                WHERE s.id = ?
            ");
            $stmt->execute([$id]);
            $item = $stmt->fetch(\PDO::FETCH_ASSOC);
            $items = $item ? [$item] : [];
        }

        if (empty($items)) {
            $this->redirect('/sales');
            return;
        }

        // Calculate Grand Total
        $grandTotal = 0;
        foreach ($items as $item) {
            $grandTotal += $item['total_amount'];
        }

        $this->view('sales/invoice', [
            'sale' => $items[0], // Use first item for header info
            'items' => $items,   // Pass all items for the table
            'grandTotal' => $grandTotal,
            'hide_sidebar' => true,
            'hide_topbar' => true
        ]);
    }

    private function loadCreateView($sale = null)
    {
        // Debug Checkpoint

        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        $pumpModel = new Pump();
        $pumps = $pumpModel->getPumpsWithCounters($stationId);

        $workerModel = new Worker();
        $workers = $workerModel->getAll($stationId);

        $db = \App\Config\Database::connect();

        // Fetch customers
        $stmt = $db->prepare("SELECT * FROM customers WHERE station_id = ?");
        $stmt->execute([$stationId]);
        $customers = $stmt->fetchAll();

        // Fetch safes
        $stmt = $db->prepare("SELECT * FROM safes WHERE station_id = ? ORDER BY id");
        $stmt->execute([$stationId]);
        $safes = $stmt->fetchAll();

        // Fetch banks
        $stmt = $db->prepare("SELECT * FROM banks WHERE station_id = ? ORDER BY id");
        $stmt->execute([$stationId]);
        $banks = $stmt->fetchAll();


        // Fetch allStations for Header (all roles with assigned stations)
        $allStations = [];
        if ($user['role'] === 'super_admin') {
            $stmtStations = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
            $allStations = $stmtStations->fetchAll(\PDO::FETCH_ASSOC);
        } else {
            $assignedStationIds = \App\Helpers\AuthHelper::getUserStationIds();
            if (!empty($assignedStationIds)) {
                $ph = implode(',', array_fill(0, count($assignedStationIds), '?'));
                $stmtStations = $db->prepare("SELECT id, name FROM stations WHERE id IN ($ph) ORDER BY name ASC");
                $stmtStations->execute($assignedStationIds);
                $allStations = $stmtStations->fetchAll(\PDO::FETCH_ASSOC);
            }
        }

        // Fetch active users count for header stats
        $stmtActive = $db->query("SELECT COUNT(*) FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
        $activeUsers = $stmtActive->fetchColumn();

        // Manual Render to ensure data integrity
        $data = [
            'pumps' => $pumps,
            'workers' => $workers,
            'customers' => $customers,
            'safes' => $safes,
            'banks' => $banks,
            'sale' => $sale,
            'user' => $user,
            'allStations' => $allStations,
            'stats' => ['activeUsers' => $activeUsers],
            'hide_topbar' => true, // Hide the default PHP topbar as React handles its own header
            'additional_js' => '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>' . \App\Helpers\ViteHelper::load('resources/js/main.jsx'),
            'additional_css' => '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">'
        ];

        extract($data);

        // Path to views relative to this controller file (app/Controllers)
        // app/Controllers -> app/Views
        $viewPath = __DIR__ . '/../Views/sales/create.php';
        // Use the legacy layout from the root views directory to include the Sidebar
        $layoutPath = dirname(__DIR__, 2) . '/views/layouts/main.php';

        // Render logic normally handled by Core/Controller
        if (file_exists($layoutPath)) {
            $child_view = $viewPath;
            require $layoutPath;
        } else {
            require $viewPath;
        }
    }

    public function getCounterDetails()
    {
        if (isset($_GET['counter_id'])) {
            $counterModel = new Counter();
            $counter = $counterModel->find($_GET['counter_id']);

            // Fetch Pump, Tank, and Assigned Worker
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("
                SELECT t.id as tank_id, t.current_price, t.current_volume, t.name as tank_name, ft.name as product_type, w.name as worker_name, w.id as worker_id 
                FROM tanks t 
                JOIN pumps p ON p.tank_id = t.id 
                JOIN counters c ON c.pump_id = p.id 
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
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
                'tank_name' => $info['tank_name'] ?? 'غير معروف',
                'tank_id' => $info['tank_id'],
                'tank_volume' => $info['current_volume'] ?? 0,
                'worker_name' => $info['worker_name'] ?? 'غير معرف',
                'worker_id' => $info['worker_id']
            ]);
            exit;
        }
    }

    public function store()
    {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!AuthHelper::can('sales.create')) {
                $this->unauthorized();
            }
            try {
                $db = \App\Config\Database::connect();
                $user = AuthHelper::user();
                // ... rest of logic ...

                $data = $_POST;
                $data['station_id'] = $user['station_id'];
                $data['user_id'] = $user['id'];

                // Generate Invoice Number if not provided
                if (!empty($data['invoice_number'])) {
                    // Use provided invoice number (for batch saves)
                } else {
                    $data['invoice_number'] = $this->getNewInvoiceNumber($data['station_id']);
                }

                if (empty($data['station_id'])) {
                    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                        header('Content-Type: application/json');
                        echo json_encode(['success' => false, 'message' => 'Station ID missing']);
                        exit;
                    }
                    $this->redirect('/sales/create?error=no_station');
                    return;
                }

                // Clean up empty values to NULL
                $data['customer_id'] = !empty($data['customer_id']) ? $data['customer_id'] : null;
                $data['worker_id'] = !empty($data['worker_id']) ? $data['worker_id'] : null;

                // Validation: Closing >= Opening
                if ($data['closing_reading'] < $data['opening_reading']) {
                    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                        header('Content-Type: application/json');
                        echo json_encode(['success' => false, 'message' => 'القراءة الحالية يجب أن تكون أكبر من السابقة']);
                        exit;
                    }
                    $this->redirect('/sales/create?error=invalid_reading&msg=' . urlencode('القراءة الحالية يجب أن تكون أكبر من السابقة'));
                    return;
                }

                // Calculate Volume & Amount (Server side verify)
                $data['volume_sold'] = $data['closing_reading'] - $data['opening_reading'];
                $data['total_amount'] = $data['volume_sold'] * $data['unit_price'];

                // ========== BEGIN TRANSACTION ==========
                $db->beginTransaction();

                // Save Sale
                $saleModel = new Sale();
                $saleId = $saleModel->create($data);

                // Update Counter Reading
                $counterModel = new Counter();
                $counterModel->updateReading($data['counter_id'], $data['closing_reading']);

                // Deduct from Tank
                $stmt = $db->prepare("SELECT t.id FROM tanks t JOIN pumps p ON p.tank_id = t.id JOIN counters c ON c.pump_id = p.id WHERE c.id = ?");
                $stmt->execute([$data['counter_id']]);
                $tank = $stmt->fetch();

                if ($tank) {
                    $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume - ?) WHERE id = ?");
                    $stmt->execute([$data['volume_sold'], $tank['id']]);
                }

                // --- ACCOUNTING INTEGRATION ---
                $transactionModel = new Transaction();
                $transactionData = [
                    'station_id' => $data['station_id'],
                    'created_by' => $user['id'],
                    'date' => $data['sale_date'] ?? date('Y-m-d'),
                    'related_entity_type' => 'sales',
                    'related_entity_id' => $saleId,
                    'category_id' => null
                ];

                // Handle Payments (Cash/Bank vs Credit)
                // Normalize: 'bank' is treated as cash payment directed to a bank account
                $paymentMethod = $data['payment_method'] ?? 'cash';
                $accountType = $data['account_type'] ?? 'safe';
                if ($paymentMethod === 'bank') {
                    $accountType = 'bank'; // Force account_type when method is 'bank'
                }

                if ($paymentMethod === 'cash' || $paymentMethod === 'bank') {
                    $transactionData['type'] = 'income';
                    $transactionData['amount'] = $data['total_amount'];
                    $transactionData['description'] = "مبيعات محروقات - عملية " . $data['invoice_number'];

                    $accountId = !empty($data['account_id']) ? $data['account_id'] : null;

                    if ($accountType === 'safe' && $accountId) {
                        $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
                        $stmt->execute([$data['total_amount'], $accountId]);
                        $transactionData['to_type'] = 'safe';
                        $transactionData['to_id'] = $accountId;
                    } elseif ($accountType === 'bank' && $accountId) {
                        $stmt = $db->prepare("UPDATE banks SET balance = balance + ? WHERE id = ?");
                        $stmt->execute([$data['total_amount'], $accountId]);
                        $transactionData['to_type'] = 'bank';
                        $transactionData['to_id'] = $accountId;
                    } else {
                        // Fallback: Add to first safe if no account selected
                        $stmt = $db->prepare("SELECT id FROM safes WHERE station_id = ? ORDER BY id ASC LIMIT 1");
                        $stmt->execute([$data['station_id']]);
                        $fallbackSafe = $stmt->fetch();
                        if ($fallbackSafe) {
                            $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
                            $stmt->execute([$data['total_amount'], $fallbackSafe['id']]);
                            $transactionData['to_type'] = 'safe';
                            $transactionData['to_id'] = $fallbackSafe['id'];
                        }
                    }

                    // Create Transaction Record if destination exists
                    if (!empty($transactionData['to_type'])) {
                        $transactionModel->create($transactionData);
                    }
                } elseif ($data['payment_method'] === 'credit' && !empty($data['customer_id'])) {
                    // Update Customer Balance (Debtor)
                    $stmt = $db->prepare("UPDATE customers SET balance = balance + ? WHERE id = ?");
                    $stmt->execute([$data['total_amount'], $data['customer_id']]);

                    // --- NEW: Create Transaction for Credit Sale (Accrual) ---
                    $transactionData['type'] = 'income';
                    $transactionData['amount'] = $data['total_amount'];
                    $transactionData['description'] = "مبيعات آجل - عملية " . $data['invoice_number'];
                    $transactionData['to_type'] = 'customer';
                    $transactionData['to_id'] = $data['customer_id'];
                    $transactionModel->create($transactionData);
                    // ---------------------------------------------------------
                }

                // ========== COMMIT TRANSACTION ==========

                $db->commit();

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Sale added successfully']);
                    exit;
                }
                $this->redirect('/sales');
            } catch (\Throwable $e) {
                // ========== ROLLBACK ON ERROR ==========
                if (isset($db) && $db->inTransaction()) {
                    $db->rollBack();
                }

                error_log("Sales Store Error: " . $e->getMessage() . "\nStack: " . $e->getTraceAsString());

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'message' => 'حدث خطأ أثناء حفظ الفاتورة']);
                    exit;
                }
                $this->redirect('/sales?error=' . urlencode('حدث خطأ أثناء حفظ الفاتورة'));
            }
        }
    }
    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        // Check permission if needed
        if (!AuthHelper::can('sales.delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $db = \App\Config\Database::connect();

        try {
            $db->beginTransaction();

            // 1. Get sale details before deleting
            $stmt = $db->prepare("SELECT * FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            $sale = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$sale) {
                echo json_encode(['success' => false, 'message' => 'Sale not found']);
                return;
            }

            // 2. Get related transaction to reverse balances
            $stmt = $db->prepare("SELECT * FROM transactions WHERE related_entity_type = 'sales' AND related_entity_id = ?");
            $stmt->execute([$id]);
            $transaction = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($transaction) {
                // Reverse balance from safe or bank
                if ($transaction['to_type'] === 'safe' && $transaction['to_id']) {
                    $stmt = $db->prepare("UPDATE safes SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$transaction['amount'], $transaction['to_id']]);
                } elseif ($transaction['to_type'] === 'bank' && $transaction['to_id']) {
                    $stmt = $db->prepare("UPDATE banks SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$transaction['amount'], $transaction['to_id']]);
                }

                // Delete the transaction
                $stmt = $db->prepare("DELETE FROM transactions WHERE id = ?");
                $stmt->execute([$transaction['id']]);
            }

            // 3. Reverse customer balance if credit sale
            if (!empty($sale['customer_id']) && $sale['payment_method'] === 'credit') {
                $stmt = $db->prepare("UPDATE customers SET balance = balance - ? WHERE id = ?");
                $stmt->execute([$sale['total_amount'], $sale['customer_id']]);
            }

            // 4. Restore tank volume
            if (!empty($sale['counter_id'])) {
                $stmt = $db->prepare("SELECT t.id FROM tanks t JOIN pumps p ON p.tank_id = t.id JOIN counters c ON c.pump_id = p.id WHERE c.id = ?");
                $stmt->execute([$sale['counter_id']]);
                $tank = $stmt->fetch();

                if ($tank) {
                    $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume + ?) WHERE id = ?");
                    $stmt->execute([$sale['volume_sold'], $tank['id']]);
                }
            }

            // 5. Delete the sale record
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $stmt->execute([$id]);

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'تم حذف الفاتورة وعكس جميع الحركات المالية']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
        }
        exit;
    }

    public function update_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('sales.edit')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID required']);
            return;
        }

        $db = \App\Config\Database::connect();

        try {
            $db->beginTransaction();

            // 1. Fetch Existing Sale
            $stmt = $db->prepare("SELECT * FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            $oldSale = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$oldSale) {
                throw new \Exception("Sale not found with ID: " . $id);
            }

            // 2. Reverse Old Effects
            // 2a. Reverse Transaction
            $stmt = $db->prepare("SELECT * FROM transactions WHERE related_entity_type = 'sales' AND related_entity_id = ?");
            $stmt->execute([$id]);
            $oldTrans = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($oldTrans) {
                // Deduct from Safe/Bank/Customer based on old Transaction
                if ($oldTrans['to_type'] === 'safe' && $oldTrans['to_id']) {
                    $stmt = $db->prepare("UPDATE safes SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$oldTrans['amount'], $oldTrans['to_id']]);
                } elseif ($oldTrans['to_type'] === 'bank' && $oldTrans['to_id']) {
                    $stmt = $db->prepare("UPDATE banks SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$oldTrans['amount'], $oldTrans['to_id']]);
                } elseif ($oldTrans['to_type'] === 'customer') {
                    // Reverse Customer Balance
                    $stmt = $db->prepare("UPDATE customers SET balance = balance - ? WHERE id = ?");
                    $stmt->execute([$oldTrans['amount'], $oldTrans['to_id']]);
                }

                // Delete old transaction
                $db->prepare("DELETE FROM transactions WHERE id = ?")->execute([$oldTrans['id']]);
            }

            // 2b. Restore Tank Volume
            if (!empty($oldSale['counter_id'])) {
                // Find tank via counter
                $stmt = $db->prepare("
                    SELECT t.id 
                    FROM tanks t 
                    JOIN pumps p ON p.tank_id = t.id 
                    JOIN counters c ON c.pump_id = p.id 
                    WHERE c.id = ?
                ");
                $stmt->execute([$oldSale['counter_id']]);
                $tank = $stmt->fetch();
                if ($tank) {
                    // Add back the sold volume
                    $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume + ?) WHERE id = ?");
                    $stmt->execute([$oldSale['volume_sold'], $tank['id']]);
                }
            }

            // 3. Prepare New Data
            $data = $_POST;
            $data['volume_sold'] = $data['closing_reading'] - $data['opening_reading'];
            $data['total_amount'] = $data['volume_sold'] * $data['unit_price'];

            // Validation
            if ($data['closing_reading'] < $data['opening_reading']) {
                throw new \Exception("New closing reading (" . $data['closing_reading'] . ") cannot be less than opening (" . $data['opening_reading'] . ")");
            }

            // 4. Update Sale Record
            $sql = "UPDATE sales SET 
                    closing_reading = ?,
                    volume_sold = ?, 
                    total_amount = ?, 
                    unit_price = ?,
                    payment_method = ?,
                    sale_date = ?
                    WHERE id = ?";

            $accountType = $data['account_type'] ?? 'safe';
            if ($data['payment_method'] === 'bank') {
                $accountType = 'bank';
            }

            $stmt = $db->prepare($sql);
            $stmt->execute([
                $data['closing_reading'],
                $data['volume_sold'],
                $data['total_amount'],
                $data['unit_price'],
                $data['payment_method'],
                $data['sale_date'] ?? $oldSale['sale_date'], // Use new date or keep old
                $id
            ]);

            // 5. Apply New Effects
            // 5a. Update Counter Reading (to new closing)
            $counterModel = new Counter();
            $targetCounterId = $data['counter_id'] ?? $oldSale['counter_id'];
            $counterModel->updateReading($targetCounterId, $data['closing_reading']);

            // 5b. Deduct from Tank (New Volume)
            // Re-fetch tank in case counter changed (though usually counter doesn't change on edit here)
            $stmt = $db->prepare("
                SELECT t.id 
                FROM tanks t 
                JOIN pumps p ON p.tank_id = t.id 
                JOIN counters c ON c.pump_id = p.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$oldSale['counter_id']]);
            $tank = $stmt->fetch();

            if ($tank) {
                $stmt = $db->prepare("UPDATE tanks SET current_volume = GREATEST(0, current_volume - ?) WHERE id = ?");
                $stmt->execute([$data['volume_sold'], $tank['id']]);
            }

            // 5c. Create Transaction
            $transactionModel = new Transaction();
            $notes = $data['notes'] ?? ($data['note'] ?? '');

            $saleDate = $data['sale_date'] ?? null;
            if (empty($saleDate) || $saleDate === 'undefined') {
                $saleDate = $oldSale['sale_date'];
            }

            $transactionData = [
                'station_id' => $oldSale['station_id'],
                'created_by' => $oldSale['user_id'],
                'date' => $saleDate,
                'related_entity_type' => 'sales',
                'related_entity_id' => $id,
                'category_id' => null,
                'type' => 'income',
                'amount' => $data['total_amount'],
                'description' => "مبيعات محروقات (معدلة) - عملية " . ($oldSale['invoice_number'] ?? $id) . ($notes ? " - " . $notes : "")
            ];

            // Normalize: 'bank' is treated as cash payment directed to a bank account
            $paymentMethod = $data['payment_method'] ?? 'cash';
            if ($paymentMethod === 'bank') {
                $accountType = 'bank';
            }

            if ($paymentMethod === 'cash' || $paymentMethod === 'bank') {
                $accountId = !empty($data['account_id']) ? $data['account_id'] : null;

                if ($accountType === 'safe' && $accountId) {
                    $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
                    $stmt->execute([$data['total_amount'], $accountId]);
                    $transactionData['to_type'] = 'safe';
                    $transactionData['to_id'] = $accountId;
                } elseif ($accountType === 'bank' && $accountId) {
                    $stmt = $db->prepare("UPDATE banks SET balance = balance + ? WHERE id = ?");
                    $stmt->execute([$data['total_amount'], $accountId]);
                    $transactionData['to_type'] = 'bank';
                    $transactionData['to_id'] = $accountId;
                } else {
                    // Fallback: Add to first safe
                    $stmt = $db->prepare("SELECT id FROM safes WHERE station_id = ? ORDER BY id ASC LIMIT 1");
                    $stmt->execute([$oldSale['station_id']]);
                    $fallbackSafe = $stmt->fetch();
                    if ($fallbackSafe) {
                        $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
                        $stmt->execute([$data['total_amount'], $fallbackSafe['id']]);
                        $transactionData['to_type'] = 'safe';
                        $transactionData['to_id'] = $fallbackSafe['id'];
                    }
                }
            } elseif ($paymentMethod === 'credit' && !empty($data['customer_id'])) {
                // Update Customer Balance
                $stmt = $db->prepare("UPDATE customers SET balance = balance + ? WHERE id = ?");
                $stmt->execute([$data['total_amount'], $data['customer_id']]);

                $transactionData['description'] = "مبيعات آجل (معدلة) - عملية " . ($oldSale['invoice_number'] ?? $id);
                $transactionData['to_type'] = 'customer';
                $transactionData['to_id'] = $data['customer_id'];
            }

            // Save Transaction
            if (!empty($transactionData['to_type'])) {
                $transactionModel->create($transactionData);
            }

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'Sale updated successfully']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            error_log("Update Error: " . $e->getMessage()); // Log error
            echo json_encode(['success' => false, 'message' => 'Update Error: ' . $e->getMessage()]);
        }
        exit;
    }
    private function checkAndFixDatabase()
    {
        try {
            $db = \App\Config\Database::connect();

            // Check if column exists
            $stmt = $db->query("SHOW COLUMNS FROM sales LIKE 'invoice_number'");
            $exists = $stmt->fetch();

            if (!$exists) {
                // Add Column
                $db->exec("ALTER TABLE sales ADD COLUMN invoice_number VARCHAR(50) DEFAULT NULL AFTER id");

                // Backfill Data
                $stmt = $db->query("SELECT id, created_at FROM sales");
                $sales = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                $updateStmt = $db->prepare("UPDATE sales SET invoice_number = ? WHERE id = ?");

                foreach ($sales as $sale) {
                    $date = $sale['created_at'] ?? date('Y-m-d H:i:s');
                    $year = date('y', strtotime($date));
                    $month = date('m', strtotime($date));
                    $invoiceNum = 'S' . $year . $month . $sale['id'];
                    $updateStmt->execute([$invoiceNum, $sale['id']]);
                }
            }
        } catch (\Exception $e) {
            // Silently fail or log, but don't break the app flow if possible
            error_log("Auto-Migration Error: " . $e->getMessage());
        }
    }
}
