<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class TransactionCategory
{
    // Removed cached $db property

    public function __construct()
    {
        // No need to cache connection
    }

    public function getAll()
    {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM transaction_categories ORDER BY type, name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByType($type)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM transaction_categories WHERE type = ? ORDER BY name");
        $stmt->execute([$type]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $type)
    {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO transaction_categories (name, type) VALUES (?, ?)");
        return $stmt->execute([$name, $type]);
    }
}
