<?php
// views/pumps/manage.php
// PETRODIESEL ERP - React Host
$page_title = 'تعديل بيانات الماكينة';
?>
<!-- React Root -->
<div id="root"
    data-page="manage-pump"
    data-pump='<?= json_encode($pump ?? []) ?>'
    data-counters='<?= json_encode($counters ?? []) ?>'
    data-workers='<?= json_encode($workers ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>