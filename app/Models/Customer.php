<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Customer extends Model
{
    public function getAll($stationId = null)
    {
        // Customers are Global - fetch all
        $sql = "SELECT * FROM customers ORDER BY name ASC";
        $stmt = $this->db->query($sql);
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
        // Station ID is optional (Global Customers)
        $stationId = !empty($data['station_id']) ? $data['station_id'] : null;

        $sql = "INSERT INTO customers (station_id, name, phone) 
                VALUES (:station_id, :name, :phone)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $stationId,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE customers SET name = :name, phone = :phone WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM customers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function updateBalance($id, $amount)
    {
        $stmt = $this->db->prepare("UPDATE customers SET balance = balance + :amount WHERE id = :id");
        $stmt->execute([':amount' => $amount, ':id' => $id]);
    }
}
