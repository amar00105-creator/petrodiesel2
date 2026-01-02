<?php

namespace App\Models;

use App\Core\Model;

class Expense extends Model
{
    public function getAll($stationId)
    {
        $stmt = $this->db->prepare("SELECT * FROM expenses WHERE station_id = ? ORDER BY expense_date DESC");
        $stmt->execute([$stationId]);
        return $stmt->fetchAll();
    }

    public function create($data)
    {
        $sql = "INSERT INTO expenses (
                    station_id, category, description, amount, 
                    user_id, source_type, source_id, expense_date
                ) VALUES (
                    :station_id, :category, :description, :amount,
                    :user_id, :source_type, :source_id, :expense_date
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':category' => $data['category'],
            ':description' => $data['description'] ?? '',
            ':amount' => $data['amount'],
            ':user_id' => $data['user_id'],
            ':source_type' => $data['source_type'],
            ':source_id' => $data['source_id'],
            ':expense_date' => $data['expense_date'] ?? date('Y-m-d')
        ]);

        return $this->db->lastInsertId();
    }
}
