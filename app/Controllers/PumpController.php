<?php

namespace App\Controllers;

use App\Models\Pump;
use App\Models\Tank;
use App\Models\Counter;
use App\Models\Worker;
use App\Helpers\AuthHelper;

require_once __DIR__ . '/../Models/Pump.php';
require_once __DIR__ . '/../Models/Tank.php';
require_once __DIR__ . '/../Models/Counter.php';
require_once __DIR__ . '/../Models/Worker.php';
// Assuming Worker model exists based on usage in other files. If not, I'll use raw DB or create it.
// Checking schema, workers table exists. 

class WorkerStub
{ // Temporary stub if Model doesn't exist, works for dropdown
    private $db;
    public function __construct()
    {
        $this->db = \App\Config\Database::connect();
    }
    public function getAllActive()
    {
        $stmt = $this->db->query("SELECT * FROM workers WHERE status='active'");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}

class PumpController extends \App\Core\Controller
{
    private $pumpModel;
    private $tankModel;
    private $counterModel;
    private $workerModel;

    public function __construct()
    {
        AuthHelper::requireLogin();
        $this->pumpModel = new Pump();
        $this->tankModel = new Tank();
        $this->counterModel = new Counter();

        // Use existing Worker model if available, else simple query
        if (file_exists(__DIR__ . '/../Models/Worker.php')) {
            $this->workerModel = new Worker();
        } else {
            $this->workerModel = new WorkerStub();
        }
    }



