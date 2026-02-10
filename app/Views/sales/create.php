<?php

/** @var array $pumps */
/** @var array $workers */
/** @var array $customers */
/** @var array $safes */
/** @var array $user */
/** @var array $allStations */
/** @var array $stats */
?>
<div id="root"
    data-page="sales-create"
    data-base-url="<?= defined('BASE_URL') ? BASE_URL : '' ?>"
    data-user='<?= json_encode($user ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-all-stations='<?= json_encode($allStations ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-stats='<?= json_encode($stats ?? [], JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-pumps='<?= json_encode($pumps, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-workers='<?= json_encode($workers, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-customers='<?= json_encode($customers, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-safes='<?= json_encode($safes, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-banks='<?= json_encode($banks, JSON_HEX_APOS | JSON_HEX_QUOT) ?>'
    data-sale='<?php
                $json = json_encode($sale, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE);
                if ($json === false) {
                    echo "[]";
                    error_log("JSON Encode Error in create.php: " . json_last_error_msg());
                } else {
                    echo $json;
                }
                ?>'></div>