<?php
// Add these methods to ReportsController.php before the closing brace

/**
 * Get Supplier Statement Report
 * Shows unified account across all stations
 */
private function getSupplierReport()
{
    $supplierId = $_GET['supplier_id'] ?? null;
    $startDate = $_GET['start_date'] ?? date('Y-m-01');
    $endDate = $_GET['end_date'] ?? date('Y-m-d');

    if (!$supplierId) {
        echo json_encode(['success' => false, 'message' => 'معرف المورد مطلوب']);
        exit;
    }

    try {
        $db = \App\Config\Database::connect();
        
        // 1. Get Supplier Info
        $supplier = $this->supplierModel->find($supplierId);
        if (!$supplier) {
            throw new \Exception('المورد غير موجود');
        }

        // 2. Get All Purchases from this Supplier (all stations)
        $stmt = $db->prepare("
            SELECT 
                p.*,
                s.name as station_name,
                t.name as tank_name,
                d.name as driver_name
            FROM purchases p
            LEFT JOIN stations s ON p.station_id = s.id
            LEFT JOIN tanks t ON p.tank_id = t.id
            LEFT JOIN drivers d ON p.driver_id = d.id
            WHERE p.supplier_id = ?
            AND DATE(p.created_at) BETWEEN ? AND ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$supplierId, $startDate, $endDate]);
        $purchases = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // 3. Calculate Totals
        $totalCost = 0;
        $totalPaid = 0;
        $totalVolume = 0;
        
        foreach ($purchases as $purchase) {
            $totalCost += $purchase['total_cost'];
            $totalPaid += $purchase['paid_amount'];
            $totalVolume += $purchase['volume_received'];
        }

        // 4. Get Purchases Breakdown by Station
        $stmt = $db->prepare("
            SELECT 
                s.name as station_name,
                COUNT(p.id) as purchase_count,
                SUM(p.volume_received) as total_volume,
                SUM(p.total_cost) as total_cost,
                SUM(p.paid_amount) as total_paid
            FROM purchases p
            LEFT JOIN stations s ON p.station_id = s.id
            WHERE p.supplier_id = ?
            AND DATE(p.created_at) BETWEEN ? AND ?
            GROUP BY s.id, s.name
            ORDER BY total_cost DESC
        ");
        $stmt->execute([$supplierId, $startDate, $endDate]);
        $byStation = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // 5. Response
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'supplier' => $supplier,
            'summary' => [
                'total_purchases' => count($purchases),
                'total_volume' => $totalVolume,
                'total_cost' => $totalCost,
                'total_paid' => $totalPaid,
                'balance' => $supplier['balance'] // Current unified balance
            ],
            'purchases' => $purchases,
            'by_station' => $byStation
        ]);
        exit;

    } catch (\Exception $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'خطأ: ' . $e->getMessage()
        ]);
        exit;
    }
}

/**
 * Get All Suppliers Summary
 * For supplier comparison report
 */
private function getAllSuppliersReport()
{
    $startDate = $_GET['start_date'] ?? date('Y-m-01');
    $endDate = $_GET['end_date'] ?? date('Y-m-d');

    try {
        $db = \App\Config\Database::connect();
        
        // Get all suppliers with their purchase stats
        $stmt = $db->prepare("
            SELECT 
                sup.id,
                sup.name,
                sup.phone,
                sup.balance,
                COUNT(p.id) as purchase_count,
                COALESCE(SUM(p.volume_received), 0) as total_volume,
                COALESCE(SUM(p.total_cost), 0) as total_cost,
                COALESCE(AVG(p.price_per_liter), 0) as avg_price,
                COALESCE(SUM(p.paid_amount), 0) as total_paid
            FROM suppliers sup
            LEFT JOIN purchases p ON p.supplier_id = sup.id 
                AND DATE(p.created_at) BETWEEN ? AND ?
            GROUP BY sup.id
            ORDER BY total_cost DESC
        ");
        $stmt->execute([$startDate, $endDate]);
        $suppliers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'suppliers' => $suppliers
        ]);
        exit;

    } catch (\Exception $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'خطأ: ' . $e->getMessage()
        ]);
        exit;
    }
}
