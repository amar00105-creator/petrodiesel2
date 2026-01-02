<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقارير المالية - PETRODIESEL</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #0ea5e9;
            --light-blue: #e0f2fe;
            --dark-blue: #0369a1;
            --glass-bg: rgba(255, 255, 255, 0.95);
            --glass-border: 1px solid rgba(255, 255, 255, 0.4);
        }

        body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh;
            color: #334155;
        }

        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: var(--glass-border);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .filter-input {
            background: white;
            border: 1px solid #bae6fd;
            border-radius: 10px;
            padding: 10px;
        }

        .summary-box {
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            color: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>

<div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold" style="color: var(--dark-blue);">التقارير المالية</h2>
        <a href="<?= BASE_URL ?>/finance" class="btn btn-outline-primary rounded-pill px-4">
            <i class="fas fa-arrow-right me-2"></i> عودة
        </a>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 mb-4">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label text-muted">من تاريخ</label>
                <input type="date" name="start_date" class="form-control filter-input" value="<?= $data['filters']['start_date'] ?>">
            </div>
            <div class="col-md-3">
                <label class="form-label text-muted">إلى تاريخ</label>
                <input type="date" name="end_date" class="form-control filter-input" value="<?= $data['filters']['end_date'] ?>">
            </div>
            <div class="col-md-3">
                <label class="form-label text-muted">النوع</label>
                <select name="type" class="form-select filter-input">
                    <option value="">الكل</option>
                    <option value="income" <?= $data['filters']['type'] == 'income' ? 'selected' : '' ?>>إيرادات</option>
                    <option value="expense" <?= $data['filters']['type'] == 'expense' ? 'selected' : '' ?>>منصرفات</option>
                </select>
            </div>
            <div class="col-md-3">
                <button type="submit" class="btn btn-primary w-100 rounded-pill py-2">
                    <i class="fas fa-filter me-2"></i> عرض التقرير
                </button>
            </div>
        </form>
    </div>

    <!-- Summary -->
    <div class="row g-4 mb-4">
        <div class="col-md-4">
            <div class="summary-box" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <p class="mb-1 opacity-75">إجمالي الإيرادات</p>
                <h3 class="fw-bold mb-0"><?= number_format($data['totals']['income'], 2) ?></h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="summary-box" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
                <p class="mb-1 opacity-75">إجمالي المنصرفات</p>
                <h3 class="fw-bold mb-0"><?= number_format($data['totals']['expense'], 2) ?></h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="summary-box" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
                <p class="mb-1 opacity-75">صافي التدفق</p>
                <h3 class="fw-bold mb-0"><?= number_format($data['totals']['income'] - $data['totals']['expense'], 2) ?></h3>
            </div>
        </div>
    </div>

    <!-- Results Table -->
    <div class="glass-card p-0 overflow-hidden">
        <table class="table table-hover mb-0">
            <thead class="bg-light">
                <tr>
                    <th class="p-3 text-muted">التاريخ</th>
                    <th class="p-3 text-muted">المعاملة</th>
                    <th class="p-3 text-muted">النوع</th>
                    <th class="p-3 text-muted">التصنيف</th>
                    <th class="p-3 text-muted">المبلغ</th>
                </tr>
            </thead>
            <tbody>
                <?php if(empty($data['transactions'])): ?>
                    <tr><td colspan="5" class="text-center p-5 text-muted">لا توجد بيانات للعرض</td></tr>
                <?php else: ?>
                    <?php foreach ($data['transactions'] as $t): ?>
                    <tr>
                        <td class="p-3 border-bottom"><?= $t['date'] ?></td>
                        <td class="p-3 border-bottom"><?= $t['description'] ?></td>
                        <td class="p-3 border-bottom">
                            <?php if($t['type'] == 'income'): ?>
                                <span class="badge bg-success bg-opacity-10 text-success">إيراد</span>
                            <?php elseif($t['type'] == 'expense'): ?>
                                <span class="badge bg-danger bg-opacity-10 text-danger">منصرف</span>
                            <?php else: ?>
                                <span class="badge bg-info bg-opacity-10 text-info">تحويل</span>
                            <?php endif; ?>
                        </td>
                        <td class="p-3 border-bottom"><?= $t['category_name'] ?></td>
                        <td class="p-3 border-bottom fw-bold <?= $t['type'] == 'expense' ? 'text-danger' : 'text-success' ?>">
                            <?= number_format($t['amount'], 2) ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

</body>
</html>
