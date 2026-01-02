<div class="row justify-content-center">
    <div class="col-md-10">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h4>إضافة دور جديد</h4>
            </div>
            <div class="card-body">
                <form action="<?php echo BASE_URL; ?>/roles/create" method="POST">
                    <?php $role = []; include 'form_content.php'; ?>
                    
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">حفظ الدور</button>
                        <a href="<?php echo BASE_URL; ?>/roles" class="btn btn-secondary">إلغاء</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
