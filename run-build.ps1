$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\saf1\AppData\Local\Android\Sdk'
$env:PATH = "C:\Program Files\Android\Android Studio\jbr\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME"
Write-Host "Testing Java..."
& java -version

Write-Host "`nStarting Android build..."
Set-Location "c:\Users\saf1\Documents\react-native\word-game"
& node_modules\.bin\expo.cmd run:android --variant release
