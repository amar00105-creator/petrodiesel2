<?php
// Expects $data['pump'], $data['counters'], $data['workers']
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إدارة العدادات | بتروديزل</title>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <style>body { font-family: 'IBM Plex Sans Arabic', sans-serif; background: #f1f5f9; }</style>
</head>
<body>

<div class="container py-5">
    
    <!-- Header -->
    <div class="row mb-5 animate__animated animate__fadeInDown">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <div>
                <a href="<?= BASE_URL ?>/pumps" class="text-decoration-none text-muted mb-2 d-inline-block"><i class="fas fa-arrow-left me-1"></i> العودة للمكائن</a>
                <h2 class="fw-bold">إدارة العدادات: <span class="text-primary"><?= htmlspecialchars($data['pump']['name']) ?></span></h2>
                <span class="badge bg-secondary fs-6"><i class="fas fa-database me-1"></i> <?= htmlspecialchars($data['pump']['tank_name']) ?></span>
            </div>
        </div>
    </div>

    <?php if (isset($_GET['success'])): ?>
    <div class="alert alert-success alert-dismissible fade show mb-4 animate__animated animate__fadeIn" role="alert">
        <i class="fas fa-check-circle me-2"></i> تم تحديث بيانات العداد بنجاح
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    <?php endif; ?>

    <!-- Counters Grid -->
    <div class="row">
        <?php foreach ($data['counters'] as $counter): ?>
            <div class="col-md-6 mb-4 animate__animated animate__fadeInUp">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-header bg-white border-bottom border-light py-3 px-4 d-flex justify-content-between align-items-center">
                        <span class="fw-bold fs-5"><i class="fas fa-tachometer-alt me-2 text-warning"></i> <?= htmlspecialchars($counter['name']) ?></span>
                    </div>
                    <div class="card-body p-4 bg-white">
                        <form action="<?= BASE_URL ?>/pumps/updateCounter" method="POST">
                            <input type="hidden" name="pump_id" value="<?= $data['pump']['id'] ?>">
                            <input type="hidden" name="counter_id" value="<?= $counter['id'] ?>">
                            
                            <!-- Worker Assignment -->
                            <div class="mb-4">
                                <label class="form-label fw-bold text-muted small text-uppercase">العامل المسؤول (الحالي)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-0"><i class="fas fa-user-hard-hat text-secondary"></i></span>
                                    <select name="worker_id" class="form-select border-0 bg-light fw-bold text-dark p-2" style="border-radius: 0 8px 8px 0;">
                                        <option value="">-- غير محدد --</option>
                                        <?php foreach ($data['workers'] as $worker): ?>
                                            <option value="<?= $worker['id'] ?>" <?= ($counter['current_worker_id'] == $worker['id']) ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($worker['name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="form-text text-success small mt-2"><i class="fas fa-info-circle"></i> سيتم ربط مبيعات هذا العداد بهذا العامل تلقائياً.</div>
                            </div>

                            <hr class="border-light my-4">

                            <!-- Reading Adjustment -->
                            <div class="mb-4">
                                <label class="form-label fw-bold text-muted small text-uppercase">قراءة العداد الحالية (L)</label>
                                <div class="input-group">
                                    <input type="number" step="0.01" name="current_reading" class="form-control form-control-lg border-2" value="<?= $counter['current_reading'] ?>">
                                    <button class="btn btn-outline-secondary" type="button" disabled>Liters</button>
                                </div>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary rounded-pill py-2">
                                    <i class="fas fa-save me-2"></i> حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
