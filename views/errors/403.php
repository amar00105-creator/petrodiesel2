<?php
// views/errors/403.php — Unauthorized Access
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>غير مصرح - 403</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #e2e8f0;
        }

        .container {
            text-align: center;
            padding: 3rem;
            max-width: 500px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            backdrop-filter: blur(20px);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
        }

        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            display: inline-block;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: 0.7;
                transform: scale(1.05);
            }
        }

        .code {
            font-size: 5rem;
            font-weight: 900;
            background: linear-gradient(135deg, #ef4444, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #f1f5f9;
        }

        p {
            font-size: 1rem;
            color: #94a3b8;
            line-height: 1.7;
            margin-bottom: 2rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="icon">🔒</div>
        <div class="code">403</div>
        <h1>غير مصرح بالوصول</h1>
        <p>ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة. يرجى التواصل مع المدير لمنحك الصلاحيات المطلوبة.</p>
        <a href="<?= defined('BASE_URL') ? BASE_URL : '/PETRODIESEL2/public' ?>" class="btn">
            ← العودة للرئيسية
        </a>
    </div>
</body>

</html>