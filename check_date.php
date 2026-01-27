<?php
$config = require 'app/Config/db_config.php';
$pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']}", $config['username'], $config['password']);
$row = $pdo->query("SELECT id, date, created_at FROM transactions WHERE id=6")->fetch(PDO::FETCH_ASSOC);
print_r($row);
