@echo off
echo Setting up Android build environment...
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\saf1\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo.
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo.
echo Cleaning build cache and regenerating Android project...
echo.

REM Clean gradle build folders
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build

REM Prebuild to regenerate native files with updated assets
echo y | node_modules\.bin\expo.cmd prebuild --clean --platform android

echo.
echo Starting Android preview build...
echo.

node_modules\.bin\expo.cmd run:android --variant release

pause
