<style>
    /* Finance Module Styles */
    :root {
        --primary-blue: #0ea5e9;
        --light-blue: #e0f2fe;
        --dark-blue: #0369a1;
        --glass-bg: rgba(255, 255, 255, 0.95);
        --glass-border: 1px solid rgba(255, 255, 255, 0.4);
    }

    /* Scoped container override if needed */
    .finance-wrapper {
        font-family: 'Cairo', sans-serif;
        color: #334155;
    }

    .glass-card {
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: var(--glass-border);
        border-radius: 20px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .glass-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px 0 rgba(14, 165, 233, 0.15);
    }

    .stat-card {
        padding: 2rem;
        position: relative;
        overflow: hidden;
    }

    .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: linear-gradient(45deg, transparent, rgba(14, 165, 233, 0.1));
        border-radius: 0 0 0 100%;
        transition: all 0.5s ease;
    }

    .stat-card:hover::before {
        width: 100%;
        height: 100%;
        border-radius: 20px;
    }

    .btn-primary-custom {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        border: none;
        padding: 10px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        transition: all 0.3s ease;
    }

    .btn-primary-custom:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
        color: white;
    }

    .btn-secondary-custom {
        background: rgba(255, 255, 255, 0.9);
        color: var(--dark-blue);
        border: 1px solid #bae6fd;
        padding: 10px 25px;
        border-radius: 12px;
        transition: all 0.3s ease;
    }

    .btn-secondary-custom:hover {
        background: #f0f9ff;
        color: var(--primary-blue);
    }

    /* Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .delay-1 {
        animation-delay: 0.1s;
    }

    .delay-2 {
        animation-delay: 0.2s;
    }

    .delay-3 {
        animation-delay: 0.3s;
    }

    .table-custom {
        border-collapse: separate;
        border-spacing: 0 10px;
    }

    .table-custom tr {
        background: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
        border-radius: 10px;
        transition: transform 0.2s;
    }

    .table-custom tr:hover {
        transform: scale(1.01);
    }

    .table-custom td {
        padding: 15px;
        border: none;
    }

    .table-custom td:first-child {
        border-radius: 0 10px 10px 0;
    }

    .table-custom td:last-child {
        border-radius: 10px 0 0 10px;
    }

    .amount-positive {
        color: #10b981;
        font-weight: bold;
    }

    .amount-negative {
        color: #ef4444;
        font-weight: bold;
    }
</style>

<div class="finance-wrapper">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 animate-up">
        <div>
            <h2 class="fw-bold mb-1" style="color: var(--dark-blue);">المالية والحسابات</h2>
            <p class="text-muted">إدارة المنصرفات والايرادات والخزائن</p>
        </div>
    </div>

    <!-- Action Cards Grid -->
    <div class="row g-3 mb-4 animate-up">
        <!-- Safes -->
        <div class="col-md-2 col-6">
            <a href="<?= BASE_URL ?>/finance/safes" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                        <i class="fas fa-wallet fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">الخزنة</h6>
                </div>
            </a>
        </div>
        <!-- Banks -->
        <div class="col-md-2 col-6">
            <a href="<?= BASE_URL ?>/finance/banks" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-info bg-opacity-10 text-info mb-2">
                        <i class="fas fa-university fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">البنوك</h6>
                </div>
            </a>
        </div>
        <!-- Detailed Report -->
        <div class="col-md-2 col-6">
            <a href="<?= BASE_URL ?>/finance/reports/detailed" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-secondary bg-opacity-10 text-secondary mb-2">
                        <i class="fas fa-file-invoice-dollar fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">تقرير مفصل</h6>
                </div>
            </a>
        </div>
        <!-- Revenue/Expense Report -->
        <div class="col-md-2 col-6">
            <a href="<?= BASE_URL ?>/finance/reports/summary" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-warning bg-opacity-10 text-warning mb-2">
                        <i class="fas fa-chart-pie fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">الايرادات والمنصرفات</h6>
                </div>
            </a>
        </div>
        <!-- Add Income -->
        <div class="col-md-2 col-6">
            <a href="#" data-bs-toggle="modal" data-bs-target="#incomeModal" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-success bg-opacity-10 text-success mb-2">
                        <i class="fas fa-plus-circle fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">إضافة إيراد</h6>
                </div>
            </a>
        </div>
        <!-- Add Expense -->
        <div class="col-md-2 col-6">
            <a href="#" data-bs-toggle="modal" data-bs-target="#expenseModal" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-danger bg-opacity-10 text-danger mb-2">
                        <i class="fas fa-minus-circle fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">إضافة مصروف</h6>
                </div>
            </a>
        </div>
    </div>

    <style>
        .hover-lift {
            transition: transform 0.2s;
        }

        .hover-lift:hover {
            transform: translateY(-5px);
        }

        .icon-circle {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
    </style>

    <!-- Stats Row -->
    <div class="row g-4 mb-5">
        <!-- Safes -->
        <?php foreach ($data['safes'] as $key => $safe): ?>
            <div class="col-md-3 animate-up delay-1">
                <div class="glass-card stat-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted mb-1">الخزينة</p>
                            <h4 class="fw-bold mb-0"><?= htmlspecialchars($safe['name']) ?></h4>
                        </div>
                        <div class="p-2 rounded-circle" style="background: #e0f2fe; color: #0284c7;">
                            <i class="fas fa-wallet fa-lg"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3 class="fw-bold" style="color: var(--dark-blue);"><?= number_format($safe['balance'], 2) ?></h3>
                        <small class="text-muted">ر.س</small>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>

        <!-- Banks -->
        <?php foreach ($data['banks'] as $key => $bank): ?>
            <div class="col-md-3 animate-up delay-2">
                <div class="glass-card stat-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted mb-1">حساب بنكي</p>
                            <h5 class="fw-bold mb-0"><?= htmlspecialchars($bank['name']) ?></h5>
                        </div>
                        <div class="p-2 rounded-circle" style="background: #e0e7ff; color: #4338ca;">
                            <i class="fas fa-university fa-lg"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3 class="fw-bold" style="color: var(--dark-blue);"><?= number_format($bank['balance'], 2) ?></h3>
                        <small class="text-muted"><?= htmlspecialchars($bank['account_number']) ?></small>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Actions -->
    <div class="row mb-5 animate-up delay-2">
        <div class="col-12">
            <div class="glass-card p-4 d-flex justify-content-center gap-3">
                <button class="btn btn-primary-custom" data-bs-toggle="modal" data-bs-target="#incomeModal">
                    <i class="fas fa-plus-circle me-2"></i> إضافة إيراد
                </button>
                <button class="btn btn-primary-custom" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);" data-bs-toggle="modal" data-bs-target="#expenseModal">
                    <i class="fas fa-minus-circle me-2"></i> إضافة منصرف
                </button>
                <button class="btn btn-secondary-custom" data-bs-toggle="modal" data-bs-target="#transferModal">
                    <i class="fas fa-exchange-alt me-2"></i> تحويل بين الحسابات
                </button>
            </div>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="glass-card p-4 animate-up delay-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold" style="color: var(--dark-blue);">أحدث العمليات</h4>
        </div>

        <table class="table table-borderless table-custom">
            <thead>
                <tr class="text-muted">
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>التصنيف</th>
                    <th>المبلغ</th>
                    <th>الوصف</th>
                    <th>المستخدم</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($data['recent_transactions'] as $trans): ?>
                    <tr>
                        <td><?= date('Y-m-d H:i', strtotime($trans['created_at'])) ?></td>
                        <td>
                            <?php if ($trans['type'] == 'income'): ?>
                                <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">إيراد</span>
                            <?php elseif ($trans['type'] == 'expense'): ?>
                                <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">منصرف</span>
                            <?php else: ?>
                                <span class="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">تحويل</span>
                            <?php endif; ?>
                        </td>
                        <td><?= htmlspecialchars($trans['category_name'] ?? '-') ?></td>
                        <td class="<?= $trans['type'] == 'expense' ? 'amount-negative' : 'amount-positive' ?>">
                            <?= number_format($trans['amount'], 2) ?>
                        </td>
                        <td><?= htmlspecialchars($trans['description']) ?></td>
                        <td><small class="text-muted"><?= htmlspecialchars($trans['user_name']) ?></small></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

</div> <!-- End .finance-wrapper -->

<!-- Modals -->
<?php include __DIR__ . '/partials/modals.php'; ?>