<?php
$config = require 'app/Config/db_config.php';
$pdo = new PDO("mysql:host={$config['host']};dbname={$config['db_name']}", $config['username'], $config['password']);
$cols = $pdo->query("DESCRIBE transactions")->fetchAll(PDO::FETCH_COLUMN);
echo implode(', ', $cols);
