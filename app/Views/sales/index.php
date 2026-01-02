<?php
// Expects $sales array
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سجل المبيعات | بتروديزل</title>
    <link href="<?= BASE_URL ?>/css/style.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary: #4361ee;
            --primary-dark: #3f37c9;
            --secondary: #f72585;
            --bg-glass: rgba(255, 255, 255, 0.95);
            --card-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }

        body {
            font-family: 'Tajawal', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        .glass-card {
            background: var(--bg-glass);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: var(--card-shadow);
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .table-custom {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px;
        }

        .table-custom th {
            color: #666;
            font-weight: 700;
            padding: 1rem;
            border-bottom: 2px solid #eee;
        }

        .table-custom td {
            background: white;
            padding: 1rem;
            vertical-align: middle;
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
        }

        .table-custom tr td:first-child {
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
            border-right: 1px solid #f0f0f0;
        }

        .table-custom tr td:last-child {
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            border-left: 1px solid #f0f0f0;
        }

        .btn-gradient {
            background: linear-gradient(45deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-gradient:hover {
            transform: translateY(-2px);
            color: white;
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="fw-bold fs-2" style="color: var(--primary);">المبيعات اليومية</h1>
                <p class="text-muted">نظرة عامة على مبيعات الورديات</p>
            </div>
            <div>
                <a href="<?= BASE_URL ?>/" class="btn btn-outline-secondary me-2">
                    <i class="fas fa-home"></i> الرئيسية
                </a>
                <a href="<?= BASE_URL ?>/sales/create" class="btn-gradient">
                    <i class="fas fa-plus"></i> تسجيل وردية جديدة
                </a>
            </div>
        </div>

        <div class="glass-card">
            <?php if (empty($sales)): ?>
                <div class="text-center py-5">
                    <i class="fas fa-gas-pump fa-3x text-muted mb-3" style="opacity: 0.3;"></i>
                    <h4 class="text-muted">لا توجد مبيعات مسجلة حتى الآن</h4>
                    <a href="<?= BASE_URL ?>/sales/create" class="btn btn-link">ابدأ بتسجيل أول وردية</a>
                </div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table-custom">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>التاريخ</th>
                                <th>العامل</th>
                                <th>نقطة البيع</th>
                                <th>النوع</th>
                                <th>الكمية (لتر)</th>
                                <th>المبلغ</th>
                                <th>الدفع</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($sales as $sale): ?>
                                <tr>
                                    <td class="fw-bold">#
                                        <?= $sale['id'] ?>
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column">
                                            <span class="fw-bold">
                                                <?= date('Y-m-d', strtotime($sale['sale_date'])) ?>
                                            </span>
                                            <small class="text-muted">
                                                <?= $sale['shift'] ?>
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="bg-light rounded-circle p-2 text-primary">
                                                <i class="fas fa-user"></i>
                                            </div>
                                            <span>
                                                <?= htmlspecialchars($sale['worker_name'] ?? 'غير معرف') ?>
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <small>
                                            <?= htmlspecialchars($sale['pump_name'] ?? '') ?>
                                        </small><br>
                                        <span class="badge bg-light text-dark">
                                            <?= htmlspecialchars($sale['counter_name'] ?? '') ?>
                                        </span>
                                    </td>
                                    <td>
                                        <!-- Ideally fetch product type via join, simple placeholder for now or if in sales data -->
                                        <i class="fas fa-oil-can text-secondary"></i>
                                    </td>
                                    <td class="fw-bold" dir="ltr">
                                        <?= number_format($sale['volume_sold'], 2) ?>
                                    </td>
                                    <td class="fw-bold text-success" dir="ltr">
                                        <?= number_format($sale['total_amount'], 2) ?>
                                    </td>
                                    <td>
                                        <?php if ($sale['payment_method'] === 'cash'): ?>
                                            <span class="badge bg-success bg-opacity-10 text-success">
                                                <i class="fas fa-money-bill-wave me-1"></i> كاش
                                            </span>
                                        <?php else: ?>
                                            <span class="badge bg-warning bg-opacity-10 text-warning">
                                                <i class="fas fa-file-invoice-dollar me-1"></i> آجل
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <i class="fas fa-check-circle text-primary"></i>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>

</body>

</html>