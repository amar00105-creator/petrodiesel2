<?php
// views/admin/settings/index.php
?>
<style>
    :root {
        --settings-primary: #4f46e5;
        --settings-bg: #f8fafc;
        --settings-card-bg: #ffffff;
        --settings-text: #1e293b;
        --settings-text-muted: #64748b;
        --settings-border: #e2e8f0;
    }

    .settings-container {
        padding-top: 1rem;
        padding-bottom: 3rem;
    }

    .settings-header {
        margin-bottom: 2.5rem;
    }

    .settings-title {
        font-family: 'Cairo', sans-serif;
        font-size: 2rem;
        font-weight: 800;
        color: var(--settings-text);
        display: flex;
        align-items: center;
        gap: 1rem;
        background: linear-gradient(to left, #1e293b, #4f46e5);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .settings-subtitle {
        color: var(--settings-text-muted);
        font-size: 1.1rem;
        margin-top: 0.5rem;
    }

    /* Modern Sidebar Navigation */
    .settings-nav {
        background: white;
        padding: 1rem;
        border-radius: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        height: 100%;
        border: 1px solid var(--settings-border);
    }

    .settings-nav .nav-link {
        color: var(--settings-text-muted);
        padding: 1.2rem 1.5rem;
        margin-bottom: 0.8rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
        font-weight: 600;
        position: relative;
        overflow: hidden;
    }

    .settings-nav .nav-link:hover {
        background-color: #f1f5f9;
        color: var(--settings-primary);
        transform: translateX(-5px); /* RTL movement */
    }

    .settings-nav .nav-link.active {
        background: linear-gradient(135deg, var(--settings-primary), #818cf8);
        color: white;
        box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
        transform: translateX(-5px);
    }

    .settings-nav .nav-link i {
        font-size: 1.4rem;
        width: 30px;
        text-align: center;
        transition: transform 0.3s ease;
    }

    .settings-nav .nav-link:hover i {
        transform: scale(1.1) rotate(5deg);
    }

    /* Content Cards */
    .settings-card {
        background: var(--settings-card-bg);
        border-radius: 1.5rem;
        border: 1px solid var(--settings-border);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        padding: 2.5rem;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
    }

    .settings-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 6px;
        background: linear-gradient(90deg, var(--settings-primary), #818cf8);
    }

    .card-header-custom {
        border-bottom: 2px dashed var(--settings-border);
        padding-bottom: 1.5rem;
        margin-bottom: 2.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .card-icon {
        width: 50px;
        height: 50px;
        background: #e0e7ff;
        color: var(--settings-primary);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    .card-title-custom {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--settings-text);
        margin: 0;
    }

    /* Form Elements */
    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label-custom {
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.8rem;
        display: block;
        font-size: 0.95rem;
    }

    .form-control-custom, .form-select-custom {
        border: 2px solid #e2e8f0;
        border-radius: 1rem;
        padding: 1rem 1.2rem;
        transition: all 0.3s ease;
        background-color: #f8fafc;
        color: #1e293b;
        width: 100%;
        font-size: 1rem;
    }

    .form-control-custom:focus, .form-select-custom:focus {
        border-color: var(--settings-primary);
        outline: none;
        box-shadow: 0 0 0 5px rgba(79, 70, 229, 0.1);
        background-color: #fff;
    }

    .input-group-custom {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .input-icon {
        position: absolute;
        right: 1.2rem;
        color: #94a3b8;
        font-size: 1.1rem;
        z-index: 10;
        pointer-events: none;
    }

    .control-with-icon {
        padding-right: 3rem; /* Space for icon in RTL */
    }

    .btn-save {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 1rem 2.5rem;
        border-radius: 1rem;
        font-weight: 600;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1rem;
        margin-top: 1rem;
    }

    .btn-save:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.3);
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    }

    .range-value {
        font-weight: 700;
        color: var(--settings-primary);
        font-size: 1.1rem;
    }

    /* Animations */
    .tab-pane {
        animation: slideUpFade 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Role Card */
    .role-card {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
        color: white;
        text-align: center;
        padding: 4rem 2rem;
        border-radius: 1.5rem;
        position: relative;
        overflow: hidden;
    }
    
    .role-card-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDBDNDQuOCAwIDAgNDQuOCAwIDEwMHM0NC44IDEwMCAxMDAgMTAwIDEwMC00NC44IDEwMC0xMDBTMTU1LjIgMCAxMDAgMHptMCAxODB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==');
        opacity: 0.1;
        animation: spin 60s linear infinite;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }

    .btn-role {
        background: white;
        color: var(--settings-primary);
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 700;
        text-decoration: none;
        display: inline-block;
        margin-top: 2rem;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        transition: transform 0.3s;
        position: relative;
        z-index: 2;
    }

    .btn-role:hover {
        transform: scale(1.05);
        color: var(--settings-primary);
    }
</style>

<div class="container-fluid settings-container">
    
    <div class="row align-items-center settings-header">
        <div class="col">
            <h2 class="settings-title">
                <i class="fas fa-cogs fa-spin-hover"></i>
                إعدادات النظام
            </h2>
            <p class="settings-subtitle">تحكم كامل في خيارات التطبيق، الأسعار، والتنبيهات</p>
        </div>
    </div>

    <div class="row g-4">
        <!-- Sidebar Navigation -->
        <div class="col-lg-3 col-md-4">
            <div class="settings-nav">
                <div class="nav flex-column nav-pills" id="settingsTabs" role="tablist">
                    <button class="nav-link active" id="general-tab" data-bs-toggle="pill" data-bs-target="#general" type="button" role="tab">
                        <i class="fas fa-sliders-h"></i>
                        <span>الإعدادات العامة</span>
                    </button>
                    <button class="nav-link" id="fuel-tab" data-bs-toggle="pill" data-bs-target="#fuel" type="button" role="tab">
                        <i class="fas fa-gas-pump"></i>
                        <span>أسعار الوقود</span>
                    </button>
                    <button class="nav-link" id="alerts-tab" data-bs-toggle="pill" data-bs-target="#alerts" type="button" role="tab">
                        <i class="fas fa-bell"></i>
                        <span>التنبيهات والمخزون</span>
                    </button>
                    <button class="nav-link" id="roles-tab" data-bs-toggle="pill" data-bs-target="#roles" type="button" role="tab">
                        <i class="fas fa-user-shield"></i>
                        <span>إدارة الصلاحيات</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="col-lg-9 col-md-8">
            <div class="tab-content" id="settingsTabsContent">
                
                <!-- General Settings -->
                <div class="tab-pane fade show active" id="general" role="tabpanel">
                    <div class="settings-card">
                        <div class="card-header-custom">
                            <div class="card-icon"><i class="fas fa-globe"></i></div>
                            <div>
                                <h3 class="card-title-custom">الإعدادات الأساسية</h3>
                                <div class="text-muted small">تخصيص معلومات النظام واللغة</div>
                            </div>
                        </div>

                        <form action="<?php echo BASE_URL; ?>/settings/update" method="POST">
                            <input type="hidden" name="section" value="general">
                            
                            <div class="form-group">
                                <label class="form-label-custom">اسم النظام</label>
                                <div class="input-group-custom">
                                    <i class="fas fa-signature input-icon"></i>
                                    <input type="text" name="app_name" class="form-control-custom control-with-icon" 
                                           value="<?php echo $general['app_name'] ?? 'PetroDiesel ERP'; ?>" placeholder="أدخل اسم النظام">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label-custom">اللغة الافتراضية</label>
                                <select name="language" class="form-select-custom">
                                    <option value="ar" <?php echo ($general['language'] ?? 'ar') === 'ar' ? 'selected' : ''; ?>>🇸🇦 العربية</option>
                                    <option value="en" <?php echo ($general['language'] ?? '') === 'en' ? 'selected' : ''; ?>>🇺🇸 English</option>
                                </select>
                            </div>

                            <button type="submit" class="btn-save">
                                <i class="fas fa-save"></i> حفظ التغييرات
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Fuel Settings -->
                <div class="tab-pane fade" id="fuel" role="tabpanel">
                    <div class="settings-card">
                        <div class="card-header-custom">
                            <div class="card-icon"><i class="fas fa-tachometer-alt"></i></div>
                            <div>
                                <h3 class="card-title-custom">تسعير الوقود</h3>
                                <div class="text-muted small">تحديث الأسعار سينعكس مباشرة على الخزانات</div>
                            </div>
                        </div>

                        <form action="<?php echo BASE_URL; ?>/settings/update" method="POST">
                            <input type="hidden" name="section" value="fuel">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label-custom text-danger">
                                            <i class="fas fa-truck-monster me-1"></i> سعر الديزل (لتر)
                                        </label>
                                        <div class="input-group-custom">
                                            <span class="input-icon" style="color:var(--settings-text); font-weight:bold; font-size:0.9rem;">SAR</span>
                                            <input type="number" step="0.01" name="price_diesel" class="form-control-custom control-with-icon" 
                                                   style="border-color: #fca5a5;"
                                                   value="<?php echo $fuel['price_diesel'] ?? '0'; ?>">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label-custom text-success">
                                            <i class="fas fa-car me-1"></i> سعر البنزين (لتر)
                                        </label>
                                        <div class="input-group-custom">
                                            <span class="input-icon" style="color:var(--settings-text); font-weight:bold; font-size:0.9rem;">SAR</span>
                                            <input type="number" step="0.01" name="price_petrol" class="form-control-custom control-with-icon" 
                                                   style="border-color: #86efac;"
                                                   value="<?php echo $fuel['price_petrol'] ?? '0'; ?>">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert alert-light border mt-3 d-flex align-items-center gap-3">
                                <i class="fas fa-info-circle text-primary fa-2x"></i>
                                <div>
                                    <strong>ملاحظة هامة:</strong>
                                    <span class="text-muted d-block">عند تحديث السعر، سيتم تطبيقه على العمليات الجديدة فقط. العمليات المسجلة سابقاً لن تتأثر.</span>
                                </div>
                            </div>

                            <button type="submit" class="btn-save">
                                <i class="fas fa-sync-alt"></i> تحديث الأسعار
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Alerts Settings -->
                <div class="tab-pane fade" id="alerts" role="tabpanel">
                     <div class="settings-card">
                        <div class="card-header-custom">
                            <div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div>
                                <h3 class="card-title-custom">إعدادات التنبيهات</h3>
                                <div class="text-muted small">تخصيص متى يقوم النظام بإشعارك</div>
                            </div>
                        </div>

                        <form action="<?php echo BASE_URL; ?>/settings/update" method="POST">
                            <input type="hidden" name="section" value="alerts">
                            
                            <div class="form-group">
                                <label class="form-label-custom">حد التنبيه لنقص المخزون (لتر)</label>
                                <div class="range-value mb-2" id="stockVal"><?php echo $alerts['low_stock_threshold'] ?? '1000'; ?> لتر</div>
                                <input type="range" class="form-range" name="low_stock_threshold" min="100" max="5000" step="100" 
                                       value="<?php echo $alerts['low_stock_threshold'] ?? '1000'; ?>"
                                       oninput="document.getElementById('stockVal').innerText = this.value + ' لتر'">
                                <div class="d-flex justify-content-between text-muted small mt-1">
                                    <span>100 لتر</span>
                                    <span>5000 لتر</span>
                                </div>
                            </div>

                            <hr class="my-4 text-muted" style="opacity:0.1">

                            <div class="form-group">
                                <label class="form-label-custom">تنبيهات المعايرة (عدد الأيام)</label>
                                <div class="input-group-custom">
                                    <i class="fas fa-calendar-alt input-icon"></i>
                                    <input type="number" name="calibration_alert_days" class="form-control-custom control-with-icon" 
                                           value="<?php echo $alerts['calibration_alert_days'] ?? '30'; ?>">
                                </div>
                                <div class="form-text mt-2"><i class="fas fa-lightbulb text-warning"></i> سيقوم النظام بإرسال إشعار قبل موعد المعايرة بهذا العدد من الأيام.</div>
                            </div>

                            <button type="submit" class="btn-save">
                                <i class="fas fa-save"></i> حفظ التنبيهات
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Roles Link -->
                <div class="tab-pane fade" id="roles" role="tabpanel">
                    <div class="role-card">
                        <div class="role-card-bg"></div>
                        <div style="position: relative; z-index: 2;">
                            <i class="fas fa-users-cog fa-4x mb-4 text-white-50"></i>
                            <h2 class="fw-bold mb-3">إدارة المستخدمين والصلاحيات</h2>
                            <p class="lead mb-4 text-white-50" style="max-width: 600px; margin: 0 auto;">
                                يمكنك إضافة أدوار جديدة، تعيين مشرفين، وتحديد صلاحيات دقيقة لكل مستخدم لضمان أمان البيانات.
                            </p>
                            <a href="<?php echo BASE_URL; ?>/roles" class="btn-role">
                                <i class="fas fa-arrow-left me-2"></i> الانتقال إلى إدارة الصلاحيات
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
