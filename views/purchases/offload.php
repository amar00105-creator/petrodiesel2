<?php
// Expects $purchase, $tanks
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تفريغ الشحنة | بتروديزل</title>
    <link href="<?= BASE_URL ?>/css/style.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body style="background: #f5f7fa; font-family: 'Tajawal', sans-serif;">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow rounded-4 overflow-hidden">
                <div class="card-header bg-warning text-dark p-4">
                    <h3 class="fw-bold mb-0"><i class="fas fa-truck-loading me-2"></i> تفريغ وقود من الشاحنة</h3>
                </div>
                <div class="card-body p-4">
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5 class="text-muted">تفاصيل الشحنة</h5>
                            <p class="mb-1"><strong>رقم الفاتورة:</strong> <?= htmlspecialchars($purchase['invoice_number']) ?></p>
                            <p class="mb-1"><strong>السائق:</strong> <?= htmlspecialchars($purchase['driver_name'] ?? 'غير معرف') ?></p>
                            <p class="mb-1"><strong>رقم الشاحنة:</strong> <?= htmlspecialchars($purchase['truck_number'] ?? '-') ?></p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <h5 class="text-muted">الكمية المطلوبة</h5>
                            <h2 class="fw-bold text-primary"><?= number_format($purchase['volume_ordered']) ?> <small class="fs-6 text-muted">لتر</small></h2>
                        </div>
                    </div>

                    <hr>

                    <form action="<?= BASE_URL ?>/purchases/processOffload" method="POST">
                        <input type="hidden" name="purchase_id" value="<?= $purchase['id'] ?>">
                        
                        <div class="mb-4">
                            <label class="form-label fw-bold">اختر البئر (التنك) المراد التفريغ فيه</label>
                            <select name="tank_id" class="form-select form-select-lg" required>
                                <?php foreach ($tanks as $tank): ?>
                                    <option value="<?= $tank['id'] ?>" <?= ($tank['id'] == $purchase['tank_id']) ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($tank['name']) ?> - <?= htmlspecialchars($tank['product_type']) ?> 
                                        (الحالي: <?= number_format($tank['current_volume']) ?> لتر)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text">يمكنك تغيير البئر إذا اختلف عن التوجيه الأصلي.</div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">الكمية الفعلية المفرغة (لتر)</label>
                            <input type="number" step="0.01" name="quantity" class="form-control form-control-lg" value="<?= $purchase['volume_received'] > 0 ? $purchase['volume_received'] : $purchase['volume_ordered'] ?>" required>
                            <div class="form-text text-danger">تنبيه: سيتم إضافة هذه الكمية لرصيد البئر المختار.</div>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-warning btn-lg fw-bold">
                                <i class="fas fa-check-circle"></i> تأكيد التفريغ وإغلاق الطلب
                            </button>
                            <a href="<?= BASE_URL ?>/purchases" class="btn btn-light btn-lg">إلغاء</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
