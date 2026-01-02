<?php
// Expects $data['pumps']
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إدارة مكائن الوقود | بتروديزل</title>
    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Bootstrap 5 (RTL if available, but simply CDN here) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    <!-- Animations -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    
    <style>
        body { font-family: 'IBM Plex Sans Arabic', sans-serif; background: #f1f5f9; }
        .card { border-radius: 15px; overflow: hidden; }
        .btn-rounded { border-radius: 50px; }
    </style>
</head>
<body>

<div class="container py-5">
    <div class="row mb-4 animate__animated animate__fadeInDown">
        <div class="col-md-6">
            <h2 class="fw-bold"><i class="fas fa-gas-pump me-2 text-primary"></i> إدارة مكائن الوقود</h2>
            <p class="text-muted">إضافة وتعديل المكائن والعدادات وتعيين العمال.</p>
        </div>
        <div class="col-md-6 text-md-end">
            <a href="<?= BASE_URL ?>/" class="btn btn-outline-secondary btn-rounded px-4 me-2">
                <i class="fas fa-home me-2"></i> الرئسية
            </a>
            <a href="<?= BASE_URL ?>/pumps/create" class="btn btn-primary btn-rounded px-4 shadow-sm">
                <i class="fas fa-plus me-2"></i> إضافة ماكينة
            </a>
        </div>
    </div>

    <div class="row animate__animated animate__fadeInUp">
        <?php if (empty($data['pumps'])): ?>
            <div class="col-12 text-center py-5">
                <div class="text-muted opacity-50 mb-3"><i class="fas fa-charging-station fa-4x"></i></div>
                <p class="text-muted fs-5">لا توجد مكائن مضافة بعد.</p>
            </div>
        <?php else: ?>
            <?php foreach ($data['pumps'] as $pump): ?>
                <div class="col-md-4 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body p-4 text-center">
                            <div class="mb-3">
                                <span class="badge bg-light text-primary border border-primary fs-6"><?= htmlspecialchars($pump['tank_name']) ?></span>
                            </div>
                            <h4 class="fw-bold mb-3"><?= htmlspecialchars($pump['name']) ?></h4>
                            
                            <!-- Counters List -->
                            <div class="mb-3 text-start bg-light p-3 rounded">
                                <?php if(empty($pump['counters'])): ?>
                                    <small class="text-muted">لا يوجد عدادات</small>
                                <?php else: ?>
                                    <ul class="list-unstyled mb-0">
                                        <?php foreach($pump['counters'] as $counter): ?>
                                            <li class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                <div>
                                                    <i class="fas fa-tachometer-alt text-secondary me-1"></i>
                                                    <strong><?= number_format($counter['current_reading'], 2) ?></strong>
                                                    <div class="small text-muted">
                                                        <i class="fas fa-user me-1"></i> <?= htmlspecialchars($counter['worker_name'] ?? 'غير محدد') ?>
                                                    </div>
                                                </div>
                                                <?php if (\App\Helpers\AuthHelper::isAdmin()): ?>
                                                <form action="<?= BASE_URL ?>/pumps/deleteCounter" method="POST" onsubmit="return confirm('هل أنت متأكد من حذف هذا العداد؟');">
                                                    <input type="hidden" name="id" value="<?= $counter['id'] ?>">
                                                    <input type="hidden" name="pump_id" value="<?= $pump['id'] ?>">
                                                    <button type="submit" class="btn btn-sm btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>
                                                </form>
                                                <?php endif; ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                <?php endif; ?>
                            </div>

                            <div class="d-flex gap-2">
                                <a href="<?= BASE_URL ?>/pumps/manage?id=<?= $pump['id'] ?>" class="btn btn-outline-primary btn-rounded flex-grow-1">
                                    <i class="fas fa-cogs me-1"></i> إدارة
                                </a>
                                <?php if (\App\Helpers\AuthHelper::isAdmin()): ?>
                                <form action="<?= BASE_URL ?>/pumps/delete" method="POST" onsubmit="return confirm('تحذير: سيتم حذف الماكينة وجميع عداداتها. هل أنت متأكد؟');">
                                    <input type="hidden" name="id" value="<?= $pump['id'] ?>">
                                    <button type="submit" class="btn btn-outline-danger btn-rounded">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
