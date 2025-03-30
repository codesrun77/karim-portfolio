@echo off
cd /d %~dp0
ECHO ======================================
ECHO   تشغيل موقع كريم السيد - بوابة التحكم
ECHO ======================================
ECHO.
ECHO يتم بدء تشغيل الموقع...
ECHO.
ECHO تحميل المتطلبات...
ECHO.

start http://localhost:3000
npm run dev

ECHO.
ECHO تم إيقاف تشغيل الموقع.
ECHO.
ECHO اضغط أي مفتاح للخروج...
PAUSE > nul 