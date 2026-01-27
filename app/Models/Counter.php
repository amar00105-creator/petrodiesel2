<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Counter
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function create($data)
    {
        $fields = ['pump_id', 'name', 'current_reading'];
        $placeholders = ['?', '?', '?'];
        $values = [
            $data['pump_id'],
            $data['name'],
            $data['current_reading']
        ];

        if (array_key_exists('current_worker_id', $data)) {
            $fields[] = 'current_worker_id';
            $placeholders[] = '?';
            $values[] = $data['current_worker_id'];
        }

        $sql = "INSERT INTO counters (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);
        return $this->db->lastInsertId();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM counters WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByPumpId($pumpId)
    {
        // Fetch counters with current worker details
        $sql = "SELECT c.*, w.name as worker_name 
                FROM counters c 
                LEFT JOIN workers w ON c.current_worker_id = w.id 
                WHERE c.pump_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$pumpId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateReading($id, $reading)
    {
        $stmt = $this->db->prepare("UPDATE counters SET current_reading = ? WHERE id = ?");
        return $stmt->execute([$reading, $id]);
    }

    public function assignWorker($id, $workerId)
    {
        $stmt = $this->db->prepare("UPDATE counters SET current_worker_id = ? WHERE id = ?");
        return $stmt->execute([$workerId, $id]);
    }

    // Updates both reading and worker
    public function updateDetails($id, $data)
    {
        $fields = [];
        $params = [];

        if (isset($data['current_reading'])) {
            $fields[] = "current_reading = ?";
            $params[] = $data['current_reading'];
        }

        if (array_key_exists('current_worker_id', $data)) {
            $fields[] = "current_worker_id = ?";
            $params[] = $data['current_worker_id']; // Can be null
        }

        if (isset($data['name'])) {
            $fields[] = "name = ?";
            $params[] = $data['name'];
        }

        if (empty($fields)) return false;

        $params[] = $id;
        $sql = "UPDATE counters SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM counters WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
