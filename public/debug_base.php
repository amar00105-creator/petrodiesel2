<?php
require_once __DIR__ . '/../app/Config/Constants.php';

use App\Config\Constants;

echo "<h1>Debug Info</h1>";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "<br>";
echo "Calculated BASE_URL: " . Constants::getBaseUrl() . "<br>";
