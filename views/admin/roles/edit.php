<?php
// views/admin/roles/edit.php 
?>

<!-- Shared Styles -->
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

    :root {
        --primary: #0284c7;
        --bg-body: #f1f5f9;
        --card-bg: #ffffff;
    }

    body {
        background-color: var(--bg-body);
        font-family: 'Cairo', sans-serif;
        direction: rtl;
    }

    /* Header */
    .page-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 1.5rem 0 3rem 0;
        margin-bottom: -2.5rem;
        border-radius: 0 0 2rem 2rem;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
        position: relative;
    }

    .glass-panel {
        background: var(--card-bg);
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        max-width: 1100px;
        margin: 0 auto 2rem auto;
        position: relative;
        z-index: 20;
    }
</style>

<!-- Header -->
<div class="page-header">
    <div class="container text-center">
        <div class="d-inline-flex justify-content-center align-items-center p-2 rounded-circle bg-white bg-opacity-10 backdrop-blur mb-2">
            <i class="fas fa-edit fa-lg text-white"></i>
        </div>
        <h1 class="fw-bold mb-0 fs-3">تعديل بيانات الدور</h1>
    </div>
</div>

<!-- Main Content -->
<div class="container px-4">
    <form action="<?php echo BASE_URL; ?>/roles/update" method="POST">
        <input type="hidden" name="id" value="<?php echo $role['id']; ?>">

        <div class="glass-panel">
            <?php include 'form_content.php'; ?>

            <div class="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
                <a href="<?php echo BASE_URL; ?>/roles" class="btn btn-light px-4 py-2 rounded-pill fw-bold text-secondary">
                    إلغاء
                </a>
                <button type="submit" class="btn btn-primary px-5 py-2 rounded-pill fw-bold shadow-lg hover-scale">
                    <i class="fas fa-save me-2"></i> حفظ التغييرات
                </button>
            </div>
        </div>
    </form>
</div>