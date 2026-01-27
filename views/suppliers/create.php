<!-- React Root -->
<div id="root"
    data-page="partners"
    data-suppliers='<?= json_encode($suppliers ?? []) ?>'
    data-customers='<?= json_encode($customers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>