<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Safe;
use App\Models\Bank;
use App\Models\Transaction;
use App\Models\TransactionCategory;
use App\Models\Supplier;
use App\Models\Customer;
use App\Helpers\AuthHelper;
use App\Helpers\ViteHelper;


require_once __DIR__ . '/../Models/Transaction.php';
require_once __DIR__ . '/../Models/TransactionCategory.php';
require_once __DIR__ . '/../Models/Supplier.php';
require_once __DIR__ . '/../Models/Customer.php';

class FinanceController extends Controller
{
    private $safeModel;
    private $bankModel;
    private $transactionModel;
    private $categoryModel;
    private $supplierModel;
    private $customerModel;

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->safeModel = new Safe();
        $this->bankModel = new Bank();
        $this->transactionModel = new Transaction();
        $this->categoryModel = new \App\Models\TransactionCategory();
        $this->supplierModel = new Supplier();
        $this->customerModel = new Customer();
    }

    private function getSettings()
    {
        $settingModel = new \App\Models\Setting();
        return $settingModel->getAllBySection('general');
    }

    public function index()
    {
        $user = AuthHelper::user();
        $filters = [];

        $safes = $this->safeModel->getAll();
        $banks = $this->bankModel->getAll();
        $recent_transactions = $this->transactionModel->getHistory($user['station_id'] ?? 1);
        $categories = $this->categoryModel->getAll();

        // Use getAll without arguments for now as we confirmed station filtering might be excluding data
        // or we want to guarantee data flow first.
        // We know 'station_id' is 1 and supplier has station_id 1. So filtering should work?
        // Let's stick to NO FILTER for safety.
        // Match SupplierController logic: Use station_id from user, if null/empty -> fetches all
        // DEBUG: Passing NULL to fetch ALL records regardless of station to rule out ID mismatch
        $suppliers = $this->supplierModel->getAll(null);
        $customers = $this->customerModel->getAll(null);

        // Ensure they are arrays (fetchAll returns array or false)
        if (!is_array($suppliers)) $suppliers = [];
        if (!is_array($customers)) $customers = [];

        // Ensure they are arrays (fetchAll returns array or false)
        if (!is_array($suppliers)) $suppliers = [];
        if (!is_array($customers)) $customers = [];

        // Debug: Log if empty (optional, for development)
        error_log("FinanceController: Suppliers Count: " . count($suppliers));
        error_log("FinanceController: Customers Count: " . count($customers));

        // Header Requirements
        $allStations = [];
        if (($user['role'] ?? '') === 'super_admin') {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
            $allStations = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $settings = $this->getSettings();

        $this->view('finance/index', [
            'user' => $user,
            'settings' => $settings,
            'safes' => $safes,
            'banks' => $banks,
            'recent_transactions' => $recent_transactions,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'customers' => $customers,
            'allStations' => $allStations,
            'hide_topbar' => true,
            'additional_js' => '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>',
            'additional_css' => '
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                :root {
                    --primary-blue: #0ea5e9;
                    --light-blue: #e0f2fe;
                    --dark-blue: #0369a1;
                    --glass-bg: rgba(255, 255, 255, 0.95);
                    --glass-border: 1px solid rgba(255, 255, 255, 0.4);
                }
                body { font-family: "Cairo", sans-serif; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); min-height: 100vh; color: #334155; }
                .glass-card { background: var(--glass-bg); backdrop-filter: blur(10px); border: var(--glass-border); border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07); transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .glass-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px 0 rgba(14, 165, 233, 0.15); }
                .stat-card { padding: 2rem; position: relative; overflow: hidden; }
                .stat-card::before { content: ""; position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: linear-gradient(45deg, transparent, rgba(14, 165, 233, 0.1)); border-radius: 0 0 0 100%; transition: all 0.5s ease; }
                .stat-card:hover::before { width: 100%; height: 100%; border-radius: 20px; }
                .btn-primary-custom { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; border: none; padding: 10px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); transition: all 0.3s ease; }
                .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4); color: white; }
                .btn-secondary-custom { background: rgba(255, 255, 255, 0.9); color: var(--dark-blue); border: 1px solid #bae6fd; padding: 10px 25px; border-radius: 12px; transition: all 0.3s ease; }
                .btn-secondary-custom:hover { background: #f0f9ff; color: var(--primary-blue); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-up { animation: fadeInUp 0.6s ease-out forwards; }
                .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; }
                .table-custom { border-collapse: separate; border-spacing: 0 10px; }
                .table-custom tr { background: white; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02); border-radius: 10px; transition: transform 0.2s; }
                .table-custom tr:hover { transform: scale(1.01); }
                .table-custom td { padding: 15px; border: none; }
                .table-custom td:first-child { border-radius: 0 10px 10px 0; }
                .table-custom td:last-child { border-radius: 10px 0 0 10px; }
                .amount-positive { color: #10b981; font-weight: bold; }
                .amount-negative { color: #ef4444; font-weight: bold; }
            </style>'
        ]);
    }


    public function createSafe()
    {
        $user = AuthHelper::user();
        $name = $_POST['name'];
        $balance = $_POST['balance'] ?? 0;
        $scope = $_POST['account_scope'] ?? 'local';

        $this->safeModel->create([
            'station_id' => $user['station_id'] ?? 1,
            'name' => $name,
            'balance' => $balance,
            'account_scope' => $scope
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Safe created successfully']);
            exit;
        }

        header('Location: ' . BASE_URL . '/finance');
    }

    public function createBank()
    {
        $user = AuthHelper::user();
        $name = $_POST['name'];
        $accNum = $_POST['account_number'];
        $balance = $_POST['balance'] ?? 0;
        $scope = $_POST['account_scope'] ?? 'local';

        $this->bankModel->create([
            'station_id' => $user['station_id'] ?? 1,
            'name' => $name,
            'account_number' => $accNum,
            'balance' => $balance,
            'account_scope' => $scope
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Bank created successfully']);
            exit;
        }

        header('Location: ' . BASE_URL . '/finance');
    }

    public function updateSafe()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $user = AuthHelper::user();
        $id = $_POST['id'];
        $name = $_POST['name'];
        $scope = $_POST['account_scope'] ?? 'local';

        $this->safeModel->update($id, [
            'name' => $name,
            'account_scope' => $scope,
            'station_id' => $user['station_id'] ?? 1 // Only used if scope is local
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Safe updated successfully']);
            exit;
        }
        header('Location: ' . BASE_URL . '/finance');
    }

    public function deleteSafe()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        $id = $_POST['id'];

        try {
            // Check for transactions
            $transactions = $this->transactionModel->getByAccount('safe', $id, 1);
            if (count($transactions) > 0) {
                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'message' => 'لا يمكن حذف الخزنة لوجود عمليات مالية مسجلة عليها']);
                    exit;
                }
                header('Location: ' . BASE_URL . '/finance?error=' . urlencode('لا يمكن حذف الخزنة لوجود عمليات مالية مسجلة عليها'));
                return;
            }

            $this->safeModel->delete($id);

            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Safe deleted successfully']);
                exit;
            }
        } catch (\Exception $e) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'خطأ في الحذف: ' . $e->getMessage()]);
                exit;
            }
        }

        header('Location: ' . BASE_URL . '/finance');
    }

    public function updateBank()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $user = AuthHelper::user();
        $id = $_POST['id'];
        $name = $_POST['name'];
        $accNum = $_POST['account_number'];
        $scope = $_POST['account_scope'] ?? 'local';

        $this->bankModel->update($id, [
            'name' => $name,
            'account_number' => $accNum,
            'account_scope' => $scope,
            'station_id' => $user['station_id'] ?? 1 // Only used if scope is local
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Bank updated successfully']);
            exit;
        }
        header('Location: ' . BASE_URL . '/finance');
    }

    public function deleteBank()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        $id = $_POST['id'];

        try {
            // Check for transactions
            $transactions = $this->transactionModel->getByAccount('bank', $id, 1);
            if (count($transactions) > 0) {
                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'message' => 'لا يمكن حذف البنك لوجود عمليات مالية مسجلة عليه']);
                    exit;
                }
                header('Location: ' . BASE_URL . '/finance?error=' . urlencode('لا يمكن حذف البنك لوجود عمليات مالية مسجلة عليه'));
                return;
            }

            $this->bankModel->delete($id);

            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Bank deleted successfully']);
                exit;
            }
        } catch (\Exception $e) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'خطأ في الحذف: ' . $e->getMessage()]);
                exit;
            }
        }
        header('Location: ' . BASE_URL . '/finance');
    }

    public function transfer()
    {
        $user = AuthHelper::user();

        $fromType = $_POST['from_type']; // safe, bank
        $fromId = $_POST['from_id'];
        $toType = $_POST['to_type']; // safe, bank
        $toId = $_POST['to_id'];
        $amount = (float)$_POST['amount'];
        $desc = $_POST['description'];

        // Basic Validation
        if ($amount <= 0) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Invalid Amount']);
                exit;
            }
            header('Location: ' . BASE_URL . '/finance?error=Invalid+Amount');
            return;
        }

        try {
            // Check Destination Scope
            $destAccount = ($toType == 'safe') ? $this->safeModel->find($toId) : $this->bankModel->find($toId);
            $sourceAccount = ($fromType == 'safe') ? $this->safeModel->find($fromId) : $this->bankModel->find($fromId);

            // Logic: Local -> Global requires Approval (Pending Request)
            $isLocalToGlobal = ($sourceAccount['account_scope'] == 'local' && $destAccount['account_scope'] == 'global');

            if ($isLocalToGlobal) {
                // 1. Deduct from Source Immediately (Frozen)
                if ($fromType == 'safe') $this->safeModel->updateBalance($fromId, -$amount);
                elseif ($fromType == 'bank') $this->bankModel->updateBalance($fromId, -$amount);

                // 2. Create Transfer Request
                require_once __DIR__ . '/../Models/TransferRequest.php';
                $transferRequestModel = new \App\Models\TransferRequest();

                $transferRequestModel->create([
                    'from_type' => $fromType,
                    'from_id' => $fromId,
                    'from_scope' => $sourceAccount['account_scope'],
                    'to_type' => $toType,
                    'to_id' => $toId,
                    'to_scope' => $destAccount['account_scope'],
                    'amount' => $amount,
                    'description' => $desc,
                    'requested_by' => $user['id'],
                    'station_id' => $user['station_id'] ?? null
                ]);

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'تم إرسال طلب التحويل للموافقة (بانتظار قبول الخزينة العامة)']);
                    exit;
                }
            } else {
                // Direct Transfer (Local->Local or Global->Global or Global->Local if permitted)

                // 1. Deduct from Source
                if ($fromType == 'safe') $this->safeModel->updateBalance($fromId, -$amount);
                elseif ($fromType == 'bank') $this->bankModel->updateBalance($fromId, -$amount);

                // 2. Add to Dest
                if ($toType == 'safe') $this->safeModel->updateBalance($toId, $amount);
                elseif ($toType == 'bank') $this->bankModel->updateBalance($toId, $amount);

                // 3. Log Transaction
                $this->transactionModel->create([
                    'station_id' => $user['station_id'] ?? 1,
                    'type' => 'transfer',
                    'amount' => $amount,
                    'from_type' => $fromType,
                    'from_id' => $fromId,
                    'to_type' => $toType,
                    'to_id' => $toId,
                    'description' => "Transfer: $desc",
                    'created_by' => $user['id']
                ]);

                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Transfer successful']);
                    exit;
                }
            }
        } catch (\Exception $e) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
        }

        header('Location: ' . BASE_URL . '/finance?success=Transfer+Completed');
    }

    public function storeTransaction()
    {
        $user = AuthHelper::user();
        $type = $_POST['type']; // expense, income
        $categoryId = !empty($_POST['category_id']) ? $_POST['category_id'] : null;
        $amount = (float)$_POST['amount'];
        $description = $_POST['description'];

        // Source/Dest Logic
        // For Expense: Money leaves Source (Safe/Bank)
        // For Income: Money enters Dest (Safe/Bank)
        $accountType = $_POST['account_type']; // safe, bank
        $accountId = $_POST['account_id'];

        // Related Entity Logic (Supplier, Customer)
        $relatedEntityType = !empty($_POST['related_entity_type']) ? $_POST['related_entity_type'] : null;
        if ($relatedEntityType === 'general') $relatedEntityType = null; // treat general as no entity
        $relatedEntityId = !empty($_POST['related_entity_id']) ? $_POST['related_entity_id'] : null;

        if ($amount <= 0) {
            header('Location: ' . BASE_URL . '/finance?error=Invalid Amount');
            return;
        }

        if ($type === 'expense') {
            // Deduct
            if ($accountType == 'safe') $this->safeModel->updateBalance($accountId, -$amount);
            else $this->bankModel->updateBalance($accountId, -$amount);

            $fromType = $accountType;
            $fromId = $accountId;
            $toType = null;
            $toId = null;
        } else {
            // Add (Income)
            if ($accountType == 'safe') $this->safeModel->updateBalance($accountId, $amount);
            else $this->bankModel->updateBalance($accountId, $amount);

            $fromType = null;
            $fromId = null;
            $toType = $accountType;
            $toId = $accountId;
        }

        // Handle Entity Balances
        if ($relatedEntityType && $relatedEntityId) {
            if ($relatedEntityType === 'supplier') {
                // If Expense (Paying Supplier) -> We owe less -> Negative Update
                // If Income (Refund from Supplier) -> We owe more (or get credit) -> Positive Update
                // Logic: User pays Supplier 500. Supplier Balance -500.
                // Logic: User gets refund 500. Supplier Balance +500.
                $balanceChange = ($type === 'expense') ? -$amount : $amount;
                $this->supplierModel->updateBalance($relatedEntityId, $balanceChange);
            } elseif ($relatedEntityType === 'customer') {
                // If Income (Customer Assigns/Pays) -> They owe less -> Negative Update
                // If Expense (We Pay Customer) -> They owe more? Or we give them back?
                // Standard: Customer pays us (Income) -> Balance decreases.
                $balanceChange = ($type === 'income') ? -$amount : $amount;
                $this->customerModel->updateBalance($relatedEntityId, $balanceChange);
            }
        }

        // Create Record
        $this->transactionModel->create([
            'station_id' => $user['station_id'] ?? 1,
            'type' => $type,
            'amount' => $amount,
            'category_id' => $categoryId,
            'from_type' => $fromType,
            'from_id' => $fromId,
            'to_type' => $toType,
            'to_id' => $toId,
            'related_entity_type' => $relatedEntityType,
            'related_entity_id' => $relatedEntityId,
            'description' => $description,
            'reference_number' => $_POST['reference_number'] ?? null,
            'date' => $_POST['date'] ?? date('Y-m-d'),
            'created_by' => $user['id']
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
            exit;
        }

        header('Location: ' . BASE_URL . '/finance?success=Transaction+Added');
    }

    public function reports()
    {
        $user = AuthHelper::user();
        $filters = [
            'start_date' => $_GET['start_date'] ?? date('Y-m-01'),
            'end_date' => $_GET['end_date'] ?? date('Y-m-d'),
            'type' => $_GET['type'] ?? null
        ];

        $transactions = $this->transactionModel->getReport($user['station_id'] ?? 1, $filters);

        // Calculate Totals
        $totalIncome = 0;
        $totalExpense = 0;
        foreach ($transactions as $t) {
            if ($t['type'] == 'income') $totalIncome += $t['amount'];
            if ($t['type'] == 'expense') $totalExpense += $t['amount'];
        }

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'transactions' => $transactions,
                'totals' => ['income' => $totalIncome, 'expense' => $totalExpense],
                'filters' => $filters
            ]);
            exit;
        }

        $this->view('finance/reports', [
            'user' => $user,
            'transactions' => $transactions,
            'filters' => $filters,
            'totals' => ['income' => $totalIncome, 'expense' => $totalExpense],
            'hide_topbar' => true
        ]);
    }

    public function getBankDetails()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Missing ID']);
            exit;
        }

        $bank = $this->bankModel->find($id);
        if (!$bank) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Bank not found']);
            exit;
        }

        // Get date filters
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        $transactions = $this->transactionModel->getByAccount('bank', $id, 500, $startDate, $endDate);

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'bank' => $bank,
            'transactions' => $transactions
        ]);
        exit;
    }

    public function getSafeDetails()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Missing ID']);
            exit;
        }

        $safe = $this->safeModel->find($id);
        if (!$safe) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Safe not found']);
            exit;
        }

        // Get date filters
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        $transactions = $this->transactionModel->getByAccount('safe', $id, 500, $startDate, $endDate);

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'safe' => $safe,
            'transactions' => $transactions
        ]);
        exit;
    }


    // صفحة البنوك
    public function banks()
    {
        $user = AuthHelper::user();
        $banks = $this->bankModel->getAll();

        require_once __DIR__ . '/../Models/TransferRequest.php';
        $trModel = new \App\Models\TransferRequest();
        $allPending = $trModel->getPending($user['station_id']);

        // Filter: Only requests FROM a bank
        $pendingRequests = array_filter($allPending, function ($r) {
            return $r['from_type'] === 'bank';
        });

        $settings = $this->getSettings();

        $this->view('finance/banks', [
            'user' => $user,
            'settings' => $settings,
            'banks' => $banks,
            'pendingRequests' => array_values($pendingRequests),
            'hide_topbar' => true,
            'additional_js' => ViteHelper::load('resources/js/main.jsx'),
            'additional_css' => ''
        ]);
    }

    // صفحة الخزائن
    public function safes()
    {
        $user = AuthHelper::user();
        $safes = $this->safeModel->getAll();

        require_once __DIR__ . '/../Models/TransferRequest.php';
        $trModel = new \App\Models\TransferRequest();
        $allPending = $trModel->getPending($user['station_id']);

        // Filter: Only requests FROM a safe
        $pendingRequests = array_filter($allPending, function ($r) {
            return $r['from_type'] === 'safe';
        });

        $settings = $this->getSettings();

        $this->view('finance/safes', [
            'user' => $user,
            'settings' => $settings,
            'safes' => $safes,
            'pendingRequests' => array_values($pendingRequests),
            'hide_topbar' => true,
            'additional_js' => ViteHelper::load('resources/js/main.jsx'),
            'additional_css' => ''
        ]);
    }

    // صفحة الأصول المالية
    public function assets()
    {
        $user = AuthHelper::user();
        $banks = $this->bankModel->getAll();
        $safes = $this->safeModel->getAll();

        $this->view('finance/assets', [
            'user' => $user,
            'banks' => $banks,
            'safes' => $safes,
            'hide_topbar' => true,
            'additional_js' => ViteHelper::load('resources/js/main.jsx'),
            'additional_css' => ''
        ]);
    }
    public function deleteTransaction()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'];
        $transaction = $this->transactionModel->find($id);

        if (!$transaction) {
            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                echo json_encode(['success' => false, 'message' => 'Transaction not found']);
                exit;
            }
            return;
        }

        // Reverse Balance Effect
        $amount = $transaction['amount'];

        // If it was Income -> Deduct from Dest
        if ($transaction['type'] == 'income') {
            if ($transaction['to_type'] == 'safe') $this->safeModel->updateBalance($transaction['to_id'], -$amount);
            elseif ($transaction['to_type'] == 'bank') $this->bankModel->updateBalance($transaction['to_id'], -$amount);
        }
        // If it was Expense -> Add back to Source
        elseif ($transaction['type'] == 'expense') {
            if ($transaction['from_type'] == 'safe') $this->safeModel->updateBalance($transaction['from_id'], $amount);
            elseif ($transaction['from_type'] == 'bank') $this->bankModel->updateBalance($transaction['from_id'], $amount);
        }
        // If Transfer -> Reverse both
        elseif ($transaction['type'] == 'transfer') {
            // Reverse Source (Add back)
            if ($transaction['from_type'] == 'safe') $this->safeModel->updateBalance($transaction['from_id'], $amount);
            elseif ($transaction['from_type'] == 'bank') $this->bankModel->updateBalance($transaction['from_id'], $amount);

            // Reverse Dest (Deduct)
            if ($transaction['to_type'] == 'safe') $this->safeModel->updateBalance($transaction['to_id'], -$amount);
            elseif ($transaction['to_type'] == 'bank') $this->bankModel->updateBalance($transaction['to_id'], -$amount);
        }

        $this->transactionModel->delete($id);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
            exit;
        }
        header('Location: ' . BASE_URL . '/finance');
    }

    public function updateTransaction()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'];
        $newAmount = (float)$_POST['amount'];
        $description = $_POST['description'];
        $date = $_POST['date'];

        $transaction = $this->transactionModel->find($id);
        if (!$transaction) return;

        // Only allow updating Amount if it's NOT a transfer for simplicity in this version, 
        // or handle full reversal and re-application.
        // Let's handle full reversal and re-application for accuracy.

        // 1. Reverse Old Effect
        $oldAmount = $transaction['amount'];

        if ($transaction['type'] == 'income') {
            if ($transaction['to_type'] == 'safe') $this->safeModel->updateBalance($transaction['to_id'], -$oldAmount);
            elseif ($transaction['to_type'] == 'bank') $this->bankModel->updateBalance($transaction['to_id'], -$oldAmount);
        } elseif ($transaction['type'] == 'expense') {
            if ($transaction['from_type'] == 'safe') $this->safeModel->updateBalance($transaction['from_id'], $oldAmount);
            elseif ($transaction['from_type'] == 'bank') $this->bankModel->updateBalance($transaction['from_id'], $oldAmount);
        }

        // 2. Apply New Effect
        if ($transaction['type'] == 'income') {
            if ($transaction['to_type'] == 'safe') $this->safeModel->updateBalance($transaction['to_id'], $newAmount);
            elseif ($transaction['to_type'] == 'bank') $this->bankModel->updateBalance($transaction['to_id'], $newAmount);
        } elseif ($transaction['type'] == 'expense') {
            if ($transaction['from_type'] == 'safe') $this->safeModel->updateBalance($transaction['from_id'], -$newAmount);
            elseif ($transaction['from_type'] == 'bank') $this->bankModel->updateBalance($transaction['from_id'], -$newAmount);
        }

        // 3. Update Record
        $this->transactionModel->update($id, [
            'amount' => $newAmount,
            'description' => $description,
            'date' => $date,
            'category_id' => $transaction['category_id'] // Keep category same for now or add field
        ]);

        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
            exit;
        }
        header('Location: ' . BASE_URL . '/finance');
    }

    // ==================== MULTI-LEVEL TRANSFER SYSTEM ====================

    /**
     * Request a transfer from local to global (or vice versa)
     */
    public function requestTransfer()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['success' => false, 'message' => 'Invalid request method']);
            return;
        }

        $user = AuthHelper::user();
        require_once __DIR__ . '/../Models/TransferRequest.php';
        $transferRequestModel = new \App\Models\TransferRequest();

        try {
            // Validate input
            $fromId = (int)($_POST['from_id'] ?? 0);
            $toId = (int)($_POST['to_id'] ?? 0);
            $amount = (float)($_POST['amount'] ?? 0);
            $description = $_POST['description'] ?? '';

            if ($fromId <= 0 || $toId <= 0 || $amount <= 0) {
                $this->jsonResponse(['success' => false, 'message' => 'بيانات غير صحيحة']);
                return;
            }

            // Get source bank details
            $sourceBank = $this->bankModel->find($fromId);
            if (!$sourceBank) {
                $this->jsonResponse(['success' => false, 'message' => 'الحساب المصدر غير موجود']);
                return;
            }

            // Verify user has access to source account
            if ($sourceBank['account_scope'] === 'local' && $sourceBank['station_id'] != $user['station_id']) {
                $this->jsonResponse(['success' => false, 'message' => 'غير مصرح لك بالوصول لهذا الحساب']);
                return;
            }

            // Check sufficient balance
            if ($sourceBank['balance'] < $amount) {
                $this->jsonResponse(['success' => false, 'message' => 'الرصيد غير كافٍ']);
                return;
            }

            // Get destination bank details
            $destBank = $this->bankModel->find($toId);
            if (!$destBank) {
                $this->jsonResponse(['success' => false, 'message' => 'الحساب الوجهة غير موجود']);
                return;
            }

            // Deduct from source immediately (funds frozen in pending state)
            $this->bankModel->updateBalance($fromId, -$amount);

            // Create transfer request
            $requestCode = $transferRequestModel->create([
                'from_type' => 'bank',
                'from_id' => $fromId,
                'from_scope' => $sourceBank['account_scope'],
                'to_type' => 'bank',
                'to_id' => $toId,
                'to_scope' => $destBank['account_scope'],
                'amount' => $amount,
                'description' => $description,
                'requested_by' => $user['id'],
                'station_id' => $user['station_id'] ?? null
            ]);

            if ($requestCode) {
                $this->jsonResponse([
                    'success' => true,
                    'message' => 'تم إرسال طلب التحويل بنجاح',
                    'request_code' => $requestCode
                ]);
            } else {
                // Rollback: Return amount to source
                $this->bankModel->updateBalance($fromId, $amount);
                $this->jsonResponse(['success' => false, 'message' => 'فشل إنشاء طلب التحويل']);
            }
        } catch (\Exception $e) {
            error_log("Transfer request error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'حدث خطأ في النظام']);
        }
    }

    /**
     * Get all transfer requests (filtered by role)
     */
    public function getTransferRequests()
    {
        $user = AuthHelper::user();
        require_once __DIR__ . '/../Models/TransferRequest.php';
        $transferRequestModel = new \App\Models\TransferRequest();

        try {
            $status = $_GET['status'] ?? 'pending';

            $filters = ['status' => $status];

            // Non-admin users only see their station's requests
            if (!in_array($user['role'], ['super_admin', 'admin'])) {
                $filters['station_id'] = $user['station_id'];
            }

            $requests = $transferRequestModel->getAll($filters);

            $this->jsonResponse([
                'success' => true,
                'requests' => $requests
            ]);
        } catch (\Exception $e) {
            error_log("Get transfer requests error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'فشل تحميل الطلبات']);
        }
    }

    /**
     * Approve a transfer request (Admin only)
     */
    public function approveTransfer()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['success' => false, 'message' => 'Invalid request method']);
            return;
        }

        $user = AuthHelper::user();

        // Check admin permission
        if (!in_array($user['role'], ['super_admin', 'admin'])) {
            $this->jsonResponse(['success' => false, 'message' => 'غير مصرح لك بهذه العملية']);
            return;
        }

        require_once __DIR__ . '/../Models/TransferRequest.php';
        $transferRequestModel = new \App\Models\TransferRequest();

        try {
            $requestId = (int)($_POST['request_id'] ?? 0);
            $notes = $_POST['notes'] ?? null;

            if ($requestId <= 0) {
                $this->jsonResponse(['success' => false, 'message' => 'رقم الطلب غير صحيح']);
                return;
            }

            // Get request details
            $request = $transferRequestModel->find($requestId);
            if (!$request) {
                $this->jsonResponse(['success' => false, 'message' => 'الطلب غير موجود']);
                return;
            }

            if ($request['status'] !== 'pending') {
                $this->jsonResponse(['success' => false, 'message' => 'الطلب تمت معالجته مسبقاً']);
                return;
            }

            // Credit amount to destination account
            $this->bankModel->updateBalance($request['to_id'], $request['amount']);

            // Create transaction record
            $transactionId = $this->transactionModel->create([
                'station_id' => $request['station_id'],
                'type' => 'transfer',
                'from_type' => $request['from_type'],
                'from_id' => $request['from_id'],
                'to_type' => $request['to_type'],
                'to_id' => $request['to_id'],
                'amount' => $request['amount'],
                'description' => "تحويل معتمد: " . $request['request_code'] . " - " . ($request['description'] ?? ''),
                'date' => date('Y-m-d'),
                'created_by' => $user['id']
            ]);

            // Update request status
            $transferRequestModel->approve($requestId, $user['id'], $transactionId, $notes);

            $this->jsonResponse([
                'success' => true,
                'message' => 'تم اعتماد التحويل بنجاح'
            ]);
        } catch (\Exception $e) {
            error_log("Approve transfer error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'فشل اعتماد التحويل']);
        }
    }

    /**
     * Reject a transfer request (Admin只)
     */
    public function rejectTransfer()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['success' => false, 'message' => 'Invalid request method']);
            return;
        }

        $user = AuthHelper::user();

        // Check admin permission
        if (!in_array($user['role'], ['super_admin', 'admin'])) {
            $this->jsonResponse(['success' => false, 'message' => 'غير مصرح لك بهذه العملية']);
            return;
        }

        require_once __DIR__ . '/../Models/TransferRequest.php';
        $transferRequestModel = new \App\Models\TransferRequest();

        try {
            $requestId = (int)($_POST['request_id'] ?? 0);
            $notes = $_POST['notes'] ?? 'تم رفض الطلب';

            if ($requestId <= 0) {
                $this->jsonResponse(['success' => false, 'message' => 'رقم الطلب غير صحيح']);
                return;
            }

            // Get request details
            $request = $transferRequestModel->find($requestId);
            if (!$request) {
                $this->jsonResponse(['success' => false, 'message' => 'الطلب غير موجود']);
                return;
            }

            if ($request['status'] !== 'pending') {
                $this->jsonResponse(['success' => false, 'message' => 'الطلب تمت معالجته مسبقاً']);
                return;
            }

            // Return amount to source account
            $this->bankModel->updateBalance($request['from_id'], $request['amount']);

            // Update request status
            $transferRequestModel->reject($requestId, $user['id'], $notes);

            $this->jsonResponse([
                'success' => true,
                'message' => 'تم رفض الطلب وإعادة المبلغ'
            ]);
        } catch (\Exception $e) {
            error_log("Reject transfer error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'فشل رفض الطلب']);
        }
    }

    /**
     * Get local and global banks for transfer dropdowns
     */
    public function getBanksForTransfer()
    {
        $user = AuthHelper::user();

        try {
            $localBanks = $this->bankModel->getLocalByStation($user['station_id']);
            $globalBanks = $this->bankModel->getGlobal();

            $this->jsonResponse([
                'success' => true,
                'local_banks' => $localBanks,
                'global_banks' => $globalBanks
            ]);
        } catch (\Exception $e) {
            error_log("Get banks for transfer error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'فشل تحميل البنوك']);
        }
    }
}
