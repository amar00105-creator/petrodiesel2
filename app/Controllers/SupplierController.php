<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $supplierModel = new Supplier();
        $customerModel = new \App\Models\Customer();

        $suppliers = $supplierModel->getAll($user['station_id']);
        $customers = $customerModel->getAll($user['station_id']);

        $this->view('suppliers/index', [
            'suppliers' => $suppliers,
            'customers' => $customers,
            'user' => $user,
            'additional_js' => \App\Helpers\ViteHelper::load('resources/js/main.jsx'),
            'hide_topbar' => true
        ]);
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $_POST['station_id'] ?? $user['station_id'];

            if (empty($data['station_id'])) {
                $data['station_id'] = 0; // Default to Admin/Global station
            }

            $supplierModel = new Supplier();
            $supplierModel->create($data); // Ensure create method exists in Model or use logic here

            $this->redirect('/suppliers');
        }
    }

    // API Endpoint for Ajax requests (Used in Purchases/Sales forms)
    public function api_create()
    {
        header('Content-Type: application/json');

        try {
            $user = AuthHelper::user();

            // Get JSON input
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['name'])) {
                echo json_encode(['success' => false, 'message' => 'Name is required']);
                exit;
            }

            $data = [
                'name' => $input['name'],
                'phone' => $input['phone'] ?? '',
                'station_id' => $input['station_id'] ?? $user['station_id']
            ];

            if (empty($data['station_id'])) {
                $data['station_id'] = 0; // Default to Admin/Global
            }

            $supplierModel = new Supplier();
            $newId = $supplierModel->create($data);

            echo json_encode([
                'success' => true,
                'id' => $newId,
                'name' => $data['name'],
                'message' => 'Supplier created successfully'
            ]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    public function update_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        // Clean any accidental output (whitespace, warnings)
        if (ob_get_length()) ob_clean();

        header('Content-Type: application/json');

        $id = $_POST['id'] ?? null;
        $name = $_POST['name'] ?? null;
        $phone = $_POST['phone'] ?? null;

        if (!$id || !$name) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        $supplierModel = new Supplier();
        try {
            $supplierModel->update($id, [
                'name' => $name,
                'phone' => $phone
            ]);
            echo json_encode(['success' => true]);
        } catch (\Throwable $e) {
            error_log("Supplier Update Error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'System Error: ' . $e->getMessage()]);
        }
    }

    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('suppliers_delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $supplierModel = new Supplier();

        try {
            $supplierModel->delete($id);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
