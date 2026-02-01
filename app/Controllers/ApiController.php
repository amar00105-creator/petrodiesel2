<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Setting;

class ApiController extends Controller
{
    /**
     * Get current server time based on configured timezone
     */
    public function getServerTime()
    {
        header('Content-Type: application/json');

        // Return current time in various formats
        echo json_encode([
            'success' => true,
            'timestamp' => time(),
            'date' => date('Y-m-d'),
            'time' => date('H:i:s'),
            'datetime' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get(),
            'formatted' => [
                'full' => date('Y-m-d H:i:s'),
                'date_only' => date('Y-m-d'),
                'time_only' => date('H:i:s'),
                'display' => date('d/m/Y H:i')
            ]
        ]);
        exit;
    }
}
