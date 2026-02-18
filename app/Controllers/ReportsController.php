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

        if (isset($_GET['action']) && $_GET['action'] === 'get_categories') {
            while (ob_get_level()) ob_end_clean();
            $this->getCategories();
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

        if (isset($_GET['action']) && $_GET['action'] === 'get_profit_loss') {
            while (ob_get_level()) ob_end_clean();
            $this->getProfitLoss();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_loss_report') {
            while (ob_get_level()) ob_end_clean();
            $this->getLossReport();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_pump_performance') {
            while (ob_get_level()) ob_end_clean();
            $this->getPumpPerformance();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_worker_performance') {
            while (ob_get_level()) ob_end_clean();
            $this->getWorkerPerformance();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_monthly_comparison') {
            while (ob_get_level()) ob_end_clean();
            $this->getMonthlyComparison();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_tank_transaction_report') {
            while (ob_get_level()) ob_end_clean();
            $this->getTankTransactionReport();
            return;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'get_daily_closing') {
            while (ob_get_level()) ob_end_clean();
            $this->getDailyClosing();
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
            $user = AuthHelper::user();
            // 1. Filter Parameters
            $stationId = $_GET['station_id'] ?? 'all';

            // Enforce isolation
            if ($user['role'] !== 'super_admin') {
                $stationId = $user['station_id'];
            }
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $categoryId = !empty($_GET['category_id']) ? $_GET['category_id'] : null;

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
                    " . ($categoryId ? "AND t.category_id = ?" : "") . "
                    GROUP BY tc.id, tc.name
                    ORDER BY total_amount DESC
                ");
                $params = [$startDate, $endDate];
                if ($stationId !== 'all') $params[] = $stationId;
                if ($categoryId) $params[] = $categoryId;

                $stmt->execute($params);
                $expenseBreakdown = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {
                // Ignore if tables don't exist
            }

            // Income/Expense from Transactions (General P&L) for the period
            // We need a helper in Transaction model to get aggregated totals by type and date
            $financials = $this->transactionModel->getTotalsByPeriod($startDate, $endDate, $stationId, $categoryId);

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

            // Filter tanks by station before building stats
            $filteredTanks = $tanks;
            if ($stationId !== 'all') {
                $filteredTanks = array_values(array_filter($tanks, function ($t) use ($stationId) {
                    return $t['station_id'] == $stationId;
                }));
            }

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
            }, $filteredTanks);

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

            // Fetch Transfers
            $dailyTransfers = method_exists($this->tankModel, 'getDailyTransfers')
                ? $this->tankModel->getDailyTransfers($stationId, $startDate, $endDate)
                : [];

            // 2. Structure Data by Date and Tank
            $dataByDateTank = [];
            // Helper to init key
            $initKey = function ($date, $tankId) use (&$dataByDateTank) {
                if (!isset($dataByDateTank[$date][$tankId])) {
                    $dataByDateTank[$date][$tankId] = [
                        'sales' => 0,
                        'purchases' => 0,
                        'transfers_in' => 0,
                        'transfers_out' => 0,
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
            // Process Transfers
            foreach ($dailyTransfers as $tr) {
                // Out from Source
                if ($tr['from_tank_id']) {
                    $initKey($tr['transfer_date'], $tr['from_tank_id']);
                    $dataByDateTank[$tr['transfer_date']][$tr['from_tank_id']]['transfers_out'] += $tr['quantity'];
                }
                // In to Target
                if ($tr['to_tank_id']) {
                    $initKey($tr['transfer_date'], $tr['to_tank_id']);
                    $dataByDateTank[$tr['transfer_date']][$tr['to_tank_id']]['transfers_in'] += $tr['quantity'];
                }
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

                    $purchaseIn = $dataByDateTank[$date][$tank['id']]['purchases'] ?? 0;
                    $transferIn = $dataByDateTank[$date][$tank['id']]['transfers_in'] ?? 0;

                    $salesOut = $dataByDateTank[$date][$tank['id']]['sales'] ?? 0;
                    $transferOut = $dataByDateTank[$date][$tank['id']]['transfers_out'] ?? 0;

                    $totalIn = $purchaseIn + $transferIn;
                    $totalOut = $salesOut + $transferOut;

                    $actual = $dataByDateTank[$date][$tank['id']]['actual_closing'] ?? null;

                    $theoretical = $currentBalance + $totalIn - $totalOut;
                    $variance = ($actual !== null) ? ($actual - $theoretical) : 0;

                    // Always add to list to show complete history (Cardex style)
                    $dailyReconciliation[] = [
                        'date' => $date,
                        'tank_name' => $tank['name'],
                        'opening' => $currentBalance,
                        'in' => $totalIn, // Merged purchases & transfers IN
                        'out' => $totalOut, // Merged sales & transfers OUT
                        'sales_only' => $salesOut,     // For detailed UI if needed
                        'transfers_in' => $transferIn, // ""
                        'transfers_out' => $transferOut, // ""
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
            // Fetch Safes - show all if station_id is not set
            if ($stationId) {
                $stmt = $db->prepare("SELECT id, name, balance FROM safes WHERE station_id = ? ORDER BY name ASC");
                $stmt->execute([$stationId]);
                $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }
            // Fallback: if no station or station has no safes, fetch ALL safes
            if (empty($safes)) {
                $stmt = $db->query("SELECT id, name, balance FROM safes ORDER BY name ASC");
                $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }

            // Fetch Banks - show all if station_id is not set
            if ($stationId) {
                $stmt = $db->prepare("SELECT id, bank_name as name, balance FROM banks WHERE station_id = ? ORDER BY bank_name ASC");
                $stmt->execute([$stationId]);
                $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }
            // Fallback: if no station or station has no banks, fetch ALL banks
            if (empty($banks)) {
                $stmt = $db->query("SELECT id, bank_name as name, balance FROM banks ORDER BY bank_name ASC");
                $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }

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
            $user = AuthHelper::user();
            $stationId = $_GET['station_id'] ?? 'all';

            if ($user['role'] !== 'super_admin') {
                $stationId = $user['station_id'];
            }
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

                // Fallback: if no reading exists, back-calculate opening
                if ($openingVol === false || $openingVol === null || $openingVol == 0) {
                    $openingVol = floatval($currentVol) + $salesVol - $purchaseVol;
                }

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
            $user = AuthHelper::user();
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

            // Enforce isolation
            $params = [$tankId];
            if ($user['role'] !== 'super_admin') {
                $tankSql .= " AND t.station_id = ?";
                $params[] = $user['station_id'];
            }

            $stmt = $db->prepare($tankSql);
            $stmt->execute($params);
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
                            COALESCE(w.name, w2.name) as worker_name,
                            p.name as machine_name,
                            c.name as counter_name
                        FROM sales s
                        LEFT JOIN workers w ON s.worker_id = w.id
                        LEFT JOIN counters c ON s.counter_id = c.id
                        LEFT JOIN workers w2 ON c.current_worker_id = w2.id
                        LEFT JOIN pumps p ON c.pump_id = p.id
                        WHERE p.tank_id = ?
                        AND DATE(s.created_at) = ?
                        ORDER BY s.created_at ASC";

            $stmt = $db->prepare($salesSql);
            $stmt->execute([$tankId, $date]);
            $sales = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Get opening balance (reading from previous day's closing OR calculate from current)
            $prevDate = date('Y-m-d', strtotime($date . ' -1 day'));
            $openingVol = $this->tankModel->getReadingAt($tankId, $prevDate);

            // Calculate totals
            $totalVolumeSold = array_sum(array_column($sales, 'volume_sold'));
            $totalAmount = array_sum(array_column($sales, 'total_amount'));

            // Get purchases for this tank on this date
            $purchaseVol = $this->purchaseModel->getVolumeByTank($tankId, $date, $date);

            // Get closing reading for the day
            $closingReadingSql = "SELECT * FROM tank_readings 
                                  WHERE tank_id = ? AND DATE(created_at) = ? 
                                  ORDER BY id DESC LIMIT 1";
            $stmt = $db->prepare($closingReadingSql);
            $stmt->execute([$tankId, $date]);
            $closingReading = $stmt->fetch(\PDO::FETCH_ASSOC);

            // Get any calibration variance for this day
            $calibrationSql = "SELECT variance FROM tank_calibrations 
                               WHERE tank_id = ? AND DATE(created_at) = ? 
                               ORDER BY id DESC LIMIT 1";
            $stmt = $db->prepare($calibrationSql);
            $stmt->execute([$tankId, $date]);
            $calibration = $stmt->fetch(\PDO::FETCH_ASSOC);
            $variance = $calibration ? floatval($calibration['variance']) : 0;

            // Current calibrated volume (actual after calibration)
            $actual = $closingReading ? floatval($closingReading['volume_liters']) : floatval($tank['current_volume']);

            // If no historical reading exists, calculate opening balance
            // Formula: Opening = Actual + Sold - Purchases
            // Variance is derived after opening is known, not used to compute it
            if ($openingVol === false || $openingVol === null || $openingVol == 0) {
                $openingVol = $actual + $totalVolumeSold - $purchaseVol;
            }

            // Calculate theoretical closing (what it should be based on math)
            $theoretical = $openingVol + $purchaseVol - $totalVolumeSold;

            // If we don't have an explicit calibration record, calculate variance dynamically based on current theoretical vs actual
            if (!$calibration) {
                $variance = $actual - $theoretical;
            }

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

        $sql .= " ORDER BY c.created_at DESC LIMIT 50";

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
            $sql = "
                SELECT 
                    p.*,
                    s.name as station_name,
                    t.name as tank_name,
                    d.name as driver_name,
                    ft.name as fuel_type_name
                FROM purchases p
                LEFT JOIN stations s ON p.station_id = s.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN drivers d ON p.driver_id = d.id
                LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
                WHERE p.supplier_id = ?
                AND DATE(p.created_at) BETWEEN ? AND ?";

            $params = [$supplierId, $startDate, $endDate];
            $user = AuthHelper::user();
            if ($user['role'] !== 'super_admin') {
                $sql .= " AND p.station_id = ?";
                $params[] = $user['station_id'];
            }

            $sql .= " ORDER BY p.created_at DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
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

            // 4b. Get Transactions from the transactions table (expenses/payments to supplier)
            $stmt = $db->prepare("
                SELECT 
                    t.*,
                    tc.name as category_name,
                    u.name as user_name,
                    CASE 
                        WHEN t.from_type = 'bank' THEN (SELECT bank_name FROM banks WHERE id = t.from_id)
                        WHEN t.from_type = 'safe' THEN (SELECT name FROM safes WHERE id = t.from_id)
                        ELSE NULL
                    END as account_name
                FROM transactions t
                LEFT JOIN transaction_categories tc ON t.category_id = tc.id
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.related_entity_type = 'supplier' 
                AND t.related_entity_id = ?
                AND t.date BETWEEN ? AND ?
                ORDER BY t.date ASC, t.id ASC
            ");
            $stmt->execute([$supplierId, $startDate, $endDate]);
            $supplierTransactions = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // 5. Build Transactions Array (for statement view)
            $transactions = [];
            $runningBalance = 0;

            foreach ($purchases as $purchase) {
                $purchaseValue = floatval($purchase['total_cost']);
                $paidValue = floatval($purchase['paid_amount']);

                // Add purchase transaction
                $runningBalance += $purchaseValue;
                $fuelLabel = $purchase['fuel_type_name'] ?? '';
                $transactions[] = [
                    'date' => date('Y-m-d', strtotime($purchase['created_at'])),
                    'statement_title' => 'شراء ' . ($purchase['tank_name'] ?? 'وقود'),
                    'statement_subtitle' => 'فاتورة #' . $purchase['invoice_number'] . ' - ' . ($purchase['station_name'] ?? ''),
                    'type' => 'purchase',
                    'category' => 'شراء' . ($fuelLabel ? ' ' . $fuelLabel : ''),
                    'fuel_type' => $fuelLabel,
                    'driver_name' => $purchase['driver_name'] ?? '',
                    'quantity' => $purchase['volume_received'],
                    'price' => $purchase['price_per_liter'],
                    'amount_paid' => 0,
                    'purchase_value' => $purchaseValue,
                    'running_balance' => $runningBalance
                ];

                // Add payment if exists
                if ($paidValue > 0) {
                    $runningBalance -= $paidValue;
                    $totalPaid += $paidValue; // Add to totalPaid
                    $transactions[] = [
                        'date' => date('Y-m-d', strtotime($purchase['created_at'])),
                        'statement_title' => 'دفعة',
                        'statement_subtitle' => 'دفعة مقابل فاتورة #' . $purchase['invoice_number'],
                        'type' => 'payment',
                        'category' => 'دفعة',
                        'fuel_type' => '',
                        'driver_name' => '',
                        'quantity' => 0,
                        'price' => 0,
                        'amount_paid' => $paidValue,
                        'purchase_value' => 0,
                        'running_balance' => $runningBalance
                    ];
                }
            }

            // 5b. Add transactions from the transactions table (expense payments)
            foreach ($supplierTransactions as $trans) {
                $transAmount = floatval($trans['amount']);
                // For expense to supplier: reduce balance (money paid to them)
                if ($trans['type'] === 'expense') {
                    $runningBalance -= $transAmount;
                    $totalPaid += $transAmount;

                    // Build statement title with reference number
                    $refNumber = $trans['reference_number'] ?? '';
                    $statementTitle = $refNumber ? 'ر.الاشعار ' . $refNumber : 'دفعة للمورد';

                    // Use bank/safe name as category, fallback to category_name
                    $categoryDisplay = $trans['account_name'] ?: ($trans['category_name'] ?? 'مصروف');

                    $transactions[] = [
                        'date' => $trans['date'],
                        'statement_title' => $statementTitle,
                        'statement_subtitle' => $trans['description'] ?: $categoryDisplay,
                        'type' => 'payment',
                        'category' => $categoryDisplay,
                        'fuel_type' => '',
                        'driver_name' => '',
                        'quantity' => 0,
                        'price' => 0,
                        'amount_paid' => $transAmount,
                        'purchase_value' => 0,
                        'running_balance' => $runningBalance
                    ];
                }
                // For income from supplier (e.g., refund): increase balance
                elseif ($trans['type'] === 'income') {
                    $runningBalance += $transAmount;
                    $transactions[] = [
                        'date' => $trans['date'],
                        'statement_title' => 'استلام من المورد',
                        'statement_subtitle' => $trans['description'] ?: ($trans['category_name'] ?? 'إيراد'),
                        'type' => 'income',
                        'category' => $trans['category_name'] ?? 'إيراد',
                        'fuel_type' => '',
                        'driver_name' => '',
                        'quantity' => 0,
                        'price' => 0,
                        'amount_paid' => 0,
                        'purchase_value' => $transAmount,
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
            $sql = "
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
                    AND DATE(p.created_at) BETWEEN ? AND ?";

            $params = [$startDate, $endDate];
            $user = AuthHelper::user();
            if ($user['role'] !== 'super_admin') {
                $sql .= " AND p.station_id = ?";
                $params[] = $user['station_id'];
            }

            $sql .= " GROUP BY sup.id ORDER BY total_cost DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
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
                        'amount_paid' => $amountPaid,
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

    /**
     * Get Profit & Loss Report
     * Calculates revenue, expenses, and net profit for a given period
     */
    public function getProfitLoss()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            $db = \App\Config\Database::connect();

            // === REVENUE ===

            // 1. Fuel Sales Revenue
            $salesSql = "SELECT COALESCE(SUM(total_price), 0) as fuel_sales 
                         FROM sales 
                         WHERE sale_date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $salesSql .= " AND station_id = ?";
                $stmt = $db->prepare($salesSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($salesSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $fuelSales = $stmt->fetchColumn() ?: 0;

            // 2. Other Sales (non-fuel income transactions)
            $otherSalesSql = "SELECT COALESCE(SUM(amount), 0) as other_sales 
                              FROM transactions 
                              WHERE type = 'income' 
                              AND related_entity_type != 'sales'
                              AND date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $otherSalesSql .= " AND station_id = ?";
                $stmt = $db->prepare($otherSalesSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($otherSalesSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $otherSales = $stmt->fetchColumn() ?: 0;

            // 3. Customer Payments (income from customers paying debts)
            $customerPaymentsSql = "SELECT COALESCE(SUM(amount), 0) as customer_payments 
                                    FROM transactions 
                                    WHERE related_entity_type = 'customer' 
                                    AND type = 'income'
                                    AND date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $customerPaymentsSql .= " AND station_id = ?";
                $stmt = $db->prepare($customerPaymentsSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($customerPaymentsSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $customerPayments = $stmt->fetchColumn() ?: 0;

            // === EXPENSES ===

            // 1. Purchase Cost (fuel purchases)
            $purchaseSql = "SELECT COALESCE(SUM(total_cost), 0) as purchase_cost 
                            FROM purchases 
                            WHERE purchase_date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $purchaseSql .= " AND station_id = ?";
                $stmt = $db->prepare($purchaseSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($purchaseSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $purchaseCost = $stmt->fetchColumn() ?: 0;

            // 2. Salaries and Wages (from payroll)
            $salariesSql = "SELECT COALESCE(SUM(net_salary), 0) as salaries 
                            FROM payroll 
                            WHERE month BETWEEN ? AND ?";
            $stmt = $db->prepare($salariesSql);
            $stmt->execute([substr($startDate, 0, 7), substr($endDate, 0, 7)]);
            $salaries = $stmt->fetchColumn() ?: 0;

            // 3. Operational Expenses (from transactions)
            $expensesSql = "SELECT COALESCE(SUM(amount), 0) as operational_expenses 
                            FROM transactions 
                            WHERE type = 'expense' 
                            AND related_entity_type != 'supplier'
                            AND date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $expensesSql .= " AND station_id = ?";
                $stmt = $db->prepare($expensesSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($expensesSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $operationalExpenses = $stmt->fetchColumn() ?: 0;

            // 4. Supplier Payments
            $supplierPaymentsSql = "SELECT COALESCE(SUM(amount), 0) as supplier_payments 
                                    FROM transactions 
                                    WHERE related_entity_type = 'supplier' 
                                    AND type = 'expense'
                                    AND date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $supplierPaymentsSql .= " AND station_id = ?";
                $stmt = $db->prepare($supplierPaymentsSql);
                $stmt->execute([$startDate, $endDate, $stationId]);
            } else {
                $stmt = $db->prepare($supplierPaymentsSql);
                $stmt->execute([$startDate, $endDate]);
            }
            $supplierPayments = $stmt->fetchColumn() ?: 0;

            // === TOTALS ===
            $totalRevenue = $fuelSales + $otherSales + $customerPayments;
            $totalExpenses = $purchaseCost + $salaries + $operationalExpenses + $supplierPayments;

            // === PREVIOUS PERIOD (for comparison) ===
            $periodDays = (strtotime($endDate) - strtotime($startDate)) / 86400;
            $prevEndDate = date('Y-m-d', strtotime($startDate . ' -1 day'));
            $prevStartDate = date('Y-m-d', strtotime($prevEndDate . " -$periodDays days"));

            // Previous Revenue
            $prevRevenueSql = "SELECT COALESCE(SUM(total_price), 0) FROM sales WHERE sale_date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $prevRevenueSql .= " AND station_id = ?";
                $stmt = $db->prepare($prevRevenueSql);
                $stmt->execute([$prevStartDate, $prevEndDate, $stationId]);
            } else {
                $stmt = $db->prepare($prevRevenueSql);
                $stmt->execute([$prevStartDate, $prevEndDate]);
            }
            $prevRevenue = $stmt->fetchColumn() ?: 0;

            // Previous Expenses
            $prevExpensesSql = "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?";
            if ($stationId !== 'all') {
                $prevExpensesSql .= " AND station_id = ?";
                $stmt = $db->prepare($prevExpensesSql);
                $stmt->execute([$prevStartDate, $prevEndDate, $stationId]);
            } else {
                $stmt = $db->prepare($prevExpensesSql);
                $stmt->execute([$prevStartDate, $prevEndDate]);
            }
            $prevExpenses = $stmt->fetchColumn() ?: 0;

            echo json_encode([
                'success' => true,
                'data' => [
                    'fuel_sales' => floatval($fuelSales),
                    'other_sales' => floatval($otherSales),
                    'customer_payments' => floatval($customerPayments),
                    'total_revenue' => floatval($totalRevenue),
                    'purchase_cost' => floatval($purchaseCost),
                    'salaries' => floatval($salaries),
                    'operational_expenses' => floatval($operationalExpenses),
                    'supplier_payments' => floatval($supplierPayments),
                    'total_expenses' => floatval($totalExpenses)
                ],
                'previous_period' => [
                    'total_revenue' => floatval($prevRevenue),
                    'total_expenses' => floatval($prevExpenses),
                    'net_profit' => floatval($prevRevenue - $prevExpenses)
                ]
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Get Loss/Evaporation Report
     * Calculates variance between theoretical and actual tank volumes
     */
    public function getLossReport()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            $db = \App\Config\Database::connect();

            // Get all tanks
            $tanksSql = "SELECT t.*, ft.name as fuel_name, ft.color_hex as fuel_color
                         FROM tanks t 
                         LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id";
            if ($stationId !== 'all') {
                $tanksSql .= " WHERE t.station_id = ?";
                $stmt = $db->prepare($tanksSql);
                $stmt->execute([$stationId]);
            } else {
                $stmt = $db->query($tanksSql);
            }
            $tanks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $tankData = [];
            $totalLoss = 0;
            $totalPercent = 0;

            foreach ($tanks as $tank) {
                // Get opening balance (reading before start date or earliest reading)
                $openingSql = "SELECT volume_liters FROM tank_readings 
                               WHERE tank_id = ? AND reading_date < ? 
                               ORDER BY reading_date DESC, id DESC LIMIT 1";
                $stmt = $db->prepare($openingSql);
                $stmt->execute([$tank['id'], $startDate]);
                $opening = $stmt->fetchColumn();

                if ($opening === false) {
                    // No prior reading, use capacity as starting point or 0
                    $opening = 0;
                }

                // Get total purchases (incoming)
                $purchasesSql = "SELECT COALESCE(SUM(volume_liters), 0) FROM purchases 
                                 WHERE tank_id = ? AND purchase_date BETWEEN ? AND ?";
                $stmt = $db->prepare($purchasesSql);
                $stmt->execute([$tank['id'], $startDate, $endDate]);
                $totalIn = $stmt->fetchColumn() ?: 0;

                // Get total sales (outgoing)
                $salesSql = "SELECT COALESCE(SUM(s.volume_liters), 0) 
                             FROM sales s
                             JOIN counters c ON s.counter_id = c.id
                             JOIN pumps p ON c.pump_id = p.id
                             WHERE p.tank_id = ? AND s.sale_date BETWEEN ? AND ?";
                $stmt = $db->prepare($salesSql);
                $stmt->execute([$tank['id'], $startDate, $endDate]);
                $totalOut = $stmt->fetchColumn() ?: 0;

                // Get transfers in
                $transfersInSql = "SELECT COALESCE(SUM(quantity), 0) FROM tank_transfers 
                                   WHERE to_tank_id = ? AND transfer_date BETWEEN ? AND ?";
                $stmt = $db->prepare($transfersInSql);
                $stmt->execute([$tank['id'], $startDate, $endDate]);
                $transfersIn = $stmt->fetchColumn() ?: 0;

                // Get transfers out
                $transfersOutSql = "SELECT COALESCE(SUM(quantity), 0) FROM tank_transfers 
                                    WHERE from_tank_id = ? AND transfer_date BETWEEN ? AND ?";
                $stmt = $db->prepare($transfersOutSql);
                $stmt->execute([$tank['id'], $startDate, $endDate]);
                $transfersOut = $stmt->fetchColumn() ?: 0;

                $totalInWithTransfers = $totalIn + $transfersIn;
                $totalOutWithTransfers = $totalOut + $transfersOut;

                // Theoretical balance
                $theoretical = $opening + $totalInWithTransfers - $totalOutWithTransfers;

                // Actual balance (current volume or latest reading)
                $actualSql = "SELECT volume_liters FROM tank_readings 
                              WHERE tank_id = ? AND reading_date <= ? 
                              ORDER BY reading_date DESC, id DESC LIMIT 1";
                $stmt = $db->prepare($actualSql);
                $stmt->execute([$tank['id'], $endDate]);
                $actual = $stmt->fetchColumn();

                if ($actual === false) {
                    $actual = $tank['current_volume'];
                }

                // Calculate variance
                $variance = $actual - $theoretical;

                // Calculate loss percentage (relative to sales volume)
                $lossPercent = $totalOutWithTransfers > 0
                    ? (abs($variance) / $totalOutWithTransfers) * 100
                    : 0;

                // Only count as loss if variance is negative
                if ($variance < 0) {
                    $totalLoss += abs($variance);
                    $totalPercent += $lossPercent;
                }

                $tankData[] = [
                    'id' => $tank['id'],
                    'name' => $tank['name'],
                    'fuel_name' => $tank['fuel_name'],
                    'fuel_color' => $tank['fuel_color'],
                    'opening_balance' => round($opening, 2),
                    'total_in' => round($totalInWithTransfers, 2),
                    'total_out' => round($totalOutWithTransfers, 2),
                    'theoretical_balance' => round($theoretical, 2),
                    'actual_balance' => round($actual, 2),
                    'variance' => round($variance, 2),
                    'loss_percent' => round($variance < 0 ? $lossPercent : -$lossPercent, 2)
                ];
            }

            $avgPercent = count($tankData) > 0 ? $totalPercent / count($tankData) : 0;

            echo json_encode([
                'success' => true,
                'tanks' => $tankData,
                'summary' => [
                    'totalLoss' => round($totalLoss, 2),
                    'avgLossPercent' => round($avgPercent, 2)
                ]
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Get Pump Performance Report
     * Shows sales rankings and statistics for each pump
     */
    public function getPumpPerformance()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            $db = \App\Config\Database::connect();

            // Get pump performance data
            $sql = "SELECT 
                        p.id as pump_id,
                        p.name as pump_name,
                        ft.name as fuel_name,
                        ft.color_hex as fuel_color,
                        COUNT(s.id) as transaction_count,
                        COALESCE(SUM(s.volume_liters), 0) as total_volume,
                        COALESCE(SUM(s.total_price), 0) as total_revenue
                    FROM pumps p
                    LEFT JOIN tanks t ON p.tank_id = t.id
                    LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                    LEFT JOIN counters c ON c.pump_id = p.id
                    LEFT JOIN sales s ON s.counter_id = c.id AND s.sale_date BETWEEN ? AND ?
                    WHERE 1=1";

            $params = [$startDate, $endDate];

            if ($stationId !== 'all') {
                $sql .= " AND p.station_id = ?";
                $params[] = $stationId;
            }

            $sql .= " GROUP BY p.id, p.name, ft.name, ft.color_hex
                      ORDER BY total_revenue DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $pumps = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Calculate totals and percentages
            $totalSales = array_sum(array_column($pumps, 'total_revenue'));
            $totalVolume = array_sum(array_column($pumps, 'total_volume'));

            foreach ($pumps as &$pump) {
                $pump['percentage'] = $totalSales > 0
                    ? ($pump['total_revenue'] / $totalSales) * 100
                    : 0;
            }

            echo json_encode([
                'success' => true,
                'pumps' => $pumps,
                'summary' => [
                    'totalSales' => floatval($totalSales),
                    'totalVolume' => floatval($totalVolume)
                ]
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Get Worker Performance Report
     * Shows sales rankings for workers
     */
    public function getWorkerPerformance()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            $db = \App\Config\Database::connect();

            // Get worker performance data
            $sql = "SELECT 
                        w.id as worker_id,
                        w.name as worker_name,
                        COUNT(s.id) as transaction_count,
                        COALESCE(SUM(s.volume_liters), 0) as total_volume,
                        COALESCE(SUM(s.total_price), 0) as total_revenue
                    FROM workers w
                    LEFT JOIN sales s ON s.worker_id = w.id AND s.sale_date BETWEEN ? AND ?
                    WHERE 1=1";

            $params = [$startDate, $endDate];

            if ($stationId !== 'all') {
                $sql .= " AND w.station_id = ?";
                $params[] = $stationId;
            }

            $sql .= " GROUP BY w.id, w.name
                      HAVING total_revenue > 0
                      ORDER BY total_revenue DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $workers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Calculate totals and percentages
            $totalSales = array_sum(array_column($workers, 'total_revenue'));
            $totalVolume = array_sum(array_column($workers, 'total_volume'));
            $avgPerWorker = count($workers) > 0 ? $totalSales / count($workers) : 0;

            foreach ($workers as &$worker) {
                $worker['percentage'] = $totalSales > 0
                    ? ($worker['total_revenue'] / $totalSales) * 100
                    : 0;
            }

            echo json_encode([
                'success' => true,
                'workers' => $workers,
                'summary' => [
                    'totalSales' => floatval($totalSales),
                    'totalVolume' => floatval($totalVolume),
                    'avgPerWorker' => floatval($avgPerWorker)
                ]
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Get Monthly Comparison Report
     * Shows month-by-month comparison of sales, purchases, and profit
     */
    public function getMonthlyComparison()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $year = $_GET['year'] ?? date('Y');

            $db = \App\Config\Database::connect();

            $months = [];
            $monthNames = [
                'يناير',
                'فبراير',
                'مارس',
                'أبريل',
                'مايو',
                'يونيو',
                'يوليو',
                'أغسطس',
                'سبتمبر',
                'أكتوبر',
                'نوفمبر',
                'ديسمبر'
            ];

            $totalYearlySales = 0;
            $bestMonth = null;
            $bestSales = 0;
            $prevMonthSales = 0;

            for ($m = 1; $m <= 12; $m++) {
                $startDate = sprintf('%04d-%02d-01', $year, $m);
                $endDate = date('Y-m-t', strtotime($startDate));

                // Get Sales
                $salesSql = "SELECT COALESCE(SUM(total_price), 0) FROM sales 
                             WHERE sale_date BETWEEN ? AND ?";
                if ($stationId !== 'all') {
                    $salesSql .= " AND station_id = ?";
                    $stmt = $db->prepare($salesSql);
                    $stmt->execute([$startDate, $endDate, $stationId]);
                } else {
                    $stmt = $db->prepare($salesSql);
                    $stmt->execute([$startDate, $endDate]);
                }
                $sales = $stmt->fetchColumn() ?: 0;

                // Get Purchases
                $purchasesSql = "SELECT COALESCE(SUM(total_cost), 0) FROM purchases 
                                 WHERE purchase_date BETWEEN ? AND ?";
                if ($stationId !== 'all') {
                    $purchasesSql .= " AND station_id = ?";
                    $stmt = $db->prepare($purchasesSql);
                    $stmt->execute([$startDate, $endDate, $stationId]);
                } else {
                    $stmt = $db->prepare($purchasesSql);
                    $stmt->execute([$startDate, $endDate]);
                }
                $purchases = $stmt->fetchColumn() ?: 0;

                // Get Expenses
                $expensesSql = "SELECT COALESCE(SUM(amount), 0) FROM transactions 
                                WHERE type = 'expense' AND date BETWEEN ? AND ?";
                if ($stationId !== 'all') {
                    $expensesSql .= " AND station_id = ?";
                    $stmt = $db->prepare($expensesSql);
                    $stmt->execute([$startDate, $endDate, $stationId]);
                } else {
                    $stmt = $db->prepare($expensesSql);
                    $stmt->execute([$startDate, $endDate]);
                }
                $expenses = $stmt->fetchColumn() ?: 0;

                $profit = $sales - $purchases - $expenses;

                // Calculate growth
                $growth = null;
                if ($prevMonthSales > 0) {
                    $growth = (($sales - $prevMonthSales) / $prevMonthSales) * 100;
                }

                $months[] = [
                    'month' => $m,
                    'name' => $monthNames[$m - 1],
                    'sales' => floatval($sales),
                    'purchases' => floatval($purchases),
                    'expenses' => floatval($expenses),
                    'profit' => floatval($profit),
                    'growth' => $growth
                ];

                $totalYearlySales += $sales;

                if ($sales > $bestSales) {
                    $bestSales = $sales;
                    $bestMonth = $monthNames[$m - 1];
                }

                $prevMonthSales = $sales;
            }

            // Calculate yearly growth (compared to previous year)
            $prevYearSql = "SELECT COALESCE(SUM(total_price), 0) FROM sales 
                            WHERE YEAR(sale_date) = ?";
            if ($stationId !== 'all') {
                $prevYearSql .= " AND station_id = ?";
                $stmt = $db->prepare($prevYearSql);
                $stmt->execute([$year - 1, $stationId]);
            } else {
                $stmt = $db->prepare($prevYearSql);
                $stmt->execute([$year - 1]);
            }
            $prevYearSales = $stmt->fetchColumn() ?: 0;

            $yearlyGrowth = $prevYearSales > 0
                ? (($totalYearlySales - $prevYearSales) / $prevYearSales) * 100
                : 0;

            echo json_encode([
                'success' => true,
                'months' => $months,
                'summary' => [
                    'bestMonth' => $bestMonth,
                    'totalYearlySales' => floatval($totalYearlySales),
                    'avgMonthlySales' => floatval($totalYearlySales / 12),
                    'yearlyGrowth' => round($yearlyGrowth, 1)
                ]
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    private function getCategories()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $categoryModel = new \App\Models\TransactionCategory();
            // We want 'expense' categories primarily, but 'income' might be useful too. 
            // Let's return all or filter by type if passed.
            $type = $_GET['type'] ?? null;

            if ($type) {
                // TransactionCategory::getAll() returns all. Filter manually.
                $all = $categoryModel->getAll();
                $categories = array_filter($all, function ($c) use ($type) {
                    return $c['type'] === $type;
                });
                $categories = array_values($categories);
            } else {
                $categories = $categoryModel->getAll();
            }

            echo json_encode([
                'success' => true,
                'categories' => $categories
            ]);
            exit;
        } catch (\Throwable $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    public function getTankTransactionReport()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $tankId = $_GET['tank_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = ($_GET['end_date'] ?? date('Y-m-d')) . ' 23:59:59';

            if (!$tankId) {
                echo json_encode(['success' => false, 'message' => 'Tank ID required']);
                exit;
            }

            $db = \App\Config\Database::connect();

            // 0. Get Tank Info (initial volume at creation)
            $stmt = $db->prepare("SELECT name, current_volume, capacity_liters, created_at FROM tanks WHERE id = ?");
            $stmt->execute([$tankId]);
            $tankInfo = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$tankInfo) {
                echo json_encode(['success' => false, 'message' => 'الخزان غير موجود']);
                exit;
            }

            // 1. Derive the Initial Volume (volume at tank creation)
            // Since current_volume = initial + all_offloads + all_direct_purchases - all_sales
            // We reverse: initial = current - all_offloads - all_direct_purchases + all_sales

            // Total offloads ever
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(po.quantity), 0) 
                FROM purchase_offloads po 
                JOIN purchases p ON po.purchase_id = p.id 
                WHERE po.tank_id = ?
            ");
            $stmt->execute([$tankId]);
            $allOffloads = floatval($stmt->fetchColumn());

            // Total direct purchases ever (legacy records without offload entries)
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(p.volume_received), 0) 
                FROM purchases p 
                LEFT JOIN purchase_offloads po ON po.purchase_id = p.id AND po.tank_id = p.tank_id
                WHERE p.tank_id = ? AND po.id IS NULL
            ");
            $stmt->execute([$tankId]);
            $allDirectPurchases = floatval($stmt->fetchColumn());

            // Total sales ever
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(s.volume_sold), 0) 
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                WHERE p.tank_id = ?
            ");
            $stmt->execute([$tankId]);
            $allSales = floatval($stmt->fetchColumn());

            $currentVolume = floatval($tankInfo['current_volume']);
            $initialVolume = $currentVolume - $allOffloads - $allDirectPurchases + $allSales;

            // 2. Calculate Opening Balance (All activity before start date)
            // Opening = Initial Volume + Offloads_before - Sales_before

            // A. Total offloaded to this tank before period
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(po.quantity), 0) as total 
                FROM purchase_offloads po 
                JOIN purchases p ON po.purchase_id = p.id 
                WHERE po.tank_id = ? AND p.created_at < ?
            ");
            $stmt->execute([$tankId, $startDate]);
            $offloadsBefore = floatval($stmt->fetchColumn());

            // B. Total purchases directly to this tank (legacy) before period
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(p.volume_received), 0) as total 
                FROM purchases p 
                LEFT JOIN purchase_offloads po ON po.purchase_id = p.id AND po.tank_id = p.tank_id
                WHERE p.tank_id = ? AND p.created_at < ? AND po.id IS NULL
            ");
            $stmt->execute([$tankId, $startDate]);
            $directPurchasesBefore = floatval($stmt->fetchColumn());

            // C. Total sales from this tank before period
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(s.volume_sold), 0) as total 
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                WHERE p.tank_id = ? AND s.sale_date < ?
            ");
            $stmt->execute([$tankId, $startDate]);
            $salesBefore = floatval($stmt->fetchColumn());

            // D. Last calibration adjustment before period (resets balance)
            $lastCalibBefore = null;
            try {
                $stmt = $db->prepare("
                    SELECT volume_liters, created_at 
                    FROM tank_readings 
                    WHERE tank_id = ? AND created_at < ? 
                    ORDER BY created_at DESC LIMIT 1
                ");
                $stmt->execute([$tankId, $startDate]);
                $lastCalibBefore = $stmt->fetch(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {
                // tank_readings table might not exist, skip
            }

            if ($lastCalibBefore) {
                // If there was a calibration, calculate balance from that calibration point
                $calibDate = $lastCalibBefore['created_at'];
                $calibVolume = floatval($lastCalibBefore['volume_liters']);

                // Add offloads after calibration but before period
                $stmt = $db->prepare("
                    SELECT COALESCE(SUM(po.quantity), 0) FROM purchase_offloads po 
                    JOIN purchases p ON po.purchase_id = p.id 
                    WHERE po.tank_id = ? AND p.created_at > ? AND p.created_at < ?
                ");
                $stmt->execute([$tankId, $calibDate, $startDate]);
                $offloadsAfterCalib = floatval($stmt->fetchColumn());

                // Add direct purchases after calibration but before period
                $stmt = $db->prepare("
                    SELECT COALESCE(SUM(p2.volume_received), 0) FROM purchases p2 
                    LEFT JOIN purchase_offloads po ON po.purchase_id = p2.id AND po.tank_id = p2.tank_id
                    WHERE p2.tank_id = ? AND p2.created_at > ? AND p2.created_at < ? AND po.id IS NULL
                ");
                $stmt->execute([$tankId, $calibDate, $startDate]);
                $directAfterCalib = floatval($stmt->fetchColumn());

                // Subtract sales after calibration but before period
                $stmt = $db->prepare("
                    SELECT COALESCE(SUM(s.volume_sold), 0) FROM sales s
                    JOIN counters c ON s.counter_id = c.id
                    JOIN pumps p ON c.pump_id = p.id
                    WHERE p.tank_id = ? AND s.sale_date > ? AND s.sale_date < ?
                ");
                $stmt->execute([$tankId, $calibDate, $startDate]);
                $salesAfterCalib = floatval($stmt->fetchColumn());

                // Check for more recent calibrations between this one and start date
                try {
                    $stmt = $db->prepare("
                        SELECT volume_liters FROM tank_readings 
                        WHERE tank_id = ? AND created_at > ? AND created_at < ? 
                        ORDER BY created_at DESC LIMIT 1
                    ");
                    $stmt->execute([$tankId, $calibDate, $startDate]);
                    $laterCalib = $stmt->fetch(\PDO::FETCH_ASSOC);
                } catch (\Exception $e) {
                    $laterCalib = null;
                }

                if ($laterCalib) {
                    $openingBalance = floatval($laterCalib['volume_liters']);
                } else {
                    $openingBalance = $calibVolume + $offloadsAfterCalib + $directAfterCalib - $salesAfterCalib;
                }
            } else {
                // No calibration before period — include initial volume
                $openingBalance = $initialVolume + $offloadsBefore + $directPurchasesBefore - $salesBefore;
            }

            // 2. Fetch Transactions in Period
            $transactions = [];

            // A. Purchase Offloads (In) - from purchase_offloads table
            $stmt = $db->prepare("
                SELECT 
                    p.created_at as created_at_ts,
                    DATE(p.created_at) as date,
                    p.id,
                    p.invoice_number,
                    po.quantity as quantity_in,
                    0 as quantity_out,
                    'purchase' as type,
                    'تفريغ شحنة' as description,
                    NULL as user_name,
                    p.driver_name,
                    p.truck_number,
                    NULL as notes,
                    NULL as actual_volume,
                    NULL as calibration_diff
                FROM purchase_offloads po
                JOIN purchases p ON po.purchase_id = p.id
                WHERE po.tank_id = ? AND p.created_at BETWEEN ? AND ?
            ");
            $stmt->execute([$tankId, $startDate, $endDate]);
            $transactions = array_merge($transactions, $stmt->fetchAll(\PDO::FETCH_ASSOC));

            // A2. Legacy direct purchases (In) - purchases with tank_id but no offload record
            $stmt = $db->prepare("
                SELECT 
                    p.created_at as created_at_ts,
                    DATE(p.created_at) as date,
                    p.id,
                    p.invoice_number,
                    p.volume_received as quantity_in,
                    0 as quantity_out,
                    'purchase' as type,
                    'فاتورة مشتريات' as description,
                    NULL as user_name,
                    p.driver_name,
                    p.truck_number,
                    NULL as notes,
                    NULL as actual_volume,
                    NULL as calibration_diff
                FROM purchases p
                LEFT JOIN purchase_offloads po ON po.purchase_id = p.id AND po.tank_id = p.tank_id
                WHERE p.tank_id = ? AND p.created_at BETWEEN ? AND ? AND po.id IS NULL
            ");
            $stmt->execute([$tankId, $startDate, $endDate]);
            $transactions = array_merge($transactions, $stmt->fetchAll(\PDO::FETCH_ASSOC));

            // B. Sales (Out)
            $stmt = $db->prepare("
                SELECT 
                    s.created_at as created_at_ts,
                    DATE(s.created_at) as date,
                    s.id,
                    s.invoice_number,
                    0 as quantity_in,
                    s.volume_sold as quantity_out,
                    'sale' as type,
                    'فاتورة مبيعات' as description,
                    u.name as user_name,
                    NULL as driver_name,
                    NULL as truck_number,
                    NULL as notes,
                    NULL as actual_volume,
                    NULL as calibration_diff
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE p.tank_id = ? AND s.sale_date BETWEEN ? AND ?
            ");
            $stmt->execute([$tankId, $startDate, $endDate]);
            $transactions = array_merge($transactions, $stmt->fetchAll(\PDO::FETCH_ASSOC));

            // C. Calibrations (tank_readings)
            try {
                $stmt = $db->prepare("
                    SELECT 
                        tr.created_at as created_at_ts,
                        DATE(tr.created_at) as date,
                        tr.id,
                        NULL as invoice_number,
                        0 as quantity_in,
                        0 as quantity_out,
                        'calibration' as type,
                        'معايرة' as description,
                        u.name as user_name,
                        NULL as driver_name,
                        NULL as truck_number,
                        CONCAT('القراءة: ', tr.reading_cm, ' سم / الحجم: ', tr.volume_liters, ' لتر') as notes,
                        tr.volume_liters as actual_volume,
                        NULL as calibration_diff
                    FROM tank_readings tr
                    LEFT JOIN users u ON tr.user_id = u.id
                    WHERE tr.tank_id = ? AND tr.created_at BETWEEN ? AND ?
                ");
                $stmt->execute([$tankId, $startDate, $endDate]);
                $transactions = array_merge($transactions, $stmt->fetchAll(\PDO::FETCH_ASSOC));
            } catch (\Exception $e) {
                // tank_readings table might not exist, skip
            }

            // 3. Sort Everything by Date/Time
            usort($transactions, function ($a, $b) {
                return strtotime($a['created_at_ts']) - strtotime($b['created_at_ts']);
            });

            // 4. Calculate Running Balance & Totals
            $currentBalance = $openingBalance;
            $totalIn = 0;
            $totalOut = 0;
            $finalData = [];

            foreach ($transactions as $key => &$t) {
                if ($t['type'] === 'calibration') {
                    // Calculate variance dynamically: actual_volume - currentBalance
                    $actualVolume = floatval($t['actual_volume'] ?? 0);
                    $variance = $actualVolume - $currentBalance;
                    $t['calibration_diff'] = $variance;

                    if ($variance > 0) {
                        $t['quantity_in'] = $variance;
                        $t['quantity_out'] = 0;
                        $t['description'] = 'معايرة (زيادة)';
                        $totalIn += $variance;
                    } elseif ($variance < 0) {
                        $t['quantity_in'] = 0;
                        $t['quantity_out'] = abs($variance);
                        $t['description'] = 'معايرة (نقصان)';
                        $totalOut += abs($variance);
                    } else {
                        $t['description'] = 'معايرة (بدون فرق)';
                    }

                    // Set balance to actual volume (calibration resets balance)
                    $currentBalance = $actualVolume;
                    $t['balance'] = $currentBalance;
                } else {
                    $in = floatval($t['quantity_in']);
                    $out = floatval($t['quantity_out']);

                    $currentBalance = $currentBalance + $in - $out;
                    $t['balance'] = $currentBalance;
                    $totalIn += $in;
                    $totalOut += $out;
                }

                // Add Unique Key for React
                $t['unique_id'] = $t['type'] . '_' . ($t['id'] ?? $key);

                $finalData[] = $t;
            }

            echo json_encode([
                'success' => true,
                'tank_name' => $tankInfo['name'],
                'tank_capacity' => floatval($tankInfo['capacity_liters']),
                'initial_volume' => $initialVolume,
                'opening_balance' => $openingBalance,
                'closing_balance' => $currentBalance,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'transactions' => $finalData
            ]);
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Daily Closing Report – AI-style professional A4 report
     */
    private function getDailyClosing()
    {
        header('Content-Type: application/json');
        try {
            $user = AuthHelper::user();
            $stationId = $_GET['station_id'] ?? ($user['station_id'] ?? 'all');
            if ($user['role'] !== 'super_admin') {
                $stationId = $user['station_id'];
            }

            $today = date('Y-m-d');
            $db = \App\Config\Database::connect();

            // ── 1. Station Info ──
            $stationName = 'جميع المحطات';
            if ($stationId !== 'all') {
                $stmt = $db->prepare("SELECT name FROM stations WHERE id = ?");
                $stmt->execute([$stationId]);
                $row = $stmt->fetch(\PDO::FETCH_ASSOC);
                if ($row) $stationName = $row['name'];
            }

            // ── 2. Sales by Fuel Type Today ──
            $salesSql = "
                SELECT 
                    ft.name as fuel_name,
                    COALESCE(SUM(s.volume_sold), 0) as total_liters,
                    COALESCE(SUM(s.total_amount), 0) as total_amount,
                    COUNT(s.id) as sale_count
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                JOIN tanks tk ON p.tank_id = tk.id
                JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                WHERE s.sale_date = ?
            ";
            $params = [$today];
            if ($stationId !== 'all') {
                $salesSql .= " AND s.station_id = ?";
                $params[] = $stationId;
            }
            $salesSql .= " GROUP BY ft.id, ft.name ORDER BY total_amount DESC";

            $stmt = $db->prepare($salesSql);
            $stmt->execute($params);
            $salesByFuel = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $totalSalesLiters = array_sum(array_column($salesByFuel, 'total_liters'));
            $totalSalesAmount = array_sum(array_column($salesByFuel, 'total_amount'));
            $totalSalesCount = array_sum(array_column($salesByFuel, 'sale_count'));

            // ── 3. Expenses Today ──
            $expSql = "
                SELECT 
                    COALESCE(tc.name, 'غير مصنف') as category_name,
                    SUM(t.amount) as total_amount
                FROM transactions t
                LEFT JOIN transaction_categories tc ON t.category_id = tc.id
                WHERE t.type = 'expense' AND DATE(t.date) = ?
            ";
            $expParams = [$today];
            if ($stationId !== 'all') {
                $expSql .= " AND t.station_id = ?";
                $expParams[] = $stationId;
            }
            $expSql .= " GROUP BY tc.id, tc.name ORDER BY total_amount DESC";

            $stmt = $db->prepare($expSql);
            $stmt->execute($expParams);
            $expenses = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $totalExpenses = array_sum(array_column($expenses, 'total_amount'));

            // ── 4. Income Today (from transactions) ──
            $incSql = "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND DATE(date) = ?";
            $incParams = [$today];
            if ($stationId !== 'all') {
                $incSql .= " AND station_id = ?";
                $incParams[] = $stationId;
            }
            $stmt = $db->prepare($incSql);
            $stmt->execute($incParams);
            $totalIncome = $stmt->fetchColumn() ?: 0;

            // ── 5. Tank Stock Levels ──
            $tanks = $this->tankModel->getAll();
            $tankData = [];
            $totalVariance = 0;
            $varianceDetails = [];

            foreach ($tanks as $t) {
                if ($stationId !== 'all' && $t['station_id'] != $stationId) continue;

                $fillPct = $t['capacity_liters'] > 0 ? round(($t['current_volume'] / $t['capacity_liters']) * 100, 1) : 0;

                // Calculate today's variance
                $variance = 0;
                $salesVol = 0;
                $purchaseVol = 0;

                // Get yesterday's reading or last known
                $opening = method_exists($this->tankModel, 'getReadingAt')
                    ? $this->tankModel->getReadingAt($t['id'], date('Y-m-d', strtotime('-1 day')))
                    : false;

                if ($opening !== false) {
                    $salesVol = method_exists($this->saleModel, 'getVolumeByTank')
                        ? $this->saleModel->getVolumeByTank($t['id'], $today, $today) : 0;
                    $purchaseVol = method_exists($this->purchaseModel, 'getVolumeByTank')
                        ? $this->purchaseModel->getVolumeByTank($t['id'], $today, $today) : 0;

                    $theoretical = $opening + $purchaseVol - $salesVol;
                    $variance = $t['current_volume'] - $theoretical;
                    $totalVariance += $variance;

                    $varianceDetails[] = [
                        'tank' => $t['name'],
                        'fuel' => $t['fuel_name'],
                        'variance' => round($variance, 2),
                        'sales' => $salesVol
                    ];
                }

                // Calculate days of stock remaining
                // Get average daily sales for this tank over last 7 days
                $avgSql = "
                    SELECT COALESCE(AVG(daily_vol), 0) as avg_daily
                    FROM (
                        SELECT s.sale_date, COALESCE(SUM(s.volume_sold), 0) as daily_vol
                        FROM sales s
                        JOIN counters c ON s.counter_id = c.id
                        JOIN pumps p ON c.pump_id = p.id
                        WHERE p.tank_id = ?
                        AND s.sale_date BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND DATE_SUB(?, INTERVAL 1 DAY)
                        GROUP BY s.sale_date
                    ) daily
                ";
                $stmt = $db->prepare($avgSql);
                $stmt->execute([$t['id'], $today, $today]);
                $avgDaily = floatval($stmt->fetchColumn() ?: 0);
                $daysRemaining = $avgDaily > 0 ? round($t['current_volume'] / $avgDaily, 1) : null;

                $tankData[] = [
                    'name' => $t['name'],
                    'fuel' => $t['fuel_name'],
                    'volume' => $t['current_volume'],
                    'capacity' => $t['capacity_liters'],
                    'fill_pct' => $fillPct,
                    'value' => round($t['current_volume'] * $t['current_price'], 2),
                    'price' => $t['current_price'],
                    'variance' => round($variance, 2),
                    'days_remaining' => $daysRemaining,
                    'avg_daily_sales' => round($avgDaily, 1)
                ];
            }

            // ── 6. Cash Balances ──
            $safes = [];
            $banks = [];
            try {
                if ($stationId === 'all') {
                    $stmt = $db->query("SELECT name, balance FROM safes ORDER BY balance DESC");
                } else {
                    $stmt = $db->prepare("SELECT name, balance FROM safes WHERE station_id = ? ORDER BY balance DESC");
                    $stmt->execute([$stationId]);
                }
                $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                if ($stationId === 'all') {
                    $stmt = $db->query("SELECT bank_name as name, balance FROM banks ORDER BY balance DESC");
                } else {
                    $stmt = $db->prepare("SELECT bank_name as name, balance FROM banks WHERE station_id = ? ORDER BY balance DESC");
                    $stmt->execute([$stationId]);
                }
                $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) { /* tables may not exist */
            }

            $totalSafes = array_sum(array_column($safes, 'balance'));
            $totalBanks = array_sum(array_column($banks, 'balance'));

            // ── 7. AI Smart Notes ──
            $notes = [];

            // Note 1: Variance / Matching Status
            $hasDeficit = false;
            foreach ($varianceDetails as $v) {
                if ($v['variance'] < -5) { // > 5 liters deficit is notable
                    $hasDeficit = true;
                    $notes[] = [
                        'type' => 'warning',
                        'icon' => '⚠️',
                        'text' => "تنبيه: يوجد فرق (عجز) بمقدار " . abs($v['variance']) . " لتر في " . $v['fuel'] . " (" . $v['tank'] . "). يرجى فحص التوصيلات أو معايرة المضخة."
                    ];
                }
            }
            if (!$hasDeficit && !empty($varianceDetails)) {
                $notes[] = [
                    'type' => 'success',
                    'icon' => '✅',
                    'text' => "النظام يشير إلى مطابقة تامة بين مبيعات العدادات ونقص المخزون الفعلي. أداء العمليات مستقر."
                ];
            }

            // Note 2: Stock Predictions
            foreach ($tankData as $td) {
                if ($td['days_remaining'] !== null && $td['days_remaining'] <= 3 && $td['days_remaining'] > 0) {
                    $hours = round($td['days_remaining'] * 24);
                    $notes[] = [
                        'type' => 'fuel',
                        'icon' => '⛽',
                        'text' => "ذكاء المخزون: بناءً على معدل البيع الحالي، مخزون {$td['fuel']} ({$td['name']}) سينفد خلال {$hours} ساعة. يوصى بطلب شحنة جديدة الآن."
                    ];
                } elseif ($td['fill_pct'] < 15) {
                    $notes[] = [
                        'type' => 'fuel',
                        'icon' => '🔴',
                        'text' => "مخزون {$td['fuel']} ({$td['name']}) منخفض جداً ({$td['fill_pct']}%). يجب التزويد فوراً."
                    ];
                }
            }

            // Note 3: Cash Flow
            $netToday = $totalIncome - $totalExpenses;
            if ($netToday > 0) {
                $notes[] = [
                    'type' => 'info',
                    'icon' => '💰',
                    'text' => "التدفق النقدي لليوم إيجابي بمبلغ " . number_format($netToday, 2) . " ج.س. الوضع المالي مستقر."
                ];
            } elseif ($netToday < 0) {
                $notes[] = [
                    'type' => 'warning',
                    'icon' => '📉',
                    'text' => "التدفق النقدي لليوم سالب بمبلغ " . number_format(abs($netToday), 2) . " ج.س. المصروفات تجاوزت الإيرادات."
                ];
            }

            // Note 4: Sales performance
            if ($totalSalesCount == 0) {
                $notes[] = [
                    'type' => 'info',
                    'icon' => '📊',
                    'text' => "لم يتم تسجيل أي مبيعات اليوم حتى الآن."
                ];
            } elseif ($totalSalesCount > 0) {
                $avgPerSale = $totalSalesAmount / $totalSalesCount;
                $notes[] = [
                    'type' => 'info',
                    'icon' => '📊',
                    'text' => "تم تنفيذ {$totalSalesCount} عملية بيع اليوم بمتوسط " . number_format($avgPerSale, 2) . " ج.س لكل عملية."
                ];
            }

            echo json_encode([
                'success' => true,
                'date' => $today,
                'station_name' => $stationName,
                'sales' => [
                    'by_fuel' => $salesByFuel,
                    'total_liters' => $totalSalesLiters,
                    'total_amount' => $totalSalesAmount,
                    'total_count' => $totalSalesCount
                ],
                'financial' => [
                    'total_income' => $totalIncome,
                    'total_expenses' => $totalExpenses,
                    'net_profit' => $totalIncome - $totalExpenses,
                    'expenses_breakdown' => $expenses
                ],
                'inventory' => $tankData,
                'cash' => [
                    'safes' => $safes,
                    'banks' => $banks,
                    'total_safes' => $totalSafes,
                    'total_banks' => $totalBanks,
                    'total_cash' => $totalSafes + $totalBanks
                ],
                'ai_notes' => $notes
            ]);
            exit;
        } catch (\Throwable $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
                'line' => $e->getLine()
            ]);
            exit;
        }
    }
}
