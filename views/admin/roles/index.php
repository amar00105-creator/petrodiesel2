<?php
// views/admin/roles/index.php 
?>

<!-- Import Cairo Font & Animate.css -->
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

    :root {
        --primary: #0284c7;
        --primary-dark: #0369a1;
        --secondary: #64748b;
        --bg-body: #f1f5f9;
        --card-bg: #ffffff;
    }

    body {
        background-color: var(--bg-body);
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        overflow-x: hidden;
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

    .header-content {
        position: relative;
        z-index: 10;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    /* Content */
    .content-wrapper {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1rem 1rem 1rem;
        position: relative;
        z-index: 20;
    }

    .glass-panel {
        background: var(--card-bg);
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Table Styling */
    .table-custom {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 0.75rem;
    }

    .table-custom th {
        font-weight: 700;
        color: #64748b;
        padding: 1rem;
        border-bottom: 2px solid #f1f5f9;
        text-align: right;
    }

    .table-custom tbody tr {
        background: #f8fafc;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .table-custom tbody tr:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        background: white;
        cursor: default;
    }

    .table-custom td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-top: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }

    .table-custom td:first-child {
        border-right: 1px solid #f1f5f9;
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
    }

    .table-custom td:last-child {
        border-left: 1px solid #f1f5f9;
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
    }

    .role-badge {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .role-badge.system {
        background: #e0e7ff;
        color: #4338ca;
    }

    .role-badge.custom {
        background: #dcfce7;
        color: #15803d;
    }

    .action-btn {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        border: none;
    }

    .action-btn:hover {
        transform: rotate(15deg) scale(1.1);
    }
</style>

<!-- Header -->
<div class="page-header">
    <div class="container">
        <div class="header-content animate__animated animate__fadeInDown">
            <div class="d-inline-flex justify-content-center align-items-center p-2 rounded-circle bg-white bg-opacity-10 backdrop-blur">
                <i class="fas fa-user-shield fa-2x text-white"></i>
            </div>
            <h1 class="fw-bold mb-0 fs-3">إدارة الصلاحيات</h1>
        </div>
    </div>
</div>

<!-- Main Content -->
<div class="content-wrapper">
    <div class="d-flex justify-content-end mb-4 animate__animated animate__fadeInRight animate__delay-1s">
        <a href="<?php echo BASE_URL; ?>/roles/create" class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-lg hover-scale transition-transform">
            <i class="fas fa-plus me-2"></i> إضافة دور جديد
        </a>
    </div>

    <div class="glass-panel">
        <div class="table-responsive">
            <table class="table-custom">
                <thead>
                    <tr>
                        <th width="20%">اسم الدور</th>
                        <th width="40%">الوصف</th>
                        <th width="20%">النوع</th>
                        <th width="20%" class="text-center">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($roles)): ?>
                        <tr>
                            <td colspan="4" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                                    <p class="mb-0 fw-bold">لا توجد أدوار مضافة حالياً</p>
                                </div>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($roles as $role): ?>
                            <tr>
                                <td>
                                    <span class="fw-bold text-dark fs-5">
                                        <?php echo htmlspecialchars($role['name']); ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="text-secondary">
                                        <?php echo htmlspecialchars($role['description']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($role['is_system']): ?>
                                        <span class="role-badge system">
                                            <i class="fas fa-lock fa-sm"></i> نظام
                                        </span>
                                    <?php else: ?>
                                        <span class="role-badge custom">
                                            <i class="fas fa-user-edit fa-sm"></i> مخصص
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <div class="d-flex justify-content-center gap-2">
                                        <a href="<?php echo BASE_URL; ?>/roles/edit?id=<?php echo $role['id']; ?>"
                                            class="action-btn bg-info bg-opacity-10 text-info" title="تعديل">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <?php if (!$role['is_system']): ?>
                                            <form action="<?php echo BASE_URL; ?>/roles/delete" method="POST" class="d-inline" onsubmit="return confirm('هل أنت متأكد من حذف هذا الدور؟');">
                                                <input type="hidden" name="id" value="<?php echo $role['id']; ?>">
                                                <button type="submit" class="action-btn bg-danger bg-opacity-10 text-danger" title="حذف">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </form>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>