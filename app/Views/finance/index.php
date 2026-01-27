<div style="padding-top: 60px;"> <!-- Spacer -->
    <div
        id="root"
        data-page="accounting-dashboard"
        data-base-url="<?= BASE_URL ?>"
        data-safes='<?= json_encode($safes ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        data-banks='<?= json_encode($banks ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        data-transactions='<?= json_encode($recent_transactions ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        data-categories='<?= json_encode($categories ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        data-suppliers='<?= json_encode($suppliers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        data-customers='<?= json_encode($customers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        class="min-h-screen bg-slate-50"></div>

    <?php if (json_last_error() !== JSON_ERROR_NONE): ?>
        <div style="color:red; font-weight:bold; padding:20px; border:2px solid red;">
            JSON ERROR: <?= json_last_error_msg() ?>
        </div>
    <?php endif; ?>

    <script>
        // Pass PHP data to window for easier debugging access if needed
        window.phpData = {
            safes: <?= json_encode($safes ?? []) ?>,
            banks: <?= json_encode($banks ?? []) ?>,
            transactions: <?= json_encode($recent_transactions ?? []) ?>,
            categories: <?= json_encode($categories ?? []) ?>,
            suppliers: <?= json_encode($suppliers ?? []) ?>,
            customers: <?= json_encode($customers ?? []) ?>,
            user: <?= json_encode($user ?? null) ?>
        };
        console.log('Finance View Loaded');
        console.log('Suppliers:', window.phpData.suppliers);
        console.log('Customers:', window.phpData.customers);
        console.log('APP VIEW LOADED (app/Views/finance/index.php)');
    </script>
</div>