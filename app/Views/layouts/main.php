<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetroDiesel ERP</title>

    <!-- CSS Dependencies -->
    <?= $additional_css ?? '' ?>

    <!-- Tailwind (Loaded via Vite/Main in React) -->

    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f8fafc;
        }
    </style>
</head>

<body class="bg-slate-50">

    <!-- Main Content -->
    <?php require_once $child_view; ?>

    <!-- JS Dependencies -->
    <?= $additional_js ?? '' ?>

</body>

</html>