import fs from 'fs';
import path from 'path';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { generateDefaultSounds } from './sound-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOUNDS_DIR = path.resolve(__dirname, '../../sounds');

// Ensure sounds directory exists and has defaults
generateDefaultSounds(SOUNDS_DIR);

let currentAudioProcess = null;

/**
 * Play a sound file on Windows through the default audio output
 * @param {string} soundName e.g. "airhorn.wav" or full path
 * @param {number} volume 0.0 to 1.0 (default 1.0)
 */
export function playSound(soundName, volume = 1.0) {
  return new Promise((resolve, reject) => {
    let filePath = soundName;
    if (!path.isAbsolute(soundName)) {
      filePath = path.join(SOUNDS_DIR, soundName);
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`[Soundboard] Sound not found: ${filePath}`);
      return resolve({ success: false, error: 'File not found' });
    }

    // Stop currently running playback if single-instance, or let overlap
    // Using presentationCore MediaPlayer
    const normalizedPath = filePath.replace(/\\/g, '\\\\');
    const psScript = `
Add-Type -AssemblyName presentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$player.Volume = ${Math.max(0, Math.min(1, volume))}
$player.Open([Uri]'${normalizedPath}')
$player.Play()
Start-Sleep -Milliseconds 200
# Wait until playback finishes or max 15 seconds
$timeout = 0
while ($player.Position -lt $player.NaturalDuration.TimeSpan -and $timeout -lt 150) {
    Start-Sleep -Milliseconds 100
    $timeout++
}
$player.Close()
`;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], {
      windowsHide: true,
      stdio: 'ignore'
    });

    currentAudioProcess = proc;
    proc.on('exit', () => {
      if (currentAudioProcess === proc) currentAudioProcess = null;
      resolve({ success: true, file: path.basename(filePath) });
    });
  });
}

/**
 * Stop any active soundboard playback
 */
export function stopAllSounds() {
  if (currentAudioProcess) {
    try {
      currentAudioProcess.kill();
    } catch (e) {}
    currentAudioProcess = null;
  }
}

/**
 * List available sounds
 */
export function listSounds() {
  if (!fs.existsSync(SOUNDS_DIR)) return [];
  const files = fs.readdirSync(SOUNDS_DIR);
  return files
    .filter(f => /\.(wav|mp3|ogg|m4a|aac)$/i.test(f))
    .map(name => ({
      name,
      displayName: name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase(),
      path: path.join(SOUNDS_DIR, name)
    }));
}
