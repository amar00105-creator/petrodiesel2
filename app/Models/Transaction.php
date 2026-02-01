<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Transaction extends Model
{
    protected $table = 'transactions';

    public function create($data)
    {
        $sql = "INSERT INTO transactions 
                (station_id, type, amount, category_id, from_type, from_id, to_type, to_id, related_entity_type, related_entity_id, description, reference_number, date, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
            $data['reference_number'] ?? null,
            $data['date'] ?? date('Y-m-d'),
            $data['created_by'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function getTotalsByPeriod($start, $end, $stationId = 'all')
    {
        $sql = "SELECT type, SUM(amount) as total FROM transactions WHERE date BETWEEN ? AND ?";
        $params = [$start, $end];

        if ($stationId !== 'all') {
            $sql .= " AND station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " GROUP BY type";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totals = ['income' => 0, 'expense' => 0];

        foreach ($results as $row) {
            $totals[$row['type']] = $row['total'];
        }

        return $totals;
    }

    // Advanced search for history
    public function getHistory($stationId, $limit = 500)
    {
        try {
            return $this->_getHistory($stationId, $limit);
        } catch (\PDOException $e) {
            // Check for "Server has gone away" error codes (2006, 2013)
            if ($e->errorInfo[1] == 2006 || $e->errorInfo[1] == 2013) {
                // If using Model parent, we might not have a public reconnect method on $this->db easily unless we added it to Database class.
                // Assuming standard PDO behavior or ignoring reconnect for now to keep it simple as Model usually handles init.
                // Re-throw or ignore. Let's just try again or assume connection is alive.
                // If we really need reconnect, we'd need access to Database::connect() which caused issues.
                throw $e;
            }
            throw $e;
        }
    }

    private function _getHistory($stationId, $limit)
    {
        $sql = "SELECT t.*, 
                    u.name as user_name,
                    c.name as category_name
                FROM transactions t 
                LEFT JOIN users u ON t.created_by = u.id
                LEFT JOIN transaction_categories c ON t.category_id = c.id
                WHERE t.station_id = ? 
                ORDER BY t.created_at DESC, t.id DESC
                LIMIT $limit";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getReport($stationId, $filters = [])
    {
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

    public function getByAccount($type, $id, $limit = 500, $startDate = null, $endDate = null)
    {
        $sql = "SELECT t.*, 
                       c.name as category_name, 
                       u.name as user_name,
                       ft.name as fuel_name,
                       tk.name as tank_name
                FROM transactions t
                LEFT JOIN transaction_categories c ON t.category_id = c.id
                LEFT JOIN users u ON t.created_by = u.id
                LEFT JOIN sales s ON (t.related_entity_type = 'sales' AND t.related_entity_id = s.id)
                LEFT JOIN counters co ON s.counter_id = co.id
                LEFT JOIN pumps p ON co.pump_id = p.id
                LEFT JOIN tanks tk ON p.tank_id = tk.id
                LEFT JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                WHERE ((t.from_type = ? AND t.from_id = ?) 
                   OR (t.to_type = ? AND t.to_id = ?))";

        $params = [$type, $id, $type, $id];

        // Add date filtering if provided - use created_at for accuracy
        if ($startDate && $endDate) {
            $sql .= " AND DATE(t.created_at) BETWEEN ? AND ?";
            $params[] = $startDate;
            $params[] = $endDate;
        }

        $sql .= " ORDER BY t.created_at DESC, t.id DESC LIMIT $limit";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $data)
    {
        $sql = "UPDATE transactions SET 
                    amount = ?, 
                    description = ?, 
                    date = ?, 
                    category_id = ? 
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['amount'],
            $data['description'],
            $data['date'],
            $data['category_id'] ?? null,
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM transactions WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
