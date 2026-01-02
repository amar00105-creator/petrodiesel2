<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Expense;

class ExpensesController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        // Simple list or maybe part of accounting
        // For now, redirect to create or show list
        $user = AuthHelper::user();
        $expenseModel = new Expense();
        $expenses = $expenseModel->getAll($user['station_id']);

        $this->view('expenses/index', ['expenses' => $expenses]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        // Get Safes and Banks
        $db = \App\Config\Database::connect();
        $safes = $db->query("SELECT * FROM safes WHERE station_id = $stationId")->fetchAll();
        $banks = $db->query("SELECT * FROM banks WHERE station_id = $stationId")->fetchAll();

        $this->view('expenses/create', [
            'safes' => $safes,
            'banks' => $banks
        ]);
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'];
            $data['user_id'] = $user['id'];

            // Create Expense
            $expenseModel = new Expense();
            $expenseModel->create($data);

            // Deduct from Source
            $db = \App\Config\Database::connect();
            $table = $data['source_type'] === 'safe' ? 'safes' : 'banks';
            $stmt = $db->prepare("UPDATE $table SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$data['amount'], $data['source_id']]);

            $this->redirect('/expenses');
        }
    }
}
