<!-- React Root for Safes Page -->
<div id="root"
    data-page="accounting-safes"
    data-safes='<?= json_encode($safes ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="h-full w-full"></div>