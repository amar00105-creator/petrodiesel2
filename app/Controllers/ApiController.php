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
            'datetime' => date('Y-m-d H:i:s'),   // "2026-02-19 02:58:37" - used by FuturisticHeader & serverTime.js
            'date' => date('Y-m-d'),               // "2026-02-19" - used by serverTime.js getServerDate()
            'time' => date('Y-m-d\TH:i:s'),       // kept for backwards compatibility
            'timestamp' => time(),
            'timezone' => date_default_timezone_get()
        ]);
        exit;
    }
}
