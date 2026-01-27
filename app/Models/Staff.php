<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Staff extends Model
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
        $sql = "INSERT INTO users (station_id, name, email, password_hash, google_id, role, status) 
                VALUES (:station_id, :name, :email, :password_hash, :google_id, :role, :status)";

        // Robust Fallback for Station ID
        if (empty($data['station_id'])) {
            $stmt = $this->db->query("SELECT id FROM stations ORDER BY id ASC LIMIT 1");
            $fallback = $stmt->fetch();

            if ($fallback) {
                $data['station_id'] = $fallback['id'];
            } else {
                // Auto-Create Station if missing
                $this->db->exec("INSERT INTO stations (name, address, phone) VALUES ('Default Station', 'Main Location', '0000000000')");
                $data['station_id'] = $this->db->lastInsertId();
            }
        }

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password_hash' => $data['password_hash'] ?? null, // Can be null if using Google only
            ':google_id' => $data['google_id'] ?? null,
            ':role' => $data['role'] ?? 'viewer',
            ':status' => 'active'
        ]);

        return $this->db->lastInsertId();
    }
    public function getAll($stationId = null)
    {
        $sql = "SELECT id, name, email, role, status FROM users";
        $params = [];

        if ($stationId && $stationId !== 'all') {
            $sql .= " WHERE station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT id, name, email, role, status, station_id FROM users WHERE id = ?");
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
