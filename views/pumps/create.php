<!-- React Root -->
<div id="root"
    data-page="add-pump"
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-workers='<?= json_encode($workers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    data-workers='<?= json_encode($workers ?? []) ?>'
    class="min-h-screen bg-slate-50/50"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>