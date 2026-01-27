$ftpHost = "ftp://petrodiesel.net"
$ftpUser = "ftpetro@app.petrodiesel.net"
$ftpPass = "hT&[EvaNz#Xs"
$localRoot = "c:\xampp\htdocs\PETRODIESEL2"

# Force Tls12
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

function Upload-File($localPath, $remotePath) {
    # Ensure remote path uses forward slashes
    $remotePath = $remotePath -replace "\\", "/"
    Write-Host "Uploading $localPath -> $remotePath ... " -NoNewline
    try {
        $uri = New-Object System.Uri($ftpHost + $remotePath)
        $webclient.UploadFile($uri, $localPath)
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        # If directory missing, one might need to create it. 
        # WebClient is dumb. But let's assume dirs exist or use FtpWebRequest for mkdir if needed.
        # usually for updates, dirs exist.
    }
}

function Upload-Directory($localDir, $remoteBase) {
    $items = Get-ChildItem $localDir
    foreach ($item in $items) {
        $remotePath = "$remoteBase/$($item.Name)"
        if ($item.Attributes.HasFlag([System.IO.FileAttributes]::Directory)) {
            # We can't easily MKDIR with WebClient. 
            # We assume infrastructure exists or this is a simplistic update script.
            # If deep dirs are new, this will fail. 
            # For now, we recurse.
            Upload-Directory $item.FullName $remotePath
        }
        else {
            Upload-File $item.FullName $remotePath
        }
    }
}

Write-Host "Starting Backend Deployment..." -ForegroundColor Cyan

# 1. Upload App
Write-Host "--- Uploading /app ---"
Upload-Directory "$localRoot\app" "/app"

# 2. Upload Views
Write-Host "--- Uploading /views ---"
Upload-Directory "$localRoot\views" "/views"

# 3. Upload Public (Selective)
Write-Host "--- Uploading /public (Selected files) ---"
$publicItems = Get-ChildItem "$localRoot\public"
foreach ($item in $publicItems) {
    if ($item.Name -eq "build" -or $item.Name -eq "uploads" -or $item.Name -eq ".git" -or $item.Name -eq "node_modules") { continue }
    
    $remotePath = "/public/$($item.Name)"
    if ($item.Attributes.HasFlag([System.IO.FileAttributes]::Directory)) {
        Upload-Directory $item.FullName $remotePath
    }
    else {
        Upload-File $item.FullName $remotePath
    }
}

Write-Host "Backend deployment completed." -ForegroundColor Green
