<?php
// views/reports/index.php
?>
<script>
    window.BASE_URL = '/PETRODIESEL2/public';
</script>
<!-- React Root -->
<div id="root"
    data-page="reports"
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>