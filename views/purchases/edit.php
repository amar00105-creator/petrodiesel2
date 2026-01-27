<!-- React Root -->
<div id="root"
    data-page="edit-purchase"
    data-purchase='<?= json_encode($purchase ?? []) ?>'
    data-suppliers='<?= json_encode($suppliers ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-drivers='<?= json_encode($drivers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    data-fuel-types='<?= json_encode($fuelTypes ?? []) ?>'
    class="h-full w-full">
</div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>