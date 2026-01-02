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

class WorkerStub { // Temporary stub if Model doesn't exist, works for dropdown
    private $db;
    public function __construct() { $this->db = \App\Config\Database::connect(); }
    public function getAllActive() {
        $stmt = $this->db->query("SELECT * FROM workers WHERE status='active'");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}

class PumpController {
    private $pumpModel;
    private $tankModel;
    private $counterModel;
    private $workerModel;

    public function __construct() {
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



    public function index() {
        $user = AuthHelper::user();
        $data['user'] = $user;
        $stationId = $user['station_id'] ?? 1;
        $data['pumps'] = $this->pumpModel->getPumpsWithCounters($stationId);
        
        require_once __DIR__ . '/../../views/pumps/index.php';
    }

    public function create() {
        $user = AuthHelper::user();
        $data['user'] = $user;
        $data['tanks'] = $this->tankModel->getAll(); // Need existing Tanks to bind to
        $data['workers'] = $this->workerModel->getAllActive($user['station_id'] ?? null); // Pass workers to view
        
        require_once __DIR__ . '/../../views/pumps/create.php';
    }

    public function store() {
        $user = AuthHelper::user();
        
        $name = $_POST['name'] ?? 'Pump';
        $tankId = $_POST['tank_id'];
        $counterCount = (int)($_POST['counter_count'] ?? 1);
        
        // Arrays from dynamic form
        $readings = $_POST['readings'] ?? [];
        $workers = $_POST['workers'] ?? [];
        
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
            for($i=0; $i<$counterCount; $i++) {
                $countersData[] = [
                    'reading' => $readings[$i] ?? 0,
                    'worker_id' => $workers[$i] ?? null
                ];
            }
            $this->pumpModel->addCounters($pumpId, $counterCount, $countersData);
        }

        header('Location: ' . BASE_URL . '/pumps');
    }

    public function delete() {
        // Only Admin
        if (!AuthHelper::isAdmin()) {
            die('Access Denied');
        }

        $id = $_POST['id'];
        $this->pumpModel->delete($id);
        header('Location: ' . BASE_URL . '/pumps');
    }

    public function deleteCounter() {
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
    public function manage() {
        $user = AuthHelper::user();
        $pumpId = $_GET['id'] ?? null;
        
        if (!$pumpId) {
            header('Location: ' . BASE_URL . '/pumps');
            return;
        }

        $data['user'] = $user;
        $data['pump'] = $this->pumpModel->find($pumpId);
        $data['counters'] = $this->counterModel->getByPumpId($pumpId);
        $data['workers'] = $this->workerModel->getAllActive();

        require_once __DIR__ . '/../../views/pumps/manage.php';
    }

    // Ajax or Form Post to update counter details (Reading + Worker)
    public function updateCounter() {
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
}
