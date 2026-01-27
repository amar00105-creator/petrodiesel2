<?php
// Simulate the API request for specific debug
$_GET['action'] = 'financial_flow';
$_GET['source_type'] = 'safe'; // Default test
$_GET['source_id'] = 1;       // Default test
$_GET['start_date'] = date('Y-m-01');
$_GET['end_date'] = date('Y-m-d');

require_once __DIR__ . '/index.php';
