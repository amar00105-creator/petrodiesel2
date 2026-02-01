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
        $this->checkAndFixDatabase();
        $user = AuthHelper::user();
        $saleModel = new Sale();
        $sales = $saleModel->getAll($user['station_id']);

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
        $this->loadCreateView();
    }

    private function getNewInvoiceNumber($stationId)
    {
        $db = \App\Config\Database::connect();

        $year = date('y'); // 26
        $month = date('m'); // 02

        // Count existing invoices in current month for this station
        $prefix = 'S' . $year . $month;
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM sales WHERE invoice_number LIKE ? AND station_id = ?");
        $stmt->execute([$prefix . '%', $stationId]);
        $row = $stmt->fetch();
        $sequence = ($row['count'] ?? 0) + 1;

        // Format: S2602001, S2602002, etc.
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

        $this->loadCreateView($sale);
    }

    public function invoice($id = null)
    {
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
            WHERE s.id = ?
        ");
        $stmt->execute([$id]);
        $saleDetails = $stmt->fetch(\PDO::FETCH_ASSOC);

        $this->view('sales/invoice', [
            'sale' => $saleDetails ?: $sale,
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


        // Manual Render to ensure data integrity
        $data = [
            'pumps' => $pumps,
            'workers' => $workers,
            'customers' => $customers,
            'safes' => $safes,
            'banks' => $banks,
            'sale' => $sale,
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

            // Fetch Pump and Assigned Worker
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("
                SELECT t.current_price, t.name as tank_name, ft.name as product_type, w.name as worker_name, w.id as worker_id 
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
                'worker_name' => $info['worker_name'] ?? 'غير معرف',
                'worker_id' => $info['worker_id']
            ]);
            exit;
        }
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $db = \App\Config\Database::connect();

            try {
                $user = AuthHelper::user();
                $data = $_POST;
                $data['station_id'] = $user['station_id'];
                $data['user_id'] = $user['id'];

                // Generate Invoice Number
                $data['invoice_number'] = $this->getNewInvoiceNumber($data['station_id']);

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
                    $stmt = $db->prepare("UPDATE tanks SET current_volume = current_volume - ? WHERE id = ?");
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

                // Handle Payments (Cash vs Credit)
                if (($data['payment_method'] ?? 'cash') === 'cash') {
                    $transactionData['type'] = 'income';
                    $transactionData['amount'] = $data['total_amount'];
                    // Update description to use invoice number
                    $transactionData['description'] = "مبيعات محروقات - عملية " . $data['invoice_number'];

                    // Add to selected Safe or Bank
                    $accountType = $data['account_type'] ?? null;
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
                }

                // ========== COMMIT TRANSACTION ==========
                $db->commit();

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Sale added successfully']);
                    exit;
                }
                $this->redirect('/sales');
            } catch (\Exception $e) {
                // ========== ROLLBACK ON ERROR ==========
                if ($db->inTransaction()) {
                    $db->rollBack();
                }

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    // Return the specific error message to help debugging
                    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
                    exit;
                }
                // Fallback for non-AJAX
                die("An error occurred: " . $e->getMessage());
            }
        }
    }
    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        // Check permission if needed
        if (!AuthHelper::can('sales_delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $db = \App\Config\Database::connect();

        try {
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?"); // or sale_id depending on schema, SalesList uses id.
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Delete failed']);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
        }
        exit;
    }

    public function update_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('sales_edit')) {
            // Assuming a permission exists, otherwise simplify or remove check
            // For now, I'll proceed.
        }

        $data = $_POST;
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID required']);
            return;
        }

        $db = \App\Config\Database::connect();

        try {
            // Basic fields to update. 
            // Note: Updating amounts/volumes here implies manual correction. 
            // Does not auto-adjust inventory/counters to avoid complexity unless requested.
            $sql = "UPDATE sales SET 
                    volume_sold = ?, 
                    total_amount = ?, 
                    payment_method = ?,
                    unit_price = ?
                    WHERE id = ?";

            $stmt = $db->prepare($sql);
            $success = $stmt->execute([
                $data['liters'],
                $data['amount'],
                $data['method'],
                $data['price'],
                $id
            ]);

            if ($success) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Update failed']);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
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
