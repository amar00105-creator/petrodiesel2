<?php

namespace App\Models;

use App\Core\Model;

class Customer extends Model
{
    public function getAll($stationId = null)
    {
        $db = \App\Config\Database::connect();
        $sql = "SELECT * FROM customers";
        $params = [];

        if ($stationId !== null) {
            $sql .= " WHERE station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY name ASC";

        if (!empty($params)) {
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        } else {
            // Super Admin sees all
            $stmt = $db->query($sql);
        }

        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $db = \App\Config\Database::connect();
        // Robust Fallback for Station ID
        if (empty($data['station_id'])) {
            $stmt = $db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $fallback = $stmt->fetch();

            if ($fallback) {
                $data['station_id'] = $fallback['id'];
            } else {
                // Auto-Create Station if missing
                $db->exec("INSERT INTO stations (name, address, phone) VALUES ('Default Station', 'Main Location', '0000000000')");
                $data['station_id'] = $db->lastInsertId();
            }
        }

        $sql = "INSERT INTO customers (station_id, name, phone) 
                VALUES (:station_id, :name, :phone)";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null
        ]);

        return $db->lastInsertId();
    }

    public function update($id, $data)
    {
        $db = \App\Config\Database::connect();
        $sql = "UPDATE customers SET name = :name, phone = :phone WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':phone' => !empty($data['phone']) ? $data['phone'] : null
        ]);
    }

    public function delete($id)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("DELETE FROM customers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function updateBalance($id, $amount)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("UPDATE customers SET balance = balance + :amount WHERE id = :id");
        $stmt->execute([':amount' => $amount, ':id' => $id]);
    }
}
