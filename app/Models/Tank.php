<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Tank extends Model
{
    protected $table = 'tanks';

    public function getAll($stationId = null)
    {
        $sql = "SELECT t.*, ft.name as fuel_name, ft.name as product_type, ft.color_hex 
                FROM {$this->table} t
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE 1=1";

        $params = [];
        if ($stationId && $stationId !== 'all') {
            $sql .= " AND t.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY t.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $sql = "SELECT t.*, ft.name as fuel_name, ft.name as product_type, ft.color_hex 
                FROM {$this->table} t
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE t.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (station_id, name, fuel_type_id, capacity_liters, current_volume, current_price) 
                VALUES (:station_id, :name, :fuel_type_id, :capacity_liters, :current_volume, :current_price)";

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

        $params = [
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':fuel_type_id' => $data['fuel_type_id'],
            ':capacity_liters' => $data['capacity_liters'],
            ':current_volume' => $data['current_volume'],
            ':current_price' => $data['current_price']
        ];

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function update($id, $data)
    {
        // Filter allowed fields
        $allowed = ['name', 'fuel_type_id', 'capacity_liters', 'current_volume', 'current_price'];
        $fields = "";
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowed)) {
                $fields .= "$key = :$key, ";
                $params[":$key"] = $value;
            }
        }
        $fields = rtrim($fields, ", ");

        if (empty($fields)) return false;

        $stmt = $this->db->prepare("UPDATE {$this->table} SET $fields WHERE id = :id");
        return $stmt->execute($params);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // --- Specific Domain Logic ---

    /**
     * Update the current volume of the tank.
     * Use negative amount for sales, positive for offloading.
     */
    public function updateVolume($id, $amount)
    {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET current_volume = current_volume + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }

    /**
     * Get recent readings for this tank
     */
    public function getReadings($tankId, $limit = 10)
    {
        $stmt = $this->db->prepare("
            SELECT tr.*, u.name as user_name 
            FROM tank_readings tr
            LEFT JOIN users u ON tr.user_id = u.id
            WHERE tr.tank_id = ?
            ORDER BY tr.created_at DESC
            LIMIT $limit
        ");
        $stmt->execute([$tankId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Add a calibration reading and calculate variance
     */
    public function addReading($data)
    {
        // Calculate variance if not provided
        // Variance = Physical Reading (Volume) - System Volume
        // We need the current system volume *before* this reading implies any adjustment? 
        // Or is it just a record? Usually just a record.

        if (!isset($data['variance'])) {
            $tank = $this->find($data['tank_id']);
            if ($tank) {
                $systemVolume = $tank['current_volume'];
                $physicalVolume = $data['volume_liters'];
                $data['variance'] = $physicalVolume - $systemVolume;
            }
        }

        $sql = "INSERT INTO tank_readings (tank_id, user_id, reading_cm, volume_liters, variance, reading_type) 
                VALUES (:tank_id, :user_id, :reading_cm, :volume_liters, :variance, :reading_type)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }
    public function getLastCalibration($tankId)
    {
        // Assuming 'check' reading type implies a calibration check or dip
        $stmt = $this->db->prepare("SELECT created_at FROM tank_readings WHERE tank_id = ? AND reading_type = 'check' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$tankId]);
        return $stmt->fetchColumn();
    }
    public function getReadingAt($tankId, $date)
    {
        // Get the last reading on or before the end of the given date
        $sql = "SELECT volume_liters FROM tank_readings 
                WHERE tank_id = ? AND created_at <= ? 
                ORDER BY created_at DESC LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tankId, $date . ' 23:59:59']);
        return $stmt->fetchColumn();
    }
    public function getReadingsByPeriod($start, $end, $stationId = 'all')
    {
        $sql = "SELECT tr.*, t.name as tank_name, u.name as user_name 
                FROM tank_readings tr
                JOIN tanks t ON tr.tank_id = t.id
                LEFT JOIN users u ON tr.user_id = u.id
                WHERE tr.created_at BETWEEN ? AND ?";

        $params = [$start . ' 00:00:00', $end . ' 23:59:59'];

        if ($stationId !== 'all') {
            $sql .= " AND t.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY tr.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getDailyReadings($stationId, $start, $end)
    {
        // Get the latest reading (closing) for each day/tank
        $sql = "SELECT DATE(tr.created_at) as reading_date, tr.tank_id, tr.volume_liters 
                FROM tank_readings tr
                JOIN tanks t ON tr.tank_id = t.id
                WHERE t.station_id = ? AND tr.created_at BETWEEN ? AND ?
                AND tr.id IN (
                    SELECT MAX(id) FROM tank_readings 
                    WHERE created_at BETWEEN ? AND ?
                    GROUP BY DATE(created_at), tank_id
                )";

        // Use simpler query if subquery is heavy, but for now this ensures listing last reading of day.
        // Actually, let's just get all check/closing readings.
        $sql = "SELECT DATE(tr.created_at) as reading_date, tr.tank_id, tr.volume_liters, tr.reading_type 
                FROM tank_readings tr
                JOIN tanks t ON tr.tank_id = t.id
                WHERE t.station_id = ? AND tr.created_at BETWEEN ? AND ?
                ORDER BY tr.created_at DESC"; // We process in PHP to find the relevant 'closing' one.

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId, $start . ' 00:00:00', $end . ' 23:59:59']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
