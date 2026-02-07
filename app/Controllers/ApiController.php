<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Setting;

class ApiController extends Controller
{
    /**
     * Get current server time based on configured timezone.
     * The timezone is already set in index.php from the settings table.
     */
    public function getServerTime()
    {
        header('Content-Type: application/json');

        // PHP timezone is already configured in index.php from settings
        $timestamp = time();

        echo json_encode([
            'success' => true,
            'timestamp' => $timestamp,
            'date' => date('Y-m-d', $timestamp),
            'time' => date('H:i:s', $timestamp),
            'datetime' => date('Y-m-d H:i:s', $timestamp),
            'timezone' => date_default_timezone_get(),
            'formatted' => [
                'full' => date('Y-m-d H:i:s', $timestamp),
                'date_only' => date('Y-m-d', $timestamp),
                'time_only' => date('H:i:s', $timestamp),
                'display' => date('d/m/Y H:i', $timestamp)
            ]
        ]);
        exit;
    }
}
