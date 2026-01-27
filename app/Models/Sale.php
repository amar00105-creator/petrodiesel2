<?php

namespace App\Models;

use App\Core\Model;

class Sale extends Model
{
    public function getAll($stationId, $filters = [])
    {
        $sql = "SELECT s.*, 
                       c.name as counter_name, 
                       p.name as pump_name, 
                       w.name as worker_name,
                       cust.name as customer_name,
                       safes.name as safe_name,
                       banks.bank_name as bank_name
                FROM sales s
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN workers w ON s.worker_id = w.id
                LEFT JOIN customers cust ON s.customer_id = cust.id
                LEFT JOIN transactions t ON (t.related_entity_id = s.id AND t.related_entity_type = 'sales' AND t.type = 'income')
                LEFT JOIN safes ON (t.to_type = 'safe' AND t.to_id = safes.id)
                LEFT JOIN banks ON (t.to_type = 'bank' AND t.to_id = banks.id)
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
                    shift, sale_date, invoice_number
                ) VALUES (
                    :station_id, :counter_id, :worker_id, :user_id,
                    :opening_reading, :closing_reading, :volume_sold,
                    :unit_price, :total_amount, :payment_method, :customer_id,
                    :shift, :sale_date, :invoice_number
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
            ':sale_date' => $data['sale_date'] ?? date('Y-m-d'),
            ':invoice_number' => $data['invoice_number'] ?? null
        ]);

        return $this->db->lastInsertId();
    }
    public function getOne($id)
    {
        $sql = "SELECT s.*, 
                       c.name as counter_name,
                       c.pump_id, 
                       p.name as pump_name, 
                       w.name as worker_name,
                       cust.name as customer_name,
                       safes.name as safe_name,
                       banks.bank_name as bank_name,
                       t.to_type as account_type,
                       t.to_id as account_id
                FROM sales s
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN workers w ON s.worker_id = w.id
                LEFT JOIN customers cust ON s.customer_id = cust.id
                LEFT JOIN transactions t ON (t.related_entity_id = s.id AND t.related_entity_type = 'sales' AND t.type = 'income')
                LEFT JOIN safes ON (t.to_type = 'safe' AND t.to_id = safes.id)
                LEFT JOIN banks ON (t.to_type = 'bank' AND t.to_id = banks.id)
                WHERE s.id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    public function getStatsByPeriod($start, $end, $stationId = 'all')
    {
        $sql = "SELECT SUM(total_amount) as total_revenue, SUM(volume_sold) as total_liters, COUNT(*) as count 
                FROM sales 
                WHERE sale_date BETWEEN ? AND ?";

        $params = [$start, $end];
        if ($stationId !== 'all') {
            $sql .= " AND station_id = ?";
            $params[] = $stationId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    public function getSalesByProduct($start, $end, $stationId = 'all')
    {
        $sql = "SELECT ft.name as product_name, ft.color_hex, SUM(s.total_amount) as total_revenue, SUM(s.volume_sold) as total_liters 
                FROM sales s
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                WHERE s.sale_date BETWEEN ? AND ?";

        $params = [$start, $end];
        if ($stationId !== 'all') {
            $sql .= " AND s.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " GROUP BY ft.id ORDER BY total_revenue DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    public function getWorkerPerformance($start, $end, $stationId = 'all')
    {
        $sql = "SELECT w.name as worker_name, count(s.id) as shifts_count, SUM(s.total_amount) as total_sales, SUM(s.volume_sold) as total_volume
                FROM sales s
                LEFT JOIN workers w ON s.worker_id = w.id
                WHERE s.sale_date BETWEEN ? AND ? AND w.name IS NOT NULL";

        $params = [$start, $end];

        if ($stationId !== 'all') {
            $sql .= " AND s.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " GROUP BY s.worker_id ORDER BY total_sales DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    public function getVolumeByTank($tankId, $start, $end)
    {
        $sql = "SELECT SUM(s.volume_sold) 
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                WHERE p.tank_id = ? AND s.sale_date BETWEEN ? AND ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tankId, $start, $end]);
        return $stmt->fetchColumn() ?: 0;
    }
    public function getDailySalesByTank($stationId, $start, $end)
    {
        $sql = "SELECT s.sale_date, p.tank_id, SUM(s.volume_sold) as total_vol 
                FROM sales s
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps mp ON c.pump_id = mp.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                WHERE s.station_id = ? AND s.sale_date BETWEEN ? AND ?
                GROUP BY s.sale_date, p.tank_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId, $start, $end]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // --- Helpers for Financial Flow Report ---

    // Option B: Daily Total for specific account
    public function getDailySalesForFinancial($accountType, $accountId, $start, $end)
    {
        $sql = "SELECT s.sale_date as date, SUM(t.amount) as total_amount, COUNT(s.id) as count
                FROM transactions t
                JOIN sales s ON t.related_entity_id = s.id AND t.related_entity_type = 'sales'
                WHERE t.to_type = ? AND t.to_id = ? AND s.sale_date BETWEEN ? AND ?
                GROUP BY s.sale_date
                ORDER BY s.sale_date ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$accountType, $accountId, $start, $end]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Option C: Group by Fuel Type for specific account
    public function getFuelSalesForFinancial($accountType, $accountId, $start, $end)
    {
        $sql = "SELECT s.sale_date as date, ft.name as fuel_name, ft.color_hex, SUM(t.amount) as total_amount, COUNT(s.id) as count
                FROM transactions t
                JOIN sales s ON t.related_entity_id = s.id AND t.related_entity_type = 'sales'
                JOIN counters c ON s.counter_id = c.id
                JOIN pumps p ON c.pump_id = p.id
                JOIN tanks tank ON p.tank_id = tank.id
                JOIN fuel_types ft ON tank.fuel_type_id = ft.id
                WHERE t.to_type = ? AND t.to_id = ? AND s.sale_date BETWEEN ? AND ?
                GROUP BY s.sale_date, ft.id /* Group by ID to handle same names correctly, though name is selected */
                ORDER BY s.sale_date ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$accountType, $accountId, $start, $end]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
