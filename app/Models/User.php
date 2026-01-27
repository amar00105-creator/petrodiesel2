<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class User extends Model
{

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO users (station_id, name, email, password_hash, google_id, role, role_id, status) 
                VALUES (:station_id, :name, :email, :password_hash, :google_id, :role, :role_id, :status)";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':station_id' => $data['station_id'] ?? null,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password_hash' => $data['password_hash'] ?? null,
            ':google_id' => $data['google_id'] ?? null,
            ':role' => $data['role'] ?? 'viewer',
            ':role_id' => $data['role_id'] ?? null,
            ':status' => 'active'
        ]);

        return $this->db->lastInsertId();
    }
    public function getAll($stationId = null)
    {
        $sql = "SELECT u.id, u.name, u.email, u.role, u.role_id, u.status, r.name as role_name 
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id";
        $params = [];

        if ($stationId) {
            $sql .= " WHERE u.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY u.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [];

        // Dynamic update to handle password or no password
        if (!empty($data['name'])) {
            $fields[] = "name = ?";
            $params[] = $data['name'];
        }
        if (!empty($data['email'])) {
            $fields[] = "email = ?";
            $params[] = $data['email'];
        }
        if (!empty($data['role'])) {
            $fields[] = "role = ?";
            $params[] = $data['role'];
        }
        if (!empty($data['password_hash'])) {
            $fields[] = "password_hash = ?";
            $params[] = $data['password_hash'];
        }
        if (!empty($data['status'])) {
            $fields[] = "status = ?";
            $params[] = $data['status'];
        }
        if (array_key_exists('role_id', $data)) {
            $fields[] = "role_id = ?";
            $params[] = $data['role_id'];
        }
        if (array_key_exists('station_id', $data)) {
            $fields[] = "station_id = ?";
            $params[] = $data['station_id'];
        }

        if (empty($fields)) return false;

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
