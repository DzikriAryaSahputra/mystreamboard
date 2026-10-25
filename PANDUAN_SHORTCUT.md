# Panduan Lengkap Shortcut & Integrasi MyStreamBoard

Panduan resmi ini menjelaskan cara menggunakan fitur shortcut aplikasi, integrasi OBS Studio, dan TikTok Live Studio pada MyStreamBoard.

---

## 1. Membuka Aplikasi & Website (Apps)

Pada MyStreamBoard, Anda dapat membuat tombol card untuk meluncurkan program atau membuka website secara instan dari smartphone Anda.

### A. Menggunakan URI Protocol (Paling Direkomendasikan & Praktis)
Windows memiliki protokol tautan khusus yang langsung membuka aplikasi tanpa perlu mengetahui lokasi folder instalasinya:

| Target Aplikasi | Yang Perlu Diisi di Target | Keterangan |
| :--- | :--- | :--- |
| **Steam** | `steam://` atau `steam://open/main` | Langsung membuka Steam Client |
| **Spotify** | `spotify:` | Membuka aplikasi Spotify |
| **Discord** | `discord:` | Membuka aplikasi Discord |
| **Kalkulator** | `calc:` | Membuka Calculator Windows |
| **Pengaturan PC** | `ms-settings:` | Membuka Windows Settings |
| **File Explorer** | `explorer:` | Membuka File Explorer |

### B. Membuka Website / URL
Ketikkan alamat lengkap dengan `https://` di awal:
* Contoh: `https://youtube.com`
* Contoh: `https://twitch.tv`
* Contoh: `https://chatgpt.com`
* Windows akan otomatis membukanya di browser default Anda (Chrome, Edge, Firefox, Brave, dll).

### C. Menggunakan File Executable (.exe)
Jika aplikasi tidak memiliki URI protocol, gunakan path lengkap file `.exe`:
* Contoh Steam: `C:\Program Files (x86)\Steam\steam.exe`
* Contoh OBS: `C:\Program Files\obs-studio\bin\64bit\obs64.exe`
* Contoh Discord: `C:\Users\Windows\AppData\Local\Discord\Update.exe --processStart Discord.exe`

---

## 2. Integrasi Live Streaming (OBS Studio & TikTok Live)

### A. OBS Studio (Koneksi Native WebSocket)
MyStreamBoard terhubung langsung ke OBS Studio melalui WebSocket berlatensi 0 ms.

1. Buka **OBS Studio** di PC Anda.
2. Klik menu **Tools** > **WebSocket Server Settings**.
3. Pastikan kotak **"Enable WebSocket server"** dicentang.
4. Server Port default adalah **`4455`**.
5. MyStreamBoard akan otomatis terhubung secara real-time.

**Fitur OBS yang Didukung:**
* **Ganti Scene**: Masukkan nama Scene persis sesuai yang ada di OBS (contoh: `Gameplay`, `Just Chatting`, `BRB`). *Huruf besar/kecil berpengaruh.*
* **Toggle Mute Audio**: Masukkan nama sumber suara di Audio Mixer OBS (contoh: `Mic/Aux`, `Desktop Audio`).
* **Toggle Record**: Memulai / menghentikan rekaman video di OBS.
* **Toggle Stream**: Memulai / menghentikan siaran live di OBS.

### B. TikTok Live Studio
Karena TikTok Live Studio belum menyediakan API terbuka, MyStreamBoard menggunakan simulasi **Global Keyboard Hotkey**:

1. Buka aplikasi **TikTok Live Studio** di PC.
2. Klik icon **Pengaturan (Settings)** > pilih tab **Hotkeys / Tombol Pintas**.
3. Atur kombinasi tombol shortcut yang jarang dipakai sehari-hari:
   * Misal Ganti ke Scene Game: `Ctrl+F1`
   * Misal Ganti ke Scene Kamera/Chatting: `Ctrl+F2`
   * Misal Mute Mic TikTok: `Ctrl+F3`
4. Di MyStreamBoard Studio, pilih aksi **TikTok Live Studio: Hotkey Trigger**, lalu masukkan kombinasi tombol yang sama (misal: `Ctrl+F1`).
5. Saat tombol ditekan di HP Anda, MyStreamBoard akan langsung mengeksekusi shortcut tersebut ke TikTok Live Studio.

---

## 3. Kombinasi Shortcut Keyboard & Tombol Media

Anda dapat membuat tombol shortcut apa pun untuk mengontrol Windows, game, atau software editing (Premiere, Photoshop, Blender).

### Format Penulisan:
Gunakan tanda plus (`+`) untuk menghubungkan tombol:

* **Shortcut Umum:**
  * `Ctrl+Shift+M` : Mute/Unmute Discord
  * `Ctrl+Shift+D` : Deafen Discord
  * `Win+Shift+S` : Tool Screenshot Windows Snipping
  * `Alt+Tab` : Pindah jendela aplikasi
  * `Ctrl+Shift+Esc` : Buka Task Manager
  * `Win+L` : Kunci layar komputer (Lock PC)

* **Tombol Media Windows (Kontrol Musik / Video):**
  * `MEDIA_PLAY_PAUSE` : Play atau Pause lagu (Spotify, YouTube, Media Player)
  * `MEDIA_NEXT` : Lagu selanjutnya (Next Track)
  * `MEDIA_PREV` : Lagu sebelumnya (Previous Track)
  * `VOLUME_UP` : Naikkan volume suara PC
  * `VOLUME_DOWN` : Turunkan volume suara PC
  * `VOLUME_MUTE` : Mute total audio PC

---

## 4. Tips & Trik Tambahan
* **Full 1 Card Image**: Anda dapat mengunggah gambar cover PNG full satu kotak untuk card Anda di menu edit dengan menyalakan opsi *"Full 1 Card Image"*.
* **Zero Latency**: Pastikan smartphone dan PC terhubung ke Wi-Fi yang sama untuk respon instan di bawah 5 milidetik.
