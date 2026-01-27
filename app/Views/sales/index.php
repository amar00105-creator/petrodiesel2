<?php

/** @var array $sales */
?>
<div id="root"
    data-page="sales-list"
    data-sales='<?= json_encode($sales, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'></div>