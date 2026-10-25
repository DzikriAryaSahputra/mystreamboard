import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Windows Virtual Key Codes Map (Hex)
const VK_MAP = {
  // Function keys
  'F1': 0x70, 'F2': 0x71, 'F3': 0x72, 'F4': 0x73, 'F5': 0x74, 'F6': 0x75,
  'F7': 0x76, 'F8': 0x77, 'F9': 0x78, 'F10': 0x79, 'F11': 0x7A, 'F12': 0x7B,
  'F13': 0x7C, 'F14': 0x7D, 'F15': 0x7E, 'F16': 0x7F, 'F17': 0x80, 'F18': 0x81,
  'F19': 0x82, 'F20': 0x83, 'F21': 0x84, 'F22': 0x85, 'F23': 0x86, 'F24': 0x87,

  // Modifiers
  'CTRL': 0x11, 'CONTROL': 0x11,
  'SHIFT': 0x10,
  'ALT': 0x12,
  'WIN': 0x5B, 'WINDOWS': 0x5B,

  // Media Keys
  'MEDIA_PLAY_PAUSE': 0xB3,
  'MEDIA_STOP': 0xB2,
  'MEDIA_PREV': 0xB1,
  'MEDIA_NEXT': 0xB0,
  'VOLUME_MUTE': 0xAD,
  'VOLUME_DOWN': 0xAE,
  'VOLUME_UP': 0xAF,

  // General Keys
  'SPACE': 0x20,
  'ENTER': 0x0D,
  'ESC': 0x1B,
  'ESCAPE': 0x1B,
  'TAB': 0x09,
  'BACKSPACE': 0x08,
  'CAPSLOCK': 0x14,
  'PRINTSCREEN': 0x2C,
  'INSERT': 0x2D,
  'DELETE': 0x2E,
  'HOME': 0x24,
  'END': 0x23,
  'PAGEUP': 0x21,
  'PAGEDOWN': 0x22,
  'UP': 0x26,
  'DOWN': 0x28,
  'LEFT': 0x25,
  'RIGHT': 0x27,

  // Digits 0-9
  '0': 0x30, '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34,
  '5': 0x35, '6': 0x36, '7': 0x37, '8': 0x38, '9': 0x39,

  // Letters A-Z
  'A': 0x41, 'B': 0x42, 'C': 0x43, 'D': 0x44, 'E': 0x45, 'F': 0x46,
  'G': 0x47, 'H': 0x48, 'I': 0x49, 'J': 0x4A, 'K': 0x4B, 'L': 0x4C,
  'M': 0x4D, 'N': 0x4E, 'O': 0x4F, 'P': 0x50, 'Q': 0x51, 'R': 0x52,
  'S': 0x53, 'T': 0x54, 'U': 0x55, 'V': 0x56, 'W': 0x57, 'X': 0x58,
  'Y': 0x59, 'Z': 0x5A
};

/**
 * Execute native Windows keypress using C# keybd_event via PowerShell
 * Supports single keys or combinations like ["Ctrl", "Alt", "F1"]
 */
export async function sendHotKey(keys) {
  return new Promise((resolve, reject) => {
    const keyList = Array.isArray(keys) ? keys : keys.split('+').map(k => k.trim());
    const vkCodes = [];

    for (const k of keyList) {
      const upper = k.toUpperCase();
      if (VK_MAP[upper] !== undefined) {
        vkCodes.push(VK_MAP[upper]);
      } else {
        console.warn(`[Hotkey] Unknown key: ${k}`);
      }
    }

    if (vkCodes.length === 0) {
      return reject(new Error('No valid keys specified'));
    }

    // Generate C# snippet to press all keys down, then release in reverse order
    const downCalls = vkCodes.map(vk => `keybd_event(${vk}, 0, 0, UIntPtr.Zero);`).join(' ');
    const upCalls = [...vkCodes].reverse().map(vk => `keybd_event(${vk}, 0, 2, UIntPtr.Zero);`).join(' ');

    const psCode = `
$def = @"
using System;
using System.Runtime.InteropServices;
public class Kbd {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    public static void Send() {
        ${downCalls}
        System.Threading.Thread.Sleep(30);
        ${upCalls}
    }
}
"@
Add-Type -TypeDefinition $def
[Kbd]::Send()
`;

    const encoded = Buffer.from(psCode, 'utf16le').toString('base64');
    exec(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, (err, stdout, stderr) => {
      if (err) {
        console.error('[Hotkey] Error sending key:', err);
        return reject(err);
      }
      resolve({ success: true, keys: keyList });
    });
  });
}

/**
 * Launch an application or file in Windows
 */
export async function launchApp(target) {
  return new Promise((resolve, reject) => {
    if (!target) return reject(new Error('No target specified'));
    
    // Use 'start' in Windows to open apps, URLs, or files
    const cmd = target.startsWith('http://') || target.startsWith('https://') 
      ? `start "" "${target}"`
      : `start "" "${target}"`;

    exec(cmd, (err) => {
      if (err) {
        console.error('[Launcher] Error launching app:', err);
        return reject(err);
      }
      resolve({ success: true, target });
    });
  });
}
