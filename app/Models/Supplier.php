<?php

namespace App\Models;

use App\Core\Model;

class Supplier extends Model
{
    public function getAll($stationId = null)
    {
        $db = \App\Config\Database::connect();
        if ($stationId) {
            $stmt = $db->prepare("SELECT * FROM suppliers WHERE station_id = ? ORDER BY name ASC");
            $stmt->execute([$stationId]);
            return $stmt->fetchAll();
        }

        // Super Admin sees all
        $stmt = $db->query("SELECT * FROM suppliers ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM suppliers WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $db = \App\Config\Database::connect();
        // Fallback: If no station_id, get the first valid station from DB
        if (empty($data['station_id'])) {
            $stmt = $db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $fallback = $stmt->fetch();

            if ($fallback) {
                $data['station_id'] = $fallback['id'];
            } else {
                // If NO stations exist, create one to satisfy Foreign Key
                $db->exec("INSERT INTO stations (name, address, phone) VALUES ('Default Station', 'Main Location', '0000000000')");
                $data['station_id'] = $db->lastInsertId();
            }
        }

        if (empty($data['station_id'])) {
            // Should not happen now
            die("System Error: Critical Database Failure. Could not find or create a Station.");
        }

        $sql = "INSERT INTO suppliers (station_id, name, phone, balance) VALUES (:station_id, :name, :phone, :balance)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':phone' => $data['phone'] ?? '',
            ':balance' => $data['balance'] ?? 0.00
        ]);
        return $db->lastInsertId();
    }

    public function updateBalance($id, $amount)
    {
        $db = \App\Config\Database::connect();
        // Amount can be positive (we owe them more) or negative (we paid them)
        $stmt = $db->prepare("UPDATE suppliers SET balance = balance + :amount WHERE id = :id");
        $stmt->execute([':amount' => $amount, ':id' => $id]);
    }

    public function update($id, $data)
    {
        $db = \App\Config\Database::connect();
        $sql = "UPDATE suppliers SET name = :name, phone = :phone WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("DELETE FROM suppliers WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
