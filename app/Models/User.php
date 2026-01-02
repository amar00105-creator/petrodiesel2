<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class User extends Model
{

    public function getAll($stationId = null)
    {
        if ($stationId) {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE station_id = :station_id AND status = 'active' ORDER BY name ASC");
            $stmt->execute([':station_id' => $stationId]);
        } else {
            $stmt = $this->db->query("SELECT * FROM users WHERE status = 'active' ORDER BY name ASC");
        }
        return $stmt->fetchAll();
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO users (station_id, name, email, password_hash, google_id, role, status) 
                VALUES (:station_id, :name, :email, :password_hash, :google_id, :role, :status)";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':station_id' => $data['station_id'] ?? null,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password_hash' => !empty($data['password_hash']) ? $data['password_hash'] : null,
            ':google_id' => !empty($data['google_id']) ? $data['google_id'] : null,
            ':role' => $data['role'] ?? 'viewer',
            ':status' => 'active'
        ]);

        return $this->db->lastInsertId();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function update($id, $data)
    {
        // Password update logic handled separately or conditionally
        $sql = "UPDATE users SET name = :name, email = :email, role = :role, status = :status WHERE id = :id";
        $params = [
            ':id' => $id,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':role' => $data['role'] ?? 'viewer',
            ':status' => $data['status'] ?? 'active'
        ];

        if (!empty($data['password_hash'])) {
            $sql = "UPDATE users SET name = :name, email = :email, role = :role, status = :status, password_hash = :password_hash WHERE id = :id";
            $params[':password_hash'] = $data['password_hash'];
        }

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
