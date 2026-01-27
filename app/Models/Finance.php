<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Safe
{
    // Removed cached $db property

    public function __construct()
    {
        // No need to cache connection
    }

    public function getAll($stationId = null)
    {
        $db = Database::connect();
        if ($stationId && $stationId !== 'all') {
            $stmt = $db->prepare("SELECT * FROM safes WHERE station_id = ?");
            $stmt->execute([$stationId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return $db->query("SELECT * FROM safes")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM safes WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateBalance($id, $amount)
    {
        $db = Database::connect();
        // Amount can be negative
        $stmt = $db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }

    public function create($data)
    {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO safes (station_id, name, balance) VALUES (?, ?, ?)");
        $stmt->execute([$data['station_id'], $data['name'], $data['balance'] ?? 0]);
        return $db->lastInsertId();
    }
    public function update($id, $data)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE safes SET name = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $id]);
    }

    public function delete($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM safes WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

class Bank
{
    // Removed cached $db property

    public function __construct()
    {
        // No need to cache connection
    }

    public function getAll($stationId = null)
    {
        $db = Database::connect();
        if ($stationId && $stationId !== 'all') {
            $stmt = $db->prepare("SELECT *, bank_name as name FROM banks WHERE station_id = ?");
            $stmt->execute([$stationId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return $db->query("SELECT *, bank_name as name FROM banks")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT *, bank_name as name FROM banks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateBalance($id, $amount)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE banks SET balance = balance + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }

    public function create($data)
    {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO banks (station_id, bank_name, account_number, balance) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['station_id'], $data['name'], $data['account_number'], $data['balance'] ?? 0]);
        return $db->lastInsertId();
    }

    public function update($id, $data)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE banks SET bank_name = ?, account_number = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $data['account_number'], $id]);
    }

    public function delete($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM banks WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
