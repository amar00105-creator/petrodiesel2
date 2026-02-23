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
        if (!AuthHelper::can('finance.edit')) {
            $this->unauthorized();
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $name = trim($_POST['name'] ?? '');
        $type = $_POST['type'] ?? 'expense';

        if (empty($name)) {
            $this->jsonResponse(['success' => false, 'message' => 'الاسم مطلوب']);
            return;
        }

        // Check for duplicate
        $existing = $this->categoryModel->findByName($name, $type);
        if ($existing) {
            $this->jsonResponse(['success' => false, 'message' => 'هذا التصنيف موجود بالفعل', 'duplicate' => true]);
            return;
        }

        try {
            $this->categoryModel->create($name, $type);
            $db = \App\Config\Database::connect();
            $id = $db->lastInsertId();
            $this->jsonResponse([
                'success' => true,
                'message' => 'تمت إضافة التصنيف بنجاح',
                'id' => $id,
                'category' => ['id' => (int)$id, 'name' => $name, 'type' => $type]
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    public function update()
    {
        if (!AuthHelper::can('finance.edit')) {
            $this->unauthorized();
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'] ?? null;
        $name = trim($_POST['name'] ?? '');
        $type = $_POST['type'] ?? 'expense';

        if (!$id || empty($name)) {
            $this->jsonResponse(['success' => false, 'message' => 'البيانات المطلوبة غير مكتملة']);
            return;
        }

        // Check for duplicate (exclude current item)
        $existing = $this->categoryModel->findByName($name, $type);
        if ($existing && $existing['id'] != $id) {
            $this->jsonResponse(['success' => false, 'message' => 'هذا التصنيف موجود بالفعل', 'duplicate' => true]);
            return;
        }

        try {
            $this->categoryModel->update($id, $name, $type);
            $this->jsonResponse(['success' => true, 'message' => 'تم تعديل التصنيف بنجاح']);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    public function delete()
    {
        if (!AuthHelper::can('finance.delete')) {
            $this->unauthorized();
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'] ?? null;

        if (!$id) {
            $this->jsonResponse(['success' => false, 'message' => 'المعرف مطلوب']);
            return;
        }

        try {
            // Check if category is used in transactions
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("SELECT COUNT(*) FROM transactions WHERE category_id = ?");
            $stmt->execute([$id]);
            $count = $stmt->fetchColumn();

            if ($count > 0) {
                $this->jsonResponse(['success' => false, 'message' => "لا يمكن حذف التصنيف لأنه مرتبط بـ {$count} عملية مالية"]);
                return;
            }

            $this->categoryModel->delete($id);
            $this->jsonResponse(['success' => true, 'message' => 'تم حذف التصنيف بنجاح']);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    private function jsonResponse($data)
    {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
