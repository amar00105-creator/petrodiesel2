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
        $user = AuthHelper::user();
        $stationId = $user['station_id'] ?? 1;
        $pumps = $this->pumpModel->getPumpsWithCounters($stationId);

        // Header Requirements
        $allStations = [];
        if (($user['role'] ?? '') === 'super_admin') {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
            $allStations = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        // Data for Modal
        $tanks = $this->tankModel->getAll($stationId);
        $workers = $this->workerModel->getAllActive($stationId);

        $this->view('pumps/index', [
            'pumps' => $pumps,
            'tanks' => $tanks,
            'workers' => $workers,
            'user' => $user,
            'allStations' => $allStations,
            'hide_topbar' => true
        ]);
    }

    public function create()
    {
        $user = AuthHelper::user();
        $tanks = $this->tankModel->getAll(); // Need existing Tanks to bind to
        $workers = $this->workerModel->getAllActive($user['station_id'] ?? null); // Pass workers to view

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

        if (!AuthHelper::can('pumps_delete')) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $id = $_POST['id'];
        $this->pumpModel->delete($id);

        echo json_encode(['success' => true]);
    }

    public function delete()
    {
        // ... kept for fallback if any non-js logic uses it, but updated to use permission check ... 
        if (!AuthHelper::can('pumps_delete')) {
            die('Access Denied');
        }

        $id = $_POST['id'];
        $this->pumpModel->delete($id);
        header('Location: ' . BASE_URL . '/pumps');
    }

    public function deleteCounter()
    {
        // Only Admin
        if (!AuthHelper::isAdmin()) {
            die('Access Denied');
        }

        $id = $_POST['id'];
        $pumpId = $_POST['pump_id'];

        $this->counterModel->delete($id);

        header('Location: ' . BASE_URL . '/pumps');
    }

    // The Manage Page (Counters & Workers)
    public function manage()
    {
        $user = AuthHelper::user();
        $pumpId = $_GET['id'] ?? null;

        if (!$pumpId) {
            header('Location: ' . BASE_URL . '/pumps');
            return;
        }

        $pump = $this->pumpModel->find($pumpId);
        $counters = $this->counterModel->getByPumpId($pumpId);
        $workers = $this->workerModel->getAllActive();

        $pump = $this->pumpModel->find($pumpId);
        $counters = $this->counterModel->getByPumpId($pumpId);
        $workers = $this->workerModel->getAllActive();
        $tanks = $this->tankModel->getAll();

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
        if (!AuthHelper::can('pumps_edit')) {
            if ($this->isAjax()) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Access Denied']);
                exit;
            }
            die('Access Denied');
        }

        $id = $_POST['id'];
        $name = $_POST['name'];
        $tankId = $_POST['tank_id'];

        $success = $this->pumpModel->update($id, [
            'name' => $name,
            'tank_id' => $tankId
        ]);

        if ($this->isAjax()) {
            header('Content-Type: application/json');
            echo json_encode(['success' => $success]);
            exit;
        }

        header('Location: ' . BASE_URL . '/pumps/manage?id=' . $id . '&success=1');
    }

    // Ajax or Form Post to update counter details (Reading + Worker)
    public function updateCounter()
    {
        $counterId = $_POST['counter_id'];
        $workerId = !empty($_POST['worker_id']) ? $_POST['worker_id'] : null;
        $reading = $_POST['current_reading'] ?? null;

        $updateData = ['current_worker_id' => $workerId];
        if ($reading !== null) {
            $updateData['current_reading'] = $reading;
        }

        $this->counterModel->updateDetails($counterId, $updateData);

        // Redirect back
        $pumpId = $_POST['pump_id'];
        header('Location: ' . BASE_URL . '/pumps/manage?id=' . $pumpId . '&success=1');
    }

    // Update counter name
    public function updateCounterName()
    {
        if (!AuthHelper::can('pumps_edit')) {
            die('Access Denied');
        }

        $counterId = $_POST['counter_id'];
        $name = $_POST['name'];
        $pumpId = $_POST['pump_id'];

        $this->counterModel->updateDetails($counterId, ['name' => $name]);

        header('Location: ' . BASE_URL . '/pumps/manage?id=' . $pumpId . '&success=1');
    }
    // Add a new counter to existing pump
    public function addCounter()
    {
        if (!AuthHelper::can('pumps_edit')) {
            http_response_code(403);
            echo json_encode(['error' => 'Access Denied']);
            exit;
        }

        $pumpId = $_POST['pump_id'];
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
    // Bulk Update for Pump and Counters
    public function updateBulk()
    {
        if (!AuthHelper::can('pumps_edit')) {
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

        $pumpId = $input['id'];
        $pumpName = $input['name'];
        $tankId = $input['tank_id'];
        $counters = $input['counters'] ?? [];

        $db = \App\Config\Database::connect();
        $db->beginTransaction();

        try {
            // 1. Update Pump
            $this->pumpModel->update($pumpId, [
                'name' => $pumpName,
                'tank_id' => $tankId
            ]);

            // 2. Update Counters
            foreach ($counters as $c) {
                if (isset($c['id'])) {
                    $updateData = [
                        'name' => $c['name'],
                        'current_reading' => $c['current_reading'],
                        'current_worker_id' => !empty($c['current_worker_id']) ? $c['current_worker_id'] : null
                    ];
                    $this->counterModel->updateDetails($c['id'], $updateData);
                }
            }

            $db->commit();
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            $db->rollBack();
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
