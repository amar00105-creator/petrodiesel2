<?php
// Test API endpoint directly
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Simulate login for testing
$_SESSION['user'] = [
    'id' => 1,
    'username' => 'admin',
    'station_id' => 1,
    'role' => 'admin'
];

// Test the endpoint
$_GET['action'] = 'get_sources';

require_once __DIR__ . '/index.php';
