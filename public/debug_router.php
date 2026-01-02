<?php
header('Content-Type: text/plain');

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$scriptDir = dirname($scriptName);
$uriPath = parse_url($uri, PHP_URL_PATH);

echo "URI: $uri\n";
echo "Method: $method\n";
echo "Script Name: $scriptName\n";
echo "Script Dir: $scriptDir\n";
echo "Parsed Path: $uriPath\n";

$processedUri = $uriPath;

// Emulate Router Logic
echo "\n--- Router Logic ---\n";
// Adjust this depending on server config using $_SERVER['SCRIPT_NAME'] logic
if ($scriptDir !== '/' && strpos($uriPath, $scriptDir) === 0) {
    echo "Match found using case-sensitive strpos.\n";
    $processedUri = substr($uriPath, strlen($scriptDir));
} elseif ($scriptDir !== '/' && stripos($uriPath, $scriptDir) === 0) {
    echo "Match found using case-insensitive stripos.\n";
    // This is the one in the code
    $processedUri = substr($uriPath, strlen($scriptDir));
} else {
    echo "No match found for ScriptDir at start of URI.\n";
    // Try simpler replacement
    $scriptDir = str_replace('\\', '/', $scriptDir); // Normalize slashes
    echo "Normalized Script Dir: $scriptDir\n";
    if ($scriptDir !== '/' && stripos($uriPath, $scriptDir) === 0) {
        $processedUri = substr($uriPath, strlen($scriptDir));
        echo "Match found with normalized slashes.\n";
    }
}

if ($processedUri === false || $processedUri === '') {
    $processedUri = '/';
}

echo "Final Processed URI for Routing: '$processedUri'\n";
