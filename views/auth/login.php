<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - بتروديزل</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --accent-color: #3b82f6;
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-gradient);
            color: #fff;
            overflow: hidden;
        }

        /* Ambient Background Overlay */
        .ambient-light {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 50%);
            animation: rotate 20s linear infinite;
            z-index: 1;
        }

        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        .login-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 420px;
            padding: 20px;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 30px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .logo-area {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo-icon {
            font-size: 40px;
            color: var(--accent-color);
            margin-bottom: 10px;
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
        }

        .app-name {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(to right, #60a5fa, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 5px;
        }

        .form-group {
            margin-bottom: 20px;
            position: relative;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #e2e8f0;
        }

        .form-control {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 15px;
            color: #fff;
            font-family: inherit;
            font-size: 15px;
            transition: all 0.3s ease;
            box-sizing: border-box;
            /* Fix width overflow */
        }

        .form-control:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.8);
        }

        .btn-primary {
            width: 100%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            font-family: inherit;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
        }

        .btn-google {
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            color: #1e293b;
            border: none;
            padding: 12px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: background 0.2s;
            font-family: inherit;
        }

        .btn-google:hover {
            background: #fff;
        }

        .divider {
            text-align: center;
            margin: 20px 0;
            position: relative;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
        }

        .divider span {
            background: #192130;
            padding: 0 10px;
            color: #64748b;
            font-size: 12px;
            position: relative;
            z-index: 1;
            /* Small hack to match glass background approximately if needed, 
               but transparent is better inside glass */
            background-color: transparent;
        }

        .alert-danger {
            background: rgba(220, 38, 38, 0.2);
            border: 1px solid rgba(220, 38, 38, 0.4);
            color: #fca5a5;
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>

<body>

    <div class="ambient-light"></div>

    <div class="login-container">
        <div class="glass-card">
            <div class="logo-area">
                <!-- Unified Glass Container for Logo + Icon -->
                <div style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    padding: 16px 28px;
                    margin-bottom: 20px;
                    background: rgba(255,255,255,0.12); 
                    backdrop-filter: blur(14px); 
                    -webkit-backdrop-filter: blur(14px);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
                ">
                    <!-- Fuel Icon -->
                    <i class="fas fa-gas-pump" style="
                        font-size: 38px; 
                        color: #60a5fa; 
                        filter: drop-shadow(0 0 12px rgba(96,165,250,0.7));
                    "></i>

                    <!-- Separator -->
                    <div style="
                        width: 1px; 
                        height: 45px; 
                        background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent);
                    "></div>

                    <!-- Logo -->
                    <img src="<?php echo BASE_URL; ?>/img/logo.png" alt="Petro Diesel" style="
                        height: 65px; 
                        width: auto;
                        filter: drop-shadow(0 0 12px rgba(255,255,255,0.5)) brightness(1.15);
                    ">
                </div>
                <h1 class="app-name">بتروديزل ERP</h1>
                <p class="app-subtitle">نظام بتروديزل لإدارة محطات الوقود المتكامل الذكي</p>
            </div>

            <?php if (isset($error)): ?>
                <div class="alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> <?php echo $error; ?>
                </div>
            <?php endif; ?>

            <form action="<?php echo BASE_URL; ?>/login" method="POST">
                <div class="form-group">
                    <label for="email">البريد الإلكتروني</label>
                    <input type="email" name="email" id="email" class="form-control" placeholder="name@company.com"
                        required>
                </div>

                <div class="form-group">
                    <label for="password">كلمة المرور</label>
                    <input type="password" name="password" id="password" class="form-control" placeholder="••••••••"
                        required>
                </div>

                <button type="submit" class="btn-primary">
                    تسجيل الدخول
                </button>
            </form>

            <div class="divider">
                <span>أو الاستمرار بواسطة</span>
            </div>

            <button type="button" class="btn-google">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="G">
                Google
            </button>
        </div>
    </div>

</body>

</html>