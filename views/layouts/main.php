<?php
// views/layouts/main.php
use App\Helpers\AuthHelper;

// Default Layout
$user = $user ?? AuthHelper::user() ?? [];
$stationName = $stationName ?? 'إدارة النظام';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>بتروديزل | لوحة المعلومات</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />

    <!-- Bootstrap 5 (RTL) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">

    <style>
        :root {
            --bg-app: #f8fafc;
            --bg-panel: #ffffff;
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #64748b;
            --sidebar-width: 260px;
            /* Fixed width */
            --header-height: 60px;
            --transition-speed: 0.3s;
        }

        body {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
            background: var(--bg-app);
            color: #1e293b;
            margin: 0;
            overflow-x: hidden;
        }

        /* --- Sidebar Styling --- */
        .sidebar {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: var(--sidebar-width);
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
            color: #fff;
            transition: transform var(--transition-speed) ease;
            z-index: 1050;
            /* High z-index */
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: -4px 0 25px rgba(0, 0, 0, 0.1);
        }

        /* Logo Area */
        .sidebar-header {
            height: var(--header-height);
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            white-space: nowrap;
        }

        .logo-icon {
            min-width: 35px;
            height: 35px;
            background: var(--primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            margin-left: 12px;
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
        }

        .logo-text {
            font-weight: 700;
            font-size: 1.1rem;
            opacity: 1;
            /* Always visible */
        }

        /* Navigation Links */
        .sidebar-nav {
            flex: 1;
            padding: 1.5rem 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            overflow-y: auto;
        }

        .nav-link {
            display: flex;
            align-items: center;
            padding: 0.8rem 1rem;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: all 0.2s;
            border-right: 3px solid transparent;
            white-space: nowrap;
            border-radius: 8px;
            margin: 0 0.5rem;
        }

        .nav-link:hover,
        .nav-link.active {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
            border-right-color: var(--primary);
            /* Keep accent but maybe redundant with radius */
            transform: translateX(-5px);
        }

        .nav-link i {
            min-width: 24px;
            text-align: center;
            font-size: 1.2rem;
            margin-left: 12px;
        }

        .nav-text {
            opacity: 1;
            /* Always visible */
        }

        /* --- Icon Specific Colors --- */
        .icon-blue {
            color: #60a5fa;
        }

        /* Home */
        .icon-green {
            color: #34d399;
        }

        /* Sales */
        .icon-yellow {
            color: #fbbf24;
        }

        /* Purchases */
        .icon-purple {
            color: #a78bfa;
        }

        /* Finance */
        .icon-pink {
            color: #f472b6;
        }

        /* Inventory */
        .icon-teal {
            color: #2dd4bf;
        }

        /* HR */
        .icon-gray {
            color: #94a3b8;
        }

        /* Settings */

        /* Make icons white on hover/active */
        .nav-link:hover i,
        .nav-link.active i {
            color: #ffffff !important;
            transition: color 0.2s;
        }

        /* User Footer */
        .sidebar-footer {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-profile {
            display: flex;
            align-items: center;
            color: white;
            text-decoration: none;
            white-space: nowrap;
            padding: 0.5rem;
            border-radius: 8px;
            transition: background 0.2s;
        }

        .user-profile:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .user-avatar {
            min-width: 38px;
            height: 38px;
            background: var(--primary-dark);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
            font-size: 0.9rem;
        }

        .user-info {
            opacity: 1;
            /* Always visible */
        }

        /* --- Main Content Area --- */
        .main-wrapper {
            margin-right: var(--sidebar-width);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: margin-right var(--transition-speed);
        }

        /* Top Bar for Mobile */
        .mobile-header {
            display: none;
            background: white;
            padding: 1rem;
            box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
            align-items: center;
            justify-content: space-between;
            z-index: 1040;
        }

        .content-container {
            padding: 2rem;
            max-width: 1600px;
            margin: 0 auto;
            width: 100%;
            flex: 1;
        }

        /* Responsiveness */
        /* --- Sidebar Collapsible Styling --- */
        .nav-group {
            margin-bottom: 0.5rem;
        }

        .nav-link[data-bs-toggle="collapse"] {
            justify-content: space-between;
        }

        .nav-link[data-bs-toggle="collapse"]::after {
            content: "\f104";
            /* FontAwesome Left Angle */
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            transition: transform var(--transition-speed);
            margin-right: auto;
            margin-left: 0;
            font-size: 0.8rem;
        }

        .nav-link[data-bs-toggle="collapse"][aria-expanded="true"]::after {
            transform: rotate(-90deg);
        }

        .nav-sub {
            overflow: hidden;
            background: rgba(0, 0, 0, 0.15);
            margin: 0 0.5rem;
            border-radius: 0 0 8px 8px;
        }

        .nav-sub .nav-link {
            padding-right: 3rem;
            /* Indent */
            font-size: 0.9rem;
            border-radius: 0;
            /* Align with parent */
            border-right: 3px solid transparent;
            margin: 0;
            color: rgba(255, 255, 255, 0.6);
        }

        .nav-sub .nav-link:hover,
        .nav-sub .nav-link.active {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border-right-color: var(--primary);
            transform: none;
            /* Disable shift for sub items */
        }

        /* Mobile Overlay */
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1045;
            display: none;
            backdrop-filter: blur(2px);
        }

        .sidebar-overlay.active {
            display: block;
        }
    </style>
</head>

<body>

    <!-- Mobile Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Right Sidebar -->
    <aside class="sidebar" id="sidebar">
        <!-- Logo -->
        <div class="sidebar-header">
            <div class="logo-icon">
                <i class="fas fa-gas-pump"></i>
            </div>
            <span class="logo-text">بتروديزل</span>
        </div>

        <!-- Links -->
        <nav class="sidebar-nav">
            <?php
            $role = $user['role'] ?? 'viewer';
            $isAdmin = in_array($role, ['admin', 'super_admin', 'manager']);

            // Permissions Logic
            $canSeeSales = $isAdmin || $role === 'sales';
            $canSeePurchases = $isAdmin || $role === 'purchases';
            $canSeeFinance = $isAdmin || $role === 'accountant';
            $canSeeInventory = $isAdmin || $role === 'inventory'; // or generic
            $canSeeHR = $isAdmin || $role === 'hr';
            ?>

            <a href="<?= BASE_URL ?>/" class="nav-link" title="الرئيسية">
                <i class="fas fa-home icon-blue"></i>
                <span class="nav-text">الرئيسية</span>
            </a>

            <!-- Sales Group -->
            <?php if ($canSeeSales): ?>
                <a href="<?= BASE_URL ?>/sales" class="nav-link" title="المبيعات">
                    <i class="fas fa-shopping-cart icon-green"></i>
                    <span class="nav-text">المبيعات</span>
                </a>
            <?php endif; ?>

            <!-- Purchases Group -->
            <?php if ($canSeePurchases): ?>
                <a href="<?= BASE_URL ?>/purchases" class="nav-link" title="المشتريات">
                    <i class="fas fa-truck-moving icon-yellow"></i>
                    <span class="nav-text">المشتريات</span>
                </a>
            <?php endif; ?>

            <!-- Finance Group -->
            <?php if ($canSeeFinance): ?>
                <a href="<?= BASE_URL ?>/finance" class="nav-link" title="المالية">
                    <i class="fas fa-wallet icon-purple"></i>
                    <span class="nav-text">المالية</span>
                </a>
            <?php endif; ?>

            <!-- Inventory Group -->
            <?php if ($canSeeInventory): ?>
                <a href="<?= BASE_URL ?>/tanks" class="nav-link" title="المخزون">
                    <i class="fas fa-cubes icon-pink"></i>
                    <span class="nav-text">المخزون</span>
                </a>
            <?php endif; ?>

            <!-- HR Group -->
            <?php if ($canSeeHR): ?>
                <a href="<?= BASE_URL ?>/hr" class="nav-link" title="الموارد البشرية">
                    <i class="fas fa-users-cog icon-teal"></i>
                    <span class="nav-text">الموارد البشرية</span>
                </a>
            <?php endif; ?>

            <div class="mt-auto"></div>
            <a href="<?= BASE_URL ?>/settings" class="nav-link" title="الإعدادات">
                <i class="fas fa-cog icon-gray"></i>
                <span class="nav-text">الإعدادات</span>
            </a>
        </nav>

        <!-- Footer / User -->
        <div class="sidebar-footer">
            <a href="#" class="user-profile dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info me-3">
                    <div class="fw-bold small"><?= htmlspecialchars($user['name'] ?? 'Guest') ?></div>
                    <div class="text-white-50" style="font-size: 0.75rem;"><?= htmlspecialchars($user['role'] ?? '') ?></div>
                </div>
            </a>
            <ul class="dropdown-menu shadow">
                <li><a class="dropdown-item" href="<?= BASE_URL ?>/logout"><i class="fas fa-sign-out-alt me-2"></i> تسجيل الخروج</a></li>
            </ul>
        </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
        <!-- Mobile Header -->
        <header class="mobile-header sticky-top">
            <button class="btn btn-light" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
            <span class="fw-bold">بتروديزل</span>
            <div style="width: 40px;"></div> <!-- Spacer -->
        </header>

        <!-- Content -->
        <div class="content-container animate__animated animate__fadeIn">
            <?php
            if (isset($child_view) && file_exists($child_view)) {
                require_once $child_view;
            } else {
                echo '<div class="alert alert-danger">View not found</div>';
            }
            ?>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Active Link Highlight & Menu Open
        const currentPath = window.location.pathname;
        const currentUrl = window.location.href; // Includes Params for HR tabs

        document.querySelectorAll('.nav-sub .nav-link').forEach(link => {
            // Check absolute match or if href is substring (careful with partial matches)
            if (link.href === currentUrl || (link.href.includes('?tab=') && currentUrl.includes(link.href.split('?')[1]))) {
                link.classList.add('active');
                // Open parent
                const parentCollapse = link.closest('.collapse');
                if (parentCollapse) {
                    parentCollapse.classList.add('show');
                    // Highlight parent toggler
                    const toggler = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
                    if (toggler) {
                        toggler.classList.remove('collapsed');
                        toggler.setAttribute('aria-expanded', 'true');
                        toggler.classList.add('active');
                    }
                }
            } else if (link.getAttribute('href') !== '#' && currentUrl.startsWith(link.href) && !link.href.includes('?')) {
                // For paths like /sales/customers matching /sales/customers
                link.classList.add('active');
                const parentCollapse = link.closest('.collapse');
                if (parentCollapse) {
                    parentCollapse.classList.add('show');
                    const toggler = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
                    if (toggler) {
                        toggler.classList.remove('collapsed');
                        toggler.setAttribute('aria-expanded', 'true');
                        toggler.classList.add('active');
                    }
                }
            }
        });

        // Mobile Toggle Logic
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggle');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    </script>
</body>

</html>