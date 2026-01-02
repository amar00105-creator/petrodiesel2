<?php
// Expects $data array from Controller
$d = $data;
$user = $user ?? $data['user'] ?? [];
$stationName = $d['station']['name'] ?? 'إدارة النظام';
?>

<!-- Dashboard Styles -->
<style>
    /* Dashboard Specific Overrides */
    .dashboard-container {
        --text-main: #1e293b;
        --text-light: #64748b;
        --accent-success: #10b981;
        --accent-warning: #f59e0b;
        --accent-danger: #ef4444;
        --accent-info: #6366f1;
        --border-color: #e2e8f0;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --bg-panel: #ffffff;
    }

    /* KPI Cards */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .kpi-card {
        background: var(--bg-panel);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
    }
    .kpi-card::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; width: 100%; height: 3px; 
        background: currentColor; opacity: 0.2;
    }

    .kpi-content { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.75rem; color: var(--text-light); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 5px; }
    
    .kpi-icon {
        width: 48px; height: 48px;
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; opacity: 0.9;
    }

    /* Colors */
    .kpi-sales { color: var(--primary); }
    .kpi-sales .kpi-icon { background: rgba(59, 130, 246, 0.1); color: var(--primary); }
    
    .kpi-safe { color: var(--accent-success); }
    .kpi-safe .kpi-icon { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
    
    .kpi-stock { color: var(--accent-info); }
    .kpi-stock .kpi-icon { background: rgba(99, 102, 241, 0.1); color: var(--accent-info); }
    
    .kpi-truck { color: var(--accent-warning); }
    .kpi-truck .kpi-icon { background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); }

    /* Panels */
    .dashboard-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
    }
    @media (max-width: 991px) { .dashboard-row { grid-template-columns: 1fr; } }

    .ui-panel {
        background: var(--bg-panel);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }

    .panel-head {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fcfcfc;
    }
    .panel-title { font-weight: 600; font-size: 1rem; color: var(--text-main); }
    .panel-action { font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 500; }

    /* Stock Bars */
    .stock-list { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .stock-item { display: flex; align-items: center; gap: 1rem; }
    .stock-meta { width: 110px; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
    .bar-container { flex: 1; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 5px; }
    .stock-num { width: 70px; text-align: left; font-size: 0.85rem; font-weight: 600; color: var(--text-light); }

    /* Table */
    .grid-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .grid-table th { text-align: right; padding: 1rem; background: #f8fafc; color: var(--text-light); font-weight: 600; border-bottom: 1px solid var(--border-color); }
    .grid-table td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; color: var(--text-main); }
    .grid-table tr:hover td { background: #f8fafc; }

    /* Actions Grid */
    .action-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.75rem;
        gap: 0.75rem;
    }
    .btn-quick {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        color: var(--secondary);
        text-decoration: none;
        font-size: 0.85rem;
        transition: all 0.2s;
        text-align: center;
    }
    .btn-quick i { font-size: 1.6rem; margin-bottom: 8px; }
    .btn-quick:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: #eff6ff;
        transform: translateY(-3px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
</style>

<!-- Main Workspace -->
<div class="dashboard-container animate__animated animate__fadeIn">
    
    <!-- Header Widget Area -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="fw-bold mb-1">لوحة المعلومات</h3>
            <p class="text-muted mb-0">مرحباً، <?= htmlspecialchars($user['name'] ?? 'المستخدم') ?></p>
        </div>
        <div class="d-flex gap-2">
            <div class="bg-white px-3 py-2 rounded shadow-sm border">
                <i class="far fa-calendar-alt text-primary me-2"></i>
                <span class="fw-bold"><?= date('Y-m-d') ?></span>
            </div>
            <div class="bg-white px-3 py-2 rounded shadow-sm border">
                <i class="far fa-clock text-primary me-2"></i>
                <span class="fw-bold" id="clock">00:00</span>
            </div>
        </div>
    </div>

        
        <!-- KPI Cards -->
        <div class="kpi-grid animate__animated animate__fadeInUp" style="animation-delay: 0.1s;">
            <div class="kpi-card kpi-sales">
                <div class="kpi-content">
                    <span class="kpi-label">المبيعات اليومية</span>
                    <span class="kpi-value"><?= number_format($d['todaySales']) ?></span>
                </div>
                <div class="kpi-icon"><i class="fas fa-coins"></i></div>
            </div>

            <div class="kpi-card kpi-safe">
                <div class="kpi-content">
                    <span class="kpi-label">رصيد الخزينة</span>
                    <span class="kpi-value"><?= number_format($d['safeBalance']) ?></span>
                </div>
                <div class="kpi-icon"><i class="fas fa-wallet"></i></div>
            </div>

            <div class="kpi-card kpi-stock">
                <div class="kpi-content">
                    <span class="kpi-label">المخزون الكلي</span>
                    <span class="kpi-value"><?= number_format($d['totalStockCurrent']) ?></span>
                </div>
                <div class="kpi-icon"><i class="fas fa-layer-group"></i></div>
            </div>

            <div class="kpi-card kpi-truck">
                <div class="kpi-content">
                    <span class="kpi-label">الوارد (لتر)</span>
                    <span class="kpi-value"><?= number_format($d['todayIncoming']) ?></span>
                </div>
                <div class="kpi-icon"><i class="fas fa-truck-droplet"></i></div>
            </div>
        </div>

        <!-- Split Content -->
        <div class="dashboard-row">
            
            <!-- LEFT: Operations -->
            <div class="panel-container">
                
                <!-- Stock Bars -->
                <div class="ui-panel animate__animated animate__fadeInUp" style="flex: 0 0 auto; animation-delay: 0.2s;">
                    <div class="panel-head">
                        <span class="panel-title">مستويات الوقود</span>
                        <a href="<?= BASE_URL ?>/tanks" class="panel-action">إدارة الآبار</a>
                    </div>
                    <div class="stock-list">
                        <?php 
                        $types = [
                            ['key' => 'Petrol', 'label' => 'بنزين ممتاز', 'color' => '#ef4444', 'data' => $d['petrolStock']],
                            ['key' => 'Diesel', 'label' => 'ديزل (جتز)', 'color' => '#f59e0b', 'data' => $d['dieselStock']],
                            ['key' => 'Gas', 'label' => 'غاز (LPG)', 'color' => '#3b82f6', 'data' => $d['gasStock']]
                        ];
                        foreach ($types as $type):
                            $stock = $type['data'];
                            $percent = ($stock['capacity'] > 0) ? ($stock['current'] / $stock['capacity']) * 100 : 0;
                        ?>
                        <div class="stock-item">
                            <div class="stock-meta" style="color: <?= $type['color'] ?>">
                                <i class="fas fa-circle" style="font-size: 0.6rem;"></i> <?= $type['label'] ?>
                            </div>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: <?= $percent ?>%; background: <?= $type['color'] ?>"></div>
                            </div>
                            <div class="stock-num" dir="ltr"><?= number_format($stock['current']) ?></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="ui-panel animate__animated animate__fadeInUp" style="flex: 1; animation-delay: 0.3s;">
                    <div class="panel-head">
                        <span class="panel-title">سجل العمليات الأخير</span>
                        <a href="<?= BASE_URL ?>/sales" class="panel-action">كافة المبيعات</a>
                    </div>
                    <div class="table-viewport">
                        <?php if (empty($d['recentSales'])): ?>
                            <div style="padding: 2rem; text-align: center; color: var(--text-light);">لا توجد عمليات بيع اليوم</div>
                        <?php else: ?>
                        <table class="grid-table">
                            <thead>
                                <tr>
                                    <th>الوقت</th>
                                    <th>البيان / العامل</th>
                                    <th>حجم (L)</th>
                                    <th>القيمة</th>
                                    <th>الدفع</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($d['recentSales'] as $sale): ?>
                                <tr>
                                    <td style="font-family: monospace; color: var(--text-light);"><?= $sale['time'] ?></td>
                                    <td>
                                        <div style="font-weight: 500;"><?= htmlspecialchars($sale['worker_name'] ?? 'غير محدد') ?></div>
                                        <div style="font-size: 0.75rem; color: var(--text-light);"><?= htmlspecialchars($sale['pump_name'] ?? 'Pump') ?></div>
                                    </td>
                                    <td dir="ltr" style="font-weight: 600;"><?= number_format($sale['volume_sold'], 2) ?></td>
                                    <td dir="ltr" style="color: var(--accent-success); font-weight: 700;"><?= number_format($sale['total_amount'], 2) ?></td>
                                    <td>
                                        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: var(--secondary);">
                                            <?= $sale['payment_method'] ?? 'نقد' ?>
                                        </span>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        <?php endif; ?>
                    </div>
                </div>

            </div>

            <!-- RIGHT: Actions & Analytics -->
            <div class="panel-container">
                
                <div class="ui-panel animate__animated animate__fadeInRight" style="animation-delay: 0.4s;">
                    <div class="panel-head">
                        <span class="panel-title">وصول سريع</span>
                    </div>
                    <div class="action-grid">
                        <a href="<?= BASE_URL ?>/sales/create" class="btn-quick">
                            <i class="fas fa-cash-register" style="color: var(--accent-success);"></i>
                            <span>بيع جديد</span>
                        </a>
                        <a href="<?= BASE_URL ?>/purchases/create" class="btn-quick">
                            <i class="fas fa-truck-moving" style="color: var(--accent-warning);"></i>
                            <span>استلام وقود</span>
                        </a>
                        <a href="<?= BASE_URL ?>/tanks/calibration" class="btn-quick">
                            <i class="fas fa-ruler-vertical" style="color: var(--accent-info);"></i>
                            <span>معايرة</span>
                        </a>
                        <a href="<?= BASE_URL ?>/pumps" class="btn-quick">
                            <i class="fas fa-gas-pump" style="color: var(--primary);"></i>
                            <span>المكائن</span>
                        </a>
                        <a href="<?= BASE_URL ?>/expenses/create" class="btn-quick">
                            <i class="fas fa-file-invoice" style="color: var(--accent-danger);"></i>
                            <span>مصروفات</span>
                        </a>
                        <a href="<?= BASE_URL ?>/finance" class="btn-quick">
                            <i class="fas fa-coins" style="color: var(--accent-warning);"></i>
                            <span>الحسابات</span>
                        </a>
                    </div>
                </div>

                <div class="ui-panel animate__animated animate__fadeInRight" style="flex: 1; animation-delay: 0.5s;">
                    <div class="panel-head">
                        <span class="panel-title">المؤشر الأسبوعي</span>
                    </div>
                    <div class="chart-box">
                        <canvas id="weeklyChart"></canvas>
                    </div>
                </div>

            </div>
        </div>
</div> <!-- End .dashboard-container -->

<!-- Scripts -->
<script>
    // Clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const el = document.getElementById('clock');
        if(el) el.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Chart
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 200, 0, 0);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'المبيعات',
                data: [1500, 2300, 3200, 1800, 2900, 3500, 4100],
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                y: { 
                    beginAtZero: true, 
                    grid: { color: '#f1f5f9', drawBorder: false },
                    ticks: { font: { size: 10 }, maxTicksLimit: 5 }
                }
            }
        }
    });
</script>
