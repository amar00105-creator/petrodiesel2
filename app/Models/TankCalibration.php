<?php

namespace App\Models;

use App\Config\Database;

/**
 * Tank Calibration Model
 * Handles calibration points (strapping table) and volume calculations using linear interpolation
 */
class TankCalibration
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Get all calibration points for a tank, sorted by height
     * 
     * @param int $tankId
     * @return array
     */
    public function getPoints($tankId)
    {
        $stmt = $this->db->prepare("
            SELECT id, reading_cm as height_mm, volume_liters 
            FROM calibration_tables 
            WHERE tank_id = ? 
            ORDER BY reading_cm ASC
        ");
        $stmt->execute([$tankId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Add a new calibration point
     * 
     * @param int $tankId
     * @param float $heightMm Height in millimeters (stored as reading_cm)
     * @param float $volumeLiters Volume in liters
     * @return bool
     */
    public function addPoint($tankId, $heightMm, $volumeLiters)
    {
        $stmt = $this->db->prepare("
            INSERT INTO calibration_tables (tank_id, reading_cm, volume_liters) 
            VALUES (?, ?, ?)
        ");
        return $stmt->execute([$tankId, $heightMm, $volumeLiters]);
    }

    /**
     * Delete a calibration point
     * 
     * @param int $pointId
     * @return bool
     */
    public function deletePoint($pointId)
    {
        $stmt = $this->db->prepare("DELETE FROM calibration_tables WHERE id = ?");
        return $stmt->execute([$pointId]);
    }

    /**
     * Calculate volume using Linear Interpolation
     * 
     * This method implements precise volume calculation based on the strapping table.
     * It uses linear interpolation between two calibration points to calculate
     * the exact volume for any height measurement.
     * 
     * Formula: v = v1 + (h - h1) * (v2 - v1) / (h2 - h1)
     * 
     * @param int $tankId
     * @param float $heightMm Current height in millimeters
     * @return array Result with volume and calculation details
     */
    public function calculateVolume($tankId, $heightMm)
    {
        // Get calibration points
        $points = $this->getPoints($tankId);

        // No data available
        if (empty($points)) {
            return [
                'volume' => 0,
                'method' => 'no_data',
                'error' => 'No calibration data available for this tank'
            ];
        }

        // Check for exact match
        foreach ($points as $point) {
            if (abs($point['height_mm'] - $heightMm) < 0.01) {
                return [
                    'volume' => floatval($point['volume_liters']),
                    'method' => 'exact',
                    'message' => 'Exact calibration point match',
                    'point' => $point
                ];
            }
        }

        // Find bracketing points for interpolation
        $lowerPoint = null;
        $upperPoint = null;

        foreach ($points as $point) {
            if ($point['height_mm'] <= $heightMm) {
                $lowerPoint = $point;
            }
            if ($point['height_mm'] >= $heightMm && $upperPoint === null) {
                $upperPoint = $point;
                break;
            }
        }

        // Case 1: Height below all calibration points
        if ($lowerPoint === null && $upperPoint !== null) {
            return [
                'volume' => 0,
                'method' => 'below_range',
                'warning' => 'Height is below minimum calibration point. Volume set to 0.',
                'nearest_point' => $upperPoint
            ];
        }

        // Case 2: Height above all calibration points
        if ($lowerPoint !== null && $upperPoint === null) {
            // Use maximum calibrated volume (conservative approach)
            return [
                'volume' => floatval($lowerPoint['volume_liters']),
                'method' => 'above_range',
                'warning' => 'Height exceeds maximum calibration point. Using highest calibrated volume.',
                'max_point' => $lowerPoint
            ];
        }

        // Case 3: Linear Interpolation between two points
        if ($lowerPoint && $upperPoint) {
            $h1 = floatval($lowerPoint['height_mm']);
            $v1 = floatval($lowerPoint['volume_liters']);
            $h2 = floatval($upperPoint['height_mm']);
            $v2 = floatval($upperPoint['volume_liters']);

            // Linear interpolation formula
            // v = v1 + (h - h1) * (v2 - v1) / (h2 - h1)
            $volume = $v1 + (($heightMm - $h1) * ($v2 - $v1) / ($h2 - $h1));

            return [
                'volume' => round($volume, 2),
                'method' => 'linear_interpolation',
                'message' => 'Calculated using linear interpolation',
                'lower_point' => [
                    'height_mm' => $h1,
                    'volume_liters' => $v1
                ],
                'upper_point' => [
                    'height_mm' => $h2,
                    'volume_liters' => $v2
                ],
                'calculation_details' => [
                    'formula' => "v = v1 + ((h - h1) * (v2 - v1) / (h2 - h1))",
                    'substituted' => "v = $v1 + (($heightMm - $h1) * ($v2 - $v1) / ($h2 - $h1))",
                    'result' => round($volume, 2)
                ]
            ];
        }

        // Fallback (should not reach here)
        return [
            'volume' => 0,
            'method' => 'error',
            'error' => 'Unable to calculate volume'
        ];
    }
}
