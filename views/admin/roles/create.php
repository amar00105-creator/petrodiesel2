<?php
// views/admin/roles/create.php
$page_title = 'إضافة دور جديد';

$permissionsList = [
    'dashboard_view' => ['label' => 'عرض لوحة التحكم', 'icon' => 'fas fa-tachometer-alt'],
    'sales_view' => ['label' => 'عرض المبيعات', 'icon' => 'fas fa-shopping-cart'],
    'sales_create' => ['label' => 'إضافة مبيعات', 'icon' => 'fas fa-plus-circle'],
    'purchases_view' => ['label' => 'عرض المشتروات', 'icon' => 'fas fa-truck'],
    'purchases_create' => ['label' => 'إضافة مشتروات', 'icon' => 'fas fa-cart-plus'],
    'finance_view' => ['label' => 'عرض الحسابات', 'icon' => 'fas fa-wallet'],
    'finance_manage' => ['label' => 'إدارة الحسابات', 'icon' => 'fas fa-money-check-alt'],
    'reports_view' => ['label' => 'استعراض التقارير', 'icon' => 'fas fa-chart-line'],
    'settings_view' => ['label' => 'الوصول للإعدادات', 'icon' => 'fas fa-cogs'],
    'stations_manage' => ['label' => 'إدارة المحطات', 'icon' => 'fas fa-gas-pump'],
    'users_manage' => ['label' => 'إدارة المستخدمين', 'icon' => 'fas fa-users'],
    'tanks_view' => ['label' => 'عرض المخزون', 'icon' => 'fas fa-layer-group']
];

$rolePerms = $role['permissions'] ?? [];
?>

<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />

