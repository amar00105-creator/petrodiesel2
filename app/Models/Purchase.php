<?php

namespace App\Models;

use App\Core\Model;

class Purchase extends Model
{
    public function getAll($stationId)
    {
        $sql = "SELECT p.*, s.name as supplier_name, t.name as tank_name, d.name as driver_name_resolved 
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                LEFT JOIN tanks t ON p.tank_id = t.id 
                LEFT JOIN drivers d ON p.driver_id = d.id 
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
                    status, invoice_image, delivery_note_image
                ) VALUES (
                    :station_id, :supplier_id, :tank_id, :driver_id, :truck_number, :driver_name,
                    :invoice_number, :volume_ordered, :volume_received, :price_per_liter,
                    :total_cost, :paid_amount, :payment_source_type, :payment_source_id,
                    :status, :invoice_image, :delivery_note_image
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':station_id' => $data['station_id'],
            ':supplier_id' => $data['supplier_id'],
            ':tank_id' => $data['tank_id'],
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
            ':delivery_note_image' => $data['delivery_note_image'] ?? null
        ]);

        return $this->db->lastInsertId();
    }
}
