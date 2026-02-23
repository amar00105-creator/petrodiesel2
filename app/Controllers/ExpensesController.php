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
        if (!AuthHelper::can('finance.expenses.view')) {
            $this->unauthorized();
        }
        // Simple list or maybe part of accounting
        // For now, redirect to create or show list
        $user = AuthHelper::user();
        $expenseModel = new Expense();
        $expenses = $expenseModel->getAll($user['station_id']);

        $this->view('expenses/index', [
            'expenses' => $expenses,
            'hide_topbar' => true
        ]);
    }

    public function create()
    {
        if (!AuthHelper::can('finance.expenses.create')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        // Get Safes and Banks
        $db = \App\Config\Database::connect();
        $safes = $db->query("SELECT * FROM safes WHERE station_id = $stationId")->fetchAll();
        $banks = $db->query("SELECT * FROM banks WHERE station_id = $stationId")->fetchAll();

        $this->view('expenses/create', [
            'safes' => $safes,
            'banks' => $banks,
            'hide_topbar' => true
        ]);
    }

    public function get_entities()
    {
        if (!AuthHelper::can('finance.expenses.view')) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        header('Content-Type: application/json');
        $user = AuthHelper::user();

        // Use Models to respect visibility logic (e.g. Admin sees all)
        $supplierModel = new \App\Models\Supplier();
        $customerModel = new \App\Models\Customer();

        // Pass station_id only if not super admin (assuming AuthHelper handles role checks or Model handles null)
        // Supplier Model::getAll($stationId) -> if $stationId is null/false, assumes Super Admin and returns ALL.
        // We should check user role or just pass user's station_id. 
        // If user['role'] is admin, station_id might be 0 or null.

        // Let's rely on what SupplierController does: 
        // $suppliers = $supplierModel->getAll($user['station_id']);

        $suppliers = $supplierModel->getAll($user['station_id']);
        $customers = $customerModel->getAll($user['station_id']);

        // Reduce data size if models return full rows
        $suppliersList = array_map(fn($item) => ['id' => $item['id'], 'name' => $item['name']], $suppliers);
        $customersList = array_map(fn($item) => ['id' => $item['id'], 'name' => $item['name']], $customers);

        echo json_encode([
            'success' => true,
            'suppliers' => $suppliersList,
            'customers' => $customersList
        ]);
        exit;
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!AuthHelper::can('finance.expenses.create')) {
                $this->unauthorized();
            }
            $this->checkAndFixDatabase();

            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'];
            $data['user_id'] = $user['id'];

            $data['related_entity_type'] = !empty($data['related_entity_type']) ? $data['related_entity_type'] : null;
            $data['related_entity_id'] = !empty($data['related_entity_id']) ? $data['related_entity_id'] : null;

            $expenseModel = new Expense();
            $expenseModel->create($data);

            $db = \App\Config\Database::connect();
            $table = ($data['source_type'] ?? 'safe') === 'safe' ? 'safes' : 'banks';
            $stmt = $db->prepare("UPDATE $table SET balance = balance - ? WHERE id = ?");

            // We need source_id, assuming it's sent. IDK why previous code had it but let's be safe
            if (!empty($data['source_id'])) {
                $stmt->execute([$data['amount'], $data['source_id']]);
            }

            // --- NEW: Handle Categories ---
            $categoryId = null;
            if (!empty($data['category'])) {
                $categoryModel = new \App\Models\TransactionCategory();
                $existingCategory = $categoryModel->findByName($data['category'], 'expense');

                if ($existingCategory) {
                    $categoryId = $existingCategory['id'];
                } else {
                    // Create new category if not found
                    $categoryModel->create($data['category'], 'expense');
                    $categoryId = $db->lastInsertId();
                }
            }

            // --- NEW: Create Transaction Record for Reporting ---
            $transactionModel = new \App\Models\Transaction();
            $transactionModel->create([
                'station_id' => $data['station_id'],
                'type' => 'expense',
                'amount' => $data['amount'],
                'category_id' => $categoryId, // Save ID
                'from_type' => $data['source_type'],
                'from_id' => $data['source_id'],
                'to_type' => null,
                'to_id' => null,
                'description' => $data['category'] . ' - ' . ($data['description'] ?? ''),
                'related_entity_type' => $data['related_entity_type'],
                'related_entity_id' => $data['related_entity_id'],
                'date' => $data['expense_date'] ?? date('Y-m-d'),
                'created_by' => $data['user_id']
            ]);
            // ----------------------------------------------------

            if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                header('Content-Type: application/json');
                echo json_encode(['success' => true]);
                exit;
            }

            $this->redirect('/expenses');
        }
    }

    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('finance.expenses.delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $db = \App\Config\Database::connect();

        try {
            $stmt = $db->prepare("DELETE FROM expenses WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Delete failed']);
            }
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('finance.expenses.edit')) {
            $this->unauthorized();
        }

        $data = $_POST;
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID required']);
            return;
        }

        $db = \App\Config\Database::connect();

        try {
            // Update expense details
            // Note: Changing amount typically requires adjusting the source safe/bank balance too.
            // For simplicity and safety, we might restrict amount editing or implementing complex logic.
            // Here, we'll assume corrections are minor or handle just the record update for now, 
            // OR fully implement balance adjustment.
            // Given the complexity of double-entry changes (refunding old, deducting new), 
            // I will update the basic fields: title, category, note. 
            // If amount changes, I'll update it without balance adjustment unless strictly required, 
            // BUT to be safe as an ERP, I'll allow updating amount but simpler.

            // LET'S STICK TO SAFE UPDATES: Title, Category, Date, Note. 
            // Changing amount affects financial balance which is risky to do in simple update without full reversal.
            // IF user wants amount change, usually delete and recreate is safer, OR specific "Correction" flow.
            // However, to satisfy the request "Add Edit", I will include amount but just update the record value.
            // WARNING: Ideally this should adjust balance. 

            // To be robust: Calculate difference and adjust safe/bank.
            // 1. Get old amount and source
            $stmt = $db->prepare("SELECT * FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            $oldExpense = $stmt->fetch();

            if (!$oldExpense) {
                echo json_encode(['success' => false, 'message' => 'Expense not found']);
                return;
            }

            // Update record
            $sql = "UPDATE expenses SET 
                    title = ?, 
                    amount = ?, 
                    expense_category = ?,
                    description = ?
                    WHERE id = ?";

            $stmt = $db->prepare($sql);
            $success = $stmt->execute([
                $data['title'],
                $data['amount'],
                $data['category'],
                $data['note'],
                $id
            ]);

            // Adjust Balance if Amount Changed (and same source)
            $oldAmount = $oldExpense['amount'];
            $newAmount = $data['amount'];
            $diff = $newAmount - $oldAmount; // +ve means we spent MORE, so deduct MORE from safe. -ve means we spent LESS, refund safe.

            if ($diff != 0 && $success) {
                $table = $oldExpense['source_type'] === 'safe' ? 'safes' : 'banks';
                $sourceId = $oldExpense['source_id'];

                // If diff is positive (increased expense), we decrease balance
                // If diff is negative (decreased expense), we increase balance (refund)
                $adjStmt = $db->prepare("UPDATE $table SET balance = balance - ? WHERE id = ?");
                $adjStmt->execute([$diff, $sourceId]);
            }

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
            $stmt = $db->query("SHOW COLUMNS FROM expenses LIKE 'related_entity_type'");
            $exists = $stmt->fetch();

            if (!$exists) {
                $db->exec("ALTER TABLE expenses ADD COLUMN related_entity_type VARCHAR(50) DEFAULT NULL AFTER description");
                $db->exec("ALTER TABLE expenses ADD COLUMN related_entity_id INT DEFAULT NULL AFTER related_entity_type");
            }
        } catch (\Exception $e) {
            error_log("Auto-Migration Error: " . $e->getMessage());
        }
    }
}
