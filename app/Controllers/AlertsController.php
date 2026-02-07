<?php

namespace App\Controllers;

use App\Config\Database;

class AlertsController extends Controller
{
    /**
     * Main handler for alerts API
     */
    public function index()
    {
        $action = $_GET['action'] ?? 'get_alerts';

        switch ($action) {
            case 'get_alerts':
                return $this->getAlerts();
            case 'count':
                return $this->getAlertCount();
            default:
                return $this->getAlerts();
        }
    }

    /**
     * Get all smart alerts
     */
    public function getAlerts()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $db = Database::connect();

            $alerts = [];
            $alertId = 1;

            // 1. Low Stock Alerts (tanks below 20% capacity)
            $tanksSql = "SELECT t.id, t.name, t.current_volume, t.capacity, ft.name as fuel_name
                         FROM tanks t 
                         LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                         WHERE t.current_volume < (t.capacity * 0.2)";
            if ($stationId !== 'all') {
                $tanksSql .= " AND t.station_id = ?";
                $stmt = $db->prepare($tanksSql);
                $stmt->execute([$stationId]);
            } else {
                $stmt = $db->query($tanksSql);
            }
            $lowStockTanks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($lowStockTanks as $tank) {
                $percentage = $tank['capacity'] > 0 ? ($tank['current_volume'] / $tank['capacity']) * 100 : 0;
                $severity = $percentage < 10 ? 'critical' : 'warning';

                $alerts[] = [
                    'id' => $alertId++,
                    'type' => 'low_stock',
                    'severity' => $severity,
                    'title' => 'انخفاض مستوى الوقود',
                    'message' => "الخزان {$tank['name']} ({$tank['fuel_name']}) وصل إلى " . round($percentage) . "% من السعة",
                    'action' => 'طلب توريد',
                    'tank_id' => $tank['id']
                ];
            }

            // 2. Overdue Customer Debts
            $debtsSql = "SELECT c.id, c.name, c.balance, c.credit_limit
                         FROM customers c 
                         WHERE c.balance > (c.credit_limit * 0.8)
                         ORDER BY c.balance DESC
                         LIMIT 10";
            $stmt = $db->query($debtsSql);
            $overdueDebts = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($overdueDebts as $customer) {
                $percentage = $customer['credit_limit'] > 0 ? ($customer['balance'] / $customer['credit_limit']) * 100 : 100;
                $severity = $percentage >= 100 ? 'critical' : 'warning';

                $alerts[] = [
                    'id' => $alertId++,
                    'type' => 'debt_due',
                    'severity' => $severity,
                    'title' => 'تجاوز حد الائتمان',
                    'message' => "العميل {$customer['name']} تجاوز " . round($percentage) . "% من حد الائتمان (المديونية: " . number_format($customer['balance']) . ")",
                    'action' => 'عرض حساب العميل',
                    'customer_id' => $customer['id']
                ];
            }

            // 3. Pending Payroll
            $currentMonth = date('Y-m');
            $payrollCheckSql = "SELECT COUNT(*) FROM payroll WHERE month = ?";
            $stmt = $db->prepare($payrollCheckSql);
            $stmt->execute([$currentMonth]);
            $payrollCount = $stmt->fetchColumn();

            $workerCountSql = "SELECT COUNT(*) FROM workers WHERE status = 'active'";
            $stmt = $db->query($workerCountSql);
            $workerCount = $stmt->fetchColumn();

            if ($workerCount > 0 && $payrollCount < $workerCount && date('j') > 25) {
                $alerts[] = [
                    'id' => $alertId++,
                    'type' => 'payroll',
                    'severity' => 'warning',
                    'title' => 'رواتب معلقة',
                    'message' => "لم يتم صرف رواتب " . ($workerCount - $payrollCount) . " موظف لهذا الشهر",
                    'action' => 'إدارة الرواتب'
                ];
            }

            // 4. High Loss Detection (if loss > 1%)
            $lossCheckSql = "SELECT t.id, t.name, ft.name as fuel_name
                             FROM tanks t
                             LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id";
            $stmt = $db->query($lossCheckSql);
            $tanks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Check recent sales vs theoretical loss (simplified)
            // In production, this would be more sophisticated

            // 5. Supplier Payments Due
            $supplierDebtsSql = "SELECT s.id, s.name, s.balance
                                 FROM suppliers s 
                                 WHERE s.balance > 0
                                 ORDER BY s.balance DESC
                                 LIMIT 5";
            $stmt = $db->query($supplierDebtsSql);
            $supplierDebts = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($supplierDebts as $supplier) {
                if ($supplier['balance'] > 100000) { // High debt threshold
                    $alerts[] = [
                        'id' => $alertId++,
                        'type' => 'debt_due',
                        'severity' => 'info',
                        'title' => 'مستحقات موردين',
                        'message' => "يوجد مبلغ مستحق للمورد {$supplier['name']}: " . number_format($supplier['balance']) . " ج.س",
                        'action' => 'عرض حساب المورد',
                        'supplier_id' => $supplier['id']
                    ];
                }
            }

            // 6. Price Change Recommendations
            // Check if fuel prices haven't been updated in 30 days
            $priceCheckSql = "SELECT MAX(created_at) as last_update FROM fuel_price_history";
            $stmt = $db->query($priceCheckSql);
            $lastPriceUpdate = $stmt->fetchColumn();

            if ($lastPriceUpdate && strtotime($lastPriceUpdate) < strtotime('-30 days')) {
                $alerts[] = [
                    'id' => $alertId++,
                    'type' => 'fuel_price',
                    'severity' => 'info',
                    'title' => 'مراجعة الأسعار',
                    'message' => 'لم يتم تحديث أسعار الوقود منذ أكثر من 30 يوم',
                    'action' => 'تحديث الأسعار'
                ];
            }

            // Sort alerts by severity
            usort($alerts, function ($a, $b) {
                $order = ['critical' => 0, 'warning' => 1, 'info' => 2];
                return ($order[$a['severity']] ?? 3) - ($order[$b['severity']] ?? 3);
            });

            echo json_encode([
                'success' => true,
                'alerts' => $alerts,
                'count' => count($alerts)
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage()
            ]);
        }
        exit;
    }

    /**
     * Get alert count only
     */
    public function getAlertCount()
    {
        header('Content-Type: application/json');

        try {
            $stationId = $_GET['station_id'] ?? 'all';
            $db = Database::connect();

            $count = 0;

            // Count low stock tanks
            $tanksSql = "SELECT COUNT(*) FROM tanks WHERE current_volume < (capacity * 0.2)";
            if ($stationId !== 'all') {
                $tanksSql .= " AND station_id = ?";
                $stmt = $db->prepare($tanksSql);
                $stmt->execute([$stationId]);
            } else {
                $stmt = $db->query($tanksSql);
            }
            $count += $stmt->fetchColumn();

            // Count overdue debts
            $debtsSql = "SELECT COUNT(*) FROM customers WHERE balance > (credit_limit * 0.8)";
            $stmt = $db->query($debtsSql);
            $count += $stmt->fetchColumn();

            echo json_encode([
                'success' => true,
                'count' => $count
            ]);
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'count' => 0
            ]);
        }
        exit;
    }
}
