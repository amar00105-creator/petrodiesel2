<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    public function __construct()
    {
        // Private constructor to prevent instantiation
    }
    private static $host = 'localhost';
    private static $db_name = 'petrodiesel_db';
    private static $username = 'root'; // Update if needed
    private static $password = '';     // Update if needed
    private static $conn = null;

    private static function loadConfig()
    {
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

    public static function connect()
    {
        if (self::$conn === null) {
            self::loadConfig(); // Load dynamic config

            try {
                self::$conn = new PDO(
                    "mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4",
                    self::$username,
                    self::$password
                );
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // On production, do not echo detailed errors to the screen for security
                // error_log($e->getMessage());
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
