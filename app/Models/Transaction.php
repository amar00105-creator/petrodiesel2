<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Transaction {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function create($data) {
        $sql = "INSERT INTO transactions 
                (station_id, type, amount, category_id, from_type, from_id, to_type, to_id, related_entity_type, related_entity_id, description, date, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['station_id'],
            $data['type'],
            $data['amount'],
            $data['category_id'] ?? null,
            $data['from_type'] ?? null,
            $data['from_id'] ?? null,
            $data['to_type'] ?? null,
            $data['to_id'] ?? null,
            $data['related_entity_type'] ?? null,
            $data['related_entity_id'] ?? null,
            $data['description'] ?? '',
            $data['date'] ?? date('Y-m-d'),
            $data['created_by'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }

    // Advanced search for history
    public function getHistory($stationId, $limit = 50) {
        $sql = "SELECT t.*, 
                    u.name as user_name,
                    c.name as category_name
                FROM transactions t 
                LEFT JOIN users u ON t.created_by = u.id
                LEFT JOIN transaction_categories c ON t.category_id = c.id
                WHERE t.station_id = ? 
                ORDER BY t.created_at DESC 
                LIMIT $limit";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getReport($stationId, $filters = []) {
        $sql = "SELECT t.*, c.name as category_name 
                FROM transactions t
                LEFT JOIN transaction_categories c ON t.category_id = c.id
                WHERE t.station_id = ?";
        
        $params = [$stationId];

        if (!empty($filters['start_date'])) {
            $sql .= " AND t.date >= ?";
            $params[] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $sql .= " AND t.date <= ?";
            $params[] = $filters['end_date'];
        }

        if (!empty($filters['type'])) {
            $sql .= " AND t.type = ?"; // transfer, expense, income
            $params[] = $filters['type'];
        }

        $sql .= " ORDER BY t.date DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
