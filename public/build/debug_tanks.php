<?php
require_once __DIR__ . '/../app/Config/Database.php';
require_once __DIR__ . '/../app/Core/Model.php';
require_once __DIR__ . '/../app/Models/Tank.php';

use App\Models\Tank;

$tankModel = new Tank();
$tanks = $tankModel->getAll();

echo "Count: " . count($tanks) . "\n";
print_r($tanks);
