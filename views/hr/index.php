<?php
// views/hr/index.php
// React Mounting Point for Human Resources Module
?>

<div id="root"
    data-page="human-resources"
    data-workers='<?= json_encode($workers ?? []) ?>'
    data-employees='<?= json_encode($employees ?? []) ?>'
    data-drivers='<?= json_encode($drivers ?? []) ?>'
    data-user='<?= json_encode($user ?? []) ?>'
    data-stats='<?= json_encode($stats ?? []) ?>'
    data-all-stations='<?= json_encode($allStations ?? []) ?>'
    class="min-h-screen bg-slate-50">
    <!-- React loads here -->
    <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
</div>