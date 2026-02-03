$ftpUser = "ftpetro@app.petrodiesel.net"
$ftpPass = "Petro@00105"

$cmd = "
open 162.0.215.16
user $ftpUser $ftpPass
dir
cd public
dir
bye
"

$cmd | Set-Content "ftp_list.txt"
ftp -n -s:ftp_list.txt
