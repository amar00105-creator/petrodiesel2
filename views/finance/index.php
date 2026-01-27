<!-- React Root for Accounting Dashboard -->
<div id="root"
    data-page="accounting-dashboard"
    data-safes='<?= json_encode($safes ?? []) ?>'
    data-banks='<?= json_encode($banks ?? []) ?>'
    data-transactions='<?= json_encode($recent_transactions ?? []) ?>'
    data-categories='<?= json_encode($categories ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    data-suppliers='<?= json_encode($suppliers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-customers='<?= json_encode($customers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    class="h-full w-full"></div>

<script>
    console.log('ROOT VIEW LOADED (views/finance/index.php)');
</script>