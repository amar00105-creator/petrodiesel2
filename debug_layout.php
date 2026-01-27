<?php
// Simulate View Rendering
define('BASE_URL', 'http://localhost/PETRODIESEL2/public');
$hide_topbar = false;
$child_view = 'c:/xampp/htdocs/PETRODIESEL2/views/reports/index.php'; // Dummy path
$_SESSION['user_name'] = 'Debug User';

ob_start();
require 'c:/xampp/htdocs/PETRODIESEL2/views/layouts/main.php';
$html = ob_get_clean();

if (strpos($html, 'onclick="toggleTheme()"') !== false) {
    echo "SUCCESS: Toggle button found in HTML.\n";
} else {
    echo "FAILURE: Toggle button NOT found in HTML.\n";
}

echo "Top Bar Content:\n";
// Extract div with glass-card
preg_match('/<div class="glass-card".*?>(.*?)<\/div>/s', $html, $matches);
echo substr($matches[0] ?? 'Not Found', 0, 500);
