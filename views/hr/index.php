<?php
// views/hr/index.php
// Refactored HR Module: Employees, Workers, Drivers + Payroll
$isAdmin = ($user['role'] === 'admin' || $user['role'] === 'super_admin');
$canEdit = ($isAdmin || $user['role'] === 'manager');
?>

<!-- SweetAlert2 -->
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<style>
    .hr-header {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
    }

    .table-container {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        overflow-x: auto;
    }

    .hr-tabs .nav-link {
        color: #64748b;
        font-weight: 600;
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
    }

    .hr-tabs .nav-link.active {
        background: #4f46e5;
        color: white;
    }

    .avatar-sm {
        width: 32px;
        height: 32px;
        background: #e0e7ff;
        color: #4f46e5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.8rem;
    }
</style>

<div class="container-fluid animate__animated animate__fadeIn">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="fw-bold fs-2" style="color: var(--primary);">الموارد البشرية والرواتب</h1>
            <p class="text-muted">إدارة الموظفين، العمال، السائقين، وكشوف المرتبات</p>
        </div>
    </div>

    <!-- Action Cards Grid -->
    <div class="row g-3 mb-5">
        <!-- Employees -->
        <div class="col-md-3 col-6">
            <div onclick="document.querySelector('[data-bs-target=\'#tab-employee\']').click()" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift cursor-pointer">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-primary bg-opacity-10 text-primary mb-2">
                        <i class="fas fa-users fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">الموظفون</h6>
                </div>
            </div>
        </div>
        <!-- Payroll -->
        <div class="col-md-3 col-6">
            <div onclick="document.querySelector('[data-bs-target=\'#tab-payroll\']').click()" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift cursor-pointer">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-success bg-opacity-10 text-success mb-2">
                        <i class="fas fa-money-bill-wave fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">الرواتب</h6>
                </div>
            </div>
        </div>
        <!-- Report -->
        <div class="col-md-3 col-6">
            <a href="<?= BASE_URL ?>/hr/reports" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-info bg-opacity-10 text-info mb-2">
                        <i class="fas fa-file-alt fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">تقرير</h6>
                </div>
            </a>
        </div>
        <!-- Attendance -->
        <div class="col-md-3 col-6">
            <a href="<?= BASE_URL ?>/hr/attendance" class="card h-100 text-decoration-none shadow-sm border-0 hover-lift">
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                    <div class="icon-circle bg-warning bg-opacity-10 text-warning mb-2">
                        <i class="fas fa-clock fa-lg"></i>
                    </div>
                    <h6 class="text-dark fw-bold mb-0">الحضور والانصراف</h6>
                </div>
            </a>
        </div>
    </div>

    <style>
        .hover-lift {
            transition: transform 0.2s;
        }

        .hover-lift:hover {
            transform: translateY(-5px);
        }

        .icon-circle {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }

        .cursor-pointer {
            cursor: pointer;
        }
    </style>

    <!-- Tabs (Hidden or Secondary) -->
    <ul class="nav nav-pills hr-tabs mb-4 d-none" id="hrTabs" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-employee" onclick="loadData('employee')">الموظفين</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-worker" onclick="loadData('worker')">العمال</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-driver" onclick="loadData('driver')">السائقين</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-payroll" onclick="showPayroll()">الرواتب (Payroll)</button></li>
    </ul>

    <!-- Content -->
    <div class="tab-content">
        <!-- Generic Container (Data Loaded via JS) -->
        <div class="tab-pane fade show active" id="tab-employee">
            <?php renderTabContent('employee', 'إضافة موظف', $canEdit); ?>
        </div>
        <div class="tab-pane fade" id="tab-worker">
            <?php renderTabContent('worker', 'إضافة عامل', $canEdit); ?>
        </div>
        <div class="tab-pane fade" id="tab-driver">
            <?php renderTabContent('driver', 'إضافة سائق', $canEdit); ?>
        </div>

        <!-- Payroll Placeholder -->
        <div class="tab-pane fade" id="tab-payroll">
            <div class="table-container text-center py-5">
                <i class="fas fa-money-check-alt fa-3x text-muted mb-3"></i>
                <h4>نظام الرواتب</h4>
                <p class="text-muted">هنا سيتم إدارة الرواتب والسلف والخصومات للكادر الوظيفي.</p>
                <div class="alert alert-info d-inline-block">قيد التفعيل</div>
            </div>
        </div>
    </div>

