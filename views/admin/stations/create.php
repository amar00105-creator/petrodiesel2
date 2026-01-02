<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-header bg-white py-3">
                <h4 class="mb-0">إضافة محطة جديدة</h4>
            </div>
            <div class="card-body">
                <form action="<?php echo BASE_URL; ?>/stations/create" method="POST">
                    <div class="mb-3">
                        <label for="name" class="form-label">اسم المحطة <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="name" name="name" required>
                    </div>

                    <div class="mb-3">
                        <label for="address" class="form-label">العنوان</label>
                        <input type="text" class="form-control" id="address" name="address">
                    </div>

                    <div class="mb-3">
                        <label for="phone" class="form-label">رقم الهاتف</label>
                        <input type="text" class="form-control" id="phone" name="phone">
                    </div>

                    <div class="d-flex justify-content-end">
                        <a href="<?php echo BASE_URL; ?>/stations" class="btn btn-secondary me-2">إلغاء</a>
                        <button type="submit" class="btn btn-success">حفظ المحطة</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>