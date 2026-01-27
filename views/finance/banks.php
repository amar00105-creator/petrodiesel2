<!-- React Root for Banks Page -->
<div id="root"
    data-page="accounting-banks"
    data-banks='<?= json_encode($banks ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full"></div>