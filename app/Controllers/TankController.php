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
        $generalSettings = $this->settingModel->getAllBySection('general');
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
            'generalSettings' => $generalSettings,
            'fuelTypes' => $fuelTypes,
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

    /**
     * Calculate height using reverse linear interpolation (API endpoint)
     */
    public function calculateHeight()
    {
        header('Content-Type: application/json');

        $tankId = $_GET['tank_id'] ?? null;
        $volumeLiters = $_GET['volume_liters'] ?? null;

        if (!$tankId || $volumeLiters === null) {
            echo json_encode(['success' => false, 'message' => 'Missing parameters']);
            return;
        }

        $calibrationModel = new TankCalibration();
        $result = $calibrationModel->calculateHeight($tankId, floatval($volumeLiters));

        echo json_encode(['success' => true, 'result' => $result]);
    }

    /**
     * Calculate height from volume (API endpoint for real-time conversion)
     */
    public function calculateHeightFromVolume()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $tankId = $data['tank_id'] ?? null;
            $volumeLiters = floatval($data['volume_liters'] ?? 0);

            if (!$tankId || $volumeLiters <= 0) {
                echo json_encode(['success' => false, 'message' => 'بيانات غير صحيحة']);
                return;
            }

            $calibrationModel = new TankCalibration();
            $result = $calibrationModel->calculateHeight($tankId, $volumeLiters);

            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'message' => $result['error']]);
                return;
            }

            echo json_encode([
                'success' => true,
                'height_cm' => $result['height'],
                'method' => $result['method']
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'خطأ في النظام']);
        }
    }

    /**
     * Process smart calibration (API endpoint)
     * Uses pre-stored calibration table to calculate volume via linear interpolation
     * Can optionally update tank volume directly based on sensor reading
     */
    public function processSmartCalibration()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $tankId = $data['tank_id'] ?? null;
            $stickReadingCm = floatval($data['stick_reading_cm'] ?? 0);
            $sensorReadingLiters = floatval($data['sensor_reading_liters'] ?? 0);
            $updateTankVolume = boolval($data['update_tank_volume'] ?? false);

            // Validation: Must have at least stick reading OR sensor reading
            if (!$tankId || ($stickReadingCm <= 0 && $sensorReadingLiters <= 0)) {
                echo json_encode(['success' => false, 'message' => 'يرجى إدخال قراءة العصا اليدوية أو قراءة النظام الآلي على الأقل']);
                return;
            }

            // Use calibration table to calculate volume (only if stick reading is provided)
            $actualVolumeLiters = 0;
            $calculationMethod = 'direct_sensor_reading';

            if ($stickReadingCm > 0) {
                $calibrationModel = new TankCalibration();
                $calculationResult = $calibrationModel->calculateVolume($tankId, $stickReadingCm);

                // Check if calculation was successful
                if (isset($calculationResult['error'])) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'لا توجد بيانات معايرة لهذا الخزان. يرجى إضافة نقاط معايرة أولاً من صفحة المعايرة'
                    ]);
                    return;
                }

                $actualVolumeLiters = floatval($calculationResult['volume'] ?? 0);
                $calculationMethod = $calculationResult['method'] ?? 'linear_interpolation';
            } else {
                // No stick reading, use sensor reading directly
                $actualVolumeLiters = $sensorReadingLiters;
                $calculationResult = ['method' => 'direct_sensor_reading'];
            }

            // Calculate variance if sensor reading is provided
            $variance = 0;
            $errorPercent = 0;
            $status = 'pass';

            if ($sensorReadingLiters > 0) {
                $variance = $actualVolumeLiters - $sensorReadingLiters;
                $errorPercent = ($actualVolumeLiters > 0) ? round((abs($variance) / $actualVolumeLiters) * 100, 2) : 0;

                // Determine status based on error percentage
                if ($errorPercent > 10) {
                    $status = 'fail';
                } elseif ($errorPercent > 5) {
                    $status = 'warning';
                }
            }

            // Handle tank volume update if requested
            $tankUpdated = false;
            $previousVolume = null;

            if ($updateTankVolume && $sensorReadingLiters > 0) {
                // Get tank details for validation
                $tankModel = new Tank();
                $tank = $tankModel->find($tankId);

                if (!$tank) {
                    echo json_encode(['success' => false, 'message' => 'الخزان غير موجود']);
                    return;
                }

                // Validate capacity
                $capacity = floatval($tank['capacity_liters'] ?? 0);
                if ($sensorReadingLiters > $capacity) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'الكمية المدخلة (' . number_format($sensorReadingLiters, 2) . ' لتر) تتجاوز سعة الخزان (' . number_format($capacity, 2) . ' لتر)'
                    ]);
                    return;
                }

                // Store previous volume
                $previousVolume = floatval($tank['current_volume'] ?? 0);

                // Update tank volume (set absolute value, not increment)
                $updateSuccess = $tankModel->update($tankId, ['current_volume' => $sensorReadingLiters]);

                if ($updateSuccess) {
                    $tankUpdated = true;
                } else {
                    echo json_encode(['success' => false, 'message' => 'فشل تحديث رصيد الخزان']);
                    return;
                }
            }

            // Save calibration log to database
            $user = \App\Helpers\AuthHelper::user();
            $userId = $user['id'] ?? 1;

            $logData = [
                'tank_id' => $tankId,
                'user_id' => $userId,
                'stick_reading_cm' => $stickReadingCm,
                'calculated_volume_liters' => $actualVolumeLiters,
                'sensor_reading_liters' => $sensorReadingLiters,
                'variance_liters' => $variance,
                'error_percent' => $errorPercent,
                'temperature_c' => 25, // Default value
                'status' => $status,
                'notes' => 'Smart calibration using ' . $calculationMethod . ($tankUpdated ? ' - Tank volume updated' : ''),
                'dimensions_json' => json_encode($calculationResult),
                'tank_updated' => $tankUpdated,
                'previous_volume' => $previousVolume
            ];

            $calibrationModel->addCalibrationLog($logData);

            // Return result
            $result = [
                'status' => $status,
                'actual_volume' => round($actualVolumeLiters, 2),
                'sensor_volume' => round($sensorReadingLiters, 2),
                'variance' => round($variance, 2),
                'error_percent' => $errorPercent,
                'method' => $calculationMethod,
                'timestamp' => date('Y-m-d H:i:s'),
                'tank_updated' => $tankUpdated,
                'previous_volume' => $previousVolume
            ];

            echo json_encode(['success' => true, 'result' => $result]);
        } catch (Exception $e) {
            error_log("Smart Calibration Error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ في النظام: ' . $e->getMessage()]);
        }
    }

    /**
     * Calculate volume based on tank geometry and liquid height
     */
    private function calculateGeometricVolume($dimensions, $heightCm)
    {
        $shape = $dimensions['shape'] ?? 'horizontal_cylinder';
        $diameter = floatval($dimensions['diameter'] ?? 0);
        $length = floatval($dimensions['length'] ?? 0);
        $width = floatval($dimensions['width'] ?? 0);
        $height = floatval($dimensions['height'] ?? 0);

        $heightCm = floatval($heightCm);

        if ($heightCm <= 0) return false;

        $volumeLiters = 0;

        switch ($shape) {
            case 'horizontal_cylinder':
                // Horizontal cylindrical tank
                if ($diameter <= 0 || $length <= 0) return false;

                $radius = $diameter / 2;

                // Liquid height from bottom
                $h = $heightCm;

                // Cross-sectional area of liquid (circular segment)
                // A = r² * arccos((r-h)/r) - (r-h) * sqrt(2rh - h²)
                if ($h > $diameter) $h = $diameter; // Cap at full height

                $theta = acos(($radius - $h) / $radius);
                $area = ($radius * $radius * $theta) - (($radius - $h) * sqrt(2 * $radius * $h - $h * $h));

                // Volume = Area * Length
                $volumeCm3 = $area * $length;
                $volumeLiters = $volumeCm3 / 1000; // Convert cm³ to liters
                break;

            case 'vertical_cylinder':
                // Vertical cylindrical tank
                if ($diameter <= 0 || $length <= 0) return false;

                $radius = $diameter / 2;
                $area = pi() * $radius * $radius;
                $volumeCm3 = $area * $heightCm;
                $volumeLiters = $volumeCm3 / 1000;
                break;

            case 'rectangular':
                // Rectangular tank
                if ($width <= 0 || $length <= 0) return false;

                $volumeCm3 = $width * $length * $heightCm;
                $volumeLiters = $volumeCm3 / 1000;
                break;

            default:
                return false;
        }

        return $volumeLiters > 0 ? $volumeLiters : false;
    }
}
