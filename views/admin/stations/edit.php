<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0">تعديل بيانات المحطة</h4>
            </div>
            <div class="card-body">
                <form action="<?php echo BASE_URL; ?>/stations/update" method="POST">
                    <input type="hidden" name="id" value="<?php echo $station['id']; ?>">
                    
                    <div class="mb-3">
                        <label class="form-label">اسم المحطة</label>
                        <input type="text" name="name" class="form-control" required 
                               value="<?php echo htmlspecialchars($station['name']); ?>">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">العنوان</label>
                        <input type="text" name="address" class="form-control" 
                               value="<?php echo htmlspecialchars($station['address']); ?>">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">رقم الهاتف</label>
                        <input type="text" name="phone" class="form-control" 
                               value="<?php echo htmlspecialchars($station['phone']); ?>">
                    </div>

                    <div class="d-flex justify-content-between">
                        <a href="<?php echo BASE_URL; ?>/stations" class="btn btn-secondary">إلغاء</a>
                        <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
