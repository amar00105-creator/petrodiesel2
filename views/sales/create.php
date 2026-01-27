<!-- React Root -->
<div id="root"
    data-page="sales-create"
    data-pumps='<?= json_encode($pumps ?? []) ?>'
    data-safes='<?= json_encode($safes ?? []) ?>'
    data-banks='<?= json_encode($banks ?? []) ?>'
    data-customers='<?= json_encode($customers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-screen w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>