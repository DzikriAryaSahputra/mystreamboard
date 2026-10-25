# ⚡ MyStreamBoard

> **Turn Your Smartphone into a Free Professional Stream Deck & Soundboard**  
> Copyright (c) 2026 **Dzikri Arya Sahputra**. All rights reserved.  
> Commercial Proprietary Software • Contact: tomoriid62@gmail.com  
> Official Domain: [mystreamboard.pages.dev](https://mystreamboard.pages.dev)

---

## 🌟 Apa itu MyStreamBoard?

**MyStreamBoard** adalah solusi controller stream deck & soundboard gratis yang mengubah smartphone (Android / iOS) atau tablet kamu menjadi perangkat Stream Deck fisik kelas atas. Tanpa biaya langganan bulanan, tanpa batasan jumlah tombol (grid), dan dengan latensi **hampir 0 milidetik** melalui koneksi Wi-Fi lokal.

---

## ✨ Fitur Utama

- 📱 **Smartphone Deck Controller (PWA)**:
  - Buka langsung di browser HP (Chrome/Safari) atau *Add to Home Screen* untuk tampilan *fullscreen* tanpa address bar.
  - Efek sentuh taktil (*Haptic Feedback Vibration*) seperti menekan tombol fisik Elgato.
  - Multi-halaman (*Live Stream*, *Soundboard FX*, *Media & System Apps*).

- 🔴 **OBS Studio 2-Way Realtime Integration**:
  - Ganti Scene secara instan (Gameplay, Just Chatting, BRB, Ending).
  - Toggle Mute Microphone & Desktop Audio dengan lampu indikator status realtime.
  - Toggle Record & Live Streaming dengan visual *pulsing badge*.

- 🎵 **TikTok Live Studio & Windows Hotkeys**:
  - Dukungan simulasi **Global Hotkey Windows** bawaan (F1–F24, Ctrl, Shift, Alt, Win).
  - Kompatibel penuh dengan **TikTok Live Studio** (Scene Switch, Mic Mute), Discord (Mute/Deafen), Spotify, dan Game favorit.

- 🔊 **Dual Soundboard Engine**:
  - Sudah dilengkapi sound pack bawaan: *Airhorn*, *Ba-Dum-Tss (Rimshot)*, *Victory Fanfare*, *Vine Boom*, *Applause*, dan tombol *Stop All Audio*.
  - Audio diputar langsung melalui sistem Windows atau Virtual Audio Cable (VB-CABLE) agar penonton live stream dapat mendengarnya dengan jernih.

- 🖥️ **PC Studio Configurator**:
  - Editor visual drag-and-drop di komputer untuk mengubah label, warna aksen neon, ikon Lucide, dan aksi setiap tombol.
  - Tampilan otomatis **QR Code** untuk menyambungkan HP hanya dalam 1 detik!

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
- Komputer / Laptop Windows (Windows 10 / 11).
- [Node.js](https://nodejs.org/) (versi LTS terbaru).
- Smartphone yang terhubung ke jaringan Wi-Fi yang sama dengan PC.

### 2. Instalasi & Menjalankan Server
Buka terminal / PowerShell di folder project:
```bash
# Jalankan Desktop Server Agent
npm start
```

Terminal akan menampilkan link lokal dan **QR Code**:
```
=================================================================
  ⚡ MyStreamBoard Desktop Agent v1.0.0                          
  Copyright (c) 2026 Dzikri Arya Sahputra. All rights reserved.   
  Commercial Proprietary Software                                
=================================================================

  🖥️  Desktop Local URL : http://localhost:4829
  📱  Mobile Deck URL  : http://192.168.1.3:4829

  📲  SCAN DARI HP KAMU UNTUK LANGSUNG TERHUBUNG:
  [ QR CODE DITAMPILKAN DI SINI ]
```

### 3. Sambungkan Smartphone
1. Buka kamera di HP kamu.
2. Scan QR Code yang muncul di layar terminal / PC Studio.
3. Tap notifikasi link yang terbuka di browser HP.
4. *(Opsional)* Di browser HP, tap menu titik tiga -> pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*) agar tampil fullscreen layaknya perangkat keras Stream Deck!

---

## 🎛️ Panduan Integrasi Software Streaming

### 1. Menghubungkan ke OBS Studio
1. Buka **OBS Studio** di PC kamu.
2. Masuk ke menu **Tools** -> **WebSocket Server Settings**.
3. Pastikan centang **"Enable WebSocket server"** (Port default `4455`).
4. Buka **PC Studio** di `http://localhost:4829?mode=studio`, klik panel **OBS Studio WebSocket**, lalu klik **"Sambungkan ke OBS"**.
5. Tombol di HP kamu sekarang sudah terhubung 2 arah dengan OBS Studio!

### 2. Menghubungkan ke TikTok Live Studio
1. Buka **TikTok Live Studio** di PC kamu.
2. Masuk ke **Pengaturan (Settings)** -> **Hotkey**.
3. Atur shortcut yang diinginkan, contoh:
   - Ganti ke Scene 1: `Ctrl + F1`
   - Ganti ke Scene 2: `Ctrl + F2`
   - Mute Microphone: `Ctrl + F3`
4. Di MyStreamBoard, preset halaman *Live Stream* sudah otomatis terkonfigurasi dengan shortcut tersebut!

---

## 🌐 Deploy ke Cloudflare Pages (`mystreamboard.pages.dev`)

Frontend web portal siap di-deploy ke Cloudflare Pages:

1. Build static frontend bundle:
   ```bash
   npm run build
   ```
   Folder `client/dist` akan dibuat otomatis.
2. Buka dashboard [Cloudflare Pages](https://pages.cloudflare.com/).
3. Buat project baru dengan nama **mystreamboard**.
4. Hubungkan repository GitHub kamu atau upload langsung isi folder `client/dist`.
5. Pengaturan Build di Cloudflare Pages:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (atau `npm --prefix client run build`)
   - **Build Output Directory**: `client/dist`

---

## 📄 Lisensi (License)

**PROPRIETARY & COMMERCIAL LICENSE**  
Copyright (c) 2026 **Dzikri Arya Sahputra**. All rights reserved.  
Email: `tomoriid62@gmail.com`

Perangkat lunak ini adalah karya berpemilik (*proprietary*). Dilarang menyalin, mendistribusikan, memodifikasi, atau memperjualbelikan ulang tanpa izin tertulis resmi dari pemilik hak cipta.
