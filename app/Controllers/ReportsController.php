<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Sale;
use App\Models\Tank;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Employee; // Assuming we have an Employee or Worker model. Let's start with Worker? Or generic User? 
// The user mentions "Employees Report" (shifts, shortages, commissions). 
// I'll check if Worker model exists or if I should use User. 
// Based on previous convos, we have WorkerController and likely Worker model.
use App\Models\Worker;
use App\Models\Purchase; // Added manually to fix error

require_once __DIR__ . '/../Models/Sale.php';
require_once __DIR__ . '/../Models/Tank.php';
require_once __DIR__ . '/../Models/Supplier.php';
require_once __DIR__ . '/../Models/Customer.php';
require_once __DIR__ . '/../Models/Transaction.php';
require_once __DIR__ . '/../Models/Purchase.php'; // Add Purchase model
// require_once __DIR__ . '/../Models/Worker.php'; // I'll double check if this file exists before requiring it, or assume autoloader handles it? 
// The project uses manual requires in some places. I'll rely on the existing pattern.


class ReportsController extends Controller
{
    private $saleModel;
    private $tankModel;
    private $supplierModel;
    private $customerModel;
    private $transactionModel;
    private $purchaseModel; // Declared purchaseModel
    // private $workerModel;

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->saleModel = new Sale();
        $this->tankModel = new Tank();
        $this->supplierModel = new Supplier();
        $this->customerModel = new Customer();
        $this->transactionModel = new Transaction();
        $this->purchaseModel = new Purchase(); // Instantiated purchaseModel
        // $this->workerModel = new Worker();
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


