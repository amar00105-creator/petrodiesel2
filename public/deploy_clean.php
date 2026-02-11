<?php
// deploy_clean.php
// This script resets the server to match the GitHub repository exactly.
// WARNING: This will delete any local changes on the server!

// Security: Simple access key to prevent unauthorized execution
$access_key = $_GET['key'] ?? '';
$secret = 'petrodiesel_deploy_secret'; // Change this if needed

if ($access_key !== $secret) {
    die('Access Denied');
}

// Function to run commands and capture output
function run_cmd($cmd)
{
    echo "Running: $cmd\n";
    $output = [];
    $return_var = 0;
    exec($cmd . ' 2>&1', $output, $return_var);
    foreach ($output as $line) {
        echo "  > $line\n";
    }
    echo "Return Code: $return_var\n\n";
    return $return_var === 0;
}

echo "<pre>";
echo "Starting Clean Deployment...\n";
echo "----------------------------\n";

// 1. Fetch latest changes
run_cmd('git fetch --all');

// 2. Reset to origin/main (Hard Reset)
run_cmd('git reset --hard origin/main');

// 3. Clean untracked files (Optional - be careful!)
// -f = force, -d = directories
run_cmd('git clean -fd');

echo "----------------------------\n";
echo "Deployment Complete!\n";
echo "Current Commit:\n";
run_cmd('git log -1 --oneline');
echo "</pre>";
