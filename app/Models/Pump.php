<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Pump {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function getAll() {
        // Get pumps with Tank name and Station info
        $sql = "SELECT p.*, t.name as tank_name, t.product_type 
                FROM pumps p 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                ORDER BY p.name";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id) {
        $sql = "SELECT p.*, t.name as tank_name FROM pumps p LEFT JOIN tanks t ON p.tank_id = t.id WHERE p.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create Pump and return ID
    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO pumps (station_id, tank_id, name) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['station_id'],
            $data['tank_id'],
            $data['name']
        ]);
        return $this->db->lastInsertId();
    }

    // Add Counters to a Pump
    public function addCounters($pumpId, $count, $data = []) {
        $stmt = $this->db->prepare("INSERT INTO counters (pump_id, name, current_reading, current_worker_id) VALUES (?, ?, ?, ?)");
        
        for ($i = 0; $i < $count; $i++) {
            $name = "Nozzle " . ($i + 1);
            $reading = isset($data[$i]['reading']) ? $data[$i]['reading'] : 0;
            $workerId = isset($data[$i]['worker_id']) ? $data[$i]['worker_id'] : null;
            
            $stmt->execute([$pumpId, $name, $reading, $workerId]);
        }
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM pumps WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getPumpsWithCounters($stationId) {
        // 1. Get Pumps
        $sql = "SELECT p.*, t.name as tank_name, t.product_type 
                FROM pumps p 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                WHERE p.station_id = ?
                ORDER BY p.name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        $pumps = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($pumps)) {
            return [];
        }

        // 2. Get Counters with Worker Names
        $pumpIds = array_column($pumps, 'id');
        $placeholders = implode(',', array_fill(0, count($pumpIds), '?'));
        
        $sqlCounters = "SELECT c.*, w.name as worker_name 
                        FROM counters c 
                        LEFT JOIN workers w ON c.current_worker_id = w.id 
                        WHERE c.pump_id IN ($placeholders) 
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
