<?php

namespace App\Models;

use App\Core\Model;

class Supplier extends Model
{
    public function getAll($stationId)
    {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE station_id = ? ORDER BY name ASC");
        $stmt->execute([$stationId]);
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO suppliers (station_id, name, phone, balance) VALUES (:station_id, :name, :phone, :balance)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null,
            ':balance' => $data['balance'] ?? 0.00
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
         $sql = "UPDATE suppliers SET name = :name, phone = :phone WHERE id = :id";
         $stmt = $this->db->prepare($sql);
         return $stmt->execute([
             ':id' => $id,
             ':name' => $data['name'],
             ':phone' => !empty($data['phone']) ? $data['phone'] : null
         ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM suppliers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function updateBalance($id, $amount)
    {
        // Amount can be positive (we owe them more) or negative (we paid them)
        $stmt = $this->db->prepare("UPDATE suppliers SET balance = balance + :amount WHERE id = :id");
        $stmt->execute([':amount' => $amount, ':id' => $id]);
    }
}
