<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static $host = '127.0.0.1';
    private static $db_name = 'petrodiesel_db';
    private static $username = 'root'; // Update if needed
    private static $password = '';     // Update if needed
    private static $conn = null;

    public static function connect()
    {
        if (self::$conn === null) {
            try {
                self::$conn = new PDO(
                    "mysql:host=" . self::$host . ";dbname=" . self::$db_name . ";charset=utf8mb4",
                    self::$username,
                    self::$password
                );
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                die("Connection Error: " . $e->getMessage());
            }
        }
        return self::$conn;
    }
}