</div>

<!-- PHP Helper for Tab Structure -->
<?php function renderTabContent($entity, $btnLabel, $canEdit)
{ ?>
    <div class="table-container">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <input type="text" class="form-control w-25" placeholder="بحث..." onkeyup="filterTable('<?= $entity ?>', this.value)">
            <?php if ($canEdit): ?>
                <button class="btn btn-primary" onclick="openModal('<?= $entity ?>')"><i class="fas fa-plus me-2"></i> <?= $btnLabel ?></button>
            <?php endif; ?>
        </div>
        <table class="table table-hover align-middle user-select-none" id="table-<?= $entity ?>">
            <thead class="table-light">
                <tr id="thead-<?= $entity ?>"></tr>
            </thead>
            <tbody id="tbody-<?= $entity ?>">
                <tr>
                    <td colspan="5" class="text-center p-4 text-muted">جاري التحميل...</td>
                </tr>
            </tbody>
        </table>
    </div>
<?php } ?>

<!-- Modals -->
<!-- Employee Modal -->
<div class="modal fade" id="modal-employee">
    <div class="modal-dialog">
        <form class="modal-content" onsubmit="saveEntity(event, 'employee')">
            <div class="modal-header">
                <h5 class="modal-title">بيانات الموظف</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" name="id">
                <div class="mb-3">
                    <label>الاسم</label>
                    <input type="text" name="name" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>البريد الإلكتروني</label>
                    <input type="email" name="email" class="form-control">
                </div>
                <div class="mb-3">
                    <label>كلمة المرور (اتركها فارغة إذا لم ترد التغيير)</label>
                    <input type="password" name="password" class="form-control">
                </div>
                <div class="mb-3">
                    <label>الصلاحية</label>
                    <select name="role" class="form-select">
                        <option value="viewer">مشاهد (Viewer)</option>
                        <option value="manager">مدير (Manager)</option>
                        <option value="admin">مسؤول (Admin)</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">حفظ</button>
            </div>
        </form>
    </div>
</div>

<!-- Worker Modal -->
<div class="modal fade" id="modal-worker">
    <div class="modal-dialog">
        <form class="modal-content" onsubmit="saveEntity(event, 'worker')">
            <div class="modal-header">
                <h5 class="modal-title">بيانات العامل</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" name="id">
                <div class="mb-3"><label>الاسم</label><input type="text" name="name" class="form-control" required></div>
                <div class="mb-3"><label>الهاتف</label><input type="text" name="phone" class="form-control"></div>
                <div class="mb-3"><label>رقم الهوية</label><input type="text" name="national_id" class="form-control"></div>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-primary">حفظ</button></div>
        </form>
    </div>
</div>

<!-- Driver Modal -->
<div class="modal fade" id="modal-driver">
    <div class="modal-dialog">
        <form class="modal-content" onsubmit="saveEntity(event, 'driver')">
            <div class="modal-header">
                <h5 class="modal-title">بيانات السائق</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" name="id">
                <div class="mb-3"><label>الاسم</label><input type="text" name="name" class="form-control" required></div>
                <div class="mb-3"><label>الهاتف</label><input type="text" name="phone" class="form-control"></div>
                <div class="mb-3"><label>رقم اللوحة</label><input type="text" name="truck_number" class="form-control"></div>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-primary">حفظ</button></div>
        </form>
    </div>
</div>

