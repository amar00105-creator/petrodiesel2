<?php
// views/suppliers/index.php
// React Mounting Point for Partners (Customers & Suppliers)
?>

<div id="root"
    data-page="partners"
    class="h-full w-full dark:bg-[#0F172A]">
    <!-- React loads here -->
    <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <script>
        window.phpData = {
            suppliers: <?= json_encode($suppliers ?? []) ?>,
            customers: <?= json_encode($customers ?? []) ?>,
            user: <?= json_encode($user ?? []) ?>,
            stats: <?= json_encode($stats ?? []) ?>,
            allStations: <?= json_encode($allStations ?? []) ?>
        };
    </script>
</div>