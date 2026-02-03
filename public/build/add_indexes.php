<?php
// Display errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Adding Database Indexes</h1>";

try {
    require_once __DIR__ . '/../app/Config/Database.php';
    $db = \App\Config\Database::connect();
    echo "<p style='color:green'>Database Connection: OK</p>";
} catch (Exception $e) {
    die("<p style='color:red'>Database Connection Failed: " . $e->getMessage() . "</p>");
}

$indexes = [
    // Table => [IndexName => Columns]
    'sales' => [
        'idx_sales_station' => 'station_id',
        'idx_sales_date' => 'sale_date',
        'idx_sales_worker' => 'worker_id',
        'idx_sales_customer' => 'customer_id'
    ],
    'transactions' => [
        'idx_trans_station' => 'station_id',
        'idx_trans_date' => 'date',
        'idx_trans_type' => 'type',
        'idx_trans_created' => 'created_at'
    ],
    'customers' => [
        'idx_cust_station' => 'station_id',
        'idx_cust_name' => 'name'
    ],
    'suppliers' => [
        'idx_supp_name' => 'name'
    ],
    'pumps' => [
        'idx_pumps_tank' => 'tank_id'
    ],
    'counters' => [
        'idx_cnt_pump' => 'pump_id'
    ]
];

foreach ($indexes as $table => $idxs) {
    echo "<h3>Table: $table</h3>";
    foreach ($idxs as $idxName => $columns) {
        try {
            // Check if index exists
            $check = $db->query("SHOW INDEX FROM $table WHERE Key_name = '$idxName'");
            if ($check->fetch()) {
                echo "<p style='color:orange'>Index '$idxName' already exists.</p>";
            } else {
                $db->exec("CREATE INDEX $idxName ON $table ($columns)");
                echo "<p style='color:green'>CREATED Index '$idxName' on ($columns).</p>";
            }
        } catch (Exception $e) {
            echo "<p style='color:red'>Error creating '$idxName': " . $e->getMessage() . "</p>";
        }
    }
}

echo "<h3>Optimization Complete. Check your pages now.</h3>";
