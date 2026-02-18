<?php

namespace App\Controllers;

use App\Core\Controller;

class ApiController extends Controller
{
    /**
     * Return the current server time as JSON.
     * Used by the frontend to sync clocks.
     */
    public function getServerTime()
    {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'time' => date('Y-m-d\TH:i:s'),
            'timestamp' => time(),
            'timezone' => date_default_timezone_get()
        ]);
        exit;
    }
}
