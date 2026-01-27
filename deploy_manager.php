<?php
// deploy_manager.php

// Configuration
$FTP_USER = "ftpetro@app.petrodiesel.net";
$FTP_PASS = "Petro@00105";
$FTP_PORT = 21;
$HOSTS_TO_TRY = ["petrodiesel.net", "app.petrodiesel.net"];

// Base paths
$LOCAL_ROOT = __DIR__;
$REMOTE_ROOT = "/"; // Relative to FTP user's root

// State
$conn_id = null;
$current_host = "";

// Parse arguments
$options = getopt("", ["all", "backend", "frontend"]);
$mode = 'frontend'; // Default

if (isset($options['all'])) {
    $mode = 'all';
} elseif (isset($options['backend'])) {
    $mode = 'backend';
}

echo "---------------------------------------------------\n";
echo "🚀 Starting Deployment [$mode]\n";
echo "---------------------------------------------------\n";

/**
 * Establish FTP Connection
 */
function connectFTP()
{
    global $FTP_USER, $FTP_PASS, $FTP_PORT, $HOSTS_TO_TRY, $conn_id, $current_host;

    if ($conn_id !== null && $conn_id !== false) {
        // Verify if still alive
        try {
            if (@ftp_noop($conn_id)) {
                return true;
            }
        } catch (\Throwable $e) {
            // connection likely dead
        }
        echo "⚠️ Connection lost. Reconnecting...\n";
        @ftp_close($conn_id);
        $conn_id = null;
    }

    foreach ($HOSTS_TO_TRY as $host) {
        echo "Connecting to $host... ";

        // 1. Try FTP (Plain) - Prioritize to avoid SSL Crash
        echo "Trying FTP... ";
        $conn_id = @ftp_connect($host, $FTP_PORT, 10);
        if ($conn_id && @ftp_login($conn_id, $FTP_USER, $FTP_PASS)) {
            echo "FTP OK ✅\n";
            $current_host = $host;
            ftp_pasv($conn_id, true);
            return true;
        }

        // 2. Try FTPS (Fallback)
        echo "FTP failed. Trying FTPS... ";
        $conn_id = @ftp_ssl_connect($host, $FTP_PORT, 10);
        if ($conn_id && @ftp_login($conn_id, $FTP_USER, $FTP_PASS)) {
            echo "FTPS OK ✅\n";
            $current_host = $host;
            ftp_pasv($conn_id, true);
            return true;
        }

        echo "Fail ❌\n";
    }

    return false;
}

/**
 * Upload a single file with retries
 */
function uploadFile($local_path, $remote_path)
{
    global $conn_id;

    $attempts = 0;
    $max_attempts = 3;

    while ($attempts < $max_attempts) {
        // Ensure connection
        if (!connectFTP()) {
            echo "❌ Fatal: Could not establish connection.\n";
            return false;
        }

        echo "Uploading $remote_path ... ";

        if (@ftp_put($conn_id, $remote_path, $local_path, FTP_BINARY)) {
            echo "OK\n";
            return true;
        } else {
            echo "Retry " . ($attempts + 1) . "... ";
            $attempts++;
            // Force reconnect on failure
            if ($conn_id) @ftp_close($conn_id);
            $conn_id = null;
            sleep(1);
        }
    }

    echo "FAILED ❌\n";
    return false;
}

/**
 * Recursive Upload Function
 */
function uploadRecursive($local_dir, $remote_dir, $exclusions = [])
{
    global $conn_id;

    // Ensure dir exists
    if (!connectFTP()) return;

    if (!@ftp_chdir($conn_id, $remote_dir)) {
        if (@ftp_mkdir($conn_id, $remote_dir)) {
            // echo "Created dir: $remote_dir\n";
        }
    }

    $files = scandir($local_dir);
    foreach ($files as $file) {
        if ($file == '.' || $file == '..') continue;
        if (in_array($file, $exclusions)) continue;

        $local_file = $local_dir . DIRECTORY_SEPARATOR . $file;
        $remote_file = $remote_dir . '/' . $file;

        if (is_dir($local_file)) {
            uploadRecursive($local_file, $remote_file, $exclusions);
        } else {
            uploadFile($local_file, $remote_file);
        }
    }
}

// Initial Connection
if (!connectFTP()) {
    die("❌ Could not connect to server.\n");
}

// 1. FRONTEND
if ($mode === 'frontend' || $mode === 'all') {
    echo "\n📦 Deploying Frontend Assets...\n";
    $local_build = $LOCAL_ROOT . '/public/build';
    $remote_build = $REMOTE_ROOT . 'public/build';

    if (is_dir($local_build)) {
        uploadRecursive($local_build, $remote_build);
    } else {
        echo "⚠️ public/build not found.\n";
    }
}

// 2. BACKEND
if ($mode === 'backend' || $mode === 'all') {
    echo "\n⚙️ Deploying Backend Code...\n";

    // App
    uploadRecursive($LOCAL_ROOT . '/app', $REMOTE_ROOT . 'app', ['db_config.php']);

    // Views
    uploadRecursive($LOCAL_ROOT . '/views', $REMOTE_ROOT . 'views');

    // Public Root Files
    echo "\n📄 Deploying Public Root Files...\n";
    $public_files = scandir($LOCAL_ROOT . '/public');
    foreach ($public_files as $file) {
        if ($file == '.' || $file == '..') continue;
        $local_path = $LOCAL_ROOT . '/public/' . $file;

        if (is_dir($local_path)) {
            // Include CSS and IMG and ASSETS directories
            if (in_array($file, ['css', 'img', 'assets'])) {
                echo "\n📂 Uploading Public Directory: $file ...\n";
                uploadRecursive($local_path, $remote_path . '/' . $file);
            }
            continue;
        }

        // .htaccess handling
        if ($file === 'htaccess_live') {
            $remote_path = $REMOTE_ROOT . 'public/.htaccess';
            echo "(Using htaccess_live) ";
            uploadFile($local_path, $remote_path);
        } elseif ($file === '.htaccess') {
            echo "Skipping local .htaccess\n";
            continue;
        } else {
            $remote_path = $REMOTE_ROOT . 'public/' . $file;
            uploadFile($local_path, $remote_path);
        }
    }
}

if ($conn_id) @ftp_close($conn_id);
echo "\n🏁 Deployment Completed.\n";
