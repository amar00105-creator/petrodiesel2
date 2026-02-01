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
        // Updated for simplified calibration system
        $stmt = $this->db->prepare("SELECT created_at FROM tank_calibrations WHERE tank_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$tankId]);
        return $stmt->fetchColumn();
    }
    public function getReadingAt($tankId, $date)
    {
        // Get the last reading from EITHER tank_readings OR tank_calibrations 
        // on or before the end of the given date.
        // We prioritize the most recent one overall.

        $targetDate = $date . ' 23:59:59';

        $sql = "SELECT volume FROM (
                    SELECT volume_liters as volume, created_at 
                    FROM tank_readings 
                    WHERE tank_id = ? AND created_at <= ?
                    
                    UNION ALL
                    
                    SELECT actual_quantity as volume, created_at 
                    FROM tank_calibrations 
                    WHERE tank_id = ? AND created_at <= ?
                ) as combined
                ORDER BY created_at DESC LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tankId, $targetDate, $tankId, $targetDate]);
        return $stmt->fetchColumn();
    } // End getReadingAt

    public function getReadingsByPeriod($start, $end, $stationId = 'all')
    {
        // Read from tank_calibrations (where calibration system saves data)
        // AND tank_readings for completeness
        $sql = "SELECT * FROM (
                    SELECT 
                        tc.id,
                        tc.tank_id,
                        tc.actual_quantity as reading_cm,
                        tc.actual_quantity as volume_liters,
                        'calibration' as reading_type,
                        tc.created_at,
                        t.name as tank_name,
                        u.name as user_name
                    FROM tank_calibrations tc
                    JOIN tanks t ON tc.tank_id = t.id
                    LEFT JOIN users u ON tc.user_id = u.id
                    WHERE tc.created_at BETWEEN ? AND ? " . ($stationId !== 'all' ? "AND t.station_id = ?" : "") . "
                    
                    UNION ALL
                    
                    SELECT 
                        tr.id,
                        tr.tank_id,
                        tr.volume_liters as reading_cm,
                        tr.volume_liters,
                        tr.reading_type,
                        tr.created_at,
                        t.name as tank_name,
                        u.name as user_name
                    FROM tank_readings tr
                    JOIN tanks t ON tr.tank_id = t.id
                    LEFT JOIN users u ON tr.user_id = u.id
                    WHERE tr.created_at BETWEEN ? AND ? " . ($stationId !== 'all' ? "AND t.station_id = ?" : "") . "
                ) as combined
                ORDER BY created_at DESC";

        $params = [$start . ' 00:00:00', $end . ' 23:59:59'];
        if ($stationId !== 'all') $params[] = $stationId;

        $params[] = $start . ' 00:00:00';
        $params[] = $end . ' 23:59:59';
        if ($stationId !== 'all') $params[] = $stationId;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDailyReadings($stationId, $start, $end)
    {
        // Get the ALL readings for the period from both tables
        // We will process them in PHP to find the last one per day
        $sql = "SELECT * FROM (
                    SELECT DATE(tr.created_at) as reading_date, tr.tank_id, tr.volume_liters, tr.created_at
                    FROM tank_readings tr
                    JOIN tanks t ON tr.tank_id = t.id
                    WHERE t.station_id = ? AND tr.created_at BETWEEN ? AND ?
                    
                    UNION ALL
                    
                    SELECT DATE(tc.created_at) as reading_date, tc.tank_id, tc.actual_quantity as volume_liters, tc.created_at
                    FROM tank_calibrations tc
                    JOIN tanks t ON tc.tank_id = t.id
                    WHERE t.station_id = ? AND tc.created_at BETWEEN ? AND ?
                ) as combined
                ORDER BY created_at DESC";

        $startFull = $start . ' 00:00:00';
        $endFull = $end . ' 23:59:59';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $stationId,
            $startFull,
            $endFull,
            $stationId,
            $startFull,
            $endFull
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
