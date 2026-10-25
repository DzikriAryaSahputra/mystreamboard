import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'profile.json');

const DEFAULT_CONFIG = {
  version: '1.2.0',
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
      name: 'Soundboard',
      category: 'Soundboard',
      gridCols: 4,
      gridRows: 3,
      buttons: []
    },
    {
      id: 'page_live',
      name: 'Stream',
      category: 'Stream',
      gridCols: 4,
      gridRows: 3,
      buttons: []
    },
    {
      id: 'page_media',
      name: 'Apps',
      category: 'Apps',
      gridCols: 4,
      gridRows: 3,
      buttons: []
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
