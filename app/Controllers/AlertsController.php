<?php

namespace App\Controllers;

use App\Config\Database;
use App\Models\Setting;

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

            // Load alert settings from DB
            $settingModel = new Setting();
            $alertConfig = $settingModel->getAllBySection('alerts');

            $tankEnabled = ($alertConfig['alert_tank_enabled'] ?? '1') === '1';
            $tankLowPct = floatval($alertConfig['alert_tank_low_threshold'] ?? 20) / 100;
            $tankCritPct = floatval($alertConfig['alert_tank_critical_threshold'] ?? 10) / 100;
            $creditEnabled = ($alertConfig['alert_credit_enabled'] ?? '1') === '1';
            $creditPct = floatval($alertConfig['alert_credit_threshold'] ?? 80) / 100;
            $supplierEnabled = ($alertConfig['alert_supplier_enabled'] ?? '1') === '1';
            $supplierMin = floatval($alertConfig['alert_supplier_debt_min'] ?? 100000);
            $payrollEnabled = ($alertConfig['alert_payroll_enabled'] ?? '1') === '1';
            $payrollDay = intval($alertConfig['alert_payroll_day'] ?? 25);
            $priceEnabled = ($alertConfig['alert_price_enabled'] ?? '1') === '1';
            $priceReviewDays = intval($alertConfig['alert_price_review_days'] ?? 30);

            $alerts = [];
            $alertId = 1;

            // 1. Low Stock Alerts (tanks below configured threshold)
            if ($tankEnabled) {
                $tanksSql = "SELECT t.id, t.name, t.current_volume, t.capacity, ft.name as fuel_name
                             FROM tanks t 
                             LEFT JOIN fuel_types ft ON t.fuel_type_id = ft.id
                             WHERE t.current_volume < (t.capacity * ?)";
                if ($stationId !== 'all') {
                    $tanksSql .= " AND t.station_id = ?";
                    $stmt = $db->prepare($tanksSql);
                    $stmt->execute([$tankLowPct, $stationId]);
                } else {
                    $stmt = $db->prepare($tanksSql);
                    $stmt->execute([$tankLowPct]);
                }
                $lowStockTanks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                foreach ($lowStockTanks as $tank) {
                    $percentage = $tank['capacity'] > 0 ? ($tank['current_volume'] / $tank['capacity']) * 100 : 0;
                    $severity = ($percentage / 100) < $tankCritPct ? 'critical' : 'warning';

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
            }

            // 2. Overdue Customer Debts
            if ($creditEnabled) {
                $debtsSql = "SELECT c.id, c.name, c.balance, c.credit_limit
                             FROM customers c 
                             WHERE c.balance > (c.credit_limit * ?)
                             ORDER BY c.balance DESC
                             LIMIT 10";
                $stmt = $db->prepare($debtsSql);
                $stmt->execute([$creditPct]);
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
            }

            // 3. Pending Payroll
            if ($payrollEnabled) {
                $currentMonth = date('Y-m');
                $payrollCheckSql = "SELECT COUNT(*) FROM payroll WHERE month = ?";
                $stmt = $db->prepare($payrollCheckSql);
                $stmt->execute([$currentMonth]);
                $payrollCount = $stmt->fetchColumn();

                $workerCountSql = "SELECT COUNT(*) FROM workers WHERE status = 'active'";
                $stmt = $db->query($workerCountSql);
                $workerCount = $stmt->fetchColumn();

                if ($workerCount > 0 && $payrollCount < $workerCount && date('j') > $payrollDay) {
                    $alerts[] = [
                        'id' => $alertId++,
                        'type' => 'payroll',
                        'severity' => 'warning',
                        'title' => 'رواتب معلقة',
                        'message' => "لم يتم صرف رواتب " . ($workerCount - $payrollCount) . " موظف لهذا الشهر",
                        'action' => 'إدارة الرواتب'
                    ];
                }
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
            if ($supplierEnabled) {
                $supplierDebtsSql = "SELECT s.id, s.name, s.balance
                                     FROM suppliers s 
                                     WHERE s.balance > 0
                                     ORDER BY s.balance DESC
                                     LIMIT 5";
                $stmt = $db->query($supplierDebtsSql);
                $supplierDebts = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                foreach ($supplierDebts as $supplier) {
                    if ($supplier['balance'] > $supplierMin) {
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
            }

            // 6. Price Change Recommendations
            if ($priceEnabled) {
                $priceCheckSql = "SELECT MAX(created_at) as last_update FROM fuel_price_history";
                $stmt = $db->query($priceCheckSql);
                $lastPriceUpdate = $stmt->fetchColumn();

                if ($lastPriceUpdate && strtotime($lastPriceUpdate) < strtotime("-{$priceReviewDays} days")) {
                    $alerts[] = [
                        'id' => $alertId++,
                        'type' => 'fuel_price',
                        'severity' => 'info',
                        'title' => 'مراجعة الأسعار',
                        'message' => "لم يتم تحديث أسعار الوقود منذ أكثر من {$priceReviewDays} يوم",
                        'action' => 'تحديث الأسعار'
                    ];
                }
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

            // Count low stock tanks (using configured threshold)
            $settingModel = new Setting();
            $alertConfig = $settingModel->getAllBySection('alerts');
            $tankLowPct = floatval($alertConfig['alert_tank_low_threshold'] ?? 20) / 100;
            $creditPct = floatval($alertConfig['alert_credit_threshold'] ?? 80) / 100;

            $tanksSql = "SELECT COUNT(*) FROM tanks WHERE current_volume < (capacity * ?)";
            if ($stationId !== 'all') {
                $tanksSql .= " AND station_id = ?";
                $stmt = $db->prepare($tanksSql);
                $stmt->execute([$tankLowPct, $stationId]);
            } else {
                $stmt = $db->prepare($tanksSql);
                $stmt->execute([$tankLowPct]);
            }
            $count += $stmt->fetchColumn();

            // Count overdue debts (using configured threshold)
            $debtsSql = "SELECT COUNT(*) FROM customers WHERE balance > (credit_limit * ?)";
            $stmt = $db->prepare($debtsSql);
            $stmt->execute([$creditPct]);
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
