<?php

namespace App\Controllers\Api;

use App\Core\Controller;
use App\Helpers\JwtHelper;
use App\Models\Safe;
use App\Models\Bank;
use App\Models\Transaction;
use App\Config\Database;

class FinanceController extends Controller
{
    private $user;
    private $db;
    private $safeModel;
    private $bankModel;
    private $transactionModel;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->safeModel = new Safe();
        $this->bankModel = new Bank();
        $this->transactionModel = new Transaction();
        $this->authenticate();
    }

    private function authenticate()
    {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = JwtHelper::decode($token);

            if ($payload) {
                $this->user = $payload;
                return;
            }
        }

        $this->jsonResponse(['status' => false, 'message' => 'Unauthorized'], 401);
    }

    public function balances()
    {
        // Get all safes and banks
        // In a real multi-station setup, filter by station_id
        $stationId = $this->user['station_id'] ?? null;
        
        $safes = $this->safeModel->getAll(); // Modify model if it supports station filtering
        $banks = $this->bankModel->getAll();

        // If models don't support filtering by station, we might need to filter here or update models.
        // Assuming current models return all or we will refine later.
        
        // Transform for API
        $data = [
            'safes' => $safes,
            'banks' => $banks,
            'total_safe_balance' => array_sum(array_column($safes, 'balance')),
            'total_bank_balance' => array_sum(array_column($banks, 'balance')),
        ];

        $this->jsonResponse(['status' => true, 'data' => $data]);
    }

    public function transaction()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (!isset($input['type']) || !isset($input['amount']) || !isset($input['account_type']) || !isset($input['account_id'])) {
            $this->jsonResponse(['status' => false, 'message' => 'Missing required fields'], 400);
        }

        $type = $input['type']; // 'income' or 'expense'
        $amount = (float)$input['amount'];
        $accountType = $input['account_type']; // 'safe' or 'bank'
        $accountId = $input['account_id'];
        $categoryId = $input['category_id'] ?? null;
        $description = $input['description'] ?? '';

        if ($amount <= 0) {
            $this->jsonResponse(['status' => false, 'message' => 'Invalid amount'], 400);
        }

        // Logic similar to Web FinanceController
        $fromType = null;
        $fromId = null;
        $toType = null;
        $toId = null;

        if ($type === 'expense') {
            // Deduct from Account
            if ($accountType == 'safe') $this->safeModel->updateBalance($accountId, -$amount);
            else $this->bankModel->updateBalance($accountId, -$amount);

            $fromType = $accountType;
            $fromId = $accountId;
        } elseif ($type === 'income') {
             // Add to Account
             if ($accountType == 'safe') $this->safeModel->updateBalance($accountId, $amount);
             else $this->bankModel->updateBalance($accountId, $amount);

             $toType = $accountType;
             $toId = $accountId;
        } else {
             $this->jsonResponse(['status' => false, 'message' => 'Invalid transaction type'], 400);
        }

        // Record Transaction
        $this->transactionModel->create([
            'station_id' => $this->user['station_id'] ?? 1,
            'type' => $type,
            'amount' => $amount,
            'category_id' => $categoryId,
            'from_type' => $fromType,
            'from_id' => $fromId,
            'to_type' => $toType,
            'to_id' => $toId,
            'description' => $description,
            'created_by' => $this->user['user_id']
        ]);

        $this->jsonResponse(['status' => true, 'message' => 'Transaction recorded successfully']);
    }

    public function history()
    {
        $stationId = $this->user['station_id'] ?? 1;
        $filters = [
            'start_date' => $_GET['start_date'] ?? date('Y-m-01'),
            'end_date' => $_GET['end_date'] ?? date('Y-m-d'),
        ];

        // Ensure transactionModel has a getReport method or getHistory that accepts filters
        // Based on web controller, getReport exists.
        $transactions = $this->transactionModel->getReport($stationId, $filters);

        $this->jsonResponse(['status' => true, 'data' => $transactions]);
    }

    private function jsonResponse($data, $code = 200)
    {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}
