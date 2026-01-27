<?php
// Scan common MySQL ports
$ports = [3306, 3307, 3308, 8889, 33060];
$hosts = ['127.0.0.1', 'localhost']; // Swapped order to prefer IP
$user = 'root';
$pass = '';

echo "<h1>MySQL Port Scanner V2</h1>";

foreach ($hosts as $host) {
    echo "<h2>Testing Host: $host</h2>";
    foreach ($ports as $port) {
        echo "<p>Testing port: <strong>$port</strong>... ";
        try {
            $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "<span style='color: green;'>SUCCESS! Found open MySQL service on $host:$port.</span></p>";
            // List databases
            $stmt = $pdo->query("SHOW DATABASES");
            $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "<ul>";
            foreach ($dbs as $db) {
                echo "<li>$db</li>";
            }
            echo "</ul>";
        } catch (PDOException $e) {
            echo "<span style='color: red;'>Failed.</span> (" . $e->getMessage() . ")</p>";
        }
    }
}
