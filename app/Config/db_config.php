<?php
$host = $_SERVER['HTTP_HOST'] ?? '';
$isLocal = in_array($host, ['localhost', '127.0.0.1', '::1']) || strpos($host, 'petrodiesel.net') === false;

if ($isLocal) {
    // Local / Dev Environment
    return [
        'host' => 'localhost',
        'db_name' => 'petrodiesel_db',
        'username' => 'root',
        'password' => '' // Default XAMPP password
    ];
} else {
    // Production Environment (app.petrodiesel.net)
    return [
        'host' => 'localhost',
        'db_name' => 'petrnugv_petrodiesel-database',
        'username' => 'petrnugv_petrodiesel',
        'password' => 'Petro@205'
    ];
}
