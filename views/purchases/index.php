<?php
$title = 'سجل المشتروات';
?>

<div class="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2" style="color: var(--primary);">سجل المشتروات (وارد الوقود)</h1>
</div>

<!-- Action Cards Grid -->
<div class="row g-3 mb-4">
    <!-- Buy Fuel -->
    <div class="col-md-2 col-6">
        <a href="<?php echo BASE_URL; ?>/purchases/create" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
            <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                    <i class="fas fa-gas-pump fa-lg"></i>
                </div>
                <h6 class="text-dark fw-bold mb-0">شراء وقود</h6>
            </div>
        </a>
    </div>
    <!-- Invoices -->
    <div class="col-md-2 col-6">
        <a href="<?php echo BASE_URL; ?>/purchases/invoices" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
            <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div class="icon-circle bg-secondary bg-opacity-10 text-secondary mb-2">
                    <i class="fas fa-file-invoice fa-lg"></i>
                </div>
                <h6 class="text-dark fw-bold mb-0">فواتير</h6>
            </div>
        </a>
    </div>
    <!-- Purchase Report -->
    <div class="col-md-2 col-6">
        <a href="<?php echo BASE_URL; ?>/purchases/reports" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
            <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div class="icon-circle bg-info bg-opacity-10 text-info mb-2">
                    <i class="fas fa-chart-pie fa-lg"></i>
                </div>
                <h6 class="text-dark fw-bold mb-0">تقرير المشتروات</h6>
            </div>
        </a>
    </div>
    <!-- Add Supplier -->
    <div class="col-md-2 col-6">
        <a href="<?php echo BASE_URL; ?>/purchases/suppliers/create" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
            <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div class="icon-circle bg-success bg-opacity-10 text-success mb-2">
                    <i class="fas fa-user-plus fa-lg"></i>
                </div>
                <h6 class="text-dark fw-bold mb-0">اضافة مورد</h6>
            </div>
        </a>
    </div>
    <!-- Supplier Balances -->
    <div class="col-md-2 col-6">
        <a href="<?php echo BASE_URL; ?>/purchases/suppliers/balances" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
            <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                <div class="icon-circle bg-warning bg-opacity-10 text-warning mb-2">
                    <i class="fas fa-balance-scale fa-lg"></i>
                </div>
                <h6 class="text-dark fw-bold mb-0">أرصدة الموردين</h6>
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

<div class="card shadow-sm">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>التاريخ</th>
                        <th>المورد</th>
                        <th>المادة / الخزان</th>
                        <th>الساق / الشاحنة</th>
                        <th>رقم الفاتورة</th>
                        <th>الكمية (لتر)</th>
                        <th>الإجمالي</th>
                        <th>الحالة</th>
                        <th>المرفقات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($purchases)): ?>
                        <?php foreach ($purchases as $purchase): ?>
                            <tr>
                                <td>
                                    <?php echo $purchase['id']; ?>
                                </td>
                                <td>
                                    <?php echo date('Y-m-d H:i', strtotime($purchase['created_at'])); ?>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($purchase['supplier_name']); ?>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($purchase['tank_name']); ?>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($purchase['driver_name_resolved'] ?? $purchase['driver_name']); ?><br>
                                    <small class="text-muted">
                                        <?php echo htmlspecialchars($purchase['truck_number']); ?>
                                    </small>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($purchase['invoice_number']); ?>
                                </td>
                                <td>
                                    <?php echo number_format($purchase['volume_received'], 2); ?>
                                </td>
                                <td>
                                    <?php echo number_format($purchase['total_cost'], 2); ?>
                                </td>
                                <td>
                                    <span
                                        class="badge bg-<?php echo $purchase['status'] === 'completed' ? 'success' : 'warning'; ?>">
                                        <?php echo $purchase['status']; ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($purchase['invoice_image']): ?>
                                        <a href="<?php echo BASE_URL . '/' . $purchase['invoice_image']; ?>" target="_blank"
                                            class="btn btn-xs btn-outline-info" title="صورة الفاتورة">
                                            <i class="fas fa-file-invoice"></i>
                                        </a>
                                    <?php endif; ?>
                                    <?php if ($purchase['delivery_note_image']): ?>
                                        <a href="<?php echo BASE_URL . '/' . $purchase['delivery_note_image']; ?>" target="_blank"
                                            class="btn btn-xs btn-outline-secondary" title="إذن التوريد">
                                            <i class="fas fa-truck-loading"></i>
                                        </a>
                                    <?php endif; ?>

                                    <!-- Offload Action -->
                                    <?php if (in_array($purchase['status'], ['ordered', 'arrived', 'in_transit'])): ?>
                                        <a href="<?= BASE_URL ?>/purchases/offload?id=<?= $purchase['id'] ?>" class="btn btn-xs btn-warning text-dark fw-bold" title="تفريغ الشحنة">
                                            <i class="fas fa-dolly"></i> تفريغ
                                        </a>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="10" class="text-center py-4">لا توجد سجلات مشتروات حتى الآن</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>