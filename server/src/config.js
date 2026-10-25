import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'profile.json');

const DEFAULT_CONFIG = {
  version: '1.1.0',
  owner: 'Dzikri Arya Sahputra',
  activePageId: 'page_sound',
  obsSettings: {
    address: 'ws://127.0.0.1:4455',
    password: '',
    autoConnect: true
  },
  pages: [
    {
      id: 'page_sound',
      name: '🔊 Sounds & Memes',
      category: 'Soundboard',
      gridCols: 4,
      gridRows: 3,
      buttons: [
        { 
          id: 'sb_sponge', 
          row: 0, col: 0, 
          label: 'minispong... have fun', 
          sublabel: 'Add keybind', 
          image: '/uploads/spongebob.jpg', 
          imageMode: 'full', 
          color: '#8b5cf6', 
          volume: 80,
          action: { type: 'sound', sound: 'applause.wav' } 
        },
        { 
          id: 'sb_speed', 
          row: 0, col: 1, 
          label: 'speed HYPE!', 
          sublabel: 'Add keybind', 
          image: '/uploads/speed.jpg', 
          imageMode: 'full', 
          color: '#ec4899', 
          volume: 100,
          action: { type: 'sound', sound: 'airhorn.wav' } 
        },
        { 
          id: 'sb_stay', 
          row: 0, col: 2, 
          label: 'Stay With Me', 
          sublabel: 'Add keybind', 
          image: '/uploads/synthwave.jpg', 
          imageMode: 'full', 
          color: '#6366f1', 
          volume: 75,
          action: { type: 'sound', sound: 'victory.wav' } 
        },
        { 
          id: 'sb_boom', 
          row: 0, col: 3, 
          label: 'Vine Boom', 
          sublabel: 'Add keybind', 
          image: '/uploads/boom.svg', 
          imageMode: 'thumbnail', 
          color: '#ef4444', 
          volume: 90,
          action: { type: 'sound', sound: 'boom.wav' } 
        },
        { 
          id: 'sb_rimshot', 
          row: 1, col: 0, 
          label: 'Ba-Dum-Tss', 
          sublabel: 'Add keybind', 
          icon: 'Drum', 
          color: '#eab308', 
          volume: 85,
          action: { type: 'sound', sound: 'rimshot.wav' } 
        },
        { 
          id: 'sb_victory', 
          row: 1, col: 1, 
          label: 'Victory Level Up', 
          sublabel: 'Add keybind', 
          icon: 'Trophy', 
          color: '#10b981', 
          volume: 80,
          action: { type: 'sound', sound: 'victory.wav' } 
        },
        { 
          id: 'sb_airhorn', 
          row: 1, col: 2, 
          label: 'Airhorn MLG', 
          sublabel: 'Add keybind', 
          icon: 'Megaphone', 
          color: '#f97316', 
          volume: 95,
          action: { type: 'sound', sound: 'airhorn.wav' } 
        },
        { 
          id: 'sb_stop', 
          row: 1, col: 3, 
          label: 'STOP ALL AUDIO', 
          sublabel: 'Mute All', 
          icon: 'Square', 
          color: '#64748b', 
          volume: 0,
          action: { type: 'stop_sounds' } 
        }
      ]
    },
    {
      id: 'page_live',
      name: '🔴 OBS & TikTok Studio',
      category: 'Live Stream',
      gridCols: 4,
      gridRows: 3,
      buttons: [
        { id: 'b_gameplay', row: 0, col: 0, label: 'Gameplay', sublabel: 'OBS Scene', image: '/uploads/obs.svg', imageMode: 'thumbnail', color: '#3b82f6', action: { type: 'obs_scene', scene: 'Gameplay' } },
        { id: 'b_chat', row: 0, col: 1, label: 'Just Chatting', sublabel: 'OBS Scene', image: '/uploads/synthwave.jpg', imageMode: 'full', color: '#8b5cf6', action: { type: 'obs_scene', scene: 'Just Chatting' } },
        { id: 'b_brb', row: 0, col: 2, label: 'BRB Screen', sublabel: 'OBS Scene', icon: 'Coffee', color: '#ec4899', action: { type: 'obs_scene', scene: 'BRB' } },
        { id: 'b_rec', row: 0, col: 3, label: 'Record Toggle', sublabel: 'OBS Rec', icon: 'CircleDot', color: '#dc2626', action: { type: 'obs_record' } },

        { id: 'b_mic', row: 1, col: 0, label: 'Mic Mute', sublabel: 'OBS Mic', icon: 'Mic', color: '#ef4444', action: { type: 'obs_mute', input: 'Mic/Aux' } },
        { id: 'b_desk', row: 1, col: 1, label: 'Desktop Audio', sublabel: 'OBS Desktop', icon: 'Volume2', color: '#f59e0b', action: { type: 'obs_mute', input: 'Desktop Audio' } },
        { id: 'b_disc_mute', row: 1, col: 2, label: 'Discord Mute', sublabel: 'Ctrl+Shift+M', image: '/uploads/discord.svg', imageMode: 'thumbnail', color: '#6366f1', action: { type: 'hotkey', keys: 'Ctrl+Shift+M' } },
        { id: 'b_disc_deaf', row: 1, col: 3, label: 'Discord Deafen', sublabel: 'Ctrl+Shift+D', image: '/uploads/discord.svg', imageMode: 'thumbnail', color: '#a855f7', action: { type: 'hotkey', keys: 'Ctrl+Shift+D' } },

        { id: 'b_tt_s1', row: 2, col: 0, label: 'TikTok Scene 1', sublabel: 'Ctrl+F1', image: '/uploads/tiktok.svg', imageMode: 'thumbnail', color: '#06b6d4', action: { type: 'hotkey', keys: 'Ctrl+F1' } },
        { id: 'b_tt_s2', row: 2, col: 1, label: 'TikTok Scene 2', sublabel: 'Ctrl+F2', image: '/uploads/tiktok.svg', imageMode: 'thumbnail', color: '#0ea5e9', action: { type: 'hotkey', keys: 'Ctrl+F2' } },
        { id: 'b_tt_mute', row: 2, col: 2, label: 'TikTok Mic', sublabel: 'Ctrl+F3', icon: 'MicOff', color: '#f43f5e', action: { type: 'hotkey', keys: 'Ctrl+F3' } },
        { id: 'b_screen', row: 2, col: 3, label: 'Screenshot', sublabel: 'Win+Shift+S', icon: 'Camera', color: '#10b981', action: { type: 'hotkey', keys: 'Win+Shift+S' } }
      ]
    },
    {
      id: 'page_media',
      name: '🎵 Media & System Apps',
      category: 'Productivity',
      gridCols: 4,
      gridRows: 3,
      buttons: [
        { id: 'm_play', row: 0, col: 0, label: 'Play / Pause', sublabel: 'Media', icon: 'Play', color: '#22c55e', action: { type: 'hotkey', keys: 'MEDIA_PLAY_PAUSE' } },
        { id: 'm_prev', row: 0, col: 1, label: 'Prev Track', sublabel: 'Media', icon: 'SkipBack', color: '#3b82f6', action: { type: 'hotkey', keys: 'MEDIA_PREV' } },
        { id: 'm_next', row: 0, col: 2, label: 'Next Track', sublabel: 'Media', icon: 'SkipForward', color: '#3b82f6', action: { type: 'hotkey', keys: 'MEDIA_NEXT' } },
        { id: 'm_mute', row: 0, col: 3, label: 'Mute Audio', sublabel: 'Media', icon: 'VolumeX', color: '#ef4444', action: { type: 'hotkey', keys: 'VOLUME_MUTE' } },

        { id: 'm_volup', row: 1, col: 0, label: 'Volume +', sublabel: 'System', icon: 'Volume2', color: '#06b6d4', action: { type: 'hotkey', keys: 'VOLUME_UP' } },
        { id: 'm_voldown', row: 1, col: 1, label: 'Volume -', sublabel: 'System', icon: 'Volume1', color: '#06b6d4', action: { type: 'hotkey', keys: 'VOLUME_DOWN' } },
        { id: 'm_taskmgr', row: 1, col: 2, label: 'Task Manager', sublabel: 'Ctrl+Shift+Esc', icon: 'Activity', color: '#8b5cf6', action: { type: 'hotkey', keys: 'Ctrl+Shift+Esc' } },
        { id: 'm_lock', row: 1, col: 3, label: 'Lock PC', sublabel: 'Win+L', icon: 'Lock', color: '#dc2626', action: { type: 'hotkey', keys: 'Win+L' } },

        { id: 'app_obs', row: 2, col: 0, label: 'Open OBS', sublabel: 'App', image: '/uploads/obs.svg', imageMode: 'thumbnail', color: '#6366f1', action: { type: 'app', target: 'obs64.exe' } },
        { id: 'app_discord', row: 2, col: 1, label: 'Open Discord', sublabel: 'App', image: '/uploads/discord.svg', imageMode: 'thumbnail', color: '#8b5cf6', action: { type: 'app', target: 'discord' } },
        { id: 'app_browser', row: 2, col: 2, label: 'Browser', sublabel: 'Web', icon: 'Globe', color: '#f59e0b', action: { type: 'app', target: 'https://google.com' } },
        { id: 'app_spotify', row: 2, col: 3, label: 'Spotify', sublabel: 'App', icon: 'Music', color: '#10b981', action: { type: 'app', target: 'spotify' } }
      ]
    }
  ]
};

export function loadConfig() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.version === DEFAULT_CONFIG.version) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Config] Error reading profile.json, falling back to default:', err);
  }
  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

export function saveConfig(newConfig) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Config] Error saving profile.json:', err);
    return false;
  }
}
