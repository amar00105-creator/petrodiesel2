<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Supplier extends Model
{
    public function getAll($stationId = null)
    {
        // Suppliers are now global - ignore station filter
        // $stationId parameter kept for backward compatibility but not used
        $stmt = $this->db->query("SELECT * FROM suppliers ORDER BY name ASC");
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
        // Re-enabling station_id to fix FK constraint
        $sql = "INSERT INTO suppliers (name, phone, balance, station_id) VALUES (:name, :phone, :balance, :station_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'] ?? '',
            ':balance' => $data['balance'] ?? 0.00,
            ':station_id' => $data['station_id']
        ]);
        return $this->db->lastInsertId();
    }

    public function updateBalance($id, $amount)
    {
        // Amount can be positive (we owe them more) or negative (we paid them)
        $stmt = $this->db->prepare("UPDATE suppliers SET balance = balance + :amount WHERE id = :id");
        $stmt->execute([':amount' => $amount, ':id' => $id]);
    }

    public function update($id, $data)
    {
        // Update logic assumes data keys match allow list or explicit bind
        $sql = "UPDATE suppliers SET name = :name, phone = :phone WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'] ?? '',
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM suppliers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
