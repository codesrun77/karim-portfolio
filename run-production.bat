@echo off
cd /d %~dp0
ECHO =========================================
ECHO   تشغيل موقع كريم السيد - بوابة الإنتاج
ECHO =========================================
ECHO.
ECHO يتم بدء تشغيل الموقع في وضع الإنتاج...
ECHO.
ECHO جاري بناء المشروع...
ECHO.

call npm run build
IF ERRORLEVEL 1 (
    ECHO.
    ECHO حدث خطأ أثناء بناء المشروع!
    ECHO.
    PAUSE
    EXIT /B 1
)

ECHO.
ECHO تم بناء المشروع بنجاح، جاري بدء الخادم...
ECHO.

start http://localhost:3000
npm run start

ECHO.
ECHO تم إيقاف تشغيل الموقع.
ECHO.
ECHO اضغط أي مفتاح للخروج...
PAUSE > nul 