<!-- React Root -->
<div id="root"
    data-page="create-purchase"
    data-suppliers='<?= json_encode($suppliers ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-safes='<?= json_encode($safes ?? []) ?>'
    data-banks='<?= json_encode($banks ?? []) ?>'
    data-drivers='<?= json_encode($drivers ?? []) ?>'
    data-can-add-supplier='<?= json_encode($canAddSupplier ?? false) ?>'
    data-can-add-driver='<?= json_encode($canAddDriver ?? false) ?>'
    data-fuel-types='<?= json_encode($fuelTypes ?? []) ?>'
    data-invoice-number='<?= $invoiceNumber ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full">
</div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>