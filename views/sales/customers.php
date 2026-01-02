<?php
// views/sales/customers.php
$canEdit = ($user['role'] === 'admin' || $user['role'] === 'manager' || $user['role'] === 'super_admin'); 
// Assuming sales logic might be specific later, but for now generic RBAC
?>

<!-- SweetAlert2 -->
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<style>
    .sales-header {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;
        box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
    }
    .table-container {
        background: white; padding: 1.5rem; border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        overflow-x: auto;
    }
</style>

<div class="container-fluid animate__animated animate__fadeIn">

    <!-- Header -->
    <div class="sales-header d-flex justify-content-between align-items-center">
        <div>
            <h2 class="fw-bold mb-1">الزبائن (Accounts Receivable)</h2>
            <p class="mb-0 opacity-75">إدارة بيانات الزبائن والديون</p>
        </div>
    </div>

    <!-- Content -->
    <div class="table-container">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <input type="text" class="form-control w-25" placeholder="بحث..." onkeyup="filterTable(this.value)">
            <?php if ($canEdit): ?>
                <button class="btn btn-success" onclick="openModal()"><i class="fas fa-plus me-2"></i> إضافة زبون</button>
            <?php endif; ?>
        </div>
        <table class="table table-hover align-middle user-select-none">
            <thead class="table-light">
                <tr>
                    <th>الاسم</th>
                    <th>الهاتف</th>
                    <th>العنوان</th>
                    <th>الرصيد (عليه)</th>
                    <th>ملاحظات</th>
                    <th>إجراءات</th>
                </tr>
            </thead>
            <tbody id="tbody-customer">
                <tr><td colspan="6" class="text-center p-4 text-muted">جاري التحميل...</td></tr>
            </tbody>
        </table>
    </div>

</div>

<!-- Customer Modal -->
<div class="modal fade" id="modal-customer">
    <div class="modal-dialog">
        <form class="modal-content" onsubmit="saveEntity(event)">
            <div class="modal-header"><h5 class="modal-title">بيانات الزبون</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
                <input type="hidden" name="id">
                <div class="mb-3"><label>الاسم</label><input type="text" name="name" class="form-control" required></div>
                <div class="mb-3"><label>الهاتف</label><input type="text" name="phone" class="form-control"></div>
                <div class="mb-3"><label>العنوان</label><input type="text" name="address" class="form-control"></div>
                <!-- Not allowing manual balance edit here to prevent fraud, or maybe allow if it's opening balance? 
                     User model assumed balance is calculated or updated via transactions. 
                     For simplicity, we show it in table but maybe not edit it directly unless "Opening Balance"?
                     Let's stick to name/contact for now. -->
                <div class="mb-3"><label>ملاحظات</label><textarea name="notes" class="form-control"></textarea></div>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-success">حفظ</button></div>
        </form>
    </div>
</div>

<script>
const BASE_URL = '<?= BASE_URL ?>';
const canEdit = <?= json_encode($canEdit) ?>;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Move modal to body
    document.body.appendChild(document.getElementById('modal-customer'));
});

async function loadData() {
    const tbody = document.getElementById('tbody-customer');
    try {
        const res = await fetch(`${BASE_URL}/sales/api?action=list`);
        const result = await res.json();
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => {
                let actions = '';
                if (canEdit) actions += `<button class="btn btn-sm btn-outline-primary ms-1" onclick="openModal(${item.id})"><i class="fas fa-edit"></i></button>`;
                if (<?= json_encode($user['role'] === 'admin') ?>) actions += `<button class="btn btn-sm btn-outline-danger" onclick="deleteEntity(${item.id})"><i class="fas fa-trash"></i></button>`;
                
                return `<tr>
                    <td>${item.name}</td>
                    <td>${item.phone || '-'}</td>
                    <td>${item.address || '-'}</td>
                    <td><span class="badge bg-warning text-dark">${item.balance || '0.00'}</span></td>
                    <td>${item.notes || ''}</td>
                    <td>${actions}</td>
                </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-muted">لا توجد بيانات</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">خطأ في الاتصال</td></tr>';
    }
}

async function openModal(id = null) {
    const modalEl = document.getElementById('modal-customer');
    const form = modalEl.querySelector('form');
    form.reset();
    form.querySelector('[name=id]').value = '';

    if (id) {
        const res = await fetch(`${BASE_URL}/sales/api?action=get&id=${id}`);
        const result = await res.json();
        if (result.success) {
            const data = result.data;
            form.querySelector('[name=id]').value = data.id;
            form.querySelector('[name=name]').value = data.name;
            form.querySelector('[name=phone]').value = data.phone || '';
            form.querySelector('[name=address]').value = data.address || '';
            form.querySelector('[name=notes]').value = data.notes || '';
        }
    }
    new bootstrap.Modal(modalEl).show();
}

async function saveEntity(e) {
    e.preventDefault();
    const form = e.target;
    // Check form validity
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const fd = new FormData(form);
    const id = fd.get('id');
    const action = id ? 'update' : 'store';
    
    // Disable button
    const btn = form.querySelector('button[type="submit"]'); // Changed scope to form
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '...';

    try {
        const res = await fetch(`${BASE_URL}/sales/api?action=${action}`, { method: 'POST', body: fd });
        const text = await res.text();
        let result;
        try { result = JSON.parse(text); } catch(e) { throw new Error(text); }
        
        if (result.success) {
            Swal.fire({ icon: 'success', title: 'تم الحفظ', timer: 1000, showConfirmButton: false });
            bootstrap.Modal.getInstance(document.getElementById('modal-customer')).hide();
            loadData();
        } else {
            Swal.fire('خطأ', result.message, 'error');
        }
    } catch (err) {
        Swal.fire('خطأ', err.message.substring(0,100), 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function deleteEntity(id) {
    if (await Swal.fire({ title: 'حذف؟', icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
        const fd = new FormData(); fd.append('id', id);
        await fetch(`${BASE_URL}/sales/api?action=delete`, { method: 'POST', body: fd });
        loadData();
    }
}

function filterTable(query) {
    const rows = document.querySelectorAll('#tbody-customer tr');
    query = query.toLowerCase();
    rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none');
}
</script>
