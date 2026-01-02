<?php
// Validates $pumps, $workers, $customers are passed
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل مبيعات جديدة | بتروديزل</title>
    <link href="<?= BASE_URL ?>/css/style.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4361ee;
            --primary-dark: #3f37c9;
            --secondary: #f72585;
            --bg-glass: rgba(255, 255, 255, 0.9);
            --bg-glass-dark: rgba(20, 20, 20, 0.85);
            --card-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            --input-bg: rgba(255, 255, 255, 0.5);
            --border-color: rgba(255, 255, 255, 0.18);
        }

        body {
            font-family: 'Tajawal', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        .glass-card {
            background: var(--bg-glass);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            box-shadow: var(--card-shadow);
            padding: 2rem;
            transition: transform 0.3s ease;
        }

        .form-label {
            font-weight: 700;
            color: #333;
            margin-bottom: 0.5rem;
        }

        .form-control,
        .form-select {
            background: var(--input-bg);
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
            background: #fff;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.15);
        }

        .btn-premium {
            background: linear-gradient(45deg, var(--primary), var(--primary-dark));
            border: none;
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 800;
            font-size: 1.1rem;
            width: 100%;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
        }

        .btn-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(67, 97, 238, 0.4);
        }

        .info-badge {
            background: rgba(67, 97, 238, 0.1);
            color: var(--primary);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            display: inline-block;
            margin-top: 5px;
        }

        .animate-in {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="glass-card animate-in">
                    <div class="text-center mb-4">
                        <h2 class="fw-bold fs-2" style="color: var(--primary);">تسجيل وردية جديدة</h2>
                        <p class="text-muted">أدخل بيانات المبيعات بدقة</p>
                    </div>

                    <form action="<?= BASE_URL ?>/sales/store" method="POST" id="salesForm">
                        <!-- Pump & Counter Selection -->
                        <div class="mb-4">
                            <label for="counter_id" class="form-label">عداد الطرمبة</label>
                            <select name="counter_id" id="counter_id" class="form-select" required>
                                <option value="">اختر العداد...</option>
                                <?php foreach ($pumps as $pump): ?>
                                    <optgroup
                                        label="<?= htmlspecialchars($pump['name']) ?> (<?= htmlspecialchars($pump['tank_name']) ?>)">
                                        <?php foreach ($pump['counters'] as $counter): ?>
                                            <option value="<?= $counter['id'] ?>">
                                                <?= htmlspecialchars($counter['name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </optgroup>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Auto-Detected Worker (Editable) -->
                        <div class="mb-4 p-3 rounded" style="background: rgba(0,0,0,0.03);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="w-50">
                                    <label class="form-label text-muted mb-1">العامل المسؤول</label>
                                    <select name="worker_id" id="worker_id" class="form-select">
                                        <option value="">-- اختر العامل --</option>
                                        <?php foreach ($workers as $worker): ?>
                                            <option value="<?= $worker['id'] ?>"><?= htmlspecialchars($worker['name']) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="text-end">
                                    <h6 class="text-muted mb-1">نوع الوقود</h6>
                                    <span class="badge bg-primary fs-6" id="product_type_badge">--</span>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label">القراءة السابقة</label>
                                <input type="number" step="0.01" name="opening_reading" id="opening_reading"
                                    class="form-control" readonly required>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label">القراءة الحالية</label>
                                <input type="number" step="0.01" name="closing_reading" id="closing_reading"
                                    class="form-control" required placeholder="0.00">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label">السعر (لتر)</label>
                                <div class="input-group">
                                    <input type="number" step="0.01" name="unit_price" id="unit_price"
                                        class="form-control" readonly required>
                                    <button type="button" class="btn btn-outline-secondary" id="unlockPriceBtn">
                                        <i class="fas fa-lock"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label">الكمية المباعة</label>
                                <input type="number" step="0.01" name="volume_sold" id="volume_sold"
                                    class="form-control" readonly>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fs-5">خلاصة الوردية</label>
                            <div class="d-flex justify-content-between align-items-center p-3 rounded bg-white border">
                                <span class="text-muted">الإجمالي المطلوب</span>
                                <span class="fs-4 fw-bold text-success" id="total_amount_display">0.00</span>
                                <input type="hidden" name="total_amount" id="total_amount">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">طريقة الدفع</label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                <option value="cash">نقد (كاش)</option>
                                <option value="credit">آجل (ذمم)</option>
                            </select>
                        </div>

                        <div class="mb-4 d-none animate-in" id="customer_section">
                            <label class="form-label">العميل (الزبون)</label>
                            <select name="customer_id" id="customer_id" class="form-select">
                                <option value="">اختر العميل...</option>
                                <?php foreach ($customers as $customer): ?>
                                    <option value="<?= $customer['id'] ?>">
                                        <?= htmlspecialchars($customer['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">تاريخ الوردية</label>
                            <input type="date" name="sale_date" value="<?= date('Y-m-d') ?>" class="form-control">
                        </div>

                        <button type="submit" class="btn-premium">
                            <i class="fas fa-check-circle me-2"></i> حفظ الوردية
                        </button>
                        <div class="text-center mt-3">
                            <a href="<?= BASE_URL ?>/sales" class="text-muted text-decoration-none">إلغاء وعودة</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        const counterSelect = document.getElementById('counter_id');
        const openingInput = document.getElementById('opening_reading');
        const closingInput = document.getElementById('closing_reading');
        const priceInput = document.getElementById('unit_price');
        const volumeInput = document.getElementById('volume_sold');
        const totalAmountDisplay = document.getElementById('total_amount_display');
        const totalAmountInput = document.getElementById('total_amount');
        const workerDisplay = document.getElementById('worker_display');
        const workerIdInput = document.getElementById('worker_id');
        const productTypeBadge = document.getElementById('product_type_badge');
        const paymentMethodSelect = document.getElementById('payment_method');
        const customerSection = document.getElementById('customer_section');
        const unlockPriceBtn = document.getElementById('unlockPriceBtn');

        // Fetch Counter Details
        counterSelect.addEventListener('change', function () {
            const counterId = this.value;
            if (counterId) {
                fetch(`<?= BASE_URL ?>/sales/getCounterDetails?counter_id=${counterId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            openingInput.value = data.current_reading;
                            priceInput.value = data.price;
                            // Set selected worker in dropdown
                            if (data.worker_id) {
                                document.getElementById('worker_id').value = data.worker_id;
                            }
                            productTypeBadge.textContent = data.product_type;
                            calculateTotals();
                        }
                    });
            }
        });

        // Auto Calculate
        function calculateTotals() {
            const opening = parseFloat(openingInput.value) || 0;
            const closing = parseFloat(closingInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;

            if (closing > opening) {
                const volume = closing - opening;
                const total = volume * price;

                volumeInput.value = volume.toFixed(2);
                totalAmountInput.value = total.toFixed(2);
                totalAmountDisplay.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
            } else {
                volumeInput.value = '';
                totalAmountInput.value = '';
                totalAmountDisplay.innerText = '0.00';
            }
        }

        closingInput.addEventListener('input', calculateTotals);
        priceInput.addEventListener('input', calculateTotals);

        // Payment Method Toggle
        paymentMethodSelect.addEventListener('change', function () {
            if (this.value === 'credit') {
                customerSection.classList.remove('d-none');
                document.getElementById('customer_id').required = true;
            } else {
                customerSection.classList.add('d-none');
                document.getElementById('customer_id').required = false;
            }
        });

        // Unlock Price
        unlockPriceBtn.addEventListener('click', function () {
            // In a real app, maybe ask for a password prompt here
            // For now, simple toggle
            if (priceInput.readOnly) {
                priceInput.readOnly = false;
                priceInput.focus();
                this.classList.replace('btn-outline-secondary', 'btn-warning');
            } else {
                priceInput.readOnly = true;
                this.classList.replace('btn-warning', 'btn-outline-secondary');
            }
        });

    </script>
</body>

</html>
