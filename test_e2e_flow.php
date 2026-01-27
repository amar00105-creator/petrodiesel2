<?php
// E2E Test: Login + Report
$baseUrl = 'http://localhost/PETRODIESEL2/public';
$cookieFile = __DIR__ . '/cookie.txt';
if (file_exists($cookieFile)) unlink($cookieFile);

// 1. Login
echo "1. Attempting Login...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/login");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'email' => '123@123',
    'password' => '123'
]));
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true); // Get Headers to check redirect

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$body = substr($response, $headerSize);

echo "Login Status: $httpCode\n";
// Expect 302 Redirect to / (or JSON if async - but auth controller redirects normally)
if ($httpCode == 302 || $httpCode == 200) {
    echo "Login successful (assumed).\n";
} else {
    echo "Login Failed.\n";
    exit;
}
curl_close($ch);

// 2. Fetch Report
echo "\n2. Fetching Financial Report (JSON)...\n";
$ch = curl_init();
$url = "$baseUrl/reports?action=financial_flow&source_type=safe&source_id=1&group_sales=none&start_date=2026-01-01&end_date=2026-01-24";
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile); // Send cookies
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// IMPORTANT: Send Accept header
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Report Status: $httpCode\n";
echo "Response Preview: " . substr($response, 0, 300) . "...\n";

// Validation
if (strpos($response, '"success":true') !== false) {
    echo "\nVERIFICATION PASSED: JSON Data Received.\n";
} elseif (strpos($response, '<!DOCTYPE') !== false) {
    echo "\nVERIFICATION FAILED: Received HTML instead of JSON.\n";
} else {
    echo "\nVERIFICATION FAILED: Unknown Response.\n";
}
