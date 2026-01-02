<?php 
// views/admin/roles/index.php 
?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>إدارة الصلاحيات (الأدوار)</h2>
    <a href="<?php echo BASE_URL; ?>/roles/create" class="btn btn-primary">
        <i class="fas fa-plus"></i> إضافة دور جديد
    </a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>اسم الدور</th>
                    <th>الوصف</th>
                    <th>نوع الدور</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($roles as $role): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($role['name']); ?></td>
                        <td><?php echo htmlspecialchars($role['description']); ?></td>
                        <td>
                            <?php if ($role['is_system']): ?>
                                <span class="badge bg-secondary">نظام</span>
                            <?php else: ?>
                                <span class="badge bg-success">مخصص</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <a href="<?php echo BASE_URL; ?>/roles/edit?id=<?php echo $role['id']; ?>" class="btn btn-sm btn-info text-white">
                                <i class="fas fa-edit"></i>
                            </a>
                            <?php if (!$role['is_system']): ?>
                                <form action="<?php echo BASE_URL; ?>/roles/delete" method="POST" class="d-inline" onsubmit="return confirm('حذف هذا الدور؟');">
                                    <input type="hidden" name="id" value="<?php echo $role['id']; ?>">
                                    <button type="submit" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
