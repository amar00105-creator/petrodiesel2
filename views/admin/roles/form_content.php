<?php
// views/admin/roles/form_content.php helper or just inline in create/edit
$permissionsList = [
    'dashboard_view' => 'عرض لوحة التحكم',
    'sales_view' => 'عرض المبيعات',
    'sales_create' => 'إضافة مبيعات',
    'purchases_view' => 'عرض المشتروات',
    'purchases_create' => 'إضافة مشتروات',
    'finance_view' => 'عرض الحسابات',
    'finance_manage' => 'إدارة الحسابات (إضافة/تحويل)',
    'reports_view' => 'استعراض التقارير',
    'settings_view' => 'الوصول للإعدادات',
    'stations_manage' => 'إدارة المحطات',
    'users_manage' => 'إدارة المستخدمين',
    'tanks_view' => 'عرض المخزون',
    'pumps_view' => 'عرض المضخات'
];

$rolePerms = $role['permissions'] ?? [];
?>

<div class="mb-3">
    <label class="form-label">اسم الدور</label>
    <input type="text" name="name" class="form-control" required value="<?php echo htmlspecialchars($role['name'] ?? ''); ?>">
</div>
<div class="mb-3">
    <label class="form-label">الوصف</label>
    <textarea name="description" class="form-control"><?php echo htmlspecialchars($role['description'] ?? ''); ?></textarea>
</div>

<h5 class="mt-4 mb-3">الصلاحيات</h5>
<div class="row">
    <?php foreach ($permissionsList as $key => $label): ?>
        <div class="col-md-4 mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="permissions[<?php echo $key; ?>]" value="1" 
                       id="perm_<?php echo $key; ?>"
                       <?php echo (!empty($rolePerms[$key]) || in_array('*', $rolePerms)) ? 'checked' : ''; ?>>
                <label class="form-check-label" for="perm_<?php echo $key; ?>">
                    <?php echo $label; ?>
                </label>
            </div>
        </div>
    <?php endforeach; ?>
</div>
