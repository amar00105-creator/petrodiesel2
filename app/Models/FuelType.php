<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class FuelType extends Model
{
    protected $table = 'fuel_types';

    public function getAll()
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->query("SELECT * FROM {$this->table} ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $db = \App\Config\Database::connect();
        $sql = "INSERT INTO {$this->table} (name, code, color_hex, price_per_liter) 
                VALUES (:name, :code, :color_hex, :price_per_liter)";
        $stmt = $db->prepare($sql);

        return $stmt->execute([
            ':name' => $data['name'],
            ':code' => $data['code'] ?? strtolower(str_replace(' ', '_', $data['name'])),
            ':color_hex' => $data['color_hex'] ?? '#64748b',
            ':price_per_liter' => $data['price_per_liter'] ?? 0.00
        ]);
    }

    public function update($id, $data)
    {
        $db = \App\Config\Database::connect();
        $sql = "UPDATE {$this->table} SET 
                name = :name, 
                color_hex = :color_hex, 
                price_per_liter = :price_per_liter 
                WHERE id = :id";

        $stmt = $db->prepare($sql);

        return $stmt->execute([
            ':name' => $data['name'],
            ':color_hex' => $data['color_hex'],
            ':price_per_liter' => $data['price_per_liter'],
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        $db = \App\Config\Database::connect();
        // Check for usage in tanks first (Foreign key will also prevent this, but cleaner to check)
        $stmt = $db->prepare("SELECT COUNT(*) FROM tanks WHERE fuel_type_id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() > 0) {
            return false; // Cannot delete, in use
        }

        $stmt = $db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function findByCode($code)
    {
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM {$this->table} WHERE code = ?");
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
