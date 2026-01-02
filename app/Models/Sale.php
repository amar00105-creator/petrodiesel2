<?php

namespace App\Models;

use App\Core\Model;

class Sale extends Model
{
    public function getAll($stationId, $filters = [])
    {
        $sql = "SELECT s.*, c.name as counter_name, p.name as pump_name, w.name as worker_name
                FROM sales s
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN workers w ON s.worker_id = w.id
                WHERE s.station_id = ? ";

        $params = [$stationId];

        if (!empty($filters['date'])) {
            $sql .= " AND s.sale_date = ?";
            $params[] = $filters['date'];
        }

        $sql .= " ORDER BY s.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getSalesByWorker($stationId, $workerId, $dateRange = [])
    {
        $sql = "SELECT SUM(total_amount) as total_sales, COUNT(*) as count 
                FROM sales 
                WHERE station_id = ? AND worker_id = ?";

        $params = [$stationId, $workerId];

        if (!empty($dateRange['start']) && !empty($dateRange['end'])) {
            $sql .= " AND sale_date BETWEEN ? AND ?";
            $params[] = $dateRange['start'];
            $params[] = $dateRange['end'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO sales (
                    station_id, counter_id, worker_id, user_id,
                    opening_reading, closing_reading, volume_sold,
                    unit_price, total_amount, payment_method, customer_id,
                    shift, sale_date
                ) VALUES (
                    :station_id, :counter_id, :worker_id, :user_id,
                    :opening_reading, :closing_reading, :volume_sold,
                    :unit_price, :total_amount, :payment_method, :customer_id,
                    :shift, :sale_date
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':counter_id' => $data['counter_id'],
            ':worker_id' => $data['worker_id'] ?? null,
            ':user_id' => $data['user_id'],
            ':opening_reading' => $data['opening_reading'],
            ':closing_reading' => $data['closing_reading'],
            ':volume_sold' => $data['volume_sold'],
            ':unit_price' => $data['unit_price'],
            ':total_amount' => $data['total_amount'],
            ':payment_method' => $data['payment_method'] ?? 'cash',
            ':customer_id' => $data['customer_id'] ?? null,
            ':shift' => $data['shift'] ?? 'Morning',
            ':sale_date' => $data['sale_date'] ?? date('Y-m-d')
        ]);

        return $this->db->lastInsertId();
    }
}
