<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إنشاء حساب جديد - بتروديزل</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --accent-color: #3b82f6;
            --emerald: #10b981;
            --emerald-dark: #059669;
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-gradient);
            color: #fff;
            overflow-x: hidden;
        }

        /* Ambient Background Overlay */
        .ambient-light {
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 50%);
            animation: rotate 25s linear infinite;
            z-index: 1;
        }

        .ambient-light-2 {
            position: fixed;
            bottom: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 50%);
            animation: rotate 30s linear infinite reverse;
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

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .register-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 480px;
            padding: 20px;
            animation: fadeInUp 0.6s ease-out;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 36px 30px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .logo-area {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-icon-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 14px 24px;
            margin-bottom: 16px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .logo-icon-wrap i {
            font-size: 32px;
            color: #34d399;
            filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.6));
        }

        .logo-sep {
            width: 1px;
            height: 40px;
            background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.25), transparent);
        }

        .logo-icon-wrap img {
            height: 55px;
            width: auto;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4)) brightness(1.1);
        }

        .app-name {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(to right, #34d399, #60a5fa);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 4px;
        }

        .form-row {
            display: flex;
            gap: 12px;
        }

        .form-row .form-group {
            flex: 1;
        }

        .form-group {
            margin-bottom: 16px;
            position: relative;
            animation: slideIn 0.4s ease-out backwards;
        }

        .form-group:nth-child(1) {
            animation-delay: 0.1s;
        }

        .form-group:nth-child(2) {
            animation-delay: 0.15s;
        }

        .form-group:nth-child(3) {
            animation-delay: 0.2s;
        }

        .form-group:nth-child(4) {
            animation-delay: 0.25s;
        }

        .form-group:nth-child(5) {
            animation-delay: 0.3s;
        }

        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            color: #e2e8f0;
            font-weight: 600;
        }

        .input-wrapper {
            position: relative;
        }

        .input-wrapper i {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 14px;
            transition: color 0.3s;
            pointer-events: none;
        }

        .form-control {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 11px 40px 11px 14px;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--emerald);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            background: rgba(15, 23, 42, 0.8);
        }

        .form-control:focus+i,
        .form-control:focus~i {
            color: #34d399;
        }

        .form-control::placeholder {
            color: #475569;
        }

        .password-strength {
            height: 3px;
            border-radius: 3px;
            margin-top: 6px;
            background: rgba(255, 255, 255, 0.1);
            overflow: hidden;
            transition: all 0.3s;
        }

        .password-strength .bar {
            height: 100%;
            border-radius: 3px;
            transition: width 0.4s ease, background 0.4s ease;
            width: 0%;
        }

        .btn-register {
            width: 100%;
            background: linear-gradient(135deg, var(--emerald), var(--emerald-dark));
            color: white;
            border: none;
            padding: 13px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            font-family: inherit;
            margin-top: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
        }

        .btn-register:active {
            transform: translateY(0);
        }

        .btn-register i {
            transition: transform 0.3s;
        }

        .btn-register:hover i {
            transform: translateX(-4px);
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
            background-color: transparent;
            padding: 0 10px;
            color: #64748b;
            font-size: 12px;
            position: relative;
            z-index: 1;
        }

        .login-link {
            text-align: center;
            margin-top: 16px;
        }

        .login-link a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            transition: color 0.2s;
        }

        .login-link a:hover {
            color: #93c5fd;
            text-decoration: underline;
        }

        .login-link span {
            color: #94a3b8;
            font-size: 14px;
        }

        .alert-danger {
            background: rgba(220, 38, 38, 0.15);
            border: 1px solid rgba(220, 38, 38, 0.3);
            color: #fca5a5;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            animation: fadeInUp 0.3s ease-out;
        }

        .alert-danger ul {
            margin: 0;
            padding: 0 16px;
            list-style: none;
        }

        .alert-danger ul li {
            padding: 2px 0;
        }

        .alert-danger ul li::before {
            content: '⚠ ';
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #6ee7b7;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            text-align: center;
            animation: fadeInUp 0.3s ease-out;
        }

        /* Toggle Password Visibility */
        .toggle-pass {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            cursor: pointer;
            font-size: 14px;
            transition: color 0.2s;
            z-index: 2;
        }

        .toggle-pass:hover {
            color: #94a3b8;
        }
    </style>
</head>

