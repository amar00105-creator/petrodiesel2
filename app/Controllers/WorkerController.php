<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Worker;
use App\Helpers\AuthHelper;

class WorkerController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $workerModel = new Worker();
        $stationId = AuthHelper::user()['station_id'];
        $workers = $workerModel->getAll($stationId);

        $this->view('workers/index', [
            'workers' => $workers,
            'hide_topbar' => true
        ]);
    }

    public function create_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Invalid Request']);
            return;
        }

        $name = $_POST['name'] ?? null;
        $phone = $_POST['phone'] ?? null;
        $stationId = AuthHelper::user()['station_id'];

        if (empty($stationId)) {
            echo json_encode(['success' => false, 'message' => 'No station selected']);
            return;
        }

        if (!$name) {
            echo json_encode(['success' => false, 'message' => 'Name is required']);
            return;
        }

        $workerModel = new Worker();

        if ($workerModel->checkDuplicate($stationId, $name)) {
            echo json_encode(['success' => false, 'error_type' => 'duplicate', 'message' => 'هذا العامل مسجل بالفعل بهذا الاسم']);
            return;
        }

        try {
            $id = $workerModel->create([
                'station_id' => $stationId,
                'name' => $name,
                'phone' => $phone,
                'national_id' => null // Optional per quick add
            ]);

            echo json_encode(['success' => true, 'id' => $id, 'name' => $name]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    public function update_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'] ?? null;
        $name = $_POST['name'] ?? null;
        $phone = $_POST['phone'] ?? null;
        // Status might be passed or default to 'Active'. For now let's keep it simple or current.
        // If status is not passed, maybe we shouldn't overwrite it? 
        // But the Model expects it. Let's assume frontend sends it or we default only if we fetch. 
        // For efficiency, let's just accept it or default to 'Active' if new, but for update it's risky.
        // Let's modify the frontend to send status or just send what we have.
        // Actually, let's just handle name/phone for the simple modal. Status implies fetching first?
        // Let's fetch current to be safe if status is missing.

        $workerModel = new Worker();
        $current = $workerModel->find($id);
        if (!$current) {
            echo json_encode(['success' => false, 'message' => 'Worker not found']);
            return;
        }

        $status = $_POST['status'] ?? $current['status'];

        try {
            $workerModel->update($id, [
                'name' => $name,
                'phone' => $phone,
                'status' => $status
            ]);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        $id = $_POST['id'];
        $workerModel = new Worker();

        try {
            $workerModel->delete($id);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
