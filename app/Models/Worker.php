<?php

namespace App\Models;

use App\Core\Model;

class Worker extends Model
{
    public function getAll($stationId)
    {
        $stmt = $this->db->prepare("SELECT * FROM workers WHERE station_id = ? ORDER BY name ASC");
        $stmt->execute([$stationId]);
        return $stmt->fetchAll();
    }

    public function getAllActive($stationId = null)
    {
        if ($stationId) {
            return $this->getAll($stationId);
        }
        $stmt = $this->db->query("SELECT * FROM workers ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM workers WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO workers (station_id, name, phone, national_id) VALUES (:station_id, :name, :phone, :national_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null,
            ':national_id' => !empty($data['national_id']) ? $data['national_id'] : null
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE workers SET name = :name, phone = :phone, national_id = :national_id WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null,
            ':national_id' => !empty($data['national_id']) ? $data['national_id'] : null
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM workers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
