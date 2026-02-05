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

        // Get offset from settings
        $offsetDays = 0;
        try {
            $settingModel = new Setting();
            $offSetSetting = $settingModel->get('server_date_offset');
            if ($offSetSetting) {
                $offsetDays = (int)$offSetSetting['value'];
            }
        } catch (\Exception $e) {
            // Ignore if setting not found
        }

        // Apply offset to current time
        $timestamp = time() + ($offsetDays * 86400); // 86400 seconds in a day

        // Return current time in various formats
        echo json_encode([
            'success' => true,
            'timestamp' => $timestamp,
            'date' => date('Y-m-d', $timestamp),
            'time' => date('H:i:s', $timestamp),
            'datetime' => date('Y-m-d H:i:s', $timestamp),
            'timezone' => date_default_timezone_get(),
            'offset_days' => $offsetDays, // useful for debugging
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
