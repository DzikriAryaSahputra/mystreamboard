Add-Type -AssemblyName presentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$player.Volume = 0.8
Write-Output "AUDIO_ENGINE_READY"
