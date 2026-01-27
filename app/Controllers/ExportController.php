<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;

/**
 * Export Controller
 * Handles PDF and Excel export for Financial Flow Report
 */
class ExportController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function exportFinancialFlowPDF()
    {
        // Get report data using same logic as ReportsController
        $sourceType = $_GET['source_type'] ?? 'safe';
        $sourceId = $_GET['source_id'] ?? null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');
        $groupSales = $_GET['group_sales'] ?? 'none';

        if (!$sourceId) {
            die('Error: Source ID required');
        }

        // Get data from ReportsController logic
        $reportsController = new \App\Controllers\ReportsController();
        $data = $this->getReportData($sourceType, $sourceId, $startDate, $endDate, $groupSales);

        // Generate PDF
        $this->generatePDF($data, $sourceType, $sourceId, $startDate, $endDate);
    }

    public function exportFinancialFlowExcel()
    {
        // Get report data
        $sourceType = $_GET['source_type'] ?? 'safe';
        $sourceId = $_GET['source_id'] ?? null;
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');
        $groupSales = $_GET['group_sales'] ?? 'none';

        if (!$sourceId) {
            die('Error: Source ID required');
        }

        $data = $this->getReportData($sourceType, $sourceId, $startDate, $endDate, $groupSales);

        // Generate Excel
        $this->generateExcel($data, $sourceType, $sourceId, $startDate, $endDate);
    }

    private function getReportData($sourceType, $sourceId, $startDate, $endDate, $groupSales)
    {
        $db = \App\Config\Database::connect();
        $user = AuthHelper::user();
        $stationId = $user['station_id'];

        // Opening Balance
        $openingSql = "SELECT 
                        SUM(CASE 
                            WHEN (to_type = ? AND to_id = ?) THEN amount 
                            ELSE 0 
                        END) as total_in,
                        SUM(CASE 
                            WHEN (from_type = ? AND from_id = ?) THEN amount 
                            ELSE 0 
                        END) as total_out
                       FROM transactions 
                       WHERE date < ?";

        $stmt = $db->prepare($openingSql);
        $stmt->execute([$sourceType, $sourceId, $sourceType, $sourceId, $startDate]);
        $openingResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $openingBalance = ($openingResult['total_in'] ?? 0) - ($openingResult['total_out'] ?? 0);

        // Current Period Transactions
        $sql = "SELECT t.*, 
                       s.id as sale_id,
                       ft.name as fuel_name
                FROM transactions t
                LEFT JOIN sales s ON (t.related_entity_type = 'sales' AND t.related_entity_id = s.id)
                LEFT JOIN counters c ON s.counter_id = c.id
                LEFT JOIN pumps p ON c.pump_id = p.id
                LEFT JOIN tanks tk ON p.tank_id = tk.id
                LEFT JOIN fuel_types ft ON tk.fuel_type_id = ft.id
                WHERE ((t.to_type = ? AND t.to_id = ?) OR (t.from_type = ? AND t.from_id = ?))
                AND t.date BETWEEN ? AND ?
                ORDER BY t.date ASC, t.id ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute([$sourceType, $sourceId, $sourceType, $sourceId, $startDate, $endDate]);
        $rawTransactions = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Process transactions
        $finalRows = [];
        $runningBalance = $openingBalance;

        $getDirection = function ($t) use ($sourceType, $sourceId) {
            if ($t['to_type'] == $sourceType && $t['to_id'] == $sourceId) return 'in';
            return 'out';
        };

        foreach ($rawTransactions as $t) {
            $dir = $getDirection($t);

            $category = $t['category_name'] ?? 'عام';
            if ($t['related_entity_type'] === 'sales' && !empty($t['fuel_name'])) {
                $category = 'مبيعات ' . $t['fuel_name'];
            }

            $amountIn = $dir === 'in' ? $t['amount'] : 0;
            $amountOut = $dir === 'out' ? $t['amount'] : 0;
            $runningBalance += $amountIn - $amountOut;

            $finalRows[] = [
                'date' => $t['date'],
                'id' => $t['id'],
                'type' => $t['type'],
                'category' => $category,
                'description' => $t['description'],
                'amount_in' => $amountIn,
                'amount_out' => $amountOut,
                'balance' => $runningBalance,
                'is_sale' => ($t['related_entity_type'] === 'sales')
            ];
        }

        // Calculate summary
        $summary = [
            'opening_balance' => $openingBalance,
            'closing_balance' => $runningBalance,
            'total_sales' => 0,
            'total_other_income' => 0,
            'total_expenses' => 0,
            'total_transfers_in' => 0,
            'total_transfers_out' => 0
        ];

        foreach ($finalRows as $r) {
            if ($r['type'] === 'income') {
                if ($r['is_sale']) {
                    $summary['total_sales'] += $r['amount_in'];
                } else {
                    $summary['total_other_income'] += $r['amount_in'];
                }
            } elseif ($r['type'] === 'expense') {
                $summary['total_expenses'] += $r['amount_out'];
            } elseif ($r['type'] === 'transfer') {
                if ($r['amount_in'] > 0) $summary['total_transfers_in'] += $r['amount_in'];
                if ($r['amount_out'] > 0) $summary['total_transfers_out'] += $r['amount_out'];
            }
        }

        // Get account name
        if ($sourceType === 'safe') {
            $stmt = $db->prepare("SELECT name FROM safes WHERE id = ?");
        } else {
            $stmt = $db->prepare("SELECT bank_name as name FROM banks WHERE id = ?");
        }
        $stmt->execute([$sourceId]);
        $account = $stmt->fetch(\PDO::FETCH_ASSOC);

        return [
            'summary' => $summary,
            'movements' => $finalRows,
            'account_name' => $account['name'] ?? 'Unknown',
            'account_type' => $sourceType === 'safe' ? 'خزنة' : 'بنك'
        ];
    }

    private function generatePDF($data, $sourceType, $sourceId, $startDate, $endDate)
    {
        // Simple HTML to PDF conversion
        $html = $this->getPDFTemplate($data, $sourceType, $sourceId, $startDate, $endDate);

        // Set headers
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="financial_flow_' . date('Y-m-d') . '.pdf"');

        // Use DomPDF-like approach with basic HTML
        // For now, we'll use a workaround with HTML output
        // In production, you'd use a proper PDF library

        echo $html;
        exit;
    }

    private function generateExcel($data, $sourceType, $sourceId, $startDate, $endDate)
    {
        // Generate CSV (Excel-compatible)
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="financial_flow_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');

        // Add BOM for Excel UTF-8 support
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        // Header info
        fputcsv($output, ['تقرير التدفق المالي']);
        fputcsv($output, ['الحساب:', $data['account_type'] . ' - ' . $data['account_name']]);
        fputcsv($output, ['من:', $startDate, 'إلى:', $endDate]);
        fputcsv($output, []);

        // Summary
        fputcsv($output, ['الملخص']);
        fputcsv($output, ['الرصيد الافتتاحي', number_format($data['summary']['opening_balance'], 2)]);
        fputcsv($output, ['إجمالي المبيعات', number_format($data['summary']['total_sales'], 2)]);
        fputcsv($output, ['دخل آخر', number_format($data['summary']['total_other_income'], 2)]);
        fputcsv($output, ['المصروفات', number_format($data['summary']['total_expenses'], 2)]);
        fputcsv($output, ['تحويلات واردة', number_format($data['summary']['total_transfers_in'], 2)]);
        fputcsv($output, ['تحويلات صادرة', number_format($data['summary']['total_transfers_out'], 2)]);
        fputcsv($output, ['الرصيد الختامي', number_format($data['summary']['closing_balance'], 2)]);
        fputcsv($output, []);

        // Table headers
        fputcsv($output, ['التاريخ', 'النوع', 'التصنيف', 'الوصف', 'وارد', 'صادر', 'الرصيد']);

        // Data rows
        foreach ($data['movements'] as $row) {
            fputcsv($output, [
                $row['date'],
                $row['type'],
                $row['category'],
                $row['description'],
                number_format($row['amount_in'], 2),
                number_format($row['amount_out'], 2),
                number_format($row['balance'], 2)
            ]);
        }

        fclose($output);
        exit;
    }

    private function getPDFTemplate($data, $sourceType, $sourceId, $startDate, $endDate)
    {
        ob_start();
?>
        <!DOCTYPE html>
        <html dir="rtl">

        <head>
            <meta charset="UTF-8">
            <title>تقرير التدفق المالي</title>
            <style>
                body {
                    font-family: 'DejaVu Sans', Arial, sans-serif;
                    direction: rtl;
                    padding: 20px;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .info {
                    margin-bottom: 20px;
                }

                .summary {
                    background: #f0f0f0;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .summary-item {
                    padding: 5px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }

                th {
                    background-color: #4CAF50;
                    color: white;
                }

                .amount-in {
                    color: green;
                }

                .amount-out {
                    color: red;
                }
            </style>
        </head>

        <body>
            <div class="header">
                <h1>تقرير التدفق المالي</h1>
                <p>نظام إدارة محطات الوقود - PETRODIESEL</p>
            </div>

            <div class="info">
                <p><strong>الحساب:</strong> <?php echo htmlspecialchars($data['account_type'] . ' - ' . $data['account_name']); ?></p>
                <p><strong>الفترة:</strong> من <?php echo $startDate; ?> إلى <?php echo $endDate; ?></p>
                <p><strong>تاريخ الإصدار:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
            </div>

            <div class="summary">
                <h3>الملخص المالي</h3>
                <div class="summary-item"><strong>الرصيد الافتتاحي:</strong> <?php echo number_format($data['summary']['opening_balance'], 2); ?> SDG</div>
                <div class="summary-item"><strong>إجمالي المبيعات:</strong> <?php echo number_format($data['summary']['total_sales'], 2); ?> SDG</div>
                <div class="summary-item"><strong>دخل آخر:</strong> <?php echo number_format($data['summary']['total_other_income'], 2); ?> SDG</div>
                <div class="summary-item"><strong>المصروفات:</strong> <?php echo number_format($data['summary']['total_expenses'], 2); ?> SDG</div>
                <div class="summary-item"><strong>تحويلات واردة:</strong> <?php echo number_format($data['summary']['total_transfers_in'], 2); ?> SDG</div>
                <div class="summary-item"><strong>تحويلات صادرة:</strong> <?php echo number_format($data['summary']['total_transfers_out'], 2); ?> SDG</div>
                <div class="summary-item"><strong>الرصيد الختامي:</strong> <?php echo number_format($data['summary']['closing_balance'], 2); ?> SDG</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>التصنيف</th>
                        <th>الوصف</th>
                        <th>وارد</th>
                        <th>صادر</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($data['movements'] as $row): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row['date']); ?></td>
                            <td><?php echo htmlspecialchars($row['category']); ?></td>
                            <td><?php echo htmlspecialchars($row['description']); ?></td>
                            <td class="amount-in"><?php echo $row['amount_in'] > 0 ? number_format($row['amount_in'], 2) : '-'; ?></td>
                            <td class="amount-out"><?php echo $row['amount_out'] > 0 ? number_format($row['amount_out'], 2) : '-'; ?></td>
                            <td><?php echo number_format($row['balance'], 2); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </body>

        </html>
<?php
        return ob_get_clean();
    }
}
