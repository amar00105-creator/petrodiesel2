<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Safe {
    private $db;

    public function __construct() { $this->db = Database::connect(); }

    public function getAll() {
        return $this->db->query("SELECT * FROM safes")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id) {
        $stmt = $this->db->prepare("SELECT * FROM safes WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateBalance($id, $amount) {
        // Amount can be negative
        $stmt = $this->db->prepare("UPDATE safes SET balance = balance + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO safes (station_id, name, balance) VALUES (?, ?, ?)");
        $stmt->execute([$data['station_id'], $data['name'], $data['balance'] ?? 0]);
        return $this->db->lastInsertId();
    }
}

class Bank {
    private $db;

    public function __construct() { $this->db = Database::connect(); }

    public function getAll() {
        return $this->db->query("SELECT * FROM banks")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateBalance($id, $amount) {
        $stmt = $this->db->prepare("UPDATE banks SET balance = balance + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO banks (station_id, name, account_number, balance) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['station_id'], $data['name'], $data['account_number'], $data['balance'] ?? 0]);
        return $this->db->lastInsertId();
    }
}
