<?php
// Expects $tanks array
?>
<div id="root" class="h-full w-full bg-slate-50 dark:bg-[#0F172A]"
    data-page="tank-list"
    data-tanks='<?= json_encode($tanks, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>'
    data-suppliers='<?= json_encode($suppliers ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>'
    data-fuel-settings='<?= json_encode($fuelSettings ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>'
    data-general-settings='<?= json_encode($generalSettings ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>'
    data-fuel-types='<?= json_encode($fuelTypes ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'></div>
<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>

<?php
// Layout handled by Controller
?>