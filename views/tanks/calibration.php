<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow-lg border-0 rounded-4">
                <div class="card-body p-4">
                    <h3 class="fw-bold text-center mb-4 text-primary">تسجيل معايرة (القياس)</h3>

                    <form action="<?= BASE_URL ?>/tanks/saveCalibration" method="POST">
                        <div class="mb-3">
                            <label class="form-label fw-bold">البئر / التنك</label>
                            <select name="tank_id" class="form-select" required>
                                <?php foreach ($tanks as $tank): ?>
                                    <option value="<?= $tank['id'] ?>"><?= htmlspecialchars($tank['name']) ?> (<?= $tank['current_volume'] ?> L)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">نوع المعايرة</label>
                            <select name="reading_type" class="form-select">
                                <option value="opening">افتتاحية (الصباح)</option>
                                <option value="check">وسط اليوم</option>
                                <option value="closing">إغلاق (المساء)</option>
                                <option value="delivery">بعد التفريغ</option>
                            </select>
                        </div>

                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold">القياس بالسنتمتر (cm)</label>
                                <input type="number" step="0.1" name="reading_cm" class="form-control" required placeholder="0.0">
                                <div class="form-text small">قراءة سيخ المعايرة</div>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold">الكمية المقابلة (لتر)</label>
                                <input type="number" step="0.1" name="volume_liters" class="form-control" required placeholder="0.0">
                                <div class="form-text small">حسب جدول المعايرة</div>
                            </div>
                        </div>

                        <div class="alert alert-info small">
                            <i class="fas fa-info-circle"></i> سيقوم النظام تلقائياً بحساب الفروقات (النقص/الزيادة) مقارنة بالرصيد الدفتري الحالي.
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg fw-bold">حفظ المعايرة</button>
                            <a href="<?= BASE_URL ?>/tanks" class="btn btn-outline-secondary">إلغاء</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>