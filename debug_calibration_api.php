<?php
// Script to test Tank Calibration API Endpoints

// Define base URL
$baseUrl = 'http://localhost/PETRODIESEL2/public';

// Helper function to make requests
function makeRequest($url, $method = 'GET', $data = [])
{
    $curl = curl_init();

    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
    ];

    if ($method === 'POST') {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
        $options[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
    }

    curl_setopt_array($curl, $options);

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);

    curl_close($curl);

    return [
        'code' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

echo "Testing Tank Calibration API...\n";
echo "===============================\n\n";

// 1. Test getCalibrationPoints (assuming tank_id 1 exists or similar)
echo "1. Testing GET /tanks/getCalibrationPoints?tank_id=1\n";
$res1 = makeRequest($baseUrl . '/tanks/getCalibrationPoints?tank_id=1');
echo "Status: " . $res1['code'] . "\n";
echo "Response: " . substr($res1['response'], 0, 500) . "...\n\n";

// 2. Test calculateVolume
echo "2. Testing GET /tanks/calculateVolume?tank_id=1&height_mm=1000\n";
$res2 = makeRequest($baseUrl . '/tanks/calculateVolume?tank_id=1&height_mm=1000');
echo "Status: " . $res2['code'] . "\n";
echo "Response: " . substr($res2['response'], 0, 500) . "...\n\n";
