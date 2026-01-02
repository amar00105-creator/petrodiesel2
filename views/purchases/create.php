<?php
$title = 'توريد وقود جديد';
?>

<div class="row justify-content-center">
    <div class="col-md-10">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0"><i class="fas fa-truck-moving me-2"></i> تسجيل توريد وقود جديد</h4>
            </div>
            <div class="card-body">
                <form action="<?php echo BASE_URL; ?>/purchases/store" method="POST" enctype="multipart/form-data">

                    <!-- Basic Info -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">المورد <span class="text-danger">*</span></label>
                            <select name="supplier_id" class="form-select" required>
                                <option value="">اختر المورد...</option>
                                <?php foreach ($suppliers as $supplier): ?>
                                    <option value="<?php echo $supplier['id']; ?>">
                                        <?php echo htmlspecialchars($supplier['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">الخزان المستلم <span class="text-danger">*</span></label>
                            <select name="tank_id" class="form-select" required>
                                <option value="">اختيار الخزان...</option>
                                <?php foreach ($tanks as $tank): ?>
                                    <option value="<?php echo $tank['id']; ?>">
                                        <?php echo htmlspecialchars($tank['name']); ?> (
                                        <?php echo $tank['product_type']; ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <hr>

                    <!-- Driver & Transport Info -->
                    <h5 class="mb-3 text-secondary">بيانات السائق والشحن</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">اسم السائق <span class="text-danger">*</span></label>
                            <input type="text" name="driver_name" id="driver_name" class="form-control"
                                list="driversList" required autocomplete="off">
                            <datalist id="driversList">
                                <?php foreach ($drivers as $driver): ?>
                                    <option value="<?php echo htmlspecialchars($driver['name']); ?>">
                                    <?php endforeach; ?>
                            </datalist>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">رقم الشاحنة (اللوحة) <span class="text-danger">*</span></label>
                            <input type="text" name="truck_number" id="truck_number" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">رقم هاتف السائق</label>
                            <input type="text" name="driver_phone" id="driver_phone" class="form-control">
                        </div>
                    </div>

                    <hr>

                    <!-- Invoice Info -->
                    <h5 class="mb-3 text-secondary">تفاصيل الفاتورة والكميات</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">رقم الفاتورة <span class="text-danger">*</span></label>
                            <input type="text" name="invoice_number" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">الكمية المطلوبة (لتر)</label>
                            <input type="number" step="0.01" name="volume_ordered" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">الكمية المستلمة (لتر) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" name="volume_received" class="form-control" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">سعر اللتر <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" name="price_per_liter" id="price_per_liter"
                                class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">إجمالي التكلفة</label>
                            <input type="number" step="0.01" name="total_cost" id="total_cost" class="form-control"
                                readonly>
                        </div>
                    </div>

                    <hr>

                    <!-- Payment Info -->
                    <h5 class="mb-3 text-secondary">الدفعة المالية (اختياري)</h5>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">المبلغ المدفوع</label>
                            <input type="number" step="0.01" name="paid_amount" class="form-control" value="0">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">خصم من</label>
                            <select name="payment_source_type" class="form-select" id="payment_source_type">
                                <option value="">بدون دفع (آجل)</option>
                                <option value="safe">الخزنة</option>
                                <option value="bank">البنك</option>
                            </select>
                        </div>
                        <div class="col-md-4" id="payment_source_id_container" style="display:none;">
                            <label class="form-label">الحساب المحدد</label>
                            <select name="payment_source_id" class="form-select">
                                <!-- Populated via JS/Backend usually, but for now we can rely on a simplistic approach or leave it empty -->
                                <!-- We should pass safes/banks to this view too if we want to list them -->
                                <option value="1">الخزنة الرئيسية / البنك الرئيسي</option>
                            </select>
                            <small class="text-muted">تأكد من اختيار المصدر الصحيح</small>
                        </div>
                    </div>

                    <hr>

                    <!-- Attachments -->
                    <h5 class="mb-3 text-secondary">المرفقات</h5>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">صورة الفاتورة</label>
                            <input type="file" name="invoice_image" class="form-control" accept="image/*">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">صورة إذن التوريد/التفريغ</label>
                            <input type="file" name="delivery_note_image" class="form-control" accept="image/*">
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-4">
                        <button type="submit" class="btn btn-primary btn-lg">حفظ عملية التوريد</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Auto-calculate Total Cost
        const priceInput = document.getElementById('price_per_liter');
        const volumeInput = document.querySelector('input[name="volume_received"]');
        const totalInput = document.getElementById('total_cost');

        function calculateTotal() {
            const price = parseFloat(priceInput.value) || 0;
            const vol = parseFloat(volumeInput.value) || 0;
            totalInput.value = (price * vol).toFixed(2);
        }

        priceInput.addEventListener('input', calculateTotal);
        volumeInput.addEventListener('input', calculateTotal);

        // Filter Payment Sources (Showing logic, ideally would be dynamic)
        const sourceTypeSelect = document.getElementById('payment_source_type');
        const sourceIdContainer = document.getElementById('payment_source_id_container');

        sourceTypeSelect.addEventListener('change', function () {
            if (this.value) {
                sourceIdContainer.style.display = 'block';
            } else {
                sourceIdContainer.style.display = 'none';
            }
        });

        // Auto-fill Driver Info via AJAX
        const driverInput = document.getElementById('driver_name');
        const truckInput = document.getElementById('truck_number');
        const phoneInput = document.getElementById('driver_phone');

        driverInput.addEventListener('change', function () { // Change or input with debounce
            const name = this.value;
            if (name.length > 2) {
                fetch(`<?php echo BASE_URL; ?>/purchases/getDriver?name=${encodeURIComponent(name)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.driver) {
                            truckInput.value = data.driver.truck_number;
                            phoneInput.value = data.driver.phone || '';
                        }
                    });
            }
        });
    });
</script>