<style>
    body {
        font-family: 'Cairo', sans-serif !important;
        background-color: #f8fafc;
        overflow-x: hidden;
    }

    /* Layout Split */
    .split-container {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        padding: 24px;
        max-width: 1600px;
        margin: 0 auto;
    }

    .panel-info {
        flex: 1 1 350px;
        /* Min 350px width */
        background: white;
        border-radius: 24px;
        padding: 30px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        height: fit-content;
        position: sticky;
        top: 20px;
    }

    .panel-permissions {
        flex: 2 1 600px;
        /* Takes more space */
        background: white;
        border-radius: 24px;
        padding: 30px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    /* Gradient Header for Info Panel */
    .info-header {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        margin: -30px -30px 30px -30px;
        padding: 40px 30px;
        border-radius: 24px 24px 0 0;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .info-header::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1), transparent 70%);
    }

    /* Inputs */
    .floating-input-group {
        position: relative;
        margin-bottom: 20px;
    }

    .floating-input-group i {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        transition: color 0.3s;
    }

    .form-control {
        border-radius: 12px;
        padding: 12px 15px 12px 45px;
        /* Space for icon LTR/RTL adjusted below */
        border: 2px solid #e5e7eb;
        transition: all 0.3s;
    }

    /* RTL specific icon padding */
    html[dir="rtl"] .form-control {
        padding: 12px 45px 12px 15px;
    }

    .form-control:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .form-control:focus+i {
        color: #3b82f6;
    }

    /* Permission Cards */
    .perm-card {
        border: 2px solid #f1f5f9;
        border-radius: 16px;
        padding: 20px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f8fafc;
    }

    .perm-card:hover {
        border-color: #bfdbfe;
        transform: translateY(-2px);
        background: white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .perm-card.active {
        border-color: #3b82f6;
        background: #eff6ff;
    }

    .perm-icon {
        width: 45px;
        height: 45px;
        border-radius: 12px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        color: #64748b;
        transition: all 0.3s;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .perm-card.active .perm-icon {
        background: #3b82f6;
        color: white;
    }

    /* Toggle Switch */
    .switch-wrapper {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }

    .switch-wrapper input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #cbd5e1;
        transition: .4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    /* RTL Toggle logic override */
    html[dir="rtl"] .slider:before {
        left: auto;
        right: 3px;
    }

    input:checked+.slider {
        background-color: #3b82f6;
    }

    input:checked+.slider:before {
        transform: translateX(20px);
    }

    html[dir="rtl"] input:checked+.slider:before {
        transform: translateX(-20px);
    }

    /* Action Bar */
    .action-bar {
        background: white;
        padding: 20px;
        border-radius: 16px;
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
    }
</style>

<form action="<?php echo BASE_URL; ?>/roles/create" method="POST" id="roleForm">
    <div class="split-container">

        <!-- Left Panel: Role Details -->
        <div class="panel-info animate__animated animate__fadeInLeft">
            <div class="info-header">
                <div class="bg-white bg-opacity-20 d-inline-flex p-3 rounded-circle mb-3 backdrop-blur">
                    <i class="fas fa-user-shield fa-2x"></i>
                </div>
                <h3 class="fw-bold mb-1">تفاصيل الدور</h3>
                <p class="text-blue-100 mb-0 opacity-75 small">قم بتسمية الدور وتحديد مهامه الأساسية</p>
            </div>

            <div class="mt-4">
                <label class="form-label fw-bold mb-2 text-secondary small">اسم الدور الوظيفي <span class="text-danger">*</span></label>
                <div class="floating-input-group">
                    <input type="text" name="name" class="form-control" placeholder="مثال: مشرف مبيعات" required
                        value="<?php echo htmlspecialchars($role['name'] ?? ''); ?>">
                    <i class="fas fa-tag"></i>
                </div>

                <label class="form-label fw-bold mb-2 text-secondary small">الوصف (اختياري)</label>
                <div class="floating-input-group">
                    <textarea name="description" class="form-control" rows="5" placeholder="اكتب وصفاً مختصراً للمهام والمسؤوليات..."><?php echo htmlspecialchars($role['description'] ?? ''); ?></textarea>
                    <i class="fas fa-align-right" style="top: 20px; transform: none;"></i>
                </div>
            </div>

            <div class="mt-4 p-3 bg-blue-50 rounded-3 border border-blue-100">
                <div class="d-flex align-items-start gap-2">
                    <i class="fas fa-info-circle text-primary mt-1"></i>
                    <p class="small text-muted mb-0 line-height-lg">
                        تسمح الأدوار بتنظيم الوصول إلى أجزاء النظام المختلفة. تأكد من منح الصلاحيات الضرورية فقط لكل دور لضمان أمان البيانات.
                    </p>
                </div>
            </div>
        </div>

        <!-- Right Panel: Permissions Grid -->
        <div class="panel-permissions animate__animated animate__fadeInRight">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h4 class="fw-bold mb-0 text-dark">
                    <i class="fas fa-lock text-warning me-2"></i> صلاحيات الوصول
                </h4>
                <div class="form-check form-switch d-flex align-items-center gap-2">
                    <input class="form-check-input mt-0 cursor-pointer" type="checkbox" id="selectAll" style="width: 3em; height: 1.5em;">
                    <label class="form-check-label fw-bold small cursor-pointer" for="selectAll" style="user-select: none;">تحديد الكل</label>
                </div>
            </div>

            <div class="row g-3">
                <?php foreach ($permissionsList as $key => $meta):
                    $isChecked = (!empty($rolePerms[$key]) || (isset($rolePerms['all']) && $rolePerms['all']));
                ?>
                    <div class="col-md-6 col-xl-4">
                        <label class="perm-card <?php echo $isChecked ? 'active' : ''; ?>" for="perm_<?php echo $key; ?>">
                            <div class="d-flex align-items-center gap-3">
                                <div class="perm-icon">
                                    <i class="<?php echo $meta['icon']; ?>"></i>
                                </div>
                                <span class="fw-bold text-dark small"><?php echo $meta['label']; ?></span>
                            </div>

                            <div class="switch-wrapper">
                                <input type="checkbox" name="permissions[<?php echo $key; ?>]" value="1"
                                    id="perm_<?php echo $key; ?>"
                                    class="perm-checkbox"
                                    <?php echo $isChecked ? 'checked' : ''; ?>>
                                <span class="slider"></span>
                            </div>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Action Bar (Sticky Bottom Effect within Panel) -->
            <div class="action-bar mt-5">
                <a href="<?php echo BASE_URL; ?>/roles" class="btn btn-light rounded-pill px-4 text-muted fw-bold">
                    إلغاء
                </a>
                <button type="submit" class="btn btn-primary rounded-pill px-5 py-2 shadow-lg fw-bold hover-scale">
                    <i class="fas fa-save me-2"></i> حفظ الدور الجديد
                </button>
            </div>
        </div>
    </div>
</form>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Toggle Card Active State
        const checkboxes = document.querySelectorAll('.perm-checkbox');
        checkboxes.forEach(chk => {
            chk.addEventListener('change', function() {
                const card = this.closest('.perm-card');
                if (this.checked) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });

        // Select All Logic
        const selectAll = document.getElementById('selectAll');
        selectAll.addEventListener('change', function() {
            checkboxes.forEach(chk => {
                chk.checked = this.checked;
                // Trigger change event to update styles
                chk.dispatchEvent(new Event('change'));
            });
        });
    });
</script>