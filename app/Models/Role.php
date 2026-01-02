<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Role extends Model
{
    protected $table = 'roles';

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM {$this->table} ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} (name, description, permissions, is_system) 
                VALUES (:name, :description, :permissions, :is_system)";
        $stmt = $this->db->prepare($sql);
        
        $permissions = is_array($data['permissions']) ? json_encode($data['permissions']) : $data['permissions'];
        
        return $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':permissions' => $permissions,
            ':is_system' => $data['is_system'] ?? 0
        ]);
    }

    public function update($id, $data)
    {
        $sql = "UPDATE {$this->table} SET name = :name, description = :description, permissions = :permissions WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        $permissions = is_array($data['permissions']) ? json_encode($data['permissions']) : $data['permissions'];

        return $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':permissions' => $permissions,
            ':id' => $id
        ]);
    }

    public function delete($id)
    {
        // Don't delete system roles
        $stmt = $this->db->prepare("SELECT is_system FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $role = $stmt->fetch();

        if ($role && $role['is_system']) {
            return false; // Cannot delete system role
        }

        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
