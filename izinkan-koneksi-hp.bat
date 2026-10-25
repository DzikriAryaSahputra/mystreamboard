@echo off
:: Batch script untuk membuka port MyStreamBoard di Windows Firewall
:: Jalankan file ini dengan klik kanan -> "Run as administrator"
echo ====================================================================
echo   MyStreamBoard - Mengizinkan Akses Port 4829 di Windows Firewall
echo ====================================================================
echo.

netsh advfirewall firewall delete rule name="MyStreamBoard" >nul 2>&1
netsh advfirewall firewall add rule name="MyStreamBoard" dir=in action=allow protocol=TCP localport=4829 profile=any

powershell -Command "Set-NetConnectionProfile -NetworkCategory Private -ErrorAction SilentlyContinue"

echo.
echo ====================================================================
echo   [BERHASIL] Port 4829 sekarang sudah dibuka di Windows Firewall!
echo   HP dan perangkat lain di Wi-Fi sekarang bisa terhubung langsung.
echo ====================================================================
echo.
pause
