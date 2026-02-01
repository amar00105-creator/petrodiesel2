<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Sale;
use App\Models\Tank;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Employee;
use App\Models\Worker;
use App\Models\Purchase;
use App\Models\Calibration;
use App\Models\Payroll; // Added Payroll model

require_once __DIR__ . '/../Models/Sale.php';
require_once __DIR__ . '/../Models/Tank.php';
require_once __DIR__ . '/../Models/Supplier.php';
require_once __DIR__ . '/../Models/Customer.php';
require_once __DIR__ . '/../Models/Transaction.php';
require_once __DIR__ . '/../Models/Purchase.php';
require_once __DIR__ . '/../Models/Calibration.php';
require_once __DIR__ . '/../Models/Payroll.php'; // Require Payroll model


class ReportsController extends Controller
{
    private $saleModel;
    private $tankModel;
    private $supplierModel;
    private $customerModel;
    private $transactionModel;
    private $purchaseModel;
    private $calibrationModel;
    private $payrollModel; // Added property

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->saleModel = new Sale();
        $this->tankModel = new Tank();
        $this->supplierModel = new Supplier();
        $this->customerModel = new Customer();
        $this->transactionModel = new Transaction();
        $this->purchaseModel = new Purchase();
        $this->calibrationModel = new Calibration();
        $this->payrollModel = new Payroll(); // Initialize Payroll model
    }

    public function index()
    {
        $user = AuthHelper::user();


        // Check if it's an API request for stats
        if (isset($_GET['action']) && $_GET['action'] === 'get_stats') {
            while (ob_get_level()) ob_end_clean();
            $this->getStats();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_sources') {
            while (ob_get_level()) ob_end_clean();
            $this->getSources();
            return;
        }


        if (isset($_GET['action']) && $_GET['action'] === 'financial_flow') {
            while (ob_get_level()) ob_end_clean();
            $this->getFinancialFlow();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_detailed_daily_sales') {
            while (ob_get_level()) ob_end_clean();
            $this->getDetailedDailySales();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_tank_sales') {
            while (ob_get_level()) ob_end_clean();
            $this->getTankSalesReport();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_supplier_report') {
            while (ob_get_level()) ob_end_clean();
            $this->getSupplierReport();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_customer_report') {
            while (ob_get_level()) ob_end_clean();
            $this->getCustomerReport();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_all_suppliers') {
            while (ob_get_level()) ob_end_clean();
            $this->getAllSuppliersReport();
            return;
        }


        $this->view('reports/index', [
            'user' => $user,
            'hide_topbar' => true
        ]);
    }

    private function getStats()
    {
        try {
            // 1. Filter Parameters
            $stationId = $_GET['station_id'] ?? 'all';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            // 2. Financial Stats
            // Inventory Value: Sum(current_volume * current_price) of all tanks
            // Note: This is "Current" value, not historical. For a report date range, 
            // strictly speaking we can only give current snapshot for inventory unless we have history.
            // User asked for "Real-time Inventory Valuation".
            $tanks = $this->tankModel->getAll();
            $inventoryValue = 0;
            foreach ($tanks as $tank) {
                if ($stationId !== 'all' && $tank['station_id'] != $stationId) continue;
                $inventoryValue += ($tank['current_volume'] * $tank['current_price']);
            }

            // Corporate Debts (Receivables): Sum of Customer balances
            // Assuming positive balance means they owe us? 
            // Convention: If I credit them (Sale), balance increases. If they Pay, balance decreases.
            // So Balance > 0 = Debt to us.
            $customers = $this->customerModel->getAll($stationId === 'all' ? null : $stationId);
            $corporateDebts = 0;
            foreach ($customers as $c) {
                $corporateDebts += $c['balance'];
            }

            // Supplier Debts (Payables): Sum of Supplier balances
            // Assuming positive balance means we owe them?
            // Convention: We buy (Expense/Purchase), balance increases. We Pay, balance decreases.
            $suppliers = $this->supplierModel->getAll($stationId === 'all' ? null : $stationId);
            $supplierDebts = 0;
            foreach ($suppliers as $s) {
                $supplierDebts += $s['balance'];
            }

            // --- NEW: Additional Financial Details ---

            // Banks and Safes Balances
            $db = \App\Config\Database::connect();
            $safes = [];
            $banks = [];
            $totalSafes = 0;
            $totalBanks = 0;

            try {
                // Fetch Safes
                if ($stationId === 'all') {
                    $stmt = $db->query("SELECT id, name, balance FROM safes ORDER BY balance DESC");
                } else {
                    $stmt = $db->prepare("SELECT id, name, balance FROM safes WHERE station_id = ? ORDER BY balance DESC");
                    $stmt->execute([$stationId]);
                }
                $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                $totalSafes = array_sum(array_column($safes, 'balance'));

                // Fetch Banks
                if ($stationId === 'all') {
                    $stmt = $db->query("SELECT id, bank_name as name, account_number, balance FROM banks ORDER BY balance DESC");
                } else {
                    $stmt = $db->prepare("SELECT id, bank_name as name, account_number, balance FROM banks WHERE station_id = ? ORDER BY balance DESC");
                    $stmt->execute([$stationId]);
                }
                $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                $totalBanks = array_sum(array_column($banks, 'balance'));
            } catch (\Exception $e) {
                // Ignore table missing errors
            }

            // Top 5 Customers by Balance (who owe us the most)
            $topCustomers = [];
            if (!empty($customers)) {
                $topCustomers = array_slice(
                    array_filter($customers, fn($c) => $c['balance'] > 0),
                    0,
                    5
                );
                usort($topCustomers, fn($a, $b) => $b['balance'] <=> $a['balance']);
            }

            // Top 5 Suppliers by Balance (who we owe the most)
            $topSuppliers = [];
            if (!empty($suppliers)) {
                $topSuppliers = array_slice(
                    array_filter($suppliers, fn($s) => $s['balance'] > 0),
                    0,
                    5
                );
                usort($topSuppliers, fn($a, $b) => $b['balance'] <=> $a['balance']);
            }

            // Expense Categories Breakdown
            $expenseBreakdown = [];
            try {
                $stmt = $db->prepare("
                    SELECT 
                        COALESCE(tc.name, 'غير مصنف') as category_name,
                        SUM(t.amount) as total_amount,
                        COUNT(*) as transaction_count
                    FROM transactions t
                    LEFT JOIN transaction_categories tc ON t.category_id = tc.id
                    WHERE t.type = 'expense' 
                    AND t.date BETWEEN ? AND ?
                    " . ($stationId !== 'all' ? "AND t.station_id = ?" : "") . "
                    GROUP BY tc.id, tc.name
                    ORDER BY total_amount DESC
                ");
                if ($stationId !== 'all') {
                    $stmt->execute([$startDate, $endDate, $stationId]);
                } else {
                    $stmt->execute([$startDate, $endDate]);
                }
                $expenseBreakdown = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {
                // Ignore if tables don't exist
            }

            // Income/Expense from Transactions (General P&L) for the period
            // We need a helper in Transaction model to get aggregated totals by type and date
            $financials = $this->transactionModel->getTotalsByPeriod($startDate, $endDate, $stationId);

            // 3. Sales Stats
            $salesStats = method_exists($this->saleModel, 'getStatsByPeriod')
                ? $this->saleModel->getStatsByPeriod($startDate, $endDate, $stationId)
                : ['total_liters' => 0, 'total_revenue' => 0, 'count' => 0];

            $productStats = method_exists($this->saleModel, 'getSalesByProduct')
                ? $this->saleModel->getSalesByProduct($startDate, $endDate, $stationId)
                : [];

            // 4. Warehouse Stats (Tanks)
            $purchaseStats = method_exists($this->purchaseModel, 'getStatsByPeriod')
                ? $this->purchaseModel->getStatsByPeriod($startDate, $endDate, $stationId)
                : ['total_volume_in' => 0, 'total_cost_in' => 0, 'count' => 0];

            $evaporationLoss = 0;

            $tankStats = array_map(function ($t) use ($startDate, $endDate, &$evaporationLoss) {
                $lastCal = method_exists($this->tankModel, 'getLastCalibration')
                    ? $this->tankModel->getLastCalibration($t['id'])
                    : null;

                // Variance Calculation Logic
                // 1. Opening Volume (First reading on or before StartDate)
                $opening = method_exists($this->tankModel, 'getReadingAt')
                    ? $this->tankModel->getReadingAt($t['id'], date('Y-m-d', strtotime($startDate . ' -1 day')))
                    : false;
                // If no reading found, use capacity or current as best guess? Or 0. 
                // For now, if no reading, we assume we can't calculate variance accurately.

                $variance = 0;
                if ($opening !== false) { // Only calculate if we have a baseline
                    // 2. Closing Volume (Last reading on or before EndDate)
                    $closing = method_exists($this->tankModel, 'getReadingAt')
                        ? $this->tankModel->getReadingAt($t['id'], $endDate)
                        : false;

                    // Fallback: If no reading for 'today/future' and EndDate is today, use current live volume
                    if ($closing === false && $endDate >= date('Y-m-d')) {
                        $closing = $t['current_volume'];
                    }

                    if ($closing !== false) {
                        $salesVol = method_exists($this->saleModel, 'getVolumeByTank')
                            ? $this->saleModel->getVolumeByTank($t['id'], $startDate, $endDate)
                            : 0;

                        $purchaseVol = method_exists($this->purchaseModel, 'getVolumeByTank')
                            ? $this->purchaseModel->getVolumeByTank($t['id'], $startDate, $endDate)
                            : 0;

                        // Theoretical = Opening + In - Out
                        $theoretical = $opening + $purchaseVol - $salesVol;
                        $actual = $closing;

                        // Variance = Actual - Theoretical (Negative means missing/evaporation)
                        $variance = $actual - $theoretical;

                        if ($variance < 0) {
                            $evaporationLoss += abs($variance);
                        }
                    }
                }

                return [
                    'id' => $t['id'],
                    'name' => $t['name'],
                    'volume' => $t['current_volume'],
                    'capacity' => $t['capacity_liters'],
                    'fuel' => $t['fuel_name'],
                    'value' => $t['current_volume'] * $t['current_price'],
                    'last_calibration' => $lastCal ? date('Y-m-d', strtotime($lastCal)) : 'N/A',
                    'variance' => round($variance, 2)
                ];
            }, $tanks);

            // 5. Employee/Worker Stats
            $workerStats = method_exists($this->saleModel, 'getWorkerPerformance')
                ? $this->saleModel->getWorkerPerformance($startDate, $endDate, $stationId)
                : [];

            // Calculate Shortages (Deficit/Surplus)
            foreach ($workerStats as &$worker) {
                // ... existing logic ...
                $worker['shortage'] = 0; // Keeping placeholder as discussed
            }
            // $evaporationLoss is now calculated dynamically above

            // Fetch detailed lists for tables
            $detailedPurchases = method_exists($this->purchaseModel, 'getByPeriod')
                ? $this->purchaseModel->getByPeriod($startDate, $endDate, $stationId)
                : [];

            $detailedReadings = method_exists($this->tankModel, 'getReadingsByPeriod')
                ? $this->tankModel->getReadingsByPeriod($startDate, $endDate, $stationId)
                : [];

            // Daily Stock Reconciliation (Cardex)
            $dailyReconciliation = [];

            // 1. Fetch Daily Data
            $dailySales = method_exists($this->saleModel, 'getDailySalesByTank')
                ? $this->saleModel->getDailySalesByTank($stationId, $startDate, $endDate)
                : [];

            $dailyPurchases = method_exists($this->purchaseModel, 'getDailyPurchasesByTank')
                ? $this->purchaseModel->getDailyPurchasesByTank($stationId, $startDate, $endDate)
                : [];

            $dailyReadings = method_exists($this->tankModel, 'getDailyReadings')
                ? $this->tankModel->getDailyReadings($stationId, $startDate, $endDate)
                : [];

            // 2. Structure Data by Date and Tank
            $dataByDateTank = [];
            // Helper to init key
            $initKey = function ($date, $tankId) use (&$dataByDateTank) {
                if (!isset($dataByDateTank[$date][$tankId])) {
                    $dataByDateTank[$date][$tankId] = [
                        'sales' => 0,
                        'purchases' => 0,
                        'actual_closing' => null
                    ];
                }
            };

            foreach ($dailySales as $s) {
                $initKey($s['sale_date'], $s['tank_id']);
                $dataByDateTank[$s['sale_date']][$s['tank_id']]['sales'] += $s['total_vol'];
            }
            foreach ($dailyPurchases as $p) {
                $initKey($p['purchase_date'], $p['tank_id']);
                $dataByDateTank[$p['purchase_date']][$p['tank_id']]['purchases'] += $p['total_vol'];
            }
            // Readings: we want the LAST reading of the day as 'Actual Closing'
            foreach ($dailyReadings as $r) {
                $initKey($r['reading_date'], $r['tank_id']);
                // Since query is ordered DESC, the first one we encounter for a date is the latest.
                if ($dataByDateTank[$r['reading_date']][$r['tank_id']]['actual_closing'] === null) {
                    $dataByDateTank[$r['reading_date']][$r['tank_id']]['actual_closing'] = $r['volume_liters'];
                }
            }

            // 3. Build the Report Row by Row
            $period = new \DatePeriod(
                new \DateTime($startDate),
                new \DateInterval('P1D'),
                (new \DateTime($endDate))->modify('+1 day')
            );

            foreach ($tanks as $tank) {
                if ($stationId !== 'all' && $tank['station_id'] != $stationId) continue;

                // Initial Opening Balance for the period (Reading BEFORE start date)
                $currentBalance = method_exists($this->tankModel, 'getReadingAt')
                    ? $this->tankModel->getReadingAt($tank['id'], date('Y-m-d', strtotime($startDate . ' -1 day')))
                    : 0;

                if ($currentBalance === false) $currentBalance = 0; // Or fetch based on very first record? For now 0 if no prior history.

                foreach ($period as $dt) {
                    $date = $dt->format('Y-m-d');

                    $in = $dataByDateTank[$date][$tank['id']]['purchases'] ?? 0;
                    $out = $dataByDateTank[$date][$tank['id']]['sales'] ?? 0;
                    $actual = $dataByDateTank[$date][$tank['id']]['actual_closing'] ?? null;

                    $theoretical = $currentBalance + $in - $out;
                    $variance = ($actual !== null) ? ($actual - $theoretical) : 0;

                    // Always add to list to show complete history (Cardex style)
                    $dailyReconciliation[] = [
                        'date' => $date,
                        'tank_name' => $tank['name'],
                        'opening' => $currentBalance,
                        'in' => $in,
                        'out' => $out,
                        'theoretical' => $theoretical,
                        'actual' => $actual,
                        'variance' => $variance
                    ];

                    // Update balance for next day
                    // If actual reading exists, that becomes the true opening for next day (resets variance)
                    // Otherwise, carry forward the theoretical balance
                    if ($actual !== null) {
                        $currentBalance = $actual;
                    } else {
                        $currentBalance = $theoretical;
                    }
                }
            }

            // 6. Fetch Calibration Logs
            $calibrationLogs = method_exists($this->calibrationModel, 'getByDateRange')
                ? $this->calibrationModel->getByDateRange($startDate, $endDate, $stationId)
                : [];

            $response = [
                'success' => true,
                'financial' => [
                    'inventory_value' => $inventoryValue,
                    'corporate_debts' => $corporateDebts,
                    'supplier_debts' => $supplierDebts,
                    'income' => $financials['income'] ?? 0,
                    'expense' => $financials['expense'] ?? 0,
                    'net_profit' => ($financials['income'] ?? 0) - ($financials['expense'] ?? 0),
                    'evaporation_loss' => $evaporationLoss,
                    // NEW: Additional Financial Details
                    'safes' => $safes,
                    'banks' => $banks,
                    'total_safes' => $totalSafes,
                    'total_banks' => $totalBanks,
                    'total_cash' => $totalSafes + $totalBanks,
                    'top_customers' => array_values($topCustomers),
                    'top_suppliers' => array_values($topSuppliers),
                    'expense_breakdown' => $expenseBreakdown
                ],
                'sales' => [
                    'total_liters' => $salesStats['total_liters'] ?? 0,
                    'total_revenue' => $salesStats['total_revenue'] ?? 0,
                    'total_transactions' => $salesStats['count'] ?? 0,
                    'by_product' => $productStats, // Array of {product_name, total_revenue, total_liters, color_hex}
                    'recent_sales' => $this->saleModel->getRecent(10, $stationId)
                ],
                'warehouse' => [
                    'tanks' => $tankStats,
                    'incoming_stock' => [
                        'total_volume' => $purchaseStats['total_volume_in'] ?? 0,
                        'total_cost' => $purchaseStats['total_cost_in'] ?? 0,
                        'count' => $purchaseStats['count'] ?? 0,
                        'list' => $detailedPurchases
                    ],
                    'readings' => $detailedReadings,
                    'daily_reconciliation' => $dailyReconciliation,
                    'pending_shipments' => method_exists($this->purchaseModel, 'getPending')
                        ? $this->purchaseModel->getPending($stationId)
                        : [],
                    'calibration_logs' => $calibrationLogs
                ],
                'employees' => [
                    'list' => $this->getWorkerStatsWithPayroll($workerStats, $startDate, $endDate, $stationId)
                ]
            ];

            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ في النظام: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    private function getSources()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');


        try {
            $user = AuthHelper::user();

            if (!$user || !isset($user['station_id'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not authenticated or station_id missing'
                ]);
                exit;
            }

            $stationId = $user['station_id'];
            $db = \App\Config\Database::connect();

            // Check if specific type is requested
            $type = $_GET['type'] ?? 'all';

            if ($type === 'customer') {
                // Fetch only customers
                $stmt = $db->prepare("SELECT id, name, balance FROM customers WHERE station_id = ? ORDER BY name ASC");
                $stmt->execute([$stationId]);
                $customers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'customers' => $customers
                ]);
                exit;
            }

            if ($type === 'supplier') {
                // Fetch only suppliers (global)
                $stmt = $db->query("SELECT id, name, balance FROM suppliers ORDER BY name ASC");
                $suppliers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'suppliers' => $suppliers
                ]);
                exit;
            }

            // Fetch all sources (default behavior)
            // Fetch Safes
            $stmt = $db->prepare("SELECT id, name, balance FROM safes WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch Banks
            $stmt = $db->prepare("SELECT id, bank_name as name, balance FROM banks WHERE station_id = ? ORDER BY bank_name ASC");
            $stmt->execute([$stationId]);
            $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch Suppliers (global - no station filter)
            $stmt = $db->query("SELECT id, name, balance FROM suppliers ORDER BY name ASC");
            $suppliers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch Customers (station-specific)
            $stmt = $db->prepare("SELECT id, name, balance FROM customers WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            $customers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'safes' => $safes,
                'banks' => $banks,
                'suppliers' => $suppliers,
                'customers' => $customers
            ]);
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    public function getFinancialFlow()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            // 1. Inputs
            $sourceType = strtolower($_GET['source_type'] ?? 'safe'); // safe | bank
            $sourceId = $_GET['source_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = ($_GET['end_date'] ?? date('Y-m-d')) . ' 23:59:59';
            $groupSales = $_GET['group_sales'] ?? 'none'; // none | daily | fuel
            $stationId = AuthHelper::user()['station_id'];

            if (!$sourceId) {
                echo json_encode(['success' => false, 'message' => 'Source ID required']);
                exit;
            }

            // 2. Opening Balance Calculation
            // Logic: Sum of all In - Sum of all Out BEFORE Start Date
            // We can reuse TransactionModel::getByAccount but filtering by date < $startDate
            // Optimization: Use a direct aggregator query for speed
            $db = \App\Config\Database::connect();
            $openingSql = "SELECT 
                        SUM(CASE 
                            WHEN (to_type = ? AND to_id = ?) THEN amount 
                            ELSE 0 
                        END) as total_in,
                        SUM(CASE 
                            WHEN (from_type = ? AND from_id = ?) THEN amount 
                            ELSE 0 
                        END) as total_out
                       FROM transactions 
                       WHERE date < ?";

            $stmt = $db->prepare($openingSql);
            $stmt->execute([$sourceType, $sourceId, $sourceType, $sourceId, $startDate]);
            $openingResult = $stmt->fetch(\PDO::FETCH_ASSOC);

            $openingBalance = ($openingResult['total_in'] ?? 0) - ($openingResult['total_out'] ?? 0);


            // 3. Current Period Transactions
            // Get ALL transactions in period first
            $transactions = $this->transactionModel->getByAccount($sourceType, $sourceId, 10000); // High limit
            // Filter by Date Range relative to the method call logic 
            // (getByAccount logic is generic, let's refine it or just filter array)
            // Actually getByAccount doesn't take date range. Let's write a custom query here or filter.
            // Writing custom query is better for performance and sorting.


            $sql = "SELECT t.*, 
                           s.id as sale_id,
                           ft.name as fuel_name,
                           u.name as user_name,
                           cat.name as category_name_resolved,
                           sup.name as supplier_name,
                           cust.name as customer_name
                    FROM transactions t
                    LEFT JOIN sales s ON (t.related_entity_type = 'sales' AND t.related_entity_id = s.id)
                    LEFT JOIN counters c ON s.counter_id = c.id
                    LEFT JOIN pumps p ON c.pump_id = p.id
                    LEFT JOIN tanks tk ON p.tank_id = tk.id
                    LEFT JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                    LEFT JOIN users u ON t.created_by = u.id
                    LEFT JOIN transaction_categories cat ON t.category_id = cat.id
                    LEFT JOIN suppliers sup ON (t.related_entity_type = 'supplier' AND t.related_entity_id = sup.id)
                    LEFT JOIN customers cust ON (t.related_entity_type = 'customer' AND t.related_entity_id = cust.id)
                    WHERE ((t.to_type = ? AND t.to_id = ?) OR (t.from_type = ? AND t.from_id = ?))
                    /* AND t.date BETWEEN ? AND ? */
                    ORDER BY t.created_at DESC, t.id DESC LIMIT 50"; // Modified for "Recent Operations" style
            $stmt = $db->prepare($sql);
            $stmt->execute([$sourceType, $sourceId, $sourceType, $sourceId]);
            $rawTransactions = $stmt->fetchAll(\PDO::FETCH_ASSOC);


            // 4. Processing Grouping Logic
            $finalRows = [];

            // Function to determine direction
            $getDirection = function ($t) use ($sourceType, $sourceId) {
                if ($t['to_type'] == $sourceType && $t['to_id'] == $sourceId) return 'in';
                return 'out';
            };



            if ($groupSales === 'none') {
                // detailed: just use rawTransactions
                foreach ($rawTransactions as $t) {
                    $dir = $getDirection($t);

                    // Determine category: show fuel type for sales
                    $category = $t['category_name_resolved'] ?? 'عام';
                    if ($t['related_entity_type'] === 'sales' && !empty($t['fuel_name'])) {
                        $category = 'مبيعات ' . $t['fuel_name'];
                    }

                    // Determine Beneficiary
                    $beneficiary = null;
                    if ($t['related_entity_type'] === 'supplier') $beneficiary = $t['supplier_name'];
                    elseif ($t['related_entity_type'] === 'customer') $beneficiary = $t['customer_name'];
                    elseif ($t['related_entity_type'] === 'sales') $beneficiary = 'مبيعات يومية';

                    $finalRows[] = [
                        'date' => $t['date'],
                        'id' => $t['id'],
                        'type' => $t['type'], // income, expense, transfer
                        'category' => $category,
                        'description' => $t['description'],
                        'user_name' => $t['user_name'] ?? null,
                        'beneficiary' => $beneficiary,
                        'amount_in' => $dir === 'in' ? $t['amount'] : 0,
                        'amount_out' => $dir === 'out' ? $t['amount'] : 0,
                        // raw data for UI
                        'is_sale' => ($t['related_entity_type'] === 'sales')
                    ];
                }
            } else {
                // Grouping Active

                // Step A: Add Non-Sale Transactions
                foreach ($rawTransactions as $t) {
                    if ($t['related_entity_type'] === 'sales') continue; // Skip sales

                    $dir = $getDirection($t);

                    // Determine Beneficiary
                    $beneficiary = null;
                    if ($t['related_entity_type'] === 'supplier') $beneficiary = $t['supplier_name'];
                    elseif ($t['related_entity_type'] === 'customer') $beneficiary = $t['customer_name'];

                    $finalRows[] = [
                        'date' => $t['date'],
                        'id' => $t['id'],
                        'type' => $t['type'],
                        'category' => $t['category_name_resolved'] ?? 'عام',
                        'description' => $t['description'],
                        'user_name' => $t['user_name'] ?? null,
                        'beneficiary' => $beneficiary,
                        'amount_in' => $dir === 'in' ? $t['amount'] : 0,
                        'amount_out' => $dir === 'out' ? $t['amount'] : 0,
                        'is_sale' => false
                    ];
                }

                // Step B: Fetch Aggregated Sales
                if ($groupSales === 'daily') {
                    $dailySales = $this->saleModel->getDailySalesForFinancial($sourceType, $sourceId, $startDate, $endDate);
                    foreach ($dailySales as $ds) {
                        $finalRows[] = [
                            'date' => $ds['date'],
                            'id' => 'G-' . str_replace('-', '', $ds['date']),
                            'type' => 'income',
                            'category' => 'مبيعات وقود',
                            'description' => "إجمالي مبيعات وقود (" . $ds['count'] . " عملية)",
                            'amount_in' => $ds['total_amount'],
                            'amount_out' => 0,
                            'is_sale' => true,
                            'is_group' => true
                        ];
                    }
                } elseif ($groupSales === 'fuel') {
                    $fuelSales = $this->saleModel->getFuelSalesForFinancial($sourceType, $sourceId, $startDate, $endDate);
                    foreach ($fuelSales as $fs) {
                        $finalRows[] = [
                            'date' => $fs['date'],
                            'id' => 'F-' . str_replace('-', '', $fs['date']) . '-' . $fs['fuel_type_id'],
                            'type' => 'income',
                            'category' => 'مبيعات ' . $fs['fuel_name'],
                            'description' => "مبيعات " . $fs['fuel_name'] . " (" . $fs['count'] . " عملية)",
                            'amount_in' => $fs['total_amount'],
                            'amount_out' => 0,
                            'is_sale' => true,
                            'is_group' => true,
                            'fuel_color' => $fs['color_hex'] ?? '#000000'
                        ];
                    }
                }

                // Step C: Sort merged list by Date
                usort($finalRows, function ($a, $b) {
                    if ($a['date'] === $b['date']) {
                        return 0; // Or better sort by ID? but mixed types.
                    }
                    return strtotime($a['date']) - strtotime($b['date']);
                });
            }

            // 5. Calculate Running Balance
            $runningBalance = $openingBalance;
            $totalIn = 0;
            $totalOut = 0;

            foreach ($finalRows as &$row) {
                // Safe math
                $amountIn = floatval($row['amount_in']);
                $amountOut = floatval($row['amount_out']);

                $runningBalance += $amountIn;
                $runningBalance -= $amountOut;

                $row['balance'] = $runningBalance;

                $totalIn += $amountIn;
                $totalOut += $amountOut;
            }

            // 6. Summary Totals (for Cards)
            $summary = [
                'opening_balance' => $openingBalance,
                'closing_balance' => $runningBalance,
                'total_sales' => 0,
                'total_other_income' => 0,
                'total_expenses' => 0,
                'total_transfers_in' => 0,
                'total_transfers_out' => 0
            ];

            foreach ($finalRows as $r) {
                if ($r['type'] === 'income') {
                    if ($r['is_sale'] ?? false) {
                        $summary['total_sales'] += $r['amount_in'];
                    } else {
                        $summary['total_other_income'] += $r['amount_in'];
                    }
                } elseif ($r['type'] === 'expense') {
                    $summary['total_expenses'] += $r['amount_out'];
                } elseif ($r['type'] === 'transfer') {
                    if ($r['amount_in'] > 0) $summary['total_transfers_in'] += $r['amount_in'];
                    if ($r['amount_out'] > 0) $summary['total_transfers_out'] += $r['amount_out'];
                }
            }




            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'summary' => $summary,
                'movements' => $finalRows
            ]);
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    public function getDetailedDailySales()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $date = $_GET['date'] ?? date('Y-m-d'); // Single date report as per image

            $db = \App\Config\Database::connect();

            // 1. Fetch Detailed Sales (The Table)
            // Join sales with Pumps, Workers, Counters
            $sql = "SELECT 
                        s.id,
                        s.created_at as time,
                        s.closing_reading as current_counter,
                        s.opening_reading as previous_counter,
                        s.volume_sold,
                        s.unit_price as price_per_liter,
                        s.total_amount,
                        w.name as worker_name,
                        p.name as machine_name,
                        tk.name as tank_name,
                        tk.id as tank_id,
                        ft.name as fuel_type
                    FROM sales s
                    LEFT JOIN workers w ON s.worker_id = w.id
                    LEFT JOIN counters c ON s.counter_id = c.id
                    LEFT JOIN pumps p ON c.pump_id = p.id
                    LEFT JOIN tanks tk ON p.tank_id = tk.id
                    LEFT JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                    WHERE DATE(s.created_at) = ?
                    " . ($stationId !== 'all' ? " AND p.station_id = ?" : "") . "
                    ORDER BY p.name ASC, s.created_at ASC";

            $params = [$date];
            if ($stationId !== 'all') {
                $params[] = $stationId;
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $sales = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // 2. Fetch Tank Reconciliation (The Footer)
            $tankStats = [];

            // Fetch all tanks
            $paramsTanks = [];
            $tankSql = "SELECT t.*, ft.name as fuel_name 
                      FROM tanks t 
                      LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id 
                      WHERE 1=1 " . ($stationId !== 'all' ? " AND t.station_id = ?" : "");

            if ($stationId !== 'all') $paramsTanks[] = $stationId;

            $stmtTanks = $db->prepare($tankSql);
            $stmtTanks->execute($paramsTanks);
            $allTanks = $stmtTanks->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($allTanks as $tank) {
                // Get Reading for TODAY (Closing)
                $readingSql = "SELECT * FROM tank_readings WHERE tank_id = ? AND DATE(created_at) = ? ORDER BY id DESC LIMIT 1";
                $stmtR = $db->prepare($readingSql);
                $stmtR->execute([$tank['id'], $date]);
                $closingReading = $stmtR->fetch(\PDO::FETCH_ASSOC);

                // Get Opening (Reading from Yesterday's Closing OR Today's Opening)
                $prevDate = date('Y-m-d', strtotime($date . ' -1 day'));
                $openingVol = $this->tankModel->getReadingAt($tank['id'], $prevDate);
                if ($openingVol === false) $openingVol = 0; // fallback

                // Calculate Totals for this tank for the day
                $salesVol = 0;
                $salesAmount = 0;
                foreach ($sales as $sale) {
                    if ($sale['tank_id'] == $tank['id']) {
                        $salesVol += $sale['volume_sold'];
                        $salesAmount += $sale['total_amount'];
                    }
                }

                // Purchase Volume (In)
                $purchaseVol = $this->purchaseModel->getVolumeByTank($tank['id'], $date, $date);

                $currentVol = $closingReading ? $closingReading['volume_liters'] : $tank['current_volume'];
                // Note: If reporting for past date, $tank['current_volume'] is wrong. 
                // But without historical log of 'volume at midnight', reading is best bet.
                // Assuming operator enters reading daily.

                $theoretical = $openingVol + $purchaseVol - $salesVol;
                $actual = $currentVol;
                $variance = $actual - $theoretical;

                $tankStats[] = [
                    'tank_name' => $tank['name'],
                    'fuel_type' => $tank['fuel_name'],
                    'opening_balance' => $openingVol,
                    'purchases_in' => $purchaseVol,
                    'sales_out' => $salesVol,
                    'total_sales_amount' => $salesAmount,
                    'theoretical_balance' => $theoretical,
                    'actual_balance' => $actual,
                    'variance' => $variance,
                ];
            }

            echo json_encode([
                'success' => true,
                'date' => $date,
                'sales' => $sales,
                'tanks' => $tankStats,
                'totals' => [
                    'total_liters' => array_sum(array_column($sales, 'volume_sold')),
                    'total_amount' => array_sum(array_column($sales, 'total_amount'))
                ]
            ]);
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    public function getTankSalesReport()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $tankId = $_GET['tank_id'] ?? null;
            $date = $_GET['date'] ?? date('Y-m-d');

            if (!$tankId) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Tank ID is required'
                ]);
                exit;
            }

            $db = \App\Config\Database::connect();

            // Get tank information
            $tankSql = "SELECT t.*, ft.name as fuel_name, ft.color_hex
                        FROM tanks t
                        LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                        WHERE t.id = ?";
            $stmt = $db->prepare($tankSql);
            $stmt->execute([$tankId]);
            $tank = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$tank) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Tank not found'
                ]);
                exit;
            }

            // Get sales for this tank on the specified date
            $salesSql = "SELECT 
                            s.id,
                            s.created_at as time,
                            s.closing_reading as current_counter,
                            s.opening_reading as previous_counter,
                            s.volume_sold,
                            s.unit_price as price_per_liter,
                            s.total_amount,
                            w.name as worker_name,
                            p.name as machine_name,
                            c.name as counter_name
                        FROM sales s
                        LEFT JOIN workers w ON s.worker_id = w.id
                        LEFT JOIN counters c ON s.counter_id = c.id
                        LEFT JOIN pumps p ON c.pump_id = p.id
                        WHERE p.tank_id = ?
                        AND DATE(s.created_at) = ?
                        ORDER BY s.created_at ASC";

            $stmt = $db->prepare($salesSql);
            $stmt->execute([$tankId, $date]);
            $sales = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Get opening balance (reading from previous day's closing OR today's opening)
            $prevDate = date('Y-m-d', strtotime($date . ' -1 day'));
            $openingVol = $this->tankModel->getReadingAt($tankId, $prevDate);
            if ($openingVol === false) $openingVol = 0;

            // Calculate totals
            $totalVolumeSold = array_sum(array_column($sales, 'volume_sold'));
            $totalAmount = array_sum(array_column($sales, 'total_amount'));

            // Get closing reading for the day
            $closingReadingSql = "SELECT * FROM tank_readings 
                                  WHERE tank_id = ? AND DATE(created_at) = ? 
                                  ORDER BY id DESC LIMIT 1";
            $stmt = $db->prepare($closingReadingSql);
            $stmt->execute([$tankId, $date]);
            $closingReading = $stmt->fetch(\PDO::FETCH_ASSOC);

            // Get purchases for this tank on this date
            $purchaseVol = $this->purchaseModel->getVolumeByTank($tankId, $date, $date);

            // Calculate theoretical and actual closing
            $theoretical = $openingVol + $purchaseVol - $totalVolumeSold;
            $actual = $closingReading ? $closingReading['volume_liters'] : $tank['current_volume'];
            $variance = $actual - $theoretical;

            echo json_encode([
                'success' => true,
                'tank' => [
                    'id' => $tank['id'],
                    'name' => $tank['name'],
                    'fuel_type' => $tank['fuel_name'],
                    'fuel_color' => $tank['color_hex'],
                    'current_volume' => $tank['current_volume']
                ],
                'date' => $date,
                'sales' => $sales,
                'summary' => [
                    'opening_balance' => $openingVol,
                    'purchases_in' => $purchaseVol,
                    'total_volume_sold' => $totalVolumeSold,
                    'total_amount' => $totalAmount,
                    'theoretical_closing' => $theoretical,
                    'actual_closing' => $actual,
                    'variance' => $variance
                ]
            ]);
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    /**
     * Get calibration logs for a given period
     */
    private function getCalibrationLogs($startDate, $endDate, $stationId = 'all')
    {
        $db = \App\Config\Database::connect();

        $sql = "SELECT c.*, t.name as tank_name, u.name as user_name 
                FROM tank_calibrations c
                JOIN tanks t ON c.tank_id = t.id
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.created_at BETWEEN ? AND ?";

        $params = [$startDate . ' 00:00:00', $endDate . ' 23:59:59'];

        if ($stationId !== 'all') {
            $sql .= " AND t.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY cl.created_at DESC LIMIT 50";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get Supplier Statement Report
     * Shows unified account across all stations
     */
    private function getSupplierReport()
    {
        $supplierId = $_GET['supplier_id'] ?? null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$supplierId) {
            echo json_encode(['success' => false, 'message' => 'معرف المورد مطلوب']);
            exit;
        }

        try {
            $db = \App\Config\Database::connect();

            // 1. Get Supplier Info
            $supplier = $this->supplierModel->find($supplierId);
            if (!$supplier) {
                throw new \Exception('المورد غير موجود');
            }

            // 2. Get All Purchases from this Supplier (all stations)
            $stmt = $db->prepare("
                SELECT 
                    p.*,
                    s.name as station_name,
                    t.name as tank_name,
                    d.name as driver_name
                FROM purchases p
                LEFT JOIN stations s ON p.station_id = s.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN drivers d ON p.driver_id = d.id
                WHERE p.supplier_id = ?
                AND DATE(p.created_at) BETWEEN ? AND ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$supplierId, $startDate, $endDate]);
            $purchases = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // 3. Calculate Totals
            $totalCost = 0;
            $totalPaid = 0;
            $totalVolume = 0;

            foreach ($purchases as $purchase) {
                $totalCost += $purchase['total_cost'];
                $totalPaid += $purchase['paid_amount'];
                $totalVolume += $purchase['volume_received'];
            }

            // 4. Get Purchases Breakdown by Station
            $stmt = $db->prepare("
            SELECT 
                s.name as station_name,
                COUNT(p.id) as purchase_count,
                SUM(p.volume_received) as total_volume,
                SUM(p.total_cost) as total_cost,
                SUM(p.paid_amount) as total_paid
            FROM purchases p
            LEFT JOIN stations s ON p.station_id = s.id
            WHERE p.supplier_id = ?
            AND DATE(p.created_at) BETWEEN ? AND ?
            GROUP BY s.id, s.name
            ORDER BY total_cost DESC
        ");
            $stmt->execute([$supplierId, $startDate, $endDate]);
            $byStation = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // 5. Build Transactions Array (for statement view)
            $transactions = [];
            $runningBalance = 0;

            foreach ($purchases as $purchase) {
                $purchaseValue = floatval($purchase['total_cost']);
                $paidValue = floatval($purchase['paid_amount']);

                // Add purchase transaction
                $runningBalance += $purchaseValue;
                $transactions[] = [
                    'date' => date('Y-m-d', strtotime($purchase['created_at'])),
                    'statement_title' => 'شراء ' . ($purchase['tank_name'] ?? 'وقود'),
                    'statement_subtitle' => 'فاتورة #' . $purchase['invoice_number'] . ' - ' . ($purchase['station_name'] ?? ''),
                    'type' => 'purchase',
                    'category' => 'شراء',
                    'quantity' => $purchase['volume_received'],
                    'price' => $purchase['price_per_liter'],
                    'amount_paid' => 0,
                    'purchase_value' => $purchaseValue,
                    'running_balance' => $runningBalance
                ];

                // Add payment if exists
                if ($paidValue > 0) {
                    $runningBalance -= $paidValue;
                    $transactions[] = [
                        'date' => date('Y-m-d', strtotime($purchase['created_at'])),
                        'statement_title' => 'دفعة',
                        'statement_subtitle' => 'دفعة مقابل فاتورة #' . $purchase['invoice_number'],
                        'type' => 'payment',
                        'category' => 'دفعة',
                        'quantity' => 0,
                        'price' => 0,
                        'amount_paid' => $paidValue,
                        'purchase_value' => 0,
                        'running_balance' => $runningBalance
                    ];
                }
            }

            // Sort by date
            usort($transactions, function ($a, $b) {
                return strcmp($a['date'], $b['date']);
            });

            // 6. Response (matching SupplierReport.jsx expectations)
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'supplier' => $supplier,
                    'totals' => [
                        'total_purchased' => $totalCost,
                        'total_paid' => $totalPaid,
                        'net_balance' => $totalCost - $totalPaid
                    ],
                    'transactions' => $transactions,
                    'by_station' => $byStation
                ]
            ]);
            exit;
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    /**
     * Get All Suppliers Summary
     * For supplier comparison report
     */
    private function getAllSuppliersReport()
    {
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        try {
            $db = \App\Config\Database::connect();

            // Get all suppliers with their purchase stats
            $stmt = $db->prepare("
                SELECT 
                    sup.id,
                    sup.name,
                    sup.phone,
                    sup.balance,
                    COUNT(p.id) as purchase_count,
                    COALESCE(SUM(p.volume_received), 0) as total_volume,
                    COALESCE(SUM(p.total_cost), 0) as total_cost,
                    COALESCE(AVG(p.price_per_liter), 0) as avg_price,
                    COALESCE(SUM(p.paid_amount), 0) as total_paid
                FROM suppliers sup
                LEFT JOIN purchases p ON p.supplier_id = sup.id 
                    AND DATE(p.created_at) BETWEEN ? AND ?
                GROUP BY sup.id
                ORDER BY total_cost DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $suppliers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'suppliers' => $suppliers
            ]);
            exit;
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }

    /**
     * Get Customer Statement Report
     * Shows customer purchases and payments
     */
    private function getCustomerReport()
    {
        $customerId = $_GET['customer_id'] ?? null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        if (!$customerId) {
            echo json_encode(['success' => false, 'message' => 'معرف العميل مطلوب']);
            exit;
        }

        try {
            $db = \App\Config\Database::connect();

            // 1. Get Customer Info
            $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
            $stmt->execute([$customerId]);
            $customer = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$customer) {
                throw new \Exception('العميل غير موجود');
            }

            // 2. Get All Sales to this Customer
            $stmt = $db->prepare("
                SELECT 
                    s.*,
                    ft.name as product_name,
                    w.name as worker_name
                FROM sales s
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                LEFT JOIN workers w ON s.worker_id = w.id
                WHERE s.customer_id = ?
                AND DATE(s.created_at) BETWEEN ? AND ?
                ORDER BY s.created_at DESC
            ");
            $stmt->execute([$customerId, $startDate, $endDate]);
            $sales = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // 3. Calculate Totals
            $totalSales = 0;
            $totalPaid = 0;
            $totalVolume = 0;

            foreach ($sales as $sale) {
                // Fix: Usage of correct column names
                $saleAmount = floatval($sale['total_amount']);

                // Logic: Cash sales are fully paid, Credit sales are 0 paid (unless tracked elsewhere)
                $amountPaid = ($sale['payment_method'] === 'cash') ? $saleAmount : 0;

                $totalSales += $saleAmount;
                $totalPaid += $amountPaid;
                $totalVolume += $sale['volume_sold'];
            }

            // 4. Build Transactions Array (for statement view)
            $transactions = [];
            $runningBalance = 0;

            foreach ($sales as $sale) {
                $saleValue = floatval($sale['total_amount']);
                $amountPaid = ($sale['payment_method'] === 'cash') ? $saleValue : 0;

                // Add sale transaction
                $runningBalance += $saleValue;
                $transactions[] = [
                    'date' => date('Y-m-d', strtotime($sale['created_at'])),
                    'statement_title' => 'مبيعات ' . ($sale['product_name'] ?? 'وقود'),
                    'statement_subtitle' => 'فاتورة #' . $sale['invoice_number'] . ' - ' . ($sale['worker_name'] ?? ''),
                    'type' => 'sale',
                    'category' => 'مبيعات',
                    'quantity' => $sale['volume_sold'],
                    'price' => $sale['unit_price'], // Assuming unit_price exists
                    'sale_value' => $saleValue,
                    'amount_paid' => 0,
                    'running_balance' => $runningBalance
                ];

                // Add payment if exists (Cash Sale)
                if ($amountPaid > 0) {
                    $runningBalance -= $amountPaid;
                    $transactions[] = [
                        'date' => date('Y-m-d', strtotime($sale['created_at'])),
                        'statement_title' => 'دفعة',
                        'statement_subtitle' => 'دفعة مقابل فاتورة #' . $sale['id'],
                        'type' => 'payment',
                        'category' => 'دفعة',
                        'quantity' => 0,
                        'price' => 0,
                        'sale_value' => 0,
                        'amount_paid' => $paidValue,
                        'running_balance' => $runningBalance
                    ];
                }
            }

            // Sort by date
            usort($transactions, function ($a, $b) {
                return strcmp($a['date'], $b['date']);
            });

            // 5. Response (matching CustomerReport.jsx expectations)
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'customer' => $customer,
                    'totals' => [
                        'total_sales' => $totalSales,
                        'total_paid' => $totalPaid,
                        'net_balance' => $totalSales - $totalPaid
                    ],
                    'transactions' => $transactions
                ]
            ]);
            exit;
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ]);
            exit;
        }
    }
    private function getWorkerStatsWithPayroll($workerStats, $startDate, $endDate, $stationId)
    {
        // 1. Fetch Payroll Data
        $payrollSummary = method_exists($this->payrollModel, 'getWorkerPayrollSummary')
            ? $this->payrollModel->getWorkerPayrollSummary($startDate, $endDate, $stationId)
            : [];

        // 2. Map Payroll Data
        $payrollMap = [];
        foreach ($payrollSummary as $p) {
            if (!isset($payrollMap[$p['worker_id']])) {
                $payrollMap[$p['worker_id']] = ['deduction' => 0, 'bonus' => 0];
            }
            $payrollMap[$p['worker_id']][$p['type']] = $p['total_amount'];
        }

        // 3. Merge into Worker Stats
        foreach ($workerStats as &$worker) {
            $wId = $worker['worker_id'] ?? null;
            if ($wId && isset($payrollMap[$wId])) {
                $worker['deductions'] = $payrollMap[$wId]['deduction'] ?? 0;
                $worker['bonuses'] = $payrollMap[$wId]['bonus'] ?? 0;
            } else {
                $worker['deductions'] = 0;
                $worker['bonuses'] = 0;
            }
        }

        return $workerStats;
    }
}
