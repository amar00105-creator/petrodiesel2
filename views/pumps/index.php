<!-- React Root -->
<div id="root"
    data-page="pumps"
    data-pumps='<?= json_encode($pumps ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-workers='<?= json_encode($workers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full bg-slate-50 dark:bg-[#0F172A]"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>