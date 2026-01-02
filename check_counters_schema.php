<?php
require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();
$columns = $db->query("SHOW COLUMNS FROM counters")->fetchAll(PDO::FETCH_COLUMN);

echo "Columns in counters:\n";
foreach ($columns as $col) {
    echo "- $col\n";
}

if (!in_array('current_worker_id', $columns)) {
    echo "ATTENTION: 'current_worker_id' column is MISSING!\n";
    // Migration logic
    $db->exec("ALTER TABLE counters ADD COLUMN current_worker_id INT NULL");
    echo "Added 'current_worker_id' column.\n";
} else {
    echo "Schema is correct.\n";
}
