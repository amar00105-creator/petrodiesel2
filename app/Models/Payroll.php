<?php

namespace App\Models;

use App\Core\Model;

class Payroll extends Model
{
    public function getSalary($entityType, $entityId)
    {
        $stmt = $this->db->prepare("SELECT amount FROM salaries WHERE entity_type = ? AND entity_id = ?");
        $stmt->execute([$entityType, $entityId]);
        return $stmt->fetchColumn() ?: 0;
    }

    public function setSalary($entityType, $entityId, $amount)
    {
        // Upsert
        $stmt = $this->db->prepare("
            INSERT INTO salaries (entity_type, entity_id, amount) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        ");
        return $stmt->execute([$entityType, $entityId, $amount]);
    }

    public function addEntry($data)
    {
        $sql = "INSERT INTO payroll_entries (entity_type, entity_id, type, amount, notes, date, created_by) 
                VALUES (:entity_type, :entity_id, :type, :amount, :notes, :date, :created_by)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':entity_type' => $data['entity_type'],
            ':entity_id' => $data['entity_id'],
            ':type' => $data['type'],
            ':amount' => $data['amount'],
            ':notes' => $data['notes'],
            ':date' => $data['date'],
            ':created_by' => $data['created_by']
        ]);

        return $this->db->lastInsertId();
    }

    public function getEntries($entityType, $entityId, $month = null, $year = null)
    {
        $sql = "SELECT * FROM payroll_entries WHERE entity_type = ? AND entity_id = ?";
        $params = [$entityType, $entityId];

        if ($month && $year) {
            $sql .= " AND MONTH(date) = ? AND YEAR(date) = ?";
            $params[] = $month;
            $params[] = $year;
        }

        $sql .= " ORDER BY date DESC, id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Get summary for a specific month for all staff or specific
    public function getMonthlySummary($month, $year)
    {
        // This is complex. We need list of all staff, their base salary, and sum of their transactions for the month.
        // For simplicity, let's just return transactions for now, and filtering happens in PHP or via separate calls.

        $stmt = $this->db->prepare("
            SELECT entity_type, entity_id, type, SUM(amount) as total 
            FROM payroll_entries 
            WHERE MONTH(date) = ? AND YEAR(date) = ?
            GROUP BY entity_type, entity_id, type
        ");
        $stmt->execute([$month, $year]);
        return $stmt->fetchAll();
    }

    public function getWorkerPayrollSummary($start, $end, $stationId = 'all')
    {
        // Aggregates deductions (khusumat) and bonuses (hawafiz) for workers
        $sql = "SELECT entity_id as worker_id, type, SUM(amount) as total_amount
                FROM payroll_entries
                WHERE entity_type = 'worker' 
                AND date BETWEEN ? AND ?";

        $params = [$start, $end];

        // Note: Payroll entries don't have station_id directly. 
        // We rely on the fact that workers belong to a station. 
        // Ideally we join workers table.
        if ($stationId !== 'all') {
            $sql .= " AND entity_id IN (SELECT id FROM workers WHERE station_id = ?)";
            $params[] = $stationId;
        }

        $sql .= " GROUP BY entity_id, type";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
