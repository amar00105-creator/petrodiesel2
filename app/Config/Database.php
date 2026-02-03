<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static $host = 'localhost';
    private static $db_name = 'petrodiesel_db';
    private static $username = 'root';
    private static $password = '';
    private static $conn = null;

    private static function loadConfig()
    {
        // FORCE PRODUCTION CONFIGURATION ON LIVE SERVER
        if (strpos($_SERVER['HTTP_HOST'] ?? '', 'petrodiesel.net') !== false) {
            $configFile = __DIR__ . '/db_config.php';
            if (file_exists($configFile)) {
                $config = require $configFile;
                if (is_array($config)) {
                    self::$host = $config['host'];
                    self::$db_name = $config['db_name'];
                    self::$username = $config['username'];
                    self::$password = $config['password'];
                    return; // Stop here, do not load .env
                }
            }
        }

        // 1. Try to load from .env file (Standard way)
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);

                switch ($name) {
                    case 'DB_HOST':
                        self::$host = $value;
                        break;
                    case 'DB_DATABASE':
                        self::$db_name = $value;
                        break;
                    case 'DB_USERNAME':
                        self::$username = $value;
                        break;
                    case 'DB_PASSWORD':
                        self::$password = $value;
                        break;
                }
            }
            return; // If .env exists, ignore legacy config
        }

        // 2. Fallback to legacy db_config.php
        $configFile = __DIR__ . '/db_config.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
            if (is_array($config)) {
                self::$host = $config['host'] ?? self::$host;
                self::$db_name = $config['db_name'] ?? self::$db_name;
                self::$username = $config['username'] ?? self::$username;
                self::$password = $config['password'] ?? self::$password;
            }
        }
    }

    public function __construct() {}

    public static function connect()
    {
        if (self::$conn === null) {
            self::loadConfig(); // Load config from .env or file

            try {
                self::$conn = new PDO(
                    "mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4",
                    self::$username,
                    self::$password
                );
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // On production, hide detailed errors
                // die("Database Connection Error");
                die("Connection Error: " . $e->getMessage());
            }
        }
        return self::$conn;
    }

    public static function reconnect()
    {
        self::$conn = null;
        return self::connect();
    }
}
