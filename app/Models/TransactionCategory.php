<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class TransactionCategory extends Model
{
    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM transaction_categories ORDER BY type, name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByType($type)
    {
        $stmt = $this->db->prepare("SELECT * FROM transaction_categories WHERE type = ? ORDER BY name");
        $stmt->execute([$type]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $type)
    {
        $stmt = $this->db->prepare("INSERT INTO transaction_categories (name, type) VALUES (?, ?)");
        return $stmt->execute([$name, $type]);
    }
}
