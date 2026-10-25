import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';

import { sendHotKey, launchApp } from './hotkey.js';
import { playSound, stopAllSounds, listSounds } from './soundboard.js';
import { obsManager } from './obs.js';
import { loadConfig, saveConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
const SOUNDS_DIR = path.resolve(__dirname, '../../sounds');
const UPLOADS_DIR = path.resolve(__dirname, '../../data/uploads');

const PORT = process.env.PORT || 4829;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static sounds and uploaded card images
app.use('/sounds', express.static(SOUNDS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve compiled client if exists
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
}

// Get local IPv4 address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4, not internal (not 127.0.0.1), and not virtual hyper-v/docker
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIpAddress();
const localUrl = `http://${localIp}:${PORT}`;
let currentConfig = loadConfig();

// Broadcast message to all connected WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Attach OBS event listener
obsManager.onStateChange = (obsEvent) => {
  broadcast({ type: 'OBS_EVENT', data: obsEvent });
};

// Auto connect OBS if enabled
if (currentConfig.obsSettings?.autoConnect) {
  setTimeout(() => {
    obsManager.connect(currentConfig.obsSettings.address, currentConfig.obsSettings.password).catch(() => {});
  }, 1000);
}

// REST Endpoints
app.get('/api/info', async (req, res) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(localUrl);
    res.json({
      name: 'MyStreamBoard',
      version: '1.0.0',
      owner: 'Dzikri Arya Sahputra',
      license: 'PROPRIETARY',
      ip: localIp,
      port: PORT,
      url: localUrl,
      qrDataUrl,
      obsConnected: obsManager.isConnected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config', (req, res) => {
  res.json(currentConfig);
});

app.post('/api/config', (req, res) => {
  currentConfig = req.body;
  saveConfig(currentConfig);
  broadcast({ type: 'CONFIG_UPDATED', data: currentConfig });
  res.json({ success: true });
});

app.get('/api/sounds', (req, res) => {
  res.json(listSounds());
});

app.post('/api/upload-image', (req, res) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!filename || !dataUrl) return res.status(400).json({ error: 'Missing filename or dataUrl' });
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const ext = path.extname(filename) || '.png';
    const cleanName = `${Date.now()}_${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, cleanName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const clientUploadsPath = path.resolve(__dirname, '../../client/public/uploads', cleanName);
    try {
      fs.copyFileSync(filePath, clientUploadsPath);
    } catch(e) {}

    res.json({ success: true, url: `/uploads/${cleanName}` });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload-sound', (req, res) => {
  try {
    const { filename, dataUrl } = req.body;
    if (!filename || !dataUrl) return res.status(400).json({ error: 'Missing filename or dataUrl' });
    const base64Data = dataUrl.replace(/^data:audio\/\w+;base64,/, '').replace(/^data:application\/\w+;base64,/, '');
    const ext = path.extname(filename) || '.mp3';
    const cleanName = `${Date.now()}_${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`;
    const filePath = path.join(SOUNDS_DIR, cleanName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    res.json({ success: true, filename: cleanName, url: `/sounds/${cleanName}` });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});


// Trigger action executor
async function executeAction(action) {
  if (!action || !action.type) return { success: false, error: 'Invalid action' };

  try {
    switch (action.type) {
      case 'hotkey':
        return await sendHotKey(action.keys);

      case 'app':
        return await launchApp(action.target);

      case 'sound':
        return await playSound(action.sound, action.volume || 1.0);

      case 'stop_sounds':
        stopAllSounds();
        return { success: true };

      case 'obs_scene':
        return await obsManager.setScene(action.scene);

      case 'obs_mute':
        return await obsManager.toggleMute(action.input);

      case 'obs_record':
        return await obsManager.toggleRecord();

      case 'obs_stream':
        return await obsManager.toggleStream();

      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

app.post('/api/trigger', async (req, res) => {
  const result = await executeAction(req.body);
  res.json(result);
});

app.post('/api/obs/connect', async (req, res) => {
  const { address, password } = req.body;
  const result = await obsManager.connect(address, password);
  res.json(result);
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  // Send initial config and OBS status
  ws.send(JSON.stringify({
    type: 'INIT',
    data: {
      config: currentConfig,
      sounds: listSounds(),
      obsConnected: obsManager.isConnected
    }
  }));

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case 'TRIGGER': {
          const result = await executeAction(msg.action);
          ws.send(JSON.stringify({
            type: 'TRIGGER_RESULT',
            buttonId: msg.buttonId,
            result
          }));
          break;
        }

        case 'SAVE_CONFIG': {
          currentConfig = msg.config;
          saveConfig(currentConfig);
          broadcast({ type: 'CONFIG_UPDATED', data: currentConfig });
          break;
        }

        case 'OBS_CONNECT': {
          const res = await obsManager.connect(msg.address, msg.password);
          ws.send(JSON.stringify({ type: 'OBS_CONNECT_RESULT', data: res }));
          break;
        }

        case 'STOP_SOUNDS': {
          stopAllSounds();
          break;
        }
      }
    } catch (e) {
      console.error('[WS] Error processing message:', e);
    }
  });
});

// Fallback for SPA routing
if (fs.existsSync(CLIENT_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Error handler
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} sedang dipakai oleh proses lain!`);
    console.error(`Solusi: Tutup terminal server yang lama, atau jalankan perintah: taskkill /F /IM node.exe\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.clear();
  console.log('=================================================================');
  console.log('  MyStreamBoard Desktop Agent v1.0.0                             ');
  console.log('  Copyright (c) 2026 Dzikri Arya Sahputra. All rights reserved.   ');
  console.log('  Commercial Proprietary Software                                ');
  console.log('=================================================================');
  console.log(`\n  Desktop Local URL : http://localhost:${PORT}`);
  console.log(`  Mobile Deck URL  : ${localUrl}`);
  console.log('\n  SCAN DARI HP KAMU UNTUK LANGSUNG TERHUBUNG:');


  try {
    qrcodeTerminal.generate(localUrl, { small: true });
  } catch (e) {
    console.log(`  Buka URL di browser HP: ${localUrl}`);
  }

  console.log('\n  [Tekan Ctrl+C untuk berhenti]');
  console.log('=================================================================\n');
});
