<?php
// app/Views/finance/safes.php
?>
<div style="padding-top: 60px;"> <!-- Spacer -->
    <div
        id="root"
        data-page="accounting-safes"
        data-base-url="<?= BASE_URL ?>"
        data-safes='<?= json_encode($safes ?? [], JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>'
        class="min-h-screen bg-slate-50"></div>

    <script>
        window.phpData = {
            safes: <?= json_encode($safes ?? []) ?>,
            user: <?= json_encode($user ?? null) ?>
        };
        console.log('Safes View Loaded');
    </script>
</div>