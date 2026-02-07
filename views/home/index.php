<?php
// views/home/index.php
?>
<!-- React Root -->
<div id="root"
    data-page="dashboard"
    data-data='<?= json_encode($data ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    data-stats='<?= json_encode(['activeUsers' => $activeUsersCount ?? 0]) ?>'
    data-categories='<?= json_encode($categories ?? []) ?>'
    data-safes='<?= json_encode($safes ?? []) ?>'
    data-banks='<?= json_encode($banks ?? []) ?>'
    data-suppliers='<?= json_encode($suppliers ?? []) ?>'
    data-customers='<?= json_encode($customers ?? []) ?>'
    class="h-full w-full">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #666;">
        Loading Application...
    </div>
</div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>