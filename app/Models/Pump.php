<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Pump
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function getAll($stationId = null)
    {
        // Get pumps with Tank name and Station info
        $sql = "SELECT p.*, t.name as tank_name, ft.name as product_type 
                FROM pumps p 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE p.deleted_at IS NULL";

        $params = [];
        if ($stationId && $stationId !== 'all') {
            $sql .= " AND p.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY p.name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $sql = "SELECT p.*, t.name as tank_name, ft.name as product_type 
                FROM pumps p 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE p.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create Pump and return ID
    public function create($data)
    {
        // Robust Fallback for Station ID
        if (empty($data['station_id'])) {
            $stmt = $this->db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $fallback = $stmt->fetch();

            if ($fallback) {
                $data['station_id'] = $fallback['id'];
            } else {
                // Auto-Create Station if missing
                $this->db->exec("INSERT INTO stations (name, address, phone) VALUES ('Default Station', 'Main Location', '0000000000')");
                $data['station_id'] = $this->db->lastInsertId();
            }
        }

        $stmt = $this->db->prepare("INSERT INTO pumps (station_id, tank_id, name) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['station_id'],
            $data['tank_id'],
            $data['name']
        ]);
        return $this->db->lastInsertId();
    }

    // Add Counters to a Pump
    public function addCounters($pumpId, $count, $data = [])
    {
        $stmt = $this->db->prepare("INSERT INTO counters (pump_id, name, current_reading, current_worker_id) VALUES (?, ?, ?, ?)");

        for ($i = 0; $i < $count; $i++) {
            $name = isset($data[$i]['name']) ? $data[$i]['name'] : "Nozzle " . ($i + 1);
            $reading = isset($data[$i]['reading']) ? $data[$i]['reading'] : 0;
            $workerId = isset($data[$i]['worker_id']) ? $data[$i]['worker_id'] : null;

            $stmt->execute([$pumpId, $name, $reading, $workerId]);
        }
    }

    public function delete($id)
    {
        $this->db->beginTransaction();
        try {
            // Soft delete associated counters first
            $stmtCounters = $this->db->prepare("UPDATE counters SET deleted_at = NOW() WHERE pump_id = ?");
            $stmtCounters->execute([$id]);

            // Soft delete the pump
            $stmt = $this->db->prepare("UPDATE pumps SET deleted_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE pumps SET name = ?, tank_id = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $data['tank_id'], $id]);
    }

    public function getPumpsWithCounters($stationId)
    {
        // 1. Get Pumps (Active Only)
        $sql = "SELECT p.*, t.name as tank_name, ft.name as product_type 
                FROM pumps p 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE p.station_id = ? AND p.deleted_at IS NULL
                ORDER BY p.name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        $pumps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($pumps)) {
            return [];
        }

        // 2. Get Counters with Worker Names (Active Only)
        $pumpIds = array_column($pumps, 'id');
        $placeholders = implode(',', array_fill(0, count($pumpIds), '?'));

        $sqlCounters = "SELECT c.*, w.name as worker_name 
                        FROM counters c 
                        LEFT JOIN workers w ON c.current_worker_id = w.id 
                        WHERE c.pump_id IN ($placeholders) AND c.deleted_at IS NULL
                        ORDER BY c.id";
        $stmtCounters = $this->db->prepare($sqlCounters);
        $stmtCounters->execute($pumpIds);
        $counters = $stmtCounters->fetchAll(PDO::FETCH_ASSOC);

        // 3. Associate Counters with Pumps
        $countersByPump = [];
        foreach ($counters as $c) {
            $countersByPump[$c['pump_id']][] = $c;
        }

        foreach ($pumps as &$pump) {
            $pump['counters'] = $countersByPump[$pump['id']] ?? [];
        }

        return $pumps;
    }
}
