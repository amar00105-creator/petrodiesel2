<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Tank extends Model
{
    protected $table = 'tanks';

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM {$this->table} ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (station_id, name, product_type, capacity_liters, current_volume, current_price) 
                VALUES (:station_id, :name, :product_type, :capacity_liters, :current_volume, :current_price)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    public function update($id, $data)
    {
        $fields = "";
        foreach ($data as $key => $value) {
            $fields .= "$key = :$key, ";
        }
        $fields = rtrim($fields, ", ");

        $data['id'] = $id;
        $stmt = $this->db->prepare("UPDATE {$this->table} SET $fields WHERE id = :id");
        return $stmt->execute($data);
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
}
