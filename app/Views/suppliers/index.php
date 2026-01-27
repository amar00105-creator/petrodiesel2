<?php

/** @var array $suppliers */
/** @var array $customers */
/** @var array $user */
?>
<div id="root"
    data-page="supplier-list"
    data-suppliers='<?= json_encode($suppliers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-customers='<?= json_encode($customers ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-user='<?= json_encode($user ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'>
</div>