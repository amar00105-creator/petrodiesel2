<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔴 LIVE VERIFIED | <?= $page_title ?? 'بتروديزل' ?> | PetroDiesel ERP</title>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Global Glassmorphism Theme (Light/Dark) -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/glassmorphism-theme.css?v=<?= time() ?>">

    <!-- Theme Initialization Script (Prevents Flash) -->
    <script>
        window.BASE_URL = "<?= BASE_URL ?>";
        window.AUTO_LOCK_MINUTES = <?= $autoLockMinutes ?? 0 ?>;

        // Immediate Theme Application
        (function() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.classList.add('dark-mode');
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark-mode');
                document.documentElement.classList.remove('dark');
            }
        })();
    </script>

    <!-- Page Specific Styles -->
    <?php if (isset($additional_css)): ?>
        <?= $additional_css ?>
    <?php endif; ?>

    <style>
        /* FORCE override for any lingering scrollbar issues */
        .main-wrapper,
        .page-container {
            overflow: visible !important;
            min-height: auto !important;
            /* Let content dictate height */
        }

        /* Ensure body handles the scroll */
        body {
            overflow-y: auto !important;
        }
    </style>
</head>

<body>
    <!-- Mobile Header (Visible only on mobile) -->
    <div class="mobile-header">
        <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline" onclick="toggleSidebar()" style="padding: 0.5rem; border: none; background: transparent;">
                <i class="fas fa-bars" style="font-size: 1.5rem; color: var(--primary);"></i>
            </button>
            <span style="font-weight: 900; font-size: 1.2rem; color: var(--primary);">بتروديزل</span>
        </div>
        <!-- Mobile Profile Icon -->
        <div class="d-flex align-items-center gap-2">
            <button onclick="toggleTheme()" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%; width: 35px; height: 35px; border: none; background: transparent;">
                <i class="fas fa-moon" id="theme-icon-mobile" style="font-size: 1.1rem; color: var(--text-secondary);"></i>
            </button>
            <i class="fas fa-user-circle" style="font-size: 1.5rem; color: var(--text-secondary);"></i>
        </div>
    </div>

    <!-- Mobile Overlay -->
    <div class="sidebar-overlay" onclick="closeSidebar()"></div>

    <!-- Collapsible Glassmorphism Sidebar -->
    <div class="sidebar" id="mainSidebar">
        <div class="sidebar-header" style="display: flex; align-items: center; gap: 12px;">
            <!-- Fuel Icon on LEFT -->
            <i class="fas fa-gas-pump sidebar-logo"></i>

            <!-- Logo in Glass Container (fills remaining space) -->
            <div class="sidebar-title" style="
                flex: 1;
                padding: 10px 16px;
                background: rgba(255,255,255,0.12); 
                backdrop-filter: blur(10px); 
                -webkit-backdrop-filter: blur(10px);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.15);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <img src="<?= BASE_URL ?>/img/logo.png" alt="Petro Diesel" style="
                    height: 55px; 
                    width: auto;
                    object-fit: contain;
                    filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)) brightness(1.15);
                ">
            </div>
        </div>

        <nav class="sidebar-nav">
            <!-- الرئيسية -->
            <div class="nav-item <?= ($_SERVER['REQUEST_URI'] == '/PETRODIESEL2/public/' || $_SERVER['REQUEST_URI'] == '/PETRODIESEL2/public') ? 'active' : '' ?>"
                onclick="window.location.href='<?= BASE_URL ?>/'"
                style="cursor: pointer;">
                <i class="fas fa-home nav-icon"></i>
                <span class="nav-text">لوحة التحكم</span>
            </div>

            <!-- المشتريات -->
            <?php if (App\Helpers\AuthHelper::can('purchases_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/purchases') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/purchases'"
                    style="cursor: pointer;">
                    <i class="fas fa-truck nav-icon"></i>
                    <span class="nav-text">المشتريات</span>
                </div>
            <?php endif; ?>

            <!-- المبيعات -->
            <?php if (App\Helpers\AuthHelper::can('sales_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/sales') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/sales'"
                    style="cursor: pointer;">
                    <i class="fas fa-shopping-cart nav-icon"></i>
                    <span class="nav-text">المبيعات</span>
                </div>
            <?php endif; ?>

            <!-- المكن والعدادات -->
            <?php if (App\Helpers\AuthHelper::can('tanks_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/pumps') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/pumps'"
                    style="cursor: pointer;">
                    <i class="fas fa-gas-pump nav-icon"></i>
                    <span class="nav-text">المكن والعدادات</span>
                </div>
            <?php endif; ?>

            <!-- الخزانات -->
            <?php if (App\Helpers\AuthHelper::can('tanks_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/tanks') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/tanks'"
                    style="cursor: pointer;">
                    <i class="fas fa-oil-can nav-icon"></i>
                    <span class="nav-text">الخزانات</span>
                </div>
            <?php endif; ?>

            <!-- الحسابات -->
            <?php if (App\Helpers\AuthHelper::can('finance_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/accounting') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/accounting'"
                    style="cursor: pointer;">
                    <i class="fas fa-file-invoice-dollar nav-icon"></i>
                    <span class="nav-text">الحسابات</span>
                </div>
            <?php endif; ?>

            <!-- المصروفات (Removed) -->
            <?php /* 
            <?php if (App\Helpers\AuthHelper::can('expenses_view') || App\Helpers\AuthHelper::can('finance_view')): ?>
                <a href="<?= BASE_URL ?>/expenses" class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/expenses') !== false ? 'active' : '' ?>">
                    <i class="fas fa-money-bill-wave nav-icon"></i>
                    <span class="nav-text">المصروفات</span>
                </a>
            <?php endif; ?>
            */ ?>

            <!-- الموظفين -->
            <?php if (App\Helpers\AuthHelper::can('settings_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/hr') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/hr'"
                    style="cursor: pointer;">
                    <i class="fas fa-users-cog nav-icon"></i>
                    <span class="nav-text">الموارد البشرية</span>
                </div>
            <?php endif; ?>

            <!-- العملاء والموردون -->
            <?php if (App\Helpers\AuthHelper::can('purchases_view') || App\Helpers\AuthHelper::can('sales_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/suppliers') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/suppliers'"
                    style="cursor: pointer;">
                    <i class="fas fa-users nav-icon"></i>
                    <span class="nav-text">العملاء والموردون</span>
                </div>
            <?php endif; ?>

            <!-- التقارير -->
            <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/reports') !== false ? 'active' : '' ?>"
                onclick="window.location.href='<?= BASE_URL ?>/reports'"
                style="cursor: pointer;">
                <i class="fas fa-chart-bar nav-icon"></i>
                <span class="nav-text">التقارير</span>
            </div>

            <!-- إدارة المحطات (Super Admin Only) -->
            <!-- إدارة المحطات (Moved to Settings) -->
            <?php
            // Link Removed
            ?>

            <!-- الإعدادات -->
            <?php if (App\Helpers\AuthHelper::can('settings_view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/settings') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/settings'"
                    style="cursor: pointer;">
                    <i class="fas fa-cog nav-icon"></i>
                    <span class="nav-text">الإعدادات</span>
                </div>
            <?php endif; ?>



            <!-- تسجيل الخروج -->
            <div class="nav-item"
                onclick="window.location.href='<?= BASE_URL ?>/logout'"
                style="margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 1rem; color: var(--danger); cursor: pointer;">
                <i class="fas fa-sign-out-alt nav-icon"></i>
                <span class="nav-text">تسجيل خروج</span>
            </div>
        </nav>
    </div>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
        <!-- Page Container -->
        <div class="page-container">
            <!-- Top Bar (Optional - can be removed if not needed) -->
            <?php if (!isset($hide_topbar) || !$hide_topbar): ?>
                <div class="glass-card" style="padding: 1rem 1.5rem; margin-bottom: 1rem;">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 style="font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-primary);">
                            <?= $page_title ?? 'لوحة التحكم' ?>
                        </h1>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <!-- Dark Mode Toggle -->
                            <button onclick="toggleTheme()" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%; width: 40px; height: 40px; border: none; background: transparent;" title="تبديل الوضع">
                                <i class="fas fa-moon" id="theme-icon" style="font-size: 1.2rem; color: var(--text-secondary);"></i>
                            </button>

                            <span style="color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-user-circle" style="margin-left: 0.5rem;"></i>
                                <?= isset($_SESSION['user_name']) ? htmlspecialchars($_SESSION['user_name']) : 'مستخدم' ?>
                            </span>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Page Content -->
            <div style="flex: 1; display: flex; flex-direction: column;">
                <?php include $child_view; ?>
            </div>
        </div>
    </div>

    <!-- Page Specific Scripts -->
    <?php if (isset($additional_js)): ?>
        <?= $additional_js ?>
    <?php endif; ?>
    <!-- Theme Toggle Scripts -->
    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('theme-icon');

            html.classList.toggle('dark-mode');
            html.classList.toggle('dark');

            const isDark = html.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            updateThemeIcon();
        }

        function updateThemeIcon() {
            const isDark = document.documentElement.classList.contains('dark-mode');
            const icon = document.getElementById('theme-icon');
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                // Optional: Update title tooltip
                icon.parentElement.title = isDark ? 'الوضع النهاري' : 'الوضع الليلي';
            }
        }

        // Sidebar Logic
        function toggleSidebar() {
            document.getElementById('mainSidebar').classList.toggle('mobile-active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }

        function closeSidebar() {
            document.getElementById('mainSidebar').classList.remove('mobile-active');
            document.querySelector('.sidebar-overlay').classList.remove('active');
        }

        // Init Icon on Load
        document.addEventListener('DOMContentLoaded', () => {
            updateThemeIcon();
            // Sync mobile theme icon
            const isDark = document.documentElement.classList.contains('dark-mode');
            const mobIcon = document.getElementById('theme-icon-mobile');
            if (mobIcon) mobIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
    </script>
</body>

</html>