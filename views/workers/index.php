<?php
// views/workers/index.php
// PETRODIESEL ERP - React Host
$page_title = 'إدارة العمال';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $page_title ?></title>

    <!-- React & Vite Integration -->
    <?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>
</head>

<body class="bg-slate-50">

    <!-- React Root -->
    <div id="root"
        data-page="workers"
        data-workers='<?= json_encode($workers ?? []) ?>'
        data-user='<?= json_encode($user ?? []) ?>'
        data-stats='<?= json_encode($stats ?? []) ?>'
        data-all-stations='<?= json_encode($allStations ?? []) ?>'
        class="h-full w-full"></div>

</body>

</html>