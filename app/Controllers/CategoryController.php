<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\TransactionCategory;
use App\Helpers\AuthHelper;

class CategoryController extends Controller
{
    private $categoryModel;

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->categoryModel = new TransactionCategory();
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $name = $_POST['name'] ?? '';
        $type = $_POST['type'] ?? 'expense';

        if (empty($name)) {
            $this->jsonResponse(['success' => false, 'message' => 'الاسم مطلوب']);
            return;
        }

        try {
            $this->categoryModel->create($name, $type);
            $id = $this->db->lastInsertId();
            $this->jsonResponse(['success' => true, 'message' => 'Category created successfully', 'id' => $id, 'category' => ['id' => $id, 'name' => $name, 'type' => $type]]);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'] ?? null;
        $name = $_POST['name'] ?? '';
        $type = $_POST['type'] ?? 'expense';

        if (!$id || empty($name)) {
            $this->jsonResponse(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        try {
            $this->categoryModel->update($id, $name, $type);
            $this->jsonResponse(['success' => true, 'message' => 'Category updated successfully']);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function delete()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['success' => false, 'message' => 'Missing ID']);
            return;
        }

        try {
            $this->categoryModel->delete($id);
            $this->jsonResponse(['success' => true, 'message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    private function jsonResponse($data)
    {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
