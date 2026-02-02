<?php
// deploy.php - FTP Upload Script

$ftp_server = "162.0.215.16";
$ftp_user_name = "ftpetro@app.petrodiesel.net";
$ftp_user_pass = "Petro@00105";
$source_dir = __DIR__ . '/public/build';
$target_dir = '/public/build';

echo "Connecting to $ftp_server...\n";
$conn_id = ftp_connect($ftp_server);

if (!$conn_id) {
    die("❌ Connection failed.\n");
}

if (@ftp_login($conn_id, $ftp_user_name, $ftp_user_pass)) {
    echo "✅ Login successful.\n";
    ftp_pasv($conn_id, true); // Enable Passive Mode

    uploadRecursive($conn_id, $source_dir, $target_dir);
} else {
    echo "❌ Login failed.\n";
}

ftp_close($conn_id);
echo "🏁 Deployment finished.\n";


function uploadRecursive($conn_id, $local_dir, $remote_dir)
{
    // Ensure remote directory exists
    if (!@ftp_chdir($conn_id, $remote_dir)) {
        if (ftp_mkdir($conn_id, $remote_dir)) {
            echo "created dir: $remote_dir\n";
        } else {
            // echo "Failed to create dir: $remote_dir (might exist)\n";
        }
    }

    $files = scandir($local_dir);

    foreach ($files as $file) {
        if ($file == '.' || $file == '..') continue;

        $local_file = $local_dir . '/' . $file;
        $remote_file = $remote_dir . '/' . $file;

        if (is_dir($local_file)) {
            uploadRecursive($conn_id, $local_file, $remote_file);
        } else {
            echo "Uploading $file... ";
            if (ftp_put($conn_id, $remote_file, $local_file, FTP_BINARY)) {
                echo "OK\n";
            } else {
                echo "FAILED\n";
            }
        }
    }
}
