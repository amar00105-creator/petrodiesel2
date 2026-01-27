<?php
$url = 'http://localhost/PETRODIESEL2/public/tanks/update';
$data = [
    'id' => 1, // Assuming tank ID 1 exists or at least triggers the controller
    'name' => 'Test Tank',
    'fuel_type_id' => 1,
    'capacity_liters' => 5000,
    'current_volume' => 1000,
    'current_price' => 2.50
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "Curl Error: " . curl_error($ch) . "\n";
}

curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode !== 200) {
    echo "Request failed.\n";
} else {
    echo "Request successful.\n";
}
