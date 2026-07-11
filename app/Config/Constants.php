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
            return "https://app.petrodiesel.net";
        }

        $protocol = 'http';
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            $protocol = 'https';
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
            $protocol = 'https';
        }

        $host = $_SERVER['HTTP_HOST'];
        $script = $_SERVER['SCRIPT_NAME'];
        $path = dirname($script);

        // Remove trailing slash if exists
        $path = rtrim($path, '/\\');

        // When requests come through root .htaccess (REQUEST_URI doesn't contain /public/),
        // strip /public from the base path so redirects stay clean (e.g. /login not /public/login)
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($requestUri, '/public/') === false && strpos($requestUri, '/public?') === false) {
            $path = preg_replace('#/public$#', '', $path);
        }

        return $protocol . "://" . $host . $path;
    }

    public static function getPublicPath()
    {
        return dirname(__DIR__, 2) . '/public';
    }
}

define('BASE_URL', Constants::getBaseUrl());