    public function index()
    {
        if (!AuthHelper::can('pumps.view')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();
        $stationId = $user['station_id'] ?? 1;
        $pumps = $this->pumpModel->getPumpsWithCounters($stationId);

        // Data for Modal
        $tanks = $this->tankModel->getAll($stationId);
        $workers = $this->workerModel->getAllActive($stationId);

        $this->view('pumps/index', [
            'pumps' => $pumps,
            'tanks' => $tanks,
            'workers' => $workers,
            'user' => $user,
            'hide_topbar' => true
        ]);
    }

    public function create()
    {
        if (!AuthHelper::can('pumps.create')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();
        $stationId = $user['station_id'] ?? null;

        $tanks = $this->tankModel->getAll($stationId); // Filter by Station ID
        $workers = $this->workerModel->getAllActive($stationId); // Pass workers to view

        // Dashboard Stats
        $pumps = $this->pumpModel->getAll();
        $stats = [
            'totalPumps' => count($pumps),
            'activeTanks' => count($tanks), // Assuming all returned are active or just total
            'workerCount' => count($workers)
        ];

        $this->view('pumps/create', [
            'tanks' => $tanks,
            'workers' => $workers,
            'user' => $user,
            'stats' => $stats,
            'hide_topbar' => true
        ]);
    }

    public function store()
    {
        if (!AuthHelper::can('pumps.create')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();

        $name = $_POST['name'] ?? 'Pump';
        $tankId = $_POST['tank_id'];
        $counterCount = (int)($_POST['counter_count'] ?? 1);

        // Arrays from dynamic form
        $readings = $_POST['readings'] ?? [];
        $workers = $_POST['workers'] ?? [];
        $counterNames = $_POST['counter_names'] ?? [];

        if (!$tankId) {
            header('Location: ' . BASE_URL . '/pumps/create?error=Tank+is+required');
            return;
        }

        $stationId = isset($user['station_id']) && $user['station_id'] ? $user['station_id'] : 1;

        $pumpId = $this->pumpModel->create([
            'station_id' => $stationId,
            'tank_id' => $tankId,
            'name' => $name
        ]);

        if ($pumpId) {
            // Prepare data array for model
            $countersData = [];
            for ($i = 0; $i < $counterCount; $i++) {
                $countersData[] = [
                    'reading' => $readings[$i] ?? 0,
                    'worker_id' => $workers[$i] ?? null,
                    'name' => $counterNames[$i] ?? "Nozzle " . ($i + 1)
                ];
            }
            $this->pumpModel->addCounters($pumpId, $counterCount, $countersData);
        }

        header('Location: ' . BASE_URL . '/pumps');
    }

    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        if (!AuthHelper::can('pumps.delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        try {
            $id = $_POST['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'Missing ID']);
                return;
            }
            $this->pumpModel->delete($id);

            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function delete()
    {
        // ... kept for fallback if any non-js logic uses it, but updated to use permission check ... 
        if (!AuthHelper::can('pumps.delete')) {
            $this->redirect('/pumps?error=access_denied');
            return;
        }

        $id = $_POST['id'];
        $this->pumpModel->delete($id);
        header('Location: ' . BASE_URL . '/pumps');
    }

    public function deleteCounter()
    {
        // Only Admin
        if (!AuthHelper::isAdmin()) {
            $this->redirect('/pumps?error=access_denied');
            return;
        }

        $id = $_POST['id'] ?? null;
        $pumpId = $_POST['pump_id'] ?? null;

        if (!$id || !$pumpId) {
            $this->redirect('/pumps?error=missing_params');
            return;
        }

        $this->counterModel->delete($id);

        header('Location: ' . BASE_URL . '/pumps');
    }

    // The Manage Page (Counters & Workers)
    public function manage()
    {
        if (!AuthHelper::can('pumps.view')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();
        $pumpId = $_GET['id'] ?? null;

        if (!$pumpId) {
            header('Location: ' . BASE_URL . '/pumps');
            return;
        }

        $pump = $this->pumpModel->find($pumpId);
        $counters = $this->counterModel->getByPumpId($pumpId);

        // Use Pump's station to filter workers and tanks
        $stationId = $pump['station_id'] ?? ($user['station_id'] ?? null);

        $workers = $this->workerModel->getAllActive($stationId);
        $tanks = $this->tankModel->getAll($stationId);

        $this->view('pumps/manage', [
            'pump' => $pump,
            'counters' => $counters,
            'workers' => $workers,
            'tanks' => $tanks,
            'user' => $user,
            'hide_topbar' => true
        ]);
    }

    public function updatePump()
    {
        if (!AuthHelper::can('pumps.edit')) {
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Access Denied']);
                exit;
            }
            $this->redirect('/pumps?error=access_denied');
            return;
        }

        try {
            $id = $_POST['id'];
            $name = $_POST['name'];
            $tankId = $_POST['tank_id'];

            $success = $this->pumpModel->update($id, [
                'name' => $name,
                'tank_id' => $tankId
            ]);

            if ($this->isAjax() || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
                header('Content-Type: application/json');
                echo json_encode(['success' => $success]);
                exit;
            }

            $this->redirect('/pumps/manage?id=' . $id . '&success=1');
        } catch (\Exception $e) {
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
            error_log('PumpController::updatePump Error: ' . $e->getMessage());
            $this->redirect('/pumps?error=' . urlencode('حدث خطأ'));
        }
    }

    // Ajax or Form Post to update counter details (Reading + Worker)
    public function updateCounter()
    {
        if (!AuthHelper::can('pumps.edit')) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        try {
            $counterId = $_POST['counter_id'] ?? null;
            if (!$counterId) throw new \Exception('Counter ID missing');

            $workerId = !empty($_POST['worker_id']) ? $_POST['worker_id'] : null;
            $reading = $_POST['current_reading'] ?? null;

            $updateData = ['current_worker_id' => $workerId];
            if ($reading !== null) {
                $updateData['current_reading'] = $reading;
            }

            $result = $this->counterModel->updateDetails($counterId, $updateData);

            $pumpId = $_POST['pump_id'] ?? null;

            // Support JSON for Fetch
            if ($this->isAjax() || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true]);
                exit;
            }

            // Fallback Redirect
            $this->redirect('/pumps/manage?id=' . $pumpId . '&success=1');
        } catch (\Exception $e) {
            error_log('PumpController::updateCounter Error: ' . $e->getMessage());
            if ($this->isAjax()) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'حدث خطأ']);
                exit;
            }
            $this->redirect('/pumps?error=' . urlencode('حدث خطأ'));
        }
    }

    // Update counter name
    public function updateCounterName()
    {
        // Support JSON response
        $isJson = $this->isAjax() || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

        if (!AuthHelper::can('pumps.edit')) {
            if ($isJson) {
                header('Content-Type: application/json');
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access Denied']);
                exit;
            }
            $this->redirect('/pumps?error=access_denied');
            return;
        }

        try {
            $counterId = $_POST['counter_id'] ?? null;
            $name = $_POST['name'] ?? null;
            $pumpId = $_POST['pump_id'] ?? null;

            if (!$counterId || !$name || !$pumpId) {
                throw new \Exception("Missing required fields: counter_id, name, pump_id");
            }

            $this->counterModel->updateDetails($counterId, ['name' => $name]);

            if ($isJson) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true]);
                exit;
            }

