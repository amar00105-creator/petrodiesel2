<?php
// views/settings/index.php
// React Mounting Point for Settings
?>

<!-- React Root -->
<div
    id="root"
    data-page="settings"
    data-general='<?= json_encode($general ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-fuel='<?= json_encode($fuel ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-alerts='<?= json_encode($alerts ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-roles='<?= json_encode($roles ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-fuel-types='<?= json_encode($fuelTypes ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-user='<?= json_encode($user ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-users='<?= json_encode($users ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-stats='<?= json_encode($stats ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-all-stations='<?= json_encode($allStations ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    class="min-h-screen bg-slate-50 dark:bg-[#0F172A]">
    <!-- React will mount here -->
    <div class="flex items-center justify-center h-screen">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-navy-900"></div>
    </div>
</div>

<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>