<body>

    <div class="ambient-light"></div>
    <div class="ambient-light-2"></div>

    <div class="register-container">
        <div class="glass-card">
            <div class="logo-area">
                <div class="logo-icon-wrap">
                    <i class="fas fa-gas-pump"></i>
                    <div class="logo-sep"></div>
                    <img src="<?php echo BASE_URL; ?>/img/logo.png" alt="Petro Diesel">
                </div>
                <h1 class="app-name">إنشاء حساب جديد</h1>
                <p class="app-subtitle">انضم إلى نظام بتروديزل لإدارة محطات الوقود</p>
            </div>

            <?php if (!empty($errors)): ?>
                <div class="alert-danger">
                    <ul>
                        <?php foreach ($errors as $err): ?>
                            <li><?php echo htmlspecialchars($err); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form action="<?php echo BASE_URL; ?>/register" method="POST" id="registerForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="username">اسم المستخدم</label>
                        <div class="input-wrapper">
                            <input type="text" name="username" id="username" class="form-control"
                                placeholder="مثال: ahmed_123"
                                value="<?php echo htmlspecialchars($old['username'] ?? ''); ?>"
                                required minlength="3" pattern="[a-zA-Z0-9_]+"
                                title="حروف إنجليزية، أرقام، و _ فقط">
                            <i class="fas fa-at"></i>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="name">الاسم الكامل</label>
                        <div class="input-wrapper">
                            <input type="text" name="name" id="name" class="form-control"
                                placeholder="الاسم الثلاثي"
                                value="<?php echo htmlspecialchars($old['name'] ?? ''); ?>"
                                required>
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">البريد الإلكتروني</label>
                    <div class="input-wrapper">
                        <input type="email" name="email" id="email" class="form-control"
                            placeholder="name@company.com"
                            value="<?php echo htmlspecialchars($old['email'] ?? ''); ?>"
                            required>
                        <i class="fas fa-envelope"></i>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">كلمة المرور</label>
                    <div class="input-wrapper">
                        <input type="password" name="password" id="password" class="form-control"
                            placeholder="6 أحرف على الأقل"
                            required minlength="6">
                        <i class="fas fa-lock"></i>
                        <span class="toggle-pass" onclick="togglePassword('password', this)">
                            <i class="fas fa-eye"></i>
                        </span>
                    </div>
                    <div class="password-strength">
                        <div class="bar" id="strengthBar"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password_confirm">تأكيد كلمة المرور</label>
                    <div class="input-wrapper">
                        <input type="password" name="password_confirm" id="password_confirm" class="form-control"
                            placeholder="أعد كتابة كلمة المرور"
                            required minlength="6">
                        <i class="fas fa-shield-alt"></i>
                        <span class="toggle-pass" onclick="togglePassword('password_confirm', this)">
                            <i class="fas fa-eye"></i>
                        </span>
                    </div>
                </div>

                <button type="submit" class="btn-register">
                    <i class="fas fa-user-plus"></i>
                    إنشاء الحساب
                </button>
            </form>

            <div class="divider">
                <span>لديك حساب بالفعل؟</span>
            </div>

            <div class="login-link">
                <a href="<?php echo BASE_URL; ?>/login">
                    <i class="fas fa-arrow-right"></i>
                    تسجيل الدخول
                </a>
            </div>
        </div>
    </div>

    <script>
        // Password Strength Meter
        const passwordInput = document.getElementById('password');
        const strengthBar = document.getElementById('strengthBar');

        passwordInput.addEventListener('input', function() {
            const val = this.value;
            let strength = 0;

            if (val.length >= 6) strength += 25;
            if (val.length >= 10) strength += 15;
            if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength += 20;
            if (/\d/.test(val)) strength += 20;
            if (/[^a-zA-Z0-9]/.test(val)) strength += 20;

            strengthBar.style.width = strength + '%';

            if (strength < 30) {
                strengthBar.style.background = '#ef4444';
            } else if (strength < 60) {
                strengthBar.style.background = '#f59e0b';
            } else if (strength < 80) {
                strengthBar.style.background = '#3b82f6';
            } else {
                strengthBar.style.background = '#10b981';
            }
        });

        // Toggle Password Visibility
        function togglePassword(fieldId, btn) {
            const field = document.getElementById(fieldId);
            const icon = btn.querySelector('i');
            if (field.type === 'password') {
                field.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                field.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }

        // Client-side validation
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const pass = document.getElementById('password').value;
            const confirm = document.getElementById('password_confirm').value;

            if (pass !== confirm) {
                e.preventDefault();
                alert('كلمة المرور وتأكيدها غير متطابقتين');
                return false;
            }

            if (pass.length < 6) {
                e.preventDefault();
                alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return false;
            }
        });
    </script>

</body>

</html>