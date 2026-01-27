<?php

namespace App\Config;

class Constants
{
    // Determine base URL automatically
    // Adjust logic if needed for specific server setups
    public static function getBaseUrl()
    {
        // Enforce Live URL for consistent behavior
        if ($_SERVER['HTTP_HOST'] === 'app.petrodiesel.net') {
            return "https://app.petrodiesel.net/public";
        }

        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $script = $_SERVER['SCRIPT_NAME'];
        $path = dirname($script);

        // Remove trailing slash if exists
        $path = rtrim($path, '/\\');

        return $protocol . "://" . $host . $path;
    }

    public static function getPublicPath()
    {
        return dirname(__DIR__, 2) . '/public';
    }
}

define('BASE_URL', Constants::getBaseUrl());
