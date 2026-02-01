<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class CalibrationLog
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function create($data)
    {
        $sql = "INSERT INTO calibration_logs 
                (tank_id, user_id, stick_reading_cm, sensor_reading_liters, temperature_c, 
                actual_volume_liters, variance_liters, error_percentage, status, correction_factor, report_json, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['tank_id'],
            $data['user_id'] ?? null,
            $data['stick_reading_cm'],
            $data['sensor_reading_liters'],
            $data['temperature_c'] ?? null,
            $data['actual_volume_liters'],
            $data['variance_liters'],
            $data['error_percentage'],
            $data['status'],
            $data['correction_factor'] ?? 1.0,
            json_encode($data['report_json'] ?? []),
            $data['notes'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function getByTankId($tankId, $limit = 10)
    {
        $stmt = $this->db->prepare("SELECT * FROM calibration_logs WHERE tank_id = ? ORDER BY calibration_date DESC LIMIT ?");
        $stmt->bindValue(1, $tankId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLatest($tankId)
    {
        $stmt = $this->db->prepare("SELECT * FROM calibration_logs WHERE tank_id = ? ORDER BY calibration_date DESC LIMIT 1");
        $stmt->execute([$tankId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
