<!-- React Root -->
<div id="root"
    data-page="station-list"
    data-stations='<?= json_encode($stations) ?>'
    data-users='<?= json_encode($users ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full">
</div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>