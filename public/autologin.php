<?php
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_name'] = 'Debug Admin';
$_SESSION['user_role'] = 'super_admin';
$_SESSION['station_id'] = 1;
$_SESSION['active_station_id'] = 1;
$_SESSION['permissions'] = ['*'];

header("Location: /PETRODIESEL2/public/finance");
exit;
