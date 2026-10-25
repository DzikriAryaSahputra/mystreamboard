import React, { useState, useEffect, useRef } from 'react';
import DynamicIcon from '../components/DynamicIcon';
import { 
  SlidersHorizontal, 
  Smartphone, 
  Plus, 
  Trash2, 
  Save, 
  Radio, 
  Volume2, 
  VolumeX,
  Keyboard, 
  Sparkles, 
  QrCode, 
  Search,
  Upload,
  Play,
  Square,
  RotateCcw,
  Check,
  Image as ImageIcon
} from 'lucide-react';

const FILTER_CATEGORIES = [
  'All', 'Memes & Sounds', 'OBS Studio', 'TikTok Studio', 'Apps & Media'
];

const PRESET_COLORS = [
  '#8b5cf6', '#6366f1', '#ec4899', '#06b6d4', 
  '#ef4444', '#f59e0b', '#10b981', '#64748b'
];

export default function Studio({ onNavigate }) {
  const [config, setConfig] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBtn, setSelectedBtn] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [editingBtn, setEditingBtn] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState('None');
  const [cardVolume, setCardVolume] = useState(80);

  const fileInputRef = useRef(null);
  const serverHost = localStorage.getItem('mystreamboard_host') || window.location.hostname || '127.0.0.1';
  const serverPort = localStorage.getItem('mystreamboard_port') || window.location.port || '4829';
  const baseUrl = `http://${serverHost}:${serverPort}`;

  // Fetch server info and config
  useEffect(() => {
    fetch(`${baseUrl}/api/info`)
      .then(r => r.json())
      .then(info => setServerInfo(info))
      .catch(() => {});

    fetch(`${baseUrl}/api/config`)
      .then(r => r.json())
      .then(cfg => {
        setConfig(cfg);
        const firstBtn = cfg.pages?.[0]?.buttons?.[0];
        if (firstBtn) {
          setSelectedBtn(firstBtn);
          setCardVolume(firstBtn.volume || 80);
        }
      })
      .catch(() => {});
  }, [baseUrl]);

  // Save config
  const handleSaveConfig = async (newCfg = config) => {
    try {
      const res = await fetch(`${baseUrl}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCfg)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error('Error saving config:', e);
    }
  };

  // Trigger Action
  const handleTrigger = (btn) => {
    if (!btn) return;
    setCurrentlyPlaying(btn.label);
    fetch(`${baseUrl}/api/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(btn.action)
    }).catch(() => {});
  };

  // Stop All Audio
  const handleStopAll = () => {
    setCurrentlyPlaying('None');
    fetch(`${baseUrl}/api/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'stop_sounds' })
    }).catch(() => {});
  };

  // Handle Image Upload for Card
  const handleUploadCustomImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBtn) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        const res = await fetch(`${baseUrl}/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl })
        });
        const data = await res.json();
        if (data.success && data.url) {
          const updatedBtn = { ...selectedBtn, image: data.url, imageMode: 'full' };
          setSelectedBtn(updatedBtn);
          updateButtonInConfig(updatedBtn);
        }
      } catch (err) {
        console.error('Upload image error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Update button in config state and save
  const updateButtonInConfig = (updatedBtn) => {
    if (!config) return;
    const updatedPages = config.pages.map(p => ({
      ...p,
      buttons: p.buttons.map(b => b.id === updatedBtn.id ? updatedBtn : b)
    }));
    const newConfig = { ...config, pages: updatedPages };
    setConfig(newConfig);
    handleSaveConfig(newConfig);
  };

  // Filter Buttons
  const getAllButtons = () => {
    if (!config?.pages) return [];
    let list = [];
    config.pages.forEach(p => {
      p.buttons?.forEach(b => {
        list.push({ ...b, pageName: p.name, category: p.category || 'Soundboard' });
      });
    });

    if (activeCategory === 'Memes & Sounds') {
      list = list.filter(b => b.action?.type === 'sound' || b.pageName.includes('Sounds'));
    } else if (activeCategory === 'OBS Studio') {
      list = list.filter(b => b.action?.type?.startsWith('obs') || b.label.includes('OBS'));
    } else if (activeCategory === 'TikTok Studio') {
      list = list.filter(b => b.label.includes('TikTok') || b.sublabel?.includes('Ctrl+F'));
    } else if (activeCategory === 'Apps & Media') {
      list = list.filter(b => b.action?.type === 'app' || b.pageName.includes('Media'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => b.label.toLowerCase().includes(q) || b.sublabel?.toLowerCase().includes(q));
    }

    return list;
  };

  const displayedButtons = getAllButtons();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080a12', paddingBottom: '70px' }}>
      <div className="ambient-bg"></div>

      {/* Top Navbar */}
      <header className="glass-nav" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(139, 92, 246, 0.45)' }}>
            <SlidersHorizontal size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MyStreamBoard
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: '600' }}>
              STREAM DECK & SOUNDBOARD STUDIO
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '6px 16px', width: '340px' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search sounds, hotkeys, scenes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Upload size={15} color="#c084fc" />
            <span>Upload Image / Sound</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUploadCustomImage} 
            accept="image/*,audio/*" 
            style={{ display: 'none' }} 
          />

          <button 
            className="btn-secondary" 
            onClick={() => setShowQrModal(true)}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <QrCode size={15} color="#06b6d4" />
            <span>Sambungkan HP</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('deck')}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Smartphone size={15} color="#8b5cf6" />
            <span>Buka Deck di HP</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={() => handleSaveConfig()}
            style={{ padding: '7px 16px', fontSize: '0.82rem' }}
          >
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{saveSuccess ? 'Tersimpan!' : 'Simpan'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Filter Bar, Cards Grid, and Right Inspector */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side: Filter Pills & Grid */}
        <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* Category Filter Pills */}
          <div className="filter-pills" style={{ marginBottom: '24px' }}>
            {FILTER_CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid (MagicMic / Stream Deck Style) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '16px' }}>
            {displayedButtons.map(btn => {
              const isSelected = selectedBtn?.id === btn.id;
              const isFullArtwork = btn.imageMode === 'full' && btn.image;

              return (
                <div
                  key={btn.id}
                  className={`deck-card ${isFullArtwork ? 'full-artwork' : 'thumb-artwork'} ${isSelected ? 'card-selected' : ''}`}
                  onClick={() => {
                    setSelectedBtn(btn);
                    setCardVolume(btn.volume || 80);
                    handleTrigger(btn);
                  }}
                  style={{ '--border-focus': btn.color || '#8b5cf6' }}
                >
                  {isFullArtwork ? (
                    <>
                      <img src={btn.image} alt={btn.label} className="card-bg-image" />
                      <div className="card-content-overlay">
                        <div className="card-title">{btn.label}</div>
                        <div className="card-keybind">{btn.sublabel || 'Add keybind'}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="thumb-img-wrapper" style={{ borderColor: isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.08)' }}>
                        {btn.image ? (
                          <img src={btn.image} alt={btn.label} />
                        ) : (
                          <DynamicIcon name={btn.icon || 'CircleDot'} size={28} color={btn.color || '#8b5cf6'} />
                        )}
                      </div>
                      <div className="card-title" style={{ textAlign: 'center' }}>{btn.label}</div>
                      <div className="card-keybind" style={{ textAlign: 'center' }}>{btn.sublabel || 'Add keybind'}</div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Add New Card Button */}
            <div 
              className="deck-card thumb-artwork" 
              onClick={() => {
                const newBtn = {
                  id: `card_${Date.now()}`,
                  label: 'New Sound/Action',
                  sublabel: 'Add keybind',
                  icon: 'Sparkles',
                  imageMode: 'thumbnail',
                  color: '#8b5cf6',
                  volume: 80,
                  action: { type: 'sound', sound: 'airhorn.wav' }
                };
                const updated = {
                  ...config,
                  pages: config.pages.map((p, idx) => idx === 0 ? { ...p, buttons: [...p.buttons, newBtn] } : p)
                };
                setConfig(updated);
                setSelectedBtn(newBtn);
                handleSaveConfig(updated);
              }}
              style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="thumb-img-wrapper" style={{ background: 'transparent', border: 'none' }}>
                <Plus size={28} color="#94a3b8" />
              </div>
              <div className="card-title" style={{ color: '#94a3b8', textAlign: 'center' }}>Tambah Card</div>
              <div className="card-keybind">Klik Disini</div>
            </div>
          </div>
        </div>

        {/* Right Inspector Sidebar (MagicMic Style) */}
        {selectedBtn && (
          <aside style={{ width: '310px', background: '#0b0e1b', borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            
            {/* Big Avatar / Full Card Preview */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '110px', height: '110px', margin: '0 auto 14px', borderRadius: '20px', overflow: 'hidden', background: '#12162a', border: '2px solid #8b5cf6', boxShadow: '0 0 24px rgba(139, 92, 246, 0.35)', position: 'relative' }}>
                {selectedBtn.image ? (
                  <img src={selectedBtn.image} alt={selectedBtn.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DynamicIcon name={selectedBtn.icon || 'Sparkles'} size={48} color={selectedBtn.color || '#8b5cf6'} />
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px', color: '#fff' }}>{selectedBtn.label}</h3>
              <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {selectedBtn.sublabel || 'Add keybind'}
              </div>
            </div>

            {/* Volume Slider Control */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>Volume</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>{cardVolume}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={cardVolume} 
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setCardVolume(v);
                  const updated = { ...selectedBtn, volume: v, action: { ...selectedBtn.action, volume: v / 100 } };
                  setSelectedBtn(updated);
                  updateButtonInConfig(updated);
                }}
                className="custom-slider" 
              />
            </div>

            {/* Play Operations */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>Play operations</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <button className="op-btn" onClick={() => handleTrigger(selectedBtn)} title="Play">
                  <Play size={16} fill="#fff" />
                </button>
                <button className="op-btn" onClick={handleStopAll} title="Stop">
                  <Square size={16} fill="#fff" />
                </button>
                <button className="op-btn" onClick={() => handleTrigger(selectedBtn)} title="Replay">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Card Layout & Image Controls */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f8fafc' }}>Full 1 Card Image</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={selectedBtn.imageMode === 'full'} 
                    onChange={(e) => {
                      const updated = { ...selectedBtn, imageMode: e.target.checked ? 'full' : 'thumbnail' };
                      setSelectedBtn(updated);
                      updateButtonInConfig(updated);
                    }}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ flex: 1, padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  <ImageIcon size={14} /> Ganti PNG
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => setEditingBtn({ ...selectedBtn })}
                  style={{ flex: 1, padding: '8px', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  Edit Detail
                </button>
              </div>
            </div>

            {/* Delete Button */}
            <button 
              onClick={() => {
                if (!confirm(`Hapus tombol "${selectedBtn.label}"?`)) return;
                const updatedPages = config.pages.map(p => ({
                  ...p,
                  buttons: p.buttons.filter(b => b.id !== selectedBtn.id)
                }));
                const newCfg = { ...config, pages: updatedPages };
                setConfig(newCfg);
                setSelectedBtn(newCfg.pages[0]?.buttons[0] || null);
                handleSaveConfig(newCfg);
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginTop: 'auto' }}
            >
              <Trash2 size={14} /> Hapus Tombol Ini
            </button>
          </aside>
        )}
      </div>

      {/* Bottom Control Bar (MagicMic / Spotify Style) */}
      <footer className="bottom-player-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#191f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Sparkles size={20} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff' }}>
              {currentlyPlaying}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              MyStreamBoard Audio Output
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            className="btn-secondary" 
            onClick={handleStopAll}
            style={{ padding: '6px 14px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <Square size={14} fill="#ef4444" />
            <span>Stop Audio</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px' }}>
            <Volume2 size={16} color="#94a3b8" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="80" 
              className="custom-slider" 
            />
          </div>
        </div>
      </footer>

      {/* Button Detail Configuration Modal */}
      {editingBtn && (
        <div className="modal-overlay" onClick={() => setEditingBtn(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Konfigurasi Tombol & Shortcut</h3>
              <button onClick={() => setEditingBtn(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Nama Tombol</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingBtn.label || ''} 
                  onChange={(e) => setEditingBtn({ ...editingBtn, label: e.target.value })} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Sublabel / Info</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingBtn.sublabel || ''} 
                  onChange={(e) => setEditingBtn({ ...editingBtn, sublabel: e.target.value })} 
                />
              </div>
            </div>

            {/* Action Configuration */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Tipe Aksi</label>
              <select 
                className="input-field"
                value={editingBtn.action?.type || 'hotkey'}
                onChange={(e) => {
                  const type = e.target.value;
                  let defaultAction = { type };
                  if (type === 'hotkey') defaultAction.keys = 'Ctrl+F1';
                  if (type === 'sound') defaultAction.sound = 'airhorn.wav';
                  if (type === 'obs_scene') defaultAction.scene = 'Gameplay';
                  if (type === 'obs_mute') defaultAction.input = 'Mic/Aux';
                  if (type === 'app') defaultAction.target = 'notepad.exe';
                  setEditingBtn({ ...editingBtn, action: defaultAction });
                }}
                style={{ marginBottom: '10px' }}
              >
                <option value="sound">Soundboard (Putar Efek Suara MP3/WAV)</option>
                <option value="stop_sounds">Stop Semua Audio Soundboard</option>
                <option value="hotkey">Keyboard Hotkey / Shortcut (TikTok Studio, Discord, Game)</option>
                <option value="obs_scene">OBS Studio: Ganti Scene</option>
                <option value="obs_mute">OBS Studio: Toggle Mute Audio</option>
                <option value="obs_record">OBS Studio: Toggle Recording</option>
                <option value="obs_stream">OBS Studio: Toggle Streaming</option>
                <option value="app">Buka Program / Aplikasi / URL</option>
              </select>

              {editingBtn.action?.type === 'hotkey' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Kombinasi Tombol (misal: Ctrl+F1, Ctrl+Shift+M, Win+Shift+S)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editingBtn.action.keys || ''} 
                    onChange={(e) => setEditingBtn({ ...editingBtn, action: { ...editingBtn.action, keys: e.target.value } })}
                  />
                </div>
              )}

              {editingBtn.action?.type === 'sound' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Pilih File Suara</label>
                  <select 
                    className="input-field"
                    value={editingBtn.action.sound || 'airhorn.wav'}
                    onChange={(e) => setEditingBtn({ ...editingBtn, action: { ...editingBtn.action, sound: e.target.value } })}
                  >
                    <option value="airhorn.wav">Airhorn</option>
                    <option value="rimshot.wav">Rimshot / Ba-Dum-Tss</option>
                    <option value="victory.wav">Victory Fanfare</option>
                    <option value="boom.wav">Vine Boom</option>
                    <option value="applause.wav">Applause</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setEditingBtn(null)}>Batal</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setSelectedBtn(editingBtn);
                  updateButtonInConfig(editingBtn);
                  setEditingBtn(null);
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Phone Connection */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Sambungkan Smartphone Kamu</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '18px' }}>
              Buka kamera di HP kamu lalu scan QR Code di bawah untuk langsung membuka controller:
            </p>

            {serverInfo?.qrDataUrl ? (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 0 24px rgba(139, 92, 246, 0.4)' }}>
                <img src={serverInfo.qrDataUrl} alt="QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#64748b' }}>Memuat QR Code...</div>
            )}

            <div style={{ fontSize: '0.85rem', color: '#c084fc', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px', display: 'inline-block', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
              {serverInfo?.url || `http://${serverHost}:${serverPort}`}
            </div>

            <div>
              <button className="btn-primary" onClick={() => setShowQrModal(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
