<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>إدارة المحطات</h2>
    <a href="<?php echo BASE_URL; ?>/stations/create" class="btn btn-primary">
        <i class="fas fa-plus"></i> إضافة محطة جديدة
    </a>
</div>

<div class="card shadow-sm">
    <div class="card-body">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>#</th>
                    <th>اسم المحطة</th>
                    <th>العنوان</th>
                    <th>الهاتف</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($stations as $station): ?>
                    <tr>
                        <td>
                            <?php echo $station['id']; ?>
                        </td>
                        <td>
                            <?php echo htmlspecialchars($station['name']); ?>
                        </td>
                        <td>
                            <?php echo htmlspecialchars($station['address']); ?>
                        </td>
                        <td>
                            <?php echo htmlspecialchars($station['phone']); ?>
                        </td>
                        <td>
                            <?php echo $station['created_at']; ?>
                        </td>
                        <td>
                            <a href="<?php echo BASE_URL; ?>/stations/edit?id=<?php echo $station['id']; ?>" class="btn btn-sm btn-info text-white"><i class="fas fa-edit"></i></a>
                            
                            <form action="<?php echo BASE_URL; ?>/stations/delete" method="POST" class="d-inline" onsubmit="return confirm('هل أنت متأكد من حذف هذه المحطة؟');">
                                <input type="hidden" name="id" value="<?php echo $station['id']; ?>">
                                <button type="submit" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>

                <?php if (empty($stations)): ?>
                    <tr>
                        <td colspan="6" class="text-center text-muted">لا توجد محطات مسجلة حالياً.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>