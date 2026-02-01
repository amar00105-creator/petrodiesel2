<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Tank Calibration Model (Simplified)
 * Handles manual tank calibration entries with automatic variance calculation
 */
class Calibration
{
    public $db;
    private $table = 'tank_calibrations';

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Create a new calibration entry
     * 
     * @param array $data Calibration data
     * @return int Last insert ID
     */
    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO {$this->table} 
            (tank_id, user_id, actual_quantity, previous_quantity, variance, notes) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['tank_id'],
            $data['user_id'],
            $data['actual_quantity'],
            $data['previous_quantity'],
            $data['variance'],
            $data['notes'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Update a calibration entry
     * 
     * @param int $id Calibration ID
     * @param array $data Updated data
     * @return bool Success
     */
    public function update($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE {$this->table} 
            SET actual_quantity = ?, 
                variance = ?, 
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");

        return $stmt->execute([
            $data['actual_quantity'],
            $data['variance'],
            $data['notes'] ?? null,
            $id
        ]);
    }

    /**
     * Delete a calibration entry
     * 
     * @param int $id Calibration ID
     * @return bool Success
     */
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Find a calibration by ID
     * 
     * @param int $id Calibration ID
     * @return array|null Calibration data
     */
    public function find($id)
    {
        $stmt = $this->db->prepare("
            SELECT c.*, t.name as tank_name, u.name as user_name
            FROM {$this->table} c
            LEFT JOIN tanks t ON c.tank_id = t.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get calibration history for a tank
     * 
     * @param int $tankId Tank ID
     * @param int $limit Number of records
     * @return array Calibration records
     */
    public function getByTank($tankId, $limit = 50)
    {
        $stmt = $this->db->prepare("
            SELECT c.*, u.name as user_name
            FROM {$this->table} c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.tank_id = ?
            ORDER BY c.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$tankId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get calibration history for date range
     * 
     * @param string $startDate Start date
     * @param string $endDate End date
     * @param int|string $stationId Station ID or 'all'
     * @return array Calibration records
     */
    public function getByDateRange($startDate, $endDate, $stationId = 'all')
    {
        $sql = "
            SELECT c.*, t.name as tank_name, t.station_id, u.name as user_name
            FROM {$this->table} c
            LEFT JOIN tanks t ON c.tank_id = t.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.created_at BETWEEN ? AND ?
        ";

        $params = [$startDate . ' 00:00:00', $endDate . ' 23:59:59'];

        if ($stationId !== 'all') {
            $sql .= " AND t.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY c.created_at DESC LIMIT 100";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all calibrations
     * 
     * @param int $limit Number of records
     * @return array Calibration records
     */
    public function getAll($limit = 100)
    {
        $stmt = $this->db->prepare("
            SELECT c.*, t.name as tank_name, u.name as user_name
            FROM {$this->table} c
            LEFT JOIN tanks t ON c.tank_id = t.id
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
