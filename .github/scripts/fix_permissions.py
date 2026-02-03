import ftplib
import os
import ssl

FTP_HOST = os.environ.get('FTP_HOST', '162.0.215.16')
FTP_USER = os.environ.get('FTP_USER')
FTP_PASS = os.environ.get('FTP_PASS')

def fix_permissions():
    print(f"Connecting to {FTP_HOST}...")
    
    # Try explicit TLS first, then plain FTP
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        ftp = ftplib.FTP_TLS(context=ctx)
        ftp.connect(FTP_HOST, 21)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.prot_p() # Switch to secure data connection
        print("Connected via FTP_TLS")
    except Exception as e:
        print(f"FTP_TLS failed: {e}. Trying plain FTP...")
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21)
        ftp.login(FTP_USER, FTP_PASS)
        print("Connected via Plain FTP")

    commands = [
        ('SITE CHMOD 755 public', 'Fix public dir'),
        ('SITE CHMOD 644 public/index.php', 'Fix index.php'),
        ('SITE CHMOD 644 public/.htaccess', 'Fix .htaccess'),
        ('SITE CHMOD 644 app/Config/db_config.php', 'Fix db_config'),
        ('DELE .env', 'Delete .env file to force config usage')
    ]

    for cmd, desc in commands:
        try:
            print(f"Executing: {desc} ({cmd})")
            resp = ftp.sendcmd(cmd)
            print(f"Response: {resp}")
        except Exception as e:
            print(f"Failed to {desc}: {e}")

    ftp.quit()
    print("Permission fix completed.")

if __name__ == "__main__":
    if not FTP_USER or not FTP_PASS:
        print("Error: FTP_USER or FTP_PASS not set.")
        exit(1)
    fix_permissions()
