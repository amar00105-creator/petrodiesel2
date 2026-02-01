<!-- React Root for Safes Page -->
<div id="root"
    data-page="accounting-safes"
    data-settings='<?= json_encode($settings ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-safes='<?= json_encode($safes ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-user='<?= json_encode($user ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-stats='<?= json_encode($stats ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    data-all-stations='<?= json_encode($allStations ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
    class="h-full w-full"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>