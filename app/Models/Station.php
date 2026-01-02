<?php

namespace App\Models;

use App\Core\Model;

class Station extends Model
{

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM stations ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM stations WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO stations (name, address, phone, logo_url) VALUES (:name, :address, :phone, :logo_url)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':address' => $data['address'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':logo_url' => $data['logo_url'] ?? ''
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE stations SET name = :name, address = :address, phone = :phone WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':address' => $data['address'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        // Check dependencies (optional: sales, tanks, etc. linked to station)
        // For now, strict delete
        $stmt = $this->db->prepare("DELETE FROM stations WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
