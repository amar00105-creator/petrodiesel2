<?php
// Layout is handled by Controller
?>

<!-- React Root -->
<div id="root"
    data-page="manage-pump"
    data-pump='<?= json_encode($pump ?? []) ?>'
    data-counters='<?= json_encode($counters ?? []) ?>'
    data-workers='<?= json_encode($workers ?? []) ?>'
    data-tanks='<?= json_encode($tanks ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    class="min-h-screen bg-slate-50/50"></div>

<!-- React & Vite Integration -->
<?= \App\Helpers\ViteHelper::load('resources/js/main.jsx') ?>