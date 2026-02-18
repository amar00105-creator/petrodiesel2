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
        window.justLoggedIn = <?= !empty($justLoggedIn) ? 'true' : 'false' ?>;

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
    <?php if (!empty($justLoggedIn) || !empty($justSwitchedStation)): ?>
        <!-- Pure PHP/CSS Welcome Overlay - No React dependency -->
        <div id="welcome-overlay-php" style="
    position: fixed; inset: 0; z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at center, rgba(2,6,23,0.97) 0%, rgba(2,6,23,0.99) 100%);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    font-family: 'Cairo', sans-serif; direction: rtl;
    animation: welOverlayIn 0.6s ease-out forwards;
    transition: opacity 0.6s ease-out;
">
            <style>
                @keyframes welOverlayIn {
                    from {
                        opacity: 0;
                    }

                    to {
                        opacity: 1;
                    }
                }

                @keyframes welContentUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px) scale(0.85);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes welIconPop {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(-20deg);
                    }

                    60% {
                        transform: scale(1.15) rotate(5deg);
                    }

                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                @keyframes welTextReveal {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes welLineGrow {
                    from {
                        transform: scaleX(0);
                    }

                    to {
                        transform: scaleX(1);
                    }
                }

                @keyframes welBadgePop {
                    0% {
                        opacity: 0;
                        transform: translateY(15px) scale(0.8);
                    }

                    60% {
                        transform: translateY(-3px) scale(1.05);
                    }

                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes welBarFill {
                    from {
                        width: 0%;
                    }

                    to {
                        width: 100%;
                    }
                }

                @keyframes welGlowRotate {
                    from {
                        transform: translate(-50%, -50%) rotate(0deg);
                    }

                    to {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                }

                @keyframes welPulseRing {
                    0% {
                        transform: scale(1);
                        opacity: 0.6;
                    }

                    100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }

                @keyframes welShimmer {
                    0% {
                        background-position: -200% center;
                    }

                    100% {
                        background-position: 200% center;
                    }
                }

                @keyframes welParticle {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 0.4;
                    }

                    50% {
                        transform: translateY(-30px) scale(1.3);
                        opacity: 0.7;
                    }

                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.4;
                    }
                }
            </style>

            <!-- Ambient particles -->
            <div style="position:absolute;width:220px;height:220px;left:10%;top:15%;background:radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%);border-radius:50%;animation:welParticle 4s ease-in-out infinite;"></div>
            <div style="position:absolute;width:290px;height:290px;left:25%;top:40%;background:radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%);border-radius:50%;animation:welParticle 5s ease-in-out infinite 0.4s;"></div>
            <div style="position:absolute;width:360px;height:360px;right:15%;top:20%;background:radial-gradient(circle,rgba(168,85,247,0.04) 0%,transparent 70%);border-radius:50%;animation:welParticle 6s ease-in-out infinite 0.8s;"></div>

            <!-- Content -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:48px;max-width:480px;text-align:center;animation:welContentUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;">

                <!-- Fuel Icon -->
                <div style="position:relative;animation:welIconPop 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;">
                    <div style="position:absolute;top:50%;left:50%;width:160px;height:160px;background:conic-gradient(from 0deg,rgba(16,185,129,0.35),rgba(59,130,246,0.35),rgba(168,85,247,0.35),rgba(16,185,129,0.35));border-radius:50%;filter:blur(25px);animation:welGlowRotate 8s linear infinite;"></div>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:112px;height:112px;border-radius:50%;border:2px solid rgba(16,185,129,0.3);animation:welPulseRing 2s ease-out infinite;"></div>
                    <div style="position:relative;width:112px;height:112px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(59,130,246,0.12) 100%);border:2px solid rgba(16,185,129,0.3);box-shadow:0 0 40px rgba(16,185,129,0.2),0 0 80px rgba(59,130,246,0.1);">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                            <path d="M3 22V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V22" stroke="url(#fgW)" stroke-width="1.6" stroke-linecap="round" />
                            <path d="M2 22H16" stroke="url(#fgW)" stroke-width="1.6" stroke-linecap="round" />
                            <rect x="6" y="8" width="6" height="4" rx="0.5" stroke="url(#fgW)" stroke-width="1.3" fill="rgba(16,185,129,0.12)" />
                            <path d="M15 7L17.5 4.5C18.33 3.67 19.67 3.67 20.5 4.5C21.05 5.05 21.05 5.95 20.5 6.5L19 8V14C19 15.1 19.9 16 21 16" stroke="url(#fgW)" stroke-width="1.3" stroke-linecap="round" />
                            <defs>
                                <linearGradient id="fgW" x1="2" y1="3" x2="22" y2="22">
                                    <stop stop-color="#10b981" />
                                    <stop offset="0.5" stop-color="#3b82f6" />
                                    <stop offset="1" stop-color="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="font-size:17px;font-weight:600;color:rgba(148,163,184,0.85);letter-spacing:0.08em;animation:welTextReveal 0.6s ease-out 0.7s both;">مرحباً بك يا</div>

                <!-- User Name -->
                <div style="font-size:38px;font-weight:900;background:linear-gradient(135deg,#ffffff 0%,#e2e8f0 50%,#94a3b8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;animation:welTextReveal 0.6s ease-out 0.85s both;">
                    <?= htmlspecialchars($user['name'] ?? 'مستخدم') ?>
                </div>

                <!-- Divider -->
                <div style="width:80px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(16,185,129,0.5),rgba(59,130,246,0.5),transparent);animation:welLineGrow 0.6s ease-out 0.95s both;transform-origin:center;"></div>

                <!-- Station Label -->
                <div style="font-size:15px;font-weight:500;color:rgba(148,163,184,0.6);animation:welTextReveal 0.5s ease-out 1.05s both;">في محطة</div>

                <!-- Station Badge -->
                <div style="position:relative;padding:12px 32px;border-radius:16px;background:linear-gradient(135deg,rgba(16,185,129,0.1) 0%,rgba(59,130,246,0.1) 100%);border:1px solid rgba(16,185,129,0.22);box-shadow:0 0 30px rgba(16,185,129,0.12),0 0 60px rgba(59,130,246,0.06);animation:welBadgePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.15s both;">
                    <div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#10b981 0%,#3b82f6 50%,#a855f7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:welShimmer 3s linear infinite 1.5s;">
                        ⛽ <?= htmlspecialchars($user['station_name'] ?? 'المحطة') ?>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div style="width:180px;height:3px;border-radius:3px;background:rgba(255,255,255,0.05);overflow:hidden;margin-top:12px;animation:welTextReveal 0.4s ease-out 1.3s both;">
                    <div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#10b981,#3b82f6,#a855f7);animation:welBarFill 1.0s ease-in-out 1.4s both;"></div>
                </div>
            </div>
        </div>
        <script>
            // Auto-fade welcome overlay after 2.5 seconds
            setTimeout(function() {
                var el = document.getElementById('welcome-overlay-php');
                if (el) {
                    el.style.opacity = '0';
                    setTimeout(function() {
                        el.remove();
                    }, 600);
                }
            }, 2500);
        </script>
    <?php endif; ?>
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
            <?php if (App\Helpers\AuthHelper::can('dashboard.view')): ?>
                <div class="nav-item <?= ($_SERVER['REQUEST_URI'] == '/PETRODIESEL2/public/' || $_SERVER['REQUEST_URI'] == '/PETRODIESEL2/public') ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/'"
                    style="cursor: pointer;">
                    <i class="fas fa-home nav-icon"></i>
                    <span class="nav-text">لوحة التحكم</span>
                </div>
            <?php endif; ?>

            <!-- المشتريات -->
            <?php if (App\Helpers\AuthHelper::can('purchases.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/purchases') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/purchases'"
                    style="cursor: pointer;">
                    <i class="fas fa-truck nav-icon"></i>
                    <span class="nav-text">المشتريات</span>
                </div>
            <?php endif; ?>

            <!-- المبيعات -->
            <?php if (App\Helpers\AuthHelper::can('sales.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/sales') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/sales'"
                    style="cursor: pointer;">
                    <i class="fas fa-shopping-cart nav-icon"></i>
                    <span class="nav-text">المبيعات</span>
                </div>
            <?php endif; ?>

            <!-- المكن والعدادات -->
            <?php if (App\Helpers\AuthHelper::can('pumps.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/pumps') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/pumps'"
                    style="cursor: pointer;">
                    <i class="fas fa-gas-pump nav-icon"></i>
                    <span class="nav-text">المكن والعدادات</span>
                </div>
            <?php endif; ?>

            <!-- الخزانات -->
            <?php if (App\Helpers\AuthHelper::can('inventory.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/tanks') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/tanks'"
                    style="cursor: pointer;">
                    <i class="fas fa-oil-can nav-icon"></i>
                    <span class="nav-text">الخزانات</span>
                </div>
            <?php endif; ?>

            <!-- الحسابات -->
            <?php if (App\Helpers\AuthHelper::can('finance.view')): ?>
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
            <?php if (App\Helpers\AuthHelper::can('hr.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/hr') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/hr'"
                    style="cursor: pointer;">
                    <i class="fas fa-users-cog nav-icon"></i>
                    <span class="nav-text">الموارد البشرية</span>
                </div>
            <?php endif; ?>

            <!-- العملاء والموردون -->
            <?php if (App\Helpers\AuthHelper::can('suppliers.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/suppliers') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/suppliers'"
                    style="cursor: pointer;">
                    <i class="fas fa-users nav-icon"></i>
                    <span class="nav-text">العملاء والموردون</span>
                </div>
            <?php endif; ?>

            <!-- التقارير -->
            <?php if (App\Helpers\AuthHelper::can('reports.view')): ?>
                <div class="nav-item <?= strpos($_SERVER['REQUEST_URI'], '/reports') !== false ? 'active' : '' ?>"
                    onclick="window.location.href='<?= BASE_URL ?>/reports'"
                    style="cursor: pointer;">
                    <i class="fas fa-chart-bar nav-icon"></i>
                    <span class="nav-text">التقارير</span>
                </div>
            <?php endif; ?>

            <!-- الإعدادات -->
            <?php if (App\Helpers\AuthHelper::can('settings.view')): ?>
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