<!-- React Root -->
<div id="root"
    data-page="purchase-list"
    data-purchases='<?= json_encode($purchases ?? []) ?>'
    data-settings='<?= json_encode($settings ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full">
</div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>