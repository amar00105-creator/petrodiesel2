<?php

namespace App\Models;

use App\Core\Model;

class Customer extends Model
{
    public function getAll($stationId = null)
    {
        // If station_id is relevant for customers, filter by it. 
        // For now, assuming customers might be global or station-specific.
        // Let's assume station-specific for safety.
        if ($stationId) {
            $stmt = $this->db->prepare("SELECT * FROM customers WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            return $stmt->fetchAll();
        }
        
        $stmt = $this->db->query("SELECT * FROM customers ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO customers (station_id, name, phone, address, notes) 
                VALUES (:station_id, :name, :phone, :address, :notes)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'] ?? null,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null,
            ':address' => !empty($data['address']) ? $data['address'] : null,
            ':notes' => !empty($data['notes']) ? $data['notes'] : null
        ]);
        
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE customers SET name = :name, phone = :phone, address = :address, notes = :notes WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null,
            ':address' => !empty($data['address']) ? $data['address'] : null,
            ':notes' => !empty($data['notes']) ? $data['notes'] : null
        ]);
    }
    
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM customers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
