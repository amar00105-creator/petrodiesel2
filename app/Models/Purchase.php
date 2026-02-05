<?php

namespace App\Models;

use App\Core\Model;

class Purchase extends Model
{
    public function getAll($stationId)
    {
        $sql = "SELECT p.*, 
                       s.name as supplier_name, 
                       t.name as tank_name, 
                       ft.name as fuel_type_name,
                       d.name as driver_name_resolved
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN drivers d ON p.driver_id = d.id 
                LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
                WHERE p.station_id = ? 
                ORDER BY p.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $sql = "SELECT p.*, s.name as supplier_name, s.phone as supplier_phone 
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                WHERE p.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO purchases (
                    station_id, supplier_id, tank_id, driver_id, truck_number, driver_name,
                    invoice_number, volume_ordered, volume_received, price_per_liter,
                    total_cost, paid_amount, payment_source_type, payment_source_id,
                    status, invoice_image, delivery_note_image, fuel_type_id, created_at
                ) VALUES (
                    :station_id, :supplier_id, :tank_id, :driver_id, :truck_number, :driver_name,
                    :invoice_number, :volume_ordered, :volume_received, :price_per_liter,
                    :total_cost, :paid_amount, :payment_source_type, :payment_source_id,
                    :status, :invoice_image, :delivery_note_image, :fuel_type_id, :created_at
                )";

        $stmt = $this->db->prepare($sql);

        // Handle Date Logic
        $createdAt = $data['purchase_date'] ?? date('Y-m-d H:i:s');
        // If it's just a date (YYYY-MM-DD), append time
        if (strlen($createdAt) === 10) {
            $createdAt .= ' ' . date('H:i:s');
        }

        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':supplier_id' => $data['supplier_id'],
            ':tank_id' => $data['tank_id'] ?? null,
            ':driver_id' => $data['driver_id'] ?? null,
            ':truck_number' => $data['truck_number'] ?? '',
            ':driver_name' => $data['driver_name'] ?? '',
            ':invoice_number' => $data['invoice_number'],
            ':volume_ordered' => $data['volume_ordered'],
            ':volume_received' => $data['volume_received'],
            ':price_per_liter' => $data['price_per_liter'],
            ':total_cost' => $data['total_cost'],
            ':paid_amount' => $data['paid_amount'] ?? 0,
            ':payment_source_type' => $data['payment_source_type'] ?? null,
            ':payment_source_id' => $data['payment_source_id'] ?? null,
            ':status' => $data['status'] ?? 'ordered',
            ':invoice_image' => $data['invoice_image'] ?? null,
            ':delivery_note_image' => $data['delivery_note_image'] ?? null,
            ':fuel_type_id' => $data['fuel_type_id'] ?? null,
            ':created_at' => $createdAt
        ]);

        return $this->db->lastInsertId();
    }
    public function getStatsByPeriod($start, $end, $stationId = 'all')
    {
        $sql = "SELECT SUM(volume_received) as total_volume_in, SUM(total_cost) as total_cost_in, COUNT(*) as count 
                FROM purchases 
                WHERE created_at BETWEEN ? AND ?";

        $params = [$start, $end];
        if ($stationId !== 'all') {
            $sql .= " AND station_id = ?";
            $params[] = $stationId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
    public function getVolumeByTank($tankId, $start, $end)
    {
        $sql = "SELECT SUM(volume_received) 
                FROM purchases 
                WHERE tank_id = ? AND created_at BETWEEN ? AND ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tankId, $start, $end]);
        return $stmt->fetchColumn() ?: 0;
    }
    public function getByPeriod($start, $end, $stationId = 'all')
    {
        $sql = "SELECT p.*, s.name as supplier_name, t.name as tank_name, d.name as driver_name_resolved 
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN drivers d ON p.driver_id = d.id 
                WHERE p.created_at BETWEEN ? AND ?";

        $params = [$start, $end];
        if ($stationId !== 'all') {
            $sql .= " AND p.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    public function getDailyPurchasesByTank($stationId, $start, $end)
    {
        $sql = "SELECT DATE(created_at) as purchase_date, tank_id, SUM(volume_received) as total_vol 
                FROM purchases 
                WHERE station_id = ? AND created_at BETWEEN ? AND ?
                GROUP BY DATE(created_at), tank_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId, $start . ' 00:00:00', $end . ' 23:59:59']);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getPending($stationId = 'all')
    {
        $sql = "SELECT p.*, 
                       s.name as supplier_name, 
                       s.phone as supplier_phone,
                       t.name as tank_name,
                       ft.name as fuel_type,
                       ft.color_hex as fuel_color,
                       d.name as driver_name_resolved
                FROM purchases p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN tanks t ON p.tank_id = t.id
                LEFT JOIN fuel_types ft ON p.fuel_type_id = ft.id
                LEFT JOIN drivers d ON p.driver_id = d.id
                WHERE p.status != 'completed'";

        $params = [];
        if ($stationId !== 'all') {
            $sql .= " AND p.station_id = ?";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