            header('Location: ' . BASE_URL . '/pumps/manage?id=' . $pumpId . '&success=1');
        } catch (\Exception $e) {
            if ($isJson) {
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                exit;
            }
            error_log('PumpController::updateCounterName Error: ' . $e->getMessage());
            $this->redirect('/pumps?error=' . urlencode('حدث خطأ'));
        }
    }
    // Add a new counter to existing pump
    public function addCounter()
    {
        if (!AuthHelper::can('pumps.edit')) {
            http_response_code(403);
            echo json_encode(['error' => 'Access Denied']);
            exit;
        }

        $pumpId = $_POST['pump_id'] ?? null;
        if (!$pumpId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing pump_id']);
            exit;
        }
        $name = $_POST['name'] ?? 'New Counter';
        $reading = $_POST['initial_reading'] ?? 0;
        $workerId = !empty($_POST['worker_id']) ? $_POST['worker_id'] : null;

        $id = $this->counterModel->create([
            'pump_id' => $pumpId,
            'name' => $name,
            'current_reading' => $reading,
            'current_worker_id' => $workerId
        ]);

        if ($id) {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error adding counter']);
            exit;
        }
    }
    // Full Page Edit View
    public function edit()
    {
        if (!AuthHelper::can('pumps.edit')) {
            $this->unauthorized();
        }
        $user = AuthHelper::user();
        $pumpId = $_GET['id'] ?? null;

        if (!$pumpId) {
            $this->redirect('/pumps');
            return;
        }

        $pump = $this->pumpModel->find($pumpId);
        if (!$pump) {
            $this->redirect('/pumps?error=PumpNotFound');
            return;
        }

        $counters = $this->counterModel->getByPumpId($pumpId);

        $stationId = $pump['station_id'] ?? ($user['station_id'] ?? null);

        $tanks = $this->tankModel->getAll($stationId);
        $workers = $this->workerModel->getAllActive($stationId);

        // Dashboard Stats (reused for the sidebar)
        $pumps = $this->pumpModel->getAll();
        $stats = [
            'totalPumps' => count($pumps),
            'activeTanks' => count($tanks),
            'workerCount' => count($workers)
        ];

        $this->view('pumps/edit', [
            'pump' => $pump,
            'counters' => $counters,
            'tanks' => $tanks,
            'workers' => $workers,
            'user' => $user,
            'stats' => $stats,
            'hide_topbar' => true
        ]);
    }

    public function updateBulk()
    {
        if (!AuthHelper::can('pumps.edit')) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access Denied']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
            exit;
        }

        $pumpId = $input['id'] ?? null;
        $pumpName = $input['name'] ?? null;
        $tankId = $input['tank_id'] ?? null;
        $counters = $input['counters'] ?? [];

        // Validation
        if (!$pumpId || !$pumpName || !$tankId) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields (id, name, tank_id)']);
            exit;
        }



        $db = \App\Config\Database::connect();
        $db->beginTransaction();

        try {
            // 1. Update Pump
            $pumpUpdateResult = $this->pumpModel->update($pumpId, [
                'name' => $pumpName,
                'tank_id' => $tankId
            ]);


            // Fetch existing counters BEFORE adding new ones to establish a baseline for sync
            $existingCounters = $this->counterModel->getByPumpId($pumpId);
            $existingIds = array_column($existingCounters, 'id');

            // 2. Update/Create Counters & Collect Processed IDs
            $processedIds = [];
            foreach ($counters as $c) {
                if (isset($c['id']) && $c['id']) {
                    $processedIds[] = $c['id'];
                    $updateData = [
                        'name' => $c['name'],
                        'current_reading' => $c['current_reading'],
                        'current_worker_id' => !empty($c['current_worker_id']) ? $c['current_worker_id'] : null
                    ];
                    $res = $this->counterModel->updateDetails($c['id'], $updateData);
                } else {
                    $newId = $this->counterModel->create([
                        'pump_id' => $pumpId,
                        'name' => $c['name'],
                        'current_reading' => $c['current_reading'] ?? 0,
                        'current_worker_id' => !empty($c['current_worker_id']) ? $c['current_worker_id'] : null
                    ]);
                }
            }

            // 3. Sync: Delete counters not in the payload
            // Determine IDs to delete (Existing Snapshot - Updated IDs)
            $idsToDelete = array_diff($existingIds, $processedIds);

            foreach ($idsToDelete as $deleteId) {
                $delRes = $this->counterModel->delete($deleteId);
            }

            $db->commit();

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            $db->rollBack();
            error_log('PumpController::updateBulk Error: ' . $e->getMessage());
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Update failed: ' . $e->getMessage()]);
        }
    }
}
