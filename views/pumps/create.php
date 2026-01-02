<?php
// Expects $data['tanks']
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إضافة ماكينة | بتروديزل</title>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <style>body { font-family: 'IBM Plex Sans Arabic', sans-serif; background: #f1f5f9; }</style>
</head>
<body>

<div class="container py-5">
    <div class="row justify-content-center animate__animated animate__fadeIn">
        <div class="col-md-8">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="fw-bold"><i class="fas fa-plus-circle text-success me-2"></i> إضافة ماكينة وقود</h3>
                <a href="<?= BASE_URL ?>/pumps" class="btn btn-light rounded-circle shadow-sm" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-arrow-left"></i></a>
            </div>

            <div class="card border-0 shadow-lg rounded-4">
                <div class="card-body p-5">
                    <form action="<?= BASE_URL ?>/pumps/store" method="POST" id="pumpForm">
                        
                        <div class="mb-4">
                            <label class="form-label fw-bold">اسم الماكينة</label>
                            <input type="text" name="name" class="form-control form-control-lg bg-light" placeholder="مثال: طلمبة 1 (بنزين)" required>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">التنك المصدر (الخزان)</label>
                            <select name="tank_id" class="form-select form-select-lg bg-light" required>
                                <option value="">-- اختر التنك --</option>
                                <?php foreach ($data['tanks'] as $tank): ?>
                                    <option value="<?= $tank['id'] ?>"><?= htmlspecialchars($tank['name']) ?> (<?= $tank['product_type'] ?>)</option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text">سيتم ربط الماكينة بهذا الخزان لسحب الوقود.</div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">عدد العدادات (مسدسات)</label>
                            <select name="counter_count" id="counterCount" class="form-select form-select-lg bg-light">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        <!-- Dynamic Counters Area -->
                        <div id="countersArea" class="mb-4">
                            <!-- JS will populate this -->
                        </div>
                        
                        <div class="d-grid mt-4">
                            <button type="submit" class="btn btn-primary btn-lg rounded-pill shadow-sm">
                                <i class="fas fa-save me-2"></i> حفظ الماكينة
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const workers = <?= json_encode($data['workers'] ?? []) ?>;

    function renderCounters() {
        const count = document.getElementById('counterCount').value;
        const container = document.getElementById('countersArea');
        container.innerHTML = ''; // Clear

        for (let i = 1; i <= count; i++) {
            let workerOptions = '<option value="">-- اختر العامل --</option>';
            workers.forEach(w => {
                workerOptions += `<option value="${w.id}">${w.name}</option>`;
            });

            const html = `
                <div class="card mb-3 border bg-white animate__animated animate__fadeIn">
                    <div class="card-header bg-light fw-bold">
                        <i class="fas fa-gas-pump me-2 text-primary"></i> عداد (مسدس) رقم ${i}
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label text-muted">قراءة العداد الابتدائية <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" name="readings[]" class="form-control" placeholder="0.00" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label text-muted">تعيين عامل <span class="text-danger">*</span></label>
                                <select name="workers[]" class="form-select" required>
                                    ${workerOptions}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }
    }

    // Init
    document.getElementById('counterCount').addEventListener('change', renderCounters);
    renderCounters(); // Run once
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
