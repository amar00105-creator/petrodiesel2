<?php
// views/finance/index.php
?>
<!-- React Root for Accounting Dashboard -->
<div id="root"
    data-page="accounting-dashboard"
    data-settings='<?= json_encode($settings ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-safes='<?= json_encode($safes ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-banks='<?= json_encode($banks ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-transactions='<?= json_encode($recent_transactions ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-categories='<?= json_encode($categories ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-user='<?= json_encode($user ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-stats='<?= json_encode($stats ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-all-stations='<?= json_encode($allStations ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-suppliers='<?= json_encode($suppliers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-customers='<?= json_encode($customers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    class="h-full w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>