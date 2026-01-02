<?php
namespace App\Controllers;

use App\Models\Safe;
use App\Models\Bank;
use App\Models\Transaction;
use App\Helpers\AuthHelper;

require_once __DIR__ . '/../Models/Finance.php'; // Contains Safe and Bank
require_once __DIR__ . '/../Models/Transaction.php';
require_once __DIR__ . '/../Models/TransactionCategory.php';

class FinanceController {
    private $safeModel;
    private $bankModel;
    private $transactionModel;
    private $categoryModel;

    public function __construct() {
        AuthHelper::requireLogin();
        $this->safeModel = new Safe();
        $this->bankModel = new Bank();
        $this->transactionModel = new Transaction();
        $this->categoryModel = new \App\Models\TransactionCategory();
    }

    public function index() {
        $user = AuthHelper::user();
        $data['user'] = $user;
        
        $data['safes'] = $this->safeModel->getAll();
        $data['banks'] = $this->bankModel->getAll();
        $data['recent_transactions'] = $this->transactionModel->getHistory($user['station_id'] ?? 1);
        $data['categories'] = $this->categoryModel->getAll();

        $data['categories'] = $this->categoryModel->getAll();

        $child_view = __DIR__ . '/../../app/Views/finance/index.php';
        require_once __DIR__ . '/../../views/layouts/main.php';
    }

    public function createSafe() {
        $user = AuthHelper::user();
        $name = $_POST['name'];
        $balance = $_POST['balance'] ?? 0;
        
        $this->safeModel->create([
            'station_id' => $user['station_id'] ?? 1,
            'name' => $name,
            'balance' => $balance
        ]);
        
        header('Location: ' . BASE_URL . '/finance');
    }
    
    public function createBank() {
        $user = AuthHelper::user();
        $name = $_POST['name'];
        $accNum = $_POST['account_number'];
        $balance = $_POST['balance'] ?? 0;
        
        $this->bankModel->create([
            'station_id' => $user['station_id'] ?? 1,
            'name' => $name,
            'account_number' => $accNum,
            'balance' => $balance
        ]);
        
        header('Location: ' . BASE_URL . '/finance');
    }

    public function transfer() {
        $user = AuthHelper::user();
        
        $fromType = $_POST['from_type']; // safe, bank
        $fromId = $_POST['from_id'];
        $toType = $_POST['to_type']; // safe, bank
        $toId = $_POST['to_id'];
        $amount = (float)$_POST['amount'];
        $desc = $_POST['description'];
        
        // Basic Validation
        if ($amount <= 0) {
            header('Location: ' . BASE_URL . '/finance?error=Invalid+Amount');
            return;
        }

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

        header('Location: ' . BASE_URL . '/finance?success=Transfer+Completed');
    }

    public function storeTransaction() {
        $user = AuthHelper::user();
        $type = $_POST['type']; // expense, income
        $categoryId = $_POST['category_id'];
        $amount = (float)$_POST['amount'];
        $description = $_POST['description'];
        
        // Source/Dest Logic
        // For Expense: Money leaves Source (Safe/Bank)
        // For Income: Money enters Dest (Safe/Bank)
        $accountType = $_POST['account_type']; // safe, bank
        $accountId = $_POST['account_id'];

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
            'description' => $description,
            'created_by' => $user['id']
        ]);

        header('Location: ' . BASE_URL . '/finance?success=Transaction+Added');
    }

    public function reports() {
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

        $data['user'] = $user;
        $data['transactions'] = $transactions;
        $data['filters'] = $filters;
        $data['totals'] = ['income' => $totalIncome, 'expense' => $totalExpense];

        $data['totals'] = ['income' => $totalIncome, 'expense' => $totalExpense];

        $child_view = __DIR__ . '/../../views/finance/reports.php';
        require_once __DIR__ . '/../../views/layouts/main.php';
    }
}
