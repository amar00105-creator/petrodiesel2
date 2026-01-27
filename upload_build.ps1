$ftpHost = "ftp://petrodiesel.net"
$ftpUser = "ftpetro@app.petrodiesel.net"
$ftpPass = "hT&[EvaNz#Xs"
$localDir = "c:\xampp\htdocs\PETRODIESEL2\public\build"
$remoteDir = "/public/build"

# Force ServicePointManager to allow Tls12 (just in case)
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

function Upload-File($localPath, $remotePath) {
    Write-Host "Uploading $localPath to $remotePath..." -ForegroundColor Cyan
    try {
        $uri = New-Object System.Uri($remotePath)
        $webclient.UploadFile($uri, $localPath)
        Write-Host "Success." -ForegroundColor Green
    }
    catch {
        Write-Host "Error uploading $localPath : $_" -ForegroundColor Red
        # Print detailed error if exception is WebException
        if ($_.Exception -is [System.Net.WebException]) {
            $resp = $_.Exception.Response
            if ($resp) {
                Write-Host "Server Response: $( $resp.StatusDescription )" -ForegroundColor Yellow
            }
        }
    }
}

# 1. Upload Manifest
$manifestLocal = "$localDir\.vite\manifest.json"
$manifestRemote = "$ftpHost$remoteDir/.vite/manifest.json"
Upload-File $manifestLocal $manifestRemote

# 2. Upload Assets
$assets = Get-ChildItem "$localDir\assets"
foreach ($file in $assets) {
    if ($file.Attributes -ne "Directory") {
        $remoteFilePath = "$ftpHost$remoteDir/assets/" + $file.Name
        Upload-File $file.FullName $remoteFilePath
    }
}

Write-Host "Upload batch completed."
