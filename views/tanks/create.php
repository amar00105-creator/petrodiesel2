<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow-lg border-0 rounded-4">
                <div class="card-body p-4">
                    <h3 class="fw-bold text-center mb-4 text-primary">إضافة مخزون (بئر) جديد</h3>

                    <form action="<?= BASE_URL ?>/tanks/store" method="POST">
                        <div class="mb-3">
                            <label class="form-label fw-bold">اسم البئر / التنك</label>
                            <input type="text" name="name" class="form-control" placeholder="مثال: بئر الديزل 1" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">نوع الوقود</label>
                            <select name="product_type" class="form-select">
                                <option value="Diesel">ديزل (جتز)</option>
                                <option value="Petrol">بنزين</option>
                                <option value="Gas">غاز</option>
                            </select>
                        </div>

                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold">السعة الكلية (لتر)</label>
                                <input type="number" name="capacity_liters" class="form-control" required placeholder="50000">
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label fw-bold">الرصيد الحالي (لتر)</label>
                                <input type="number" name="current_volume" class="form-control" required placeholder="0">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">سعر اللتر الحالي</label>
                            <input type="number" step="0.01" name="current_price" class="form-control" required>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg fw-bold">حفظ البيانات</button>
                            <a href="<?= BASE_URL ?>/tanks" class="btn btn-outline-secondary">إلغاء</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>