<script>
    const BASE_URL = '<?= BASE_URL ?>';
    const canEdit = <?= json_encode($canEdit) ?>;
    const isAdmin = <?= json_encode($isAdmin) ?>;

    // Initial Load
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'employee';

        // Activate Tab
        const tabBtn = document.querySelector(`button[data-bs-target="#tab-${tab}"]`);
        if (tabBtn) {
            new bootstrap.Tab(tabBtn).show();
        }

        // Load Data
        loadData(tab);

        // Move modals
        document.querySelectorAll('.modal').forEach(m => document.body.appendChild(m));
    });

    function showPayroll() {
        // Just a UI switch
    }

    async function loadData(entity) {
        if (entity === 'payroll') return;

        const tbody = document.getElementById(`tbody-${entity}`);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center p-3 text-muted">جاري التحميل...</td></tr>';

        // Set Headers
        const thead = document.getElementById(`thead-${entity}`);
        let headers = '';
        if (entity === 'employee') headers = '<th>الاسم</th><th>البريد</th><th>الصلاحية</th><th>الحالة</th><th>إجراءات</th>';
        if (entity === 'worker') headers = '<th>الاسم</th><th>الهاتف</th><th>رقم الهوية</th><th>إجراءات</th>';
        if (entity === 'driver') headers = '<th>الاسم</th><th>الهاتف</th><th>رقم اللوحة</th><th>إجراءات</th>';
        thead.innerHTML = headers;

        try {
            const res = await fetch(`${BASE_URL}/hr/api?entity=${entity}&action=list`);
            const result = await res.json();

            if (result.success && result.data.length > 0) {
                tbody.innerHTML = result.data.map(item => {
                    let row = `<td><div class="d-flex align-items-center"><div class="avatar-sm ms-2">${item.name.charAt(0)}</div> ${item.name}</div></td>`;

                    if (entity === 'employee') {
                        row += `<td>${item.email || '-'}</td>
                            <td><span class="badge bg-secondary">${item.role}</span></td>
                            <td><span class="badge bg-success">${item.status || 'Active'}</span></td>`;
                    } else if (entity === 'worker') {
                        row += `<td>${item.phone || '-'}</td><td>${item.national_id || '-'}</td>`;
                    } else if (entity === 'driver') {
                        row += `<td>${item.phone || '-'}</td><td><span class="badge bg-dark">${item.truck_number || '-'}</span></td>`;
                    }

                    // Actions
                    let actions = '';
                    if (canEdit) actions += `<button class="btn btn-sm btn-outline-primary ms-1" onclick="openModal('${entity}', ${item.id})"><i class="fas fa-edit"></i></button>`;
                    if (isAdmin) actions += `<button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('${entity}', ${item.id})"><i class="fas fa-trash"></i></button>`;

                    return `<tr>${row}<td>${actions}</td></tr>`;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center p-4 text-muted">لا توجد بيانات</td></tr>';
            }
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">خطأ في الاتصال</td></tr>';
        }
    }

    async function openModal(entity, id = null) {
        const modalEl = document.getElementById(`modal-${entity}`);
        if (!modalEl) {
            Swal.fire('Error', 'Modal not found', 'error');
            return;
        }

        const form = modalEl.querySelector('form');
        form.reset();
        form.querySelector('[name=id]').value = '';

        if (id) {
            try {
                const res = await fetch(`${BASE_URL}/hr/api?entity=${entity}&action=get&id=${id}`);
                const result = await res.json();
                if (result.success) {
                    const data = result.data;
                    form.querySelector('[name=id]').value = data.id;
                    // Auto-fill inputs
                    Object.keys(data).forEach(key => {
                        const input = form.querySelector(`[name=${key}]`);
                        if (input && input.type !== 'password') input.value = data[key];
                        const select = form.querySelector(`select[name=${key}]`);
                        if (select) select.value = data[key];
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        let modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }

    async function saveEntity(e, entity) {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const fd = new FormData(form);
        const id = fd.get('id');
        const action = id ? 'update' : 'store';

        try {
            const res = await fetch(`${BASE_URL}/hr/api?entity=${entity}&action=${action}`, {
                method: 'POST',
                body: fd
            });
            const text = await res.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error(text);
            }

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'تم الحفظ',
                    timer: 1500,
                    showConfirmButton: false
                });
                bootstrap.Modal.getInstance(document.getElementById(`modal-${entity}`)).hide();
                loadData(entity);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'خطأ',
                    text: result.message
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: err.message
            });
        }
    }

    async function deleteEntity(entity, id) {
        if (await Swal.fire({
                title: 'حذف؟',
                icon: 'warning',
                showCancelButton: true
            }).then(r => r.isConfirmed)) {
            const fd = new FormData();
            fd.append('id', id);
            await fetch(`${BASE_URL}/hr/api?entity=${entity}&action=delete`, {
                method: 'POST',
                body: fd
            });
            loadData(entity);
        }
    }

    function filterTable(entity, query) {
        const rows = document.querySelectorAll(`#tbody-${entity} tr`);
        query = query.toLowerCase();
        rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none');
    }
</script>