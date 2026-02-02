$ftpHost = "ftp://162.0.215.16"
$ftpUser = "ftpetro@app.petrodiesel.net"
$ftpPass = "hT&[EvaNz#Xs"
$localDir = "c:\xampp\htdocs\PETRODIESEL2\public\build"
$remoteDir = "/public/build"

# Enable TLS 1.2
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

function Upload-File($localPath, $remotePath) {
    Write-Host "Uploading $localPath..." -NoNewline
    try {
        $uri = New-Object System.Uri($remotePath)
        $webclient.UploadFile($uri, $localPath)
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
    }
}

# 1. Upload Manifest
Upload-File "$localDir\.vite\manifest.json" "$ftpHost$remoteDir/.vite/manifest.json"

# 2. Upload Assets
$assets = Get-ChildItem "$localDir\assets"
foreach ($file in $assets) {
    if ($file.Attributes -ne "Directory") {
        $remoteFilePath = "$ftpHost$remoteDir/assets/" + $file.Name
        Upload-File $file.FullName $remoteFilePath
    }
}
