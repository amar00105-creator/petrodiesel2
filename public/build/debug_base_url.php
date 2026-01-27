<?php
require_once __DIR__ . '/../app/Config/Constants.php';

echo "<h1>Debug BASE_URL</h1>";
echo "Calculated BASE_URL: " . \App\Config\Constants::getBaseUrl() . "<br>";
echo "Defined BASE_URL: " . BASE_URL . "<br>";
echo "<hr>";
echo "<h2>Server Vars</h2>";
echo "HTTP_HOST: " . $_SERVER['HTTP_HOST'] . "<br>";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "<br>";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "<br>";
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'off') . "<br>";
