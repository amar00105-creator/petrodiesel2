<?php
$title = 'تسجيل مصروف جديد';
?>

<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-header bg-danger text-white">
                <h4 class="mb-0"><i class="fas fa-money-bill-wave me-2"></i> تسجيل مصروف (مشتروات بسيطة)</h4>
            </div>
            <div class="card-body">
                <form action="<?php echo BASE_URL; ?>/expenses/store" method="POST">

                    <div class="mb-3">
                        <label class="form-label">الفئة / التصنيف <span class="text-danger">*</span></label>
                        <select name="category" class="form-select" required>
                            <option value="">اختيار التصنيف...</option>
                            <option value="Operational">تشغيلية (نثرية)</option>
                            <option value="Salaries">رواتب وأجور</option>
                            <option value="Maintenance">صيانة وإصلاح</option>
                            <option value="Electricity">كهرباء / مولدة</option>
                            <option value="GovFees">رسوم حكومية/ضرائب</option>
                            <option value="Other">أخرى</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">الوصف / التفاصيل <span class="text-danger">*</span></label>
                        <textarea name="description" class="form-control" rows="3" required
                            placeholder="أدخل تفاصيل المصروف..."></textarea>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">المبلغ (دينار) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" name="amount" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">تاريخ الصرف</label>
                            <input type="date" name="expense_date" class="form-control"
                                value="<?php echo date('Y-m-d'); ?>">
                        </div>
                    </div>

                    <hr>

                    <h5 class="mb-3 text-secondary">مصدر الدفع</h5>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">السحب من <span class="text-danger">*</span></label>
                            <select name="source_type" class="form-select" id="source_type" required>
                                <option value="safe">الخزنة</option>
                                <option value="bank">البنك</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">حدد الخزنة/البنك <span class="text-danger">*</span></label>
                            <select name="source_id" class="form-select" id="source_id" required>
                                <?php if (!empty($safes)): ?>
                                    <?php foreach ($safes as $safe): ?>
                                        <option value="<?php echo $safe['id']; ?>" data-type="safe">
                                            <?php echo htmlspecialchars($safe['name']); ?> (الرصيد:
                                            <?php echo number_format($safe['balance'], 2); ?>)
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>
                    </div>

                    <!-- Hidden Data for JS switching logic if needed -->
                    <div id="bank-options" style="display:none;">
                        <?php if (!empty($banks)): ?>
                            <?php foreach ($banks as $bank): ?>
                                <option value="<?php echo $bank['id']; ?>" data-type="bank">
                                    <?php echo htmlspecialchars($bank['bank_name']); ?> (
                                    <?php echo $bank['account_number']; ?>)
                                </option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <div id="safe-options" style="display:none;">
                        <?php if (!empty($safes)): ?>
                            <?php foreach ($safes as $safe): ?>
                                <option value="<?php echo $safe['id']; ?>" data-type="safe">
                                    <?php echo htmlspecialchars($safe['name']); ?> (الرصيد:
                                    <?php echo number_format($safe['balance'], 2); ?>)
                                </option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <div class="d-grid gap-2 mt-4">
                        <button type="submit" class="btn btn-danger btn-lg">تسجيل المصروف</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const typeSelect = document.getElementById('source_type');
        const idSelect = document.getElementById('source_id');
        const safeOptions = document.getElementById('safe-options').innerHTML;
        const bankOptions = document.getElementById('bank-options').innerHTML;

        typeSelect.addEventListener('change', function () {
            if (this.value === 'safe') {
                idSelect.innerHTML = safeOptions;
            } else {
                idSelect.innerHTML = bankOptions;
            }
        });
    });
</script>