<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Tank;
use App\Models\Supplier;
use App\Models\Setting;
use App\Models\FuelType;
use App\Config\Constants;
use App\Helpers\ViteHelper;
use App\Models\TankCalibration;

class TankController extends Controller
{
    private $tankModel;
    private $supplierModel;
    private $settingModel;
    private $fuelTypeModel;

    public function __construct()
    {
        $this->tankModel = new Tank();
        $this->supplierModel = new Supplier();
        $this->settingModel = new Setting();
        $this->fuelTypeModel = new FuelType();
    }

    public function index()
    {
        // Fixed: Restored tanks and suppliers fetching
        // List all tanks with their current status
        $user = \App\Helpers\AuthHelper::user();
        $stationId = $user['station_id'] ?? null;

        $user = \App\Helpers\AuthHelper::user();
        $stationId = $user['station_id'] ?? null;

        $tanks = $this->tankModel->getAll($stationId);
        $suppliers = $this->supplierModel->getAll($stationId);
        $fuelSettings = $this->settingModel->getAllBySection('fuel');
        $fuelTypes = $this->fuelTypeModel->getAll();

        // Header Requirements
        $allStations = [];
        if ($user['role'] === 'super_admin') {
            $db = \App\Config\Database::connect();
            $stmt = $db->query("SELECT id, name FROM stations ORDER BY name ASC");
            $allStations = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $additional_js = ViteHelper::load('resources/js/main.jsx');

        // Pass to view
        $this->view('tanks/index', [
            'tanks' => $tanks,
            'suppliers' => $suppliers,
            'fuelSettings' => $fuelSettings,
            'fuelTypes' => $fuelTypes,
            'user' => $user,
            'allStations' => $allStations,
            'additional_js' => $additional_js,
            'hide_topbar' => true
        ]);
    }

    public function create()
    {
        // Redirect legacy create page to main list (React Modal handles creation now)
        $this->redirect('/tanks');
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // Try reading JSON input first
            $input = json_decode(file_get_contents('php://input'), true);

            $data = [
                'station_id' => 1, // Default station for now
                'name' => $input['name'] ?? $_POST['name'] ?? '',
                'fuel_type_id' => (isset($input['fuel_type_id']) && !str_starts_with($input['fuel_type_id'], 'legacy_')) ? $input['fuel_type_id'] : null,
                'product_type' => $input['product_type'] ?? $_POST['product_type'] ?? 'Diesel', // Legacy fallback
                'capacity_liters' => $input['capacity_liters'] ?? $_POST['capacity_liters'] ?? 0,
                'current_volume' => $input['current_volume'] ?? $_POST['current_volume'] ?? 0,
                'current_price' => $input['current_price'] ?? $_POST['current_price'] ?? 0,
            ];

            if ($this->tankModel->create($data)) {
                echo json_encode(['success' => true, 'message' => 'تم إضافة الخزان بنجاح']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'فشل في إضافة الخزان']);
            }
            exit;
        }
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            $input = json_decode(file_get_contents('php://input'), true);

            $id = $input['id'] ?? $_POST['id'] ?? null;

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'Missing Tank ID']);
                exit;
            }

            $data = [
                'name' => $input['name'] ?? $_POST['name'] ?? '',
                'fuel_type_id' => (isset($input['fuel_type_id']) && !str_starts_with($input['fuel_type_id'], 'legacy_')) ? $input['fuel_type_id'] : null,
                'capacity_liters' => $input['capacity_liters'] ?? $_POST['capacity_liters'] ?? 0,
                'current_volume' => $input['current_volume'] ?? $_POST['current_volume'] ?? 0,
                'current_price' => $input['current_price'] ?? $_POST['current_price'] ?? 0,
            ];

            if ($this->tankModel->update($id, $data)) {
                echo json_encode(['success' => true, 'message' => 'تم تحديث بيانات الخزان بنجاح']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'فشل في تحديث الخزان']);
            }
            exit;
        }
    }

    public function delete()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_POST['id'] ?? null;

            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'Missing ID']);
                exit;
            }

            if ($this->tankModel->delete($id)) {
                echo json_encode(['success' => true, 'message' => 'تم حذف الخزان بنجاح']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'فشل في حذف الخزان']);
            }
            exit;
        }
    }

    public function calibration()
    {
        $tanks = $this->tankModel->getAll();
        $this->view('tanks/calibration', [
            'tanks' => $tanks,
            'hide_topbar' => true
        ]);
    }

    public function saveCalibration()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'tank_id' => $_POST['tank_id'],
                'user_id' => 1, // Hardcoded for now, should be session user
                'reading_cm' => $_POST['reading_cm'],
                'volume_liters' => $_POST['volume_liters'],
                'reading_type' => $_POST['reading_type'],
                // Variance calculated in Model if not passed
            ];

            if ($this->tankModel->addReading($data)) {
                $this->redirect('/tanks/calibration');
            }
        }
    }

    /**
     * Get calibration points for a specific tank (API endpoint)
     */
    public function getCalibrationPoints()
    {
        header('Content-Type: application/json');
        $tankId = $_GET['tank_id'] ?? null;

        if (!$tankId) {
            echo json_encode(['success' => false, 'message' => 'Tank ID required']);
            return;
        }

        $calibrationModel = new TankCalibration();
        $points = $calibrationModel->getPoints($tankId);

        echo json_encode(['success' => true, 'points' => $points]);
    }

    /**
     * Add a new calibration point (API endpoint)
     */
    public function addCalibrationPoint()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents('php://input'), true);
        $tankId = $data['tank_id'] ?? null;
        $heightMm = $data['height_mm'] ?? null;
        $volumeLiters = $data['volume_liters'] ?? null;

        if (!$tankId || $heightMm === null || $volumeLiters === null) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        $calibrationModel = new TankCalibration();
        $success = $calibrationModel->addPoint($tankId, $heightMm, $volumeLiters);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'تمت إضافة نقطة المعايرة بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في إضافة نقطة المعايرة']);
        }
    }

    /**
     * Delete a calibration point (API endpoint)
     */
    public function deleteCalibrationPoint()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents('php://input'), true);
        $pointId = $data['point_id'] ?? null;

        if (!$pointId) {
            echo json_encode(['success' => false, 'message' => 'Point ID required']);
            return;
        }

        $calibrationModel = new TankCalibration();
        $success = $calibrationModel->deletePoint($pointId);

        if ($success) {
            echo json_encode(['success' => true, 'message' => 'تم حذف نقطة المعايرة']);
        } else {
            echo json_encode(['success' => false, 'message' => 'فشل في حذف نقطة المعايرة']);
        }
    }

    /**
     * Calculate volume using linear interpolation (API endpoint)
     */
    public function calculateVolume()
    {
        header('Content-Type: application/json');

        $tankId = $_GET['tank_id'] ?? null;
        $heightMm = $_GET['height_mm'] ?? null;

        if (!$tankId || $heightMm === null) {
            echo json_encode(['success' => false, 'message' => 'Missing parameters']);
            return;
        }

        $calibrationModel = new TankCalibration();
        $result = $calibrationModel->calculateVolume($tankId, floatval($heightMm));

        echo json_encode(['success' => true, 'result' => $result]);
    }
}
