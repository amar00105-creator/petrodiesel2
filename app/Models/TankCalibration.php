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

    /**
     * Calculate height using Reverse Linear Interpolation
     * 
     * This method implements reverse calculation: from volume to height.
     * It uses linear interpolation between two calibration points.
     * 
     * Formula: h = h1 + (v - v1) * (h2 - h1) / (v2 - v1)
     * 
     * @param int $tankId
     * @param float $volumeLiters Target volume in liters
     * @return array Result with height and calculation details
     */
    public function calculateHeight($tankId, $volumeLiters)
    {
        // Get calibration points
        $points = $this->getPoints($tankId);

        // No data available
        if (empty($points)) {
            return [
                'height_mm' => 0,
                'method' => 'no_data',
                'error' => 'No calibration data available for this tank'
            ];
        }

        // Check for exact match
        foreach ($points as $point) {
            if (abs($point['volume_liters'] - $volumeLiters) < 0.01) {
                return [
                    'height_mm' => floatval($point['height_mm']),
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
            if ($point['volume_liters'] <= $volumeLiters) {
                $lowerPoint = $point;
            }
            if ($point['volume_liters'] >= $volumeLiters && $upperPoint === null) {
                $upperPoint = $point;
                break;
            }
        }

        // Case 1: Volume below all calibration points
        if ($lowerPoint === null && $upperPoint !== null) {
            return [
                'height_mm' => 0,
                'method' => 'below_range',
                'warning' => 'Volume is below minimum calibration point. Height set to 0.',
                'nearest_point' => $upperPoint
            ];
        }

        // Case 2: Volume above all calibration points
        if ($lowerPoint !== null && $upperPoint === null) {
            return [
                'height_mm' => floatval($lowerPoint['height_mm']),
                'method' => 'above_range',
                'warning' => 'Volume exceeds maximum calibration point. Using highest calibrated height.',
                'max_point' => $lowerPoint
            ];
        }

        // Case 3: Linear Interpolation between two points
        if ($lowerPoint && $upperPoint) {
            $v1 = floatval($lowerPoint['volume_liters']);
            $h1 = floatval($lowerPoint['height_mm']);
            $v2 = floatval($upperPoint['volume_liters']);
            $h2 = floatval($upperPoint['height_mm']);

            // Reverse linear interpolation formula
            // h = h1 + (v - v1) * (h2 - h1) / (v2 - v1)
            $height = $h1 + (($volumeLiters - $v1) * ($h2 - $h1) / ($v2 - $v1));

            return [
                'height_mm' => round($height, 2),
                'method' => 'linear_interpolation',
                'message' => 'Calculated using reverse linear interpolation',
                'lower_point' => [
                    'volume_liters' => $v1,
                    'height_mm' => $h1
                ],
                'upper_point' => [
                    'volume_liters' => $v2,
                    'height_mm' => $h2
                ]
            ];
        }

        // Fallback
        return [
            'height_mm' => 0,
            'method' => 'error',
            'error' => 'Unable to calculate height'
        ];
    }

    /**
     * Calculate height (cm) from volume (liters) using reverse interpolation
     * This is the inverse of calculateVolume
     * 
     * @param int $tankId
     * @param float $volumeLiters
     * @return array
     */
    public function calculateHeight($tankId, $volumeLiters)
    {
        $points = $this->getPoints($tankId);

        if (empty($points)) {
            return ['error' => 'No calibration data found'];
        }

        // Sort by volume ascending
        usort($points, function ($a, $b) {
            return $a['volume_liters'] <=> $b['volume_liters'];
        });

        $numPoints = count($points);

        // Check if volume is below minimum
        if ($volumeLiters <= $points[0]['volume_liters']) {
            return [
                'height' => $points[0]['height_mm'],
                'method' => 'minimum_value'
            ];
        }

        // Check if volume is above maximum
        if ($volumeLiters >= $points[$numPoints - 1]['volume_liters']) {
            return [
                'height' => $points[$numPoints - 1]['height_mm'],
                'method' => 'maximum_value'
            ];
        }

        // Find the two points to interpolate between
        for ($i = 0; $i < $numPoints - 1; $i++) {
            $lower = $points[$i];
            $upper = $points[$i + 1];

            if ($volumeLiters >= $lower['volume_liters'] && $volumeLiters <= $upper['volume_liters']) {
                // Linear interpolation: height = h1 + (h2 - h1) * (v - v1) / (v2 - v1)
                $volumeDiff = $upper['volume_liters'] - $lower['volume_liters'];

                if ($volumeDiff == 0) {
                    // Avoid division by zero
                    $height = $lower['height_mm'];
                } else {
                    $ratio = ($volumeLiters - $lower['volume_liters']) / $volumeDiff;
                    $heightDiff = $upper['height_mm'] - $lower['height_mm'];
                    $height = $lower['height_mm'] + ($heightDiff * $ratio);
                }

                return [
                    'height' => round($height, 2),
                    'method' => 'linear_interpolation_reverse',
                    'lower_point' => $lower,
                    'upper_point' => $upper
                ];
            }
        }

        return ['error' => 'Volume out of calibration range'];
    }

    /**
     * Add a calibration log entry
     * Records the results of a smart calibration process
     * 
     * @param array $data Calibration log data
     * @return bool
     */
    public function addCalibrationLog($data)
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO calibration_logs (
                    tank_id, 
                    user_id, 
                    stick_reading_cm, 
                    calculated_volume_liters, 
                    sensor_reading_liters, 
                    variance_liters, 
                    error_percent, 
                    temperature_c, 
                    status, 
                    notes, 
                    dimensions_json,
                    tank_updated,
                    previous_volume,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            return $stmt->execute([
                $data['tank_id'],
                $data['user_id'],
                $data['stick_reading_cm'],
                $data['calculated_volume_liters'],
                $data['sensor_reading_liters'],
                $data['variance_liters'],
                $data['error_percent'],
                $data['temperature_c'],
                $data['status'],
                $data['notes'],
                $data['dimensions_json'],
                $data['tank_updated'] ?? false,
                $data['previous_volume'] ?? null
            ]);
        } catch (\Exception $e) {
            error_log("Failed to save calibration log: " . $e->getMessage());
            // Don't fail the entire operation if logging fails
            return false;
        }
    }
}
