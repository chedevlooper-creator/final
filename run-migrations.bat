@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM Yardım Yönetim Paneli - Migration Script (Windows)
REM ========================================

echo ========================================
echo Yardım Yönetim Paneli - Migration Script
echo ========================================
echo.

REM Proje dizini bul
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%~dp1"

echo [94mMigrations dizini: %PROJECT_ROOT%\supabase\migrations[0m
echo.

REM Yeni migration'ları bul
set "TODAY=%date:~0,4%%date:~5,2%%date:~8,2%"

REM Tüm SQL dosyalarını bul
set "MIGRATIONS_DIR=%PROJECT_ROOT%\supabase\migrations"
if not exist "%MIGRATIONS_DIR%" (
    echo [91mHata: Migrations dizini bulunamad![0m
    echo Beklenen: %MIGRATIONS_DIR%
    pause
    exit /b 1
)

echo [93mBulunan migration dosyalar:[0m
echo.

dir /b "%MIGRATIONS_DIR%\*.sql" /o:d

REM ========================================
REM UYARI: Migration'ları SİZE YÖNTEMLİK ÇALIŞTIRMAZ
REM ========================================

echo.
echo [93m=======================================[0m
echo [93m⚠️  UYARI: Bu script migration'ları SİZE YÖNTEMLİK ÇALIŞTIRMAZ[0m
echo [93m=======================================[0m
echo.

echo [93mSeçenekler:[0m
echo.
echo 1. [92mSupabase Dashboard'a Git[0m (ÖNERİLEN)
echo    Otomatik olarak tarayıcıyı açar
echo    Migration'ları SQL Editor'a kopyalamayı hatırlatır
echo.
echo 2. [93mMigration'ları Göster[0m
echo    SQL kodlarını terminalda gösterir
echo    Manuel olarak kopyalayıp yapıştırabilirsiniz
echo.
echo 3. [91mÇıkış[0m
echo.

set /p "choice=Seçiminiz (1-3): "

if "%choice%"=="1" (
    echo.
    echo [92m🚀 Supabase Dashboard açılıyor...[0m
    echo.
    echo [93mSupabase Dashboard'a gitmek için:[0m
    echo 1. [92mhttps://supabase.com/dashboard[0m
    echo 2. Projenizi seçin: [94mjdrncdqyymlwcyvnnzoj[0m
    echo 3. [93mDatabase -^> SQL Editor[0m
    echo 4. Aşağıdaki SQL dosyalarını çalıştırın:
    echo.
    echo [92mBugünkü ve gelecek migration'lar:[0m
    echo.
    echo [92m✓ 20260120_bank_accounts.sql[0m
    echo [92m✓ cash_transactions.sql (yakında)[0m
    echo [92m✓ merchants.sql (yakında)[0m
    echo [92m✓ purchase_requests.sql (yakında)[0m
    echo.
    echo [93mVeya tek tek yapıştırın:[0m
    echo.
    start https://supabase.com/dashboard/project/jdrncdqyymlwcyvnnzoj
)

if "%choice%"=="2" (
    echo.
    echo [92m📋 Migration SQL kodları:[0m
    echo.
    echo [93m=== Bugünkü Migration ===[0m
    echo.
    echo [92m--- 20260120_bank_accounts.sql ---[0m
    echo.
    type "%MIGRATIONS_DIR%\20260120_bank_accounts.sql"
    echo.
    echo [93mNot: Bu kodları Supabase Dashboard SQL Editor'a kopyalayıp çalıştırın[0m
    echo.
    pause
)

if "%choice%"=="3" (
    echo [92m👋 Çıkılıyor...[0m
    exit /b 0
)

echo [91m❌ Geçersiz seçim[0m
pause
exit /b 1
