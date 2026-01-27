<?php

namespace App\Models;

use App\Core\Model;

class Driver extends Model
{
    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM drivers ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM drivers WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function findByName($name)
    {
        $stmt = $this->db->prepare("SELECT * FROM drivers WHERE name LIKE :name LIMIT 1");
        $stmt->bindValue(':name', "%$name%");
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO drivers (name, truck_number, phone) VALUES (:name, :truck_number, :phone)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':truck_number' => $data['truck_number'],
            ':phone' => $data['phone'] ?? ''
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE drivers SET name = :name, truck_number = :truck_number, phone = :phone WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':truck_number' => $data['truck_number'],
            ':phone' => $data['phone'] ?? '',
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM drivers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
