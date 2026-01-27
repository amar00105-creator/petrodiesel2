<?php
// views/admin/settings/index.php
?>
<!-- React Root -->
<div id="root"
    data-page="settings"
    data-general='<?= json_encode($general ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-fuel='<?= json_encode($fuel ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-alerts='<?= json_encode($alerts ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-roles='<?= json_encode($roles ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-stations='<?= json_encode($stations ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-users='<?= json_encode($users ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    <?php
    $jsonFuel = json_encode($fuelTypes ?? []);
    if ($jsonFuel === false) {
        $jsonFuel = '[]';
        echo "data-json-error='" . json_last_error_msg() . "'";
    }
    ?>
    data-fuel-types='<?= $jsonFuel ?>'
    class="h-full w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>