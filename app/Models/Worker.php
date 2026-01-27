<?php

namespace App\Models;

use App\Core\Model;

class Worker extends Model
{
    public function getAll($stationId = null)
    {
        if ($stationId && $stationId !== 'all') {
            $stmt = $this->db->prepare("SELECT * FROM workers WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            return $stmt->fetchAll();
        }

        // Super Admin
        $stmt = $this->db->query("SELECT * FROM workers ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function checkDuplicate($stationId, $name)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM workers WHERE station_id = ? AND name = ?");
        $stmt->execute([$stationId, $name]);
        return $stmt->fetchColumn() > 0;
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

        $sql = "INSERT INTO workers (station_id, name, phone, national_id) VALUES (:station_id, :name, :phone, :national_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':phone' => $data['phone'] ?? '',
            ':national_id' => $data['national_id'] ?? ''
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE workers SET name = :name, phone = :phone, status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':status' => $data['status'],
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM workers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
