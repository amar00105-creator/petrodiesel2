<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة بيع - #<?= $sale['id'] ?></title>
    <!-- Google Fonts: Cairo -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Cairo', sans-serif;
            background: #f8f9fa;
            padding: 20px;
        }

        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            padding: 40px;
        }

        .header {
            border-bottom: 4px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: start;
        }

        .company-info h1 {
            font-size: 32px;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .company-info p {
            color: #64748b;
            font-size: 14px;
            margin: 3px 0;
        }

        .invoice-badge {
            background: #2563eb;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            text-align: center;
        }

        .invoice-badge .label {
            font-size: 12px;
            opacity: 0.9;
        }

        .invoice-badge .number {
            font-size: 24px;
            font-weight: bold;

        }

        .invoice-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin: 30px 0;
        }

        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }

        .info-box {
            flex: 1;
            border: 2px solid #e2e8f0;
            padding: 20px;
            margin: 0 10px;
            border-radius: 8px;
        }

        .info-box:first-child {
            margin-right: 0;
        }

        .info-box:last-child {
            margin-left: 0;
        }

        .info-box .label {
            font-size: 12px;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .info-box .value {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
        }

        .info-box .subvalue {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 2px solid #1e293b;
        }

        .details-table thead {
            background: #f1f5f9;
            border-bottom: 2px solid #1e293b;
        }

        .details-table th {
            padding: 12px;
            text-align: right;
            font-weight: bold;
            color: #1e293b;
            font-size: 14px;
        }

        .details-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 16px;
        }

        .details-table tbody tr:hover {
            background: #f8fafc;
        }

        .details-table tfoot {
            border-top: 2px solid #1e293b;
            background: #f8fafc;
        }

        .details-table tfoot td {
            padding: 15px 12px;
            font-weight: bold;
            font-size: 18px;
        }

        .total-amount {
            color: #059669;
            font-size: 28px !important;

        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }

        .footer p {
            margin: 5px 0;
        }

        .print-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }

        .print-button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .invoice-container {
                box-shadow: none;
                max-width: 100%;
            }

            .print-button {
                display: none;
            }
        }

        @page {
            size: A4;
            margin: 1cm;
        }
    </style>
</head>

<body>
    <button class="print-button" onclick="window.print()">
        🖨️ طباعة الفاتورة
    </button>

    <div class="invoice-container">
        <!-- Company Header -->
        <div class="header">
            <div style="display: flex; gap: 20px; align-items: center;">
                <div class="company-logo">
                    <img src="/PETRODIESEL2/public/assets/images/logo.png" alt="PetroDiesel Logo" style="max-height: 80px;">
                </div>
                <div class="company-info">
                    <h1>PETRODIESEL</h1>
                    <p>شركة بترودیزل لتجارة المحروقات</p>
                    <p>📞 هاتف: +249 123 456 789</p>
                    <p>📍 العنوان: الخرطوم، السودان</p>
                </div>
            </div>
            <div class="invoice-badge">
                <div class="label">Invoice / فاتورة</div>
                <div class="number">#<?= $sale['id'] ?></div>
            </div>
        </div>

        <!-- Invoice Title -->
        <h2 class="invoice-title">فاتورة بيع محروقات</h2>

        <!-- Date and Invoice Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="label">📅 التاريخ والوقت</div>
                <div class="value"><?= date('Y-m-d H:i', strtotime($sale['created_at'])) ?></div>
            </div>
            <div class="info-box">
                <div class="label">⛽ الماكينة والصنف</div>
                <div class="value"><?= htmlspecialchars($sale['pump_name'] ?? 'غير محدد') ?></div>
                <div class="subvalue"><?= htmlspecialchars($sale['fuel_type'] ?? 'عام') ?></div>
            </div>
            <div class="info-box">
                <div class="label">💳 طريقة الدفع</div>
                <div class="value"><?= $sale['payment_method'] === 'cash' ? 'نقدي' : 'آجل' ?></div>
                <div class="subvalue">
                    <?php if ($sale['payment_method'] === 'cash'): ?>
                        <?= $sale['safe_name'] ? 'خزنة: ' . htmlspecialchars($sale['safe_name']) : ($sale['bank_name'] ? 'بنك: ' . htmlspecialchars($sale['bank_name']) : 'نقدي') ?>
                    <?php else: ?>
                        <?= htmlspecialchars($sale['customer_name'] ?? 'عميل غير محدد') ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Sales Details Table -->
        <table class="details-table">
            <thead>
                <tr>
                    <th style="width: 30%">البند</th>
                    <th style="width: 25%; text-align: center">الكمية</th>
                    <th style="width: 20%; text-align: center">السعر</th>
                    <th style="width: 25%; text-align: left">المجموع</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><?= htmlspecialchars($sale['fuel_type'] ?? 'محروقات') ?></td>
                    <td style="text-align: center;">
                        <?= number_format($sale['volume_sold'], 2) ?> لتر
                    </td>
                    <td style="text-align: center;">
                        <?= number_format($sale['unit_price'], 2) ?> SDG
                    </td>
                    <td style="text-align: left; font-weight: bold">
                        <?= number_format($sale['total_amount'], 2) ?> SDG
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="text-align: right">المبلغ الإجمالي:</td>
                    <td style="text-align: left" class="total-amount">
                        <?= number_format($sale['total_amount'], 2) ?> SDG
                    </td>
                </tr>
            </tfoot>
        </table>

        <!-- Footer -->
        <div class="footer">
            <p><strong>شكراً لتعاملكم معنا</strong></p>
            <p>هذه فاتورة إلكترونية صادرة من نظام PETRODIESEL</p>
            <?php if (!empty($sale['invoice_number'])): ?>
                <p>رقم الفاتورة: <?= htmlspecialchars($sale['invoice_number']) ?></p>
            <?php endif; ?>
        </div>
    </div>
</body>

</html>