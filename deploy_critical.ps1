$ftpHost = "ftp://petrodiesel.net"
$ftpUser = "ftpetro@app.petrodiesel.net"
$ftpPass = "hT&[EvaNz#Xs"
$localRoot = "c:\xampp\htdocs\PETRODIESEL2"

# Force Tls12
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

function Upload-File($localPath, $remotePath) {
    $remotePath = $remotePath -replace "\\", "/"
    Write-Host "Uploading $localPath -> $remotePath ... " -NoNewline
    try {
        $uri = New-Object System.Uri($ftpHost + $remotePath)
        $webclient.UploadFile($uri, $localPath)
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Upload-Directory($localDir, $remoteBase) {
    $items = Get-ChildItem $localDir
    foreach ($item in $items) {
        $remotePath = "$remoteBase/$($item.Name)"
        if ($item.Attributes.HasFlag([System.IO.FileAttributes]::Directory)) {
            # Attempt to create directory (blindly, ignore error if exists)
            try {
                $mkUri = New-Object System.Uri($ftpHost + $remotePath)
                $req = [System.Net.WebRequest]::Create($mkUri)
                $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                $req.Credentials = $webclient.Credentials
                $req.GetResponse() | Out-Null
            }
            catch {}
            
            Upload-Directory $item.FullName $remotePath
        }
        else {
            Upload-File $item.FullName $remotePath
        }
    }
}

Write-Host "Starting CRITICAL Deployment..." -ForegroundColor Cyan

# 1. Upload ViteHelper
Upload-File "$localRoot\app\Helpers\ViteHelper.php" "/app/Helpers/ViteHelper.php"

# 2. Upload Layout
Upload-File "$localRoot\views\layouts\main.php" "/views/layouts/main.php"

# 3. Upload Build Folder
Write-Host "Uploading Build Assets..."
Upload-Directory "$localRoot\public\build" "/public/build"

Write-Host "Critical deployment completed." -ForegroundColor Green
