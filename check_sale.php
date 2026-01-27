<?php
$config = require 'app/Config/db_config.php';
$pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']}", $config['username'], $config['password']);
$row = $pdo->query("SELECT id, sale_date, created_at FROM sales WHERE id=7")->fetch(PDO::FETCH_ASSOC);
print_r($row);