        $this->view('reports/index', [
            'user' => $user,
            'hide_topbar' => true
        ]);
    }

    private function getStats()
    {
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

        // Income/Expense from Transactions (General P&L) for the period
        // We need a helper in Transaction model to get aggregated totals by type and date
        $financials = $this->transactionModel->getTotalsByPeriod($startDate, $endDate, $stationId);

        // 3. Sales Stats
        $salesStats = $this->saleModel->getStatsByPeriod($startDate, $endDate, $stationId);
        $productStats = $this->saleModel->getSalesByProduct($startDate, $endDate, $stationId); // New method

        // 4. Warehouse Stats (Tanks)
        $purchaseStats = $this->purchaseModel->getStatsByPeriod($startDate, $endDate, $stationId);
        $evaporationLoss = 0;

        $tankStats = array_map(function ($t) use ($startDate, $endDate, &$evaporationLoss) {
            $lastCal = $this->tankModel->getLastCalibration($t['id']);

            // Variance Calculation Logic
            // 1. Opening Volume (First reading on or before StartDate)
            $opening = $this->tankModel->getReadingAt($t['id'], $startDate); // Using strict start date could miss if no reading that exact day. Ideally find closest previous.
            // If no reading found, use capacity or current as best guess? Or 0. 
            // For now, if no reading, we assume we can't calculate variance accurately.

            $variance = 0;
            if ($opening !== false) { // Only calculate if we have a baseline
                // 2. Closing Volume (Last reading on or before EndDate)
                $closing = $this->tankModel->getReadingAt($t['id'], $endDate);

                // Fallback: If no reading for 'today/future' and EndDate is today, use current live volume
                if ($closing === false && $endDate >= date('Y-m-d')) {
                    $closing = $t['current_volume'];
                }

                if ($closing !== false) {
                    $salesVol = $this->saleModel->getVolumeByTank($t['id'], $startDate, $endDate);
                    $purchaseVol = $this->purchaseModel->getVolumeByTank($t['id'], $startDate, $endDate);

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
        $workerStats = $this->saleModel->getWorkerPerformance($startDate, $endDate, $stationId);

        // Calculate Shortages (Deficit/Surplus)
        $totalShortage = 0;
        foreach ($workerStats as &$worker) {
            // ... existing logic ...
            $worker['shortage'] = 0; // Keeping placeholder as discussed
        }
        // $evaporationLoss is now calculated dynamically above

        // Fetch detailed lists for tables
        $detailedPurchases = $this->purchaseModel->getByPeriod($startDate, $endDate, $stationId);
        $detailedReadings = $this->tankModel->getReadingsByPeriod($startDate, $endDate, $stationId);

        // Daily Stock Reconciliation (Cardex)
        $dailyReconciliation = [];

        // 1. Fetch Daily Data
        $dailySales = $this->saleModel->getDailySalesByTank($stationId, $startDate, $endDate);
        $dailyPurchases = $this->purchaseModel->getDailyPurchasesByTank($stationId, $startDate, $endDate);
        $dailyReadings = $this->tankModel->getDailyReadings($stationId, $startDate, $endDate); // All readings

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
            $currentBalance = $this->tankModel->getReadingAt($tank['id'], date('Y-m-d', strtotime($startDate . ' -1 day')));
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

        $response = [
            'success' => true,
            'financial' => [
                'inventory_value' => $inventoryValue,
                'corporate_debts' => $corporateDebts,
                'supplier_debts' => $supplierDebts,
                'income' => $financials['income'] ?? 0,
                'expense' => $financials['expense'] ?? 0,
                'net_profit' => ($financials['income'] ?? 0) - ($financials['expense'] ?? 0),
                'evaporation_loss' => $evaporationLoss
            ],
            'sales' => [
                'total_liters' => $salesStats['total_liters'] ?? 0,
                'total_revenue' => $salesStats['total_revenue'] ?? 0,
                'total_transactions' => $salesStats['count'] ?? 0,
                'by_product' => $productStats // Array of {product_name, total_revenue, total_liters, color_hex}
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
                'pending_shipments' => $this->purchaseModel->getPending($stationId)
            ],
            'employees' => [
                'list' => $workerStats // Array of {worker_name, shifts_count, total_sales, total_volume}
            ]
        ];

        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
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

            // Fetch Safes
            $stmt = $db->prepare("SELECT id, name, balance FROM safes WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            $safes = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch Banks
            $stmt = $db->prepare("SELECT id, bank_name as name, balance FROM banks WHERE station_id = ? ORDER BY bank_name ASC");
            $stmt->execute([$stationId]);
            $banks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch Suppliers
            $stmt = $db->prepare("SELECT id, name, balance FROM suppliers WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            $suppliers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'safes' => $safes,
                'banks' => $banks,
                'suppliers' => $suppliers
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        exit;
    }

    public function getFinancialFlow()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            // 1. Inputs
            $sourceType = $_GET['source_type'] ?? 'safe'; // safe | bank
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
                           ft.name as fuel_name
                    FROM transactions t
                    LEFT JOIN sales s ON (t.related_entity_type = 'sales' AND t.related_entity_id = s.id)
                    LEFT JOIN counters c ON s.counter_id = c.id
                    LEFT JOIN pumps p ON c.pump_id = p.id
                    LEFT JOIN tanks tk ON p.tank_id = tk.id
                    LEFT JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                    WHERE ((t.to_type = ? AND t.to_id = ?) OR (t.from_type = ? AND t.from_id = ?))
                    AND t.date BETWEEN ? AND ?
                    ORDER BY t.date ASC, t.id ASC"; // Chronological
            $stmt = $db->prepare($sql);
            $stmt->execute([$sourceType, $sourceId, $sourceType, $sourceId, $startDate, $endDate]);
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
                    $category = $t['category_name'] ?? 'عام';
                    if ($t['related_entity_type'] === 'sales' && !empty($t['fuel_name'])) {
                        $category = 'مبيعات ' . $t['fuel_name'];
                    }

                    $finalRows[] = [
                        'date' => $t['date'],
                        'id' => $t['id'],
                        'type' => $t['type'], // income, expense, transfer
                        'category' => $category,
                        'description' => $t['description'],
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
                    $finalRows[] = [
                        'date' => $t['date'],
                        'id' => $t['id'],
                        'type' => $t['type'],
                        'category' => $t['category_name'] ?? 'عام',
                        'description' => $t['description'],
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
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        exit;
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
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        exit;
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
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        exit;
    }

    public function getSupplierReport()
    {
        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $supplierId = $_GET['supplier_id'] ?? null;
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');

            if (!$supplierId) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'يرجى تحديد المورد']);
                exit;
            }

            $db = \App\Config\Database::connect();

            // 1. Fetch Purchases (Fuel)
            $purchasesSql = "SELECT 
                                p.created_at as tr_date,
                                COALESCE(p.driver_name, d.name, 'غير معروف') as statement_title, 
                                p.truck_number as statement_subtitle,
                                ft.name as category,
                                'purchase' as type,
                                p.volume_received as quantity,
                                p.price_per_liter as price,
                                p.total_cost as purchase_value,
                                0 as amount_paid
                             FROM purchases p
                             LEFT JOIN drivers d ON p.driver_id = d.id
                             LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
                             WHERE p.supplier_id = ? AND DATE(p.created_at) BETWEEN ? AND ?";

            // 2. Fetch Payments
            $paymentsSql = "SELECT 
                                t.date as tr_date,
                                COALESCE(t.reference_number, CONCAT('#', t.id)) as statement_title,
                                t.description as statement_subtitle,
                                CASE 
                                    WHEN t.from_type = 'bank' THEN 'تحويل بنكي'
                                    WHEN t.from_type = 'safe' THEN 'نقدي'
                                    ELSE 'أخرى'
                                END as category,
                                'payment' as type,
                                0 as quantity,
                                0 as price,
                                0 as purchase_value,
                                t.amount as amount_paid
                            FROM transactions t
                            WHERE t.to_type = 'supplier' AND t.to_id = ? AND t.date BETWEEN ? AND ?";

            $paramsP = [$supplierId, $startDate, $endDate];
            $paramsT = [$supplierId, $startDate, $endDate];

            if ($stationId !== 'all') {
                $purchasesSql .= " AND p.station_id = ?";
                $paymentsSql .= " AND t.station_id = ?";
                $paramsP[] = $stationId;
                $paramsT[] = $stationId;
            }

            $stmtP = $db->prepare($purchasesSql);
            $stmtP->execute($paramsP);
            $purchases = $stmtP->fetchAll(\PDO::FETCH_ASSOC);

            $stmtT = $db->prepare($paymentsSql);
            $stmtT->execute($paramsT);
            $payments = $stmtT->fetchAll(\PDO::FETCH_ASSOC);

            $allTransactions = array_merge($purchases, $payments);

            usort($allTransactions, function ($a, $b) {
                return strtotime($a['tr_date']) - strtotime($b['tr_date']);
            });

            $runningBalance = 0;
            $processedData = [];
            $totalPaid = 0;
            $totalPurchased = 0;

            foreach ($allTransactions as $tr) {
                $purchaseVal = floatval($tr['purchase_value']);
                $paidVal = floatval($tr['amount_paid']);

                $runningBalance += $paidVal;
                $runningBalance -= $purchaseVal;

                $totalPaid += $paidVal;
                $totalPurchased += $purchaseVal;

                $processedData[] = [
                    'date' => date('Y-m-d', strtotime($tr['tr_date'])),
                    'statement_title' => $tr['statement_title'],
                    'statement_subtitle' => $tr['statement_subtitle'],
                    'category' => $tr['category'],
                    'type' => $tr['type'],
                    'quantity' => $tr['quantity'] > 0 ? $tr['quantity'] : null,
                    'price' => $tr['price'] > 0 ? $tr['price'] : null,
                    'amount_paid' => $paidVal > 0 ? $paidVal : null,
                    'purchase_value' => $purchaseVal > 0 ? $purchaseVal : null,
                    'running_balance' => $runningBalance
                ];
            }

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'transactions' => $processedData,
                    'totals' => [
                        'total_paid' => $totalPaid,
                        'total_purchased' => $totalPurchased,
                        'net_balance' => $runningBalance
                    ]
                ]
            ]);
            exit;
        } catch (\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
            exit;
        }
    }
}
