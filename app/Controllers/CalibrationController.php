<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Calibration;
use App\Models\Tank;
use App\Helpers\AuthHelper;

/**
 * Calibration Controller (Simplified)
 * Handles manual tank calibration with automatic variance calculation
 */
class CalibrationController extends Controller
{
    private $calibrationModel;
    private $tankModel;

    public function __construct()
    {
        $this->calibrationModel = new Calibration();
        $this->tankModel = new Tank();
    }

    /**
     * Add new calibration
     * POST /calibrations/add
     */
    public function add()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $user = AuthHelper::user();

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح']);
                return;
            }

            // Validate input
            $tankId = $data['tank_id'] ?? null;
            $actualQuantity = $data['actual_quantity'] ?? null;
            $notes = $data['notes'] ?? '';

            if (!$tankId || $actualQuantity === null || $actualQuantity < 0) {
                echo json_encode(['success' => false, 'message' => 'بيانات غير صحيحة']);
                return;
            }

            // Get current tank data
            $tank = $this->tankModel->find($tankId);
            if (!$tank) {
                echo json_encode(['success' => false, 'message' => 'الخزان غير موجود']);
                return;
            }

            $previousQuantity = floatval($tank['current_volume'] ?? 0);
            $variance = $actualQuantity - $previousQuantity;

            // Start transaction
            $this->calibrationModel->db->beginTransaction();

            // Create calibration record
            $calibrationId = $this->calibrationModel->create([
                'tank_id' => $tankId,
                'user_id' => $user['id'],
                'actual_quantity' => $actualQuantity,
                'previous_quantity' => $previousQuantity,
                'variance' => $variance,
                'notes' => $notes
            ]);

            // Update tank volume
            $this->tankModel->update($tankId, [
                'current_volume' => $actualQuantity
            ]);

            $this->calibrationModel->db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'تم حفظ المعايرة بنجاح',
                'calibration_id' => $calibrationId,
                'variance' => $variance
            ]);
        } catch (\Exception $e) {
            if ($this->calibrationModel->db->inTransaction()) {
                $this->calibrationModel->db->rollBack();
            }
            error_log("Calibration add error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    /**
     * Update calibration
     * POST /calibrations/update/{id}
     */
    public function update($id)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;

        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $user = AuthHelper::user();

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح']);
                return;
            }

            // Get existing calibration
            $calibration = $this->calibrationModel->find($id);
            if (!$calibration) {
                echo json_encode(['success' => false, 'message' => 'المعايرة غير موجودة']);
                return;
            }

            $newActualQuantity = $data['actual_quantity'] ?? null;
            $newNotes = $data['notes'] ?? '';

            if ($newActualQuantity === null || $newActualQuantity < 0) {
                echo json_encode(['success' => false, 'message' => 'بيانات غير صحيحة']);
                return;
            }

            // Calculate new variance (using same previous_quantity)
            $newVariance = $newActualQuantity - $calibration['previous_quantity'];

            // Start transaction
            $this->calibrationModel->db->beginTransaction();

            // Revert tank to previous quantity first
            $this->tankModel->update($calibration['tank_id'], [
                'current_volume' => $calibration['previous_quantity']
            ]);

            // Update calibration record
            $this->calibrationModel->update($id, [
                'actual_quantity' => $newActualQuantity,
                'variance' => $newVariance,
                'notes' => $newNotes
            ]);

            // Apply new quantity to tank
            $this->tankModel->update($calibration['tank_id'], [
                'current_volume' => $newActualQuantity
            ]);

            $this->calibrationModel->db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث المعايرة بنجاح',
                'variance' => $newVariance
            ]);
        } catch (\Exception $e) {
            if ($this->calibrationModel->db->inTransaction()) {
                $this->calibrationModel->db->rollBack();
            }
            error_log("Calibration update error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete calibration
     * DELETE /calibrations/delete/{id}
     */
    public function delete($id)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') return;

        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $user = AuthHelper::user();

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'غير مصرح']);
                return;
            }

            // Get calibration
            $calibration = $this->calibrationModel->find($id);
            if (!$calibration) {
                echo json_encode(['success' => false, 'message' => 'المعايرة غير موجودة']);
                return;
            }

            // Start transaction
            $this->calibrationModel->db->beginTransaction();

            // Revert tank to previous quantity
            $this->tankModel->update($calibration['tank_id'], [
                'current_volume' => $calibration['previous_quantity']
            ]);

            // Delete calibration record
            $this->calibrationModel->delete($id);

            $this->calibrationModel->db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'تم حذف المعايرة وإرجاع الرصيد'
            ]);
        } catch (\Exception $e) {
            if ($this->calibrationModel->db->inTransaction()) {
                $this->calibrationModel->db->rollBack();
            }
            error_log("Calibration delete error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()]);
        }
    }

    /**
     * Get calibration history for a tank
     * GET /calibrations/history?tank_id=1
     */
    public function getHistory()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $tankId = $_GET['tank_id'] ?? null;

            if (!$tankId) {
                echo json_encode(['success' => false, 'message' => 'معرف الخزان مطلوب']);
                return;
            }

            $calibrations = $this->calibrationModel->getByTank($tankId);

            echo json_encode([
                'success' => true,
                'calibrations' => $calibrations
            ]);
        } catch (\Exception $e) {
            error_log("Get calibration history error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ']);
        }
    }

    /**
     * Get all calibrations
     * GET /calibrations/all
     */
    public function getAll()
    {
        while (ob_get_level()) ob_end_clean();
        header('Content-Type: application/json');

        try {
            $calibrations = $this->calibrationModel->getAll();

            echo json_encode([
                'success' => true,
                'calibrations' => $calibrations
            ]);
        } catch (\Exception $e) {
            error_log("Get all calibrations error: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'حدث خطأ']);
        }
    }
}
