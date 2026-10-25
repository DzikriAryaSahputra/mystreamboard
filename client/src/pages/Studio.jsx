import React, { useState, useEffect, useRef } from 'react';
import DynamicIcon from '../components/DynamicIcon';
import { 
  SlidersHorizontal, 
  Smartphone, 
  Plus, 
  Trash2, 
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
  Image as ImageIcon,
  Edit2,
  X,
  Layers,
  Tv,
  Music,
  FolderOpen
} from 'lucide-react';

const FILTER_CATEGORIES = ['All', 'Soundboard', 'Stream', 'Apps'];

export default function Studio({ onNavigate }) {
  const [config, setConfig] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBtn, setEditingBtn] = useState(null); // When not null, Right Sidebar is open!
  const [serverInfo, setServerInfo] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Add Card Flow States
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);
  const [creationType, setCreationType] = useState(null); // 'Soundboard' | 'Stream' | 'Apps'
  const [newCardData, setNewCardData] = useState({
    label: '',
    sublabel: '',
    image: '',
    imageMode: 'full',
    actionType: 'sound',
    sound: 'airhorn.wav',
    hotkeys: 'Ctrl+F1',
    obsType: 'scene',
    obsTarget: 'Gameplay',
    volume: 80
  });

  const sidebarImgInputRef = useRef(null);
  const modalImgInputRef = useRef(null);
  const modalSoundInputRef = useRef(null);

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
      .then(cfg => setConfig(cfg))
      .catch(() => {});
  }, [baseUrl]);

  // Save config
  const handleSaveConfig = async (newCfg = config) => {
    try {
      await fetch(`${baseUrl}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCfg)
      });
    } catch (e) {
      console.error('Error saving config:', e);
    }
  };

  // Trigger Action on Card click
  const handleTrigger = (btn) => {
    if (!btn) return;
    fetch(`${baseUrl}/api/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(btn.action)
    }).catch(() => {});
  };

  // Stop All Audio
  const handleStopAll = () => {
    fetch(`${baseUrl}/api/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'stop_sounds' })
    }).catch(() => {});
  };

  // Upload image handler
  const handleUploadImageFile = (file, onSuccess) => {
    if (!file) return;
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
          onSuccess(data.url);
        }
      } catch (err) {
        console.error('Upload image error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload sound handler
  const handleUploadSoundFile = (file, onSuccess) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        const res = await fetch(`${baseUrl}/api/upload-sound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl })
        });
        const data = await res.json();
        if (data.success && data.filename) {
          onSuccess(data.filename);
        }
      } catch (err) {
        console.error('Upload sound error:', err);
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

  // Add Card Flow Handlers
  const handleSelectCreationType = (type) => {
    setCreationType(type);
    setShowAddChoiceModal(false);
    // Reset data
    setNewCardData({
      label: type === 'Soundboard' ? 'Sound FX' : type === 'Stream' ? 'Stream Scene' : 'App Launcher',
      sublabel: type === 'Soundboard' ? '' : type === 'Stream' ? 'Ctrl+F1' : 'Shortcut',
      image: '',
      imageMode: 'full',
      actionType: type === 'Soundboard' ? 'sound' : type === 'Stream' ? 'obs_scene' : 'hotkey',
      sound: 'airhorn.wav',
      hotkeys: 'Ctrl+F1',
      obsType: 'scene',
      obsTarget: 'Gameplay',
      volume: 80
    });
  };

  const handleFinishAddCard = () => {
    let action = {};
    if (creationType === 'Soundboard') {
      action = { type: 'sound', sound: newCardData.sound, volume: newCardData.volume / 100 };
    } else if (creationType === 'Stream') {
      if (newCardData.obsType === 'scene') action = { type: 'obs_scene', scene: newCardData.obsTarget };
      else if (newCardData.obsType === 'mute') action = { type: 'obs_mute', input: newCardData.obsTarget || 'Mic/Aux' };
      else if (newCardData.obsType === 'tiktok') action = { type: 'hotkey', keys: newCardData.hotkeys };
      else action = { type: 'obs_record' };
    } else {
      action = { type: 'hotkey', keys: newCardData.hotkeys };
    }

    const newBtn = {
      id: `card_${Date.now()}`,
      label: newCardData.label || 'Card Baru',
      sublabel: creationType === 'Soundboard' ? '' : (newCardData.sublabel || ''),
      image: newCardData.image || '',
      imageMode: newCardData.imageMode || 'full',
      icon: creationType === 'Soundboard' ? 'Volume2' : creationType === 'Stream' ? 'Radio' : 'Layers',
      color: '#333333',
      volume: newCardData.volume || 80,
      action
    };

    // Find destination page or put in active
    const targetPageId = creationType === 'Soundboard' ? 'page_sound' : creationType === 'Stream' ? 'page_live' : 'page_media';
    const updatedPages = config.pages.map(p => {
      if (p.id === targetPageId || (!config.pages.some(x => x.id === targetPageId) && p.id === config.pages[0].id)) {
        return { ...p, buttons: [...p.buttons, newBtn] };
      }
      return p;
    });

    const newConfig = { ...config, pages: updatedPages };
    setConfig(newConfig);
    handleSaveConfig(newConfig);
    setCreationType(null);
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

    if (activeCategory === 'Soundboard') {
      list = list.filter(b => b.category === 'Soundboard' || b.action?.type === 'sound');
    } else if (activeCategory === 'Stream') {
      list = list.filter(b => b.category === 'Stream' || b.action?.type?.startsWith('obs') || b.label.toLowerCase().includes('tiktok'));
    } else if (activeCategory === 'Apps') {
      list = list.filter(b => b.category === 'Apps' || b.action?.type === 'app');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => b.label.toLowerCase().includes(q) || b.sublabel?.toLowerCase().includes(q));
    }

    return list;
  };

  const displayedButtons = getAllButtons();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080808' }}>
      <div className="ambient-bg"></div>

      {/* Top Navbar */}
      <header className="glass-nav" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1c1c1c', border: '1px solid #2e2e2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={18} color="#f5f5f5" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f5f5f5' }}>
              MyStreamBoard Studio
            </div>
            <div style={{ fontSize: '0.65rem', color: '#737373', fontWeight: '600' }}>
              DESKTOP CONTROLLER & CONFIGURATOR
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#121212', border: '1px solid #222222', borderRadius: '24px', padding: '6px 16px', width: '320px' }}>
          <Search size={15} color="#737373" />
          <input 
            type="text" 
            placeholder="Search sounds, hotkeys, stream..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', width: '100%' }}
          />
        </div>

        {/* Right Nav Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowQrModal(true)}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <QrCode size={15} color="#a3a3a3" />
            <span>Sambungkan HP</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('deck')}
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Smartphone size={15} color="#a3a3a3" />
            <span>Buka Deck Controller</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Filter Bar, Cards Grid, and Conditional Right Inspector */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side: 4 Filter Pills & Grid */}
        <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* Exactly 4 Filter Pills: All, Soundboard, Stream, Apps */}
          <div className="filter-pills" style={{ marginBottom: '22px' }}>
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

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
            {displayedButtons.map(btn => {
              const isEditing = editingBtn?.id === btn.id;
              const isFullArtwork = btn.imageMode === 'full' && btn.image;
              const isSoundboard = btn.category === 'Soundboard' || btn.action?.type === 'sound';

              return (
                <div
                  key={btn.id}
                  className={`deck-card ${isFullArtwork ? 'full-artwork' : 'thumb-artwork'} ${isEditing ? 'card-selected' : ''}`}
                  onClick={() => handleTrigger(btn)}
                >
                  {/* Edit Pencil Icon (Top Right) */}
                  <button 
                    className="card-edit-btn"
                    title="Edit Card"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBtn(btn);
                    }}
                  >
                    <Edit2 size={13} />
                  </button>

                  {isFullArtwork ? (
                    <>
                      <img src={btn.image} alt={btn.label} className="card-bg-image" />
                      <div className="card-content-overlay">
                        <div className="card-title">{btn.label}</div>
                        {/* Only show sublabel if NOT soundboard */}
                        {!isSoundboard && btn.sublabel && (
                          <div className="card-keybind">{btn.sublabel}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="thumb-img-wrapper" style={{ borderColor: isEditing ? '#666' : '#222' }}>
                        {btn.image ? (
                          <img src={btn.image} alt={btn.label} />
                        ) : (
                          <DynamicIcon name={btn.icon || 'CircleDot'} size={26} color="#a3a3a3" />
                        )}
                      </div>
                      <div className="card-title" style={{ textAlign: 'center' }}>{btn.label}</div>
                      {/* Only show sublabel if NOT soundboard */}
                      {!isSoundboard && btn.sublabel && (
                        <div className="card-keybind" style={{ textAlign: 'center' }}>{btn.sublabel}</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Tambah Card Button */}
            <div 
              className="deck-card thumb-artwork" 
              onClick={() => setShowAddChoiceModal(true)}
              style={{ borderStyle: 'dashed', borderColor: '#2e2e2e', background: '#0e0e0e' }}
            >
              <div className="thumb-img-wrapper" style={{ background: 'transparent', border: 'none' }}>
                <Plus size={26} color="#737373" />
              </div>
              <div className="card-title" style={{ color: '#a3a3a3', textAlign: 'center' }}>Tambah Card</div>
              <div className="card-keybind" style={{ background: 'transparent', border: 'none', color: '#555' }}>Pilih Tipe</div>
            </div>
          </div>
        </div>

        {/* Right Inspector Sidebar - ONLY SHOWN WHEN EDITING A CARD */}
        {editingBtn && (
          <aside style={{ width: '310px', background: '#0d0d0d', borderLeft: '1px solid #1f1f1f', padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', position: 'relative' }}>
            
            {/* Top Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1c', paddingBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit2 size={14} color="#a3a3a3" />
                <span>Edit Card</span>
              </div>
              <button 
                onClick={() => setEditingBtn(null)}
                style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Big Avatar / Full Card Preview */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', margin: '0 auto 12px', borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid #333333', position: 'relative' }}>
                {editingBtn.image ? (
                  <img src={editingBtn.image} alt={editingBtn.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DynamicIcon name={editingBtn.icon || 'Sparkles'} size={42} color="#f5f5f5" />
                  </div>
                )}
              </div>

              <input 
                type="text" 
                value={editingBtn.label || ''} 
                onChange={(e) => {
                  const updated = { ...editingBtn, label: e.target.value };
                  setEditingBtn(updated);
                  updateButtonInConfig(updated);
                }}
                className="input-field"
                style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', marginBottom: '6px' }}
                placeholder="Nama Card"
              />

              {/* Only show sublabel / keybind if NOT soundboard */}
              {editingBtn.action?.type !== 'sound' && (
                <input 
                  type="text" 
                  value={editingBtn.sublabel || ''} 
                  onChange={(e) => {
                    const updated = { ...editingBtn, sublabel: e.target.value };
                    setEditingBtn(updated);
                    updateButtonInConfig(updated);
                  }}
                  className="input-field"
                  style={{ textAlign: 'center', fontSize: '0.75rem', color: '#a3a3a3' }}
                  placeholder="Shortcut (misal: Ctrl+F1)"
                />
              )}
            </div>

            {/* Volume Slider (if sound) */}
            {editingBtn.action?.type === 'sound' && (
              <div className="glass-panel" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3' }}>Volume Suara</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>{editingBtn.volume || 80}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={editingBtn.volume || 80} 
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    const updated = { ...editingBtn, volume: v, action: { ...editingBtn.action, volume: v / 100 } };
                    setEditingBtn(updated);
                    updateButtonInConfig(updated);
                  }}
                  className="custom-slider" 
                />
              </div>
            )}

            {/* Play Operations */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '10px' }}>Tes Operasi</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <button className="op-btn" onClick={() => handleTrigger(editingBtn)} title="Play">
                  <Play size={15} fill="#fff" />
                </button>
                <button className="op-btn" onClick={handleStopAll} title="Stop">
                  <Square size={15} fill="#fff" />
                </button>
                <button className="op-btn" onClick={() => handleTrigger(editingBtn)} title="Replay">
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            {/* Card Layout & Image Controls */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f5f5f5' }}>Full 1 Card Image</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={editingBtn.imageMode === 'full'} 
                    onChange={(e) => {
                      const updated = { ...editingBtn, imageMode: e.target.checked ? 'full' : 'thumbnail' };
                      setEditingBtn(updated);
                      updateButtonInConfig(updated);
                    }}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <div>
                <button 
                  className="btn-secondary" 
                  onClick={() => sidebarImgInputRef.current?.click()}
                  style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.78rem' }}
                >
                  <ImageIcon size={14} />
                  <span>Upload / Ganti Gambar PNG</span>
                </button>
                <input 
                  type="file" 
                  ref={sidebarImgInputRef} 
                  onChange={(e) => handleUploadImageFile(e.target.files?.[0], (url) => {
                    const updated = { ...editingBtn, image: url, imageMode: 'full' };
                    setEditingBtn(updated);
                    updateButtonInConfig(updated);
                  })}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>

            {/* Delete Button */}
            <button 
              onClick={() => {
                if (!confirm(`Hapus card "${editingBtn.label}"?`)) return;
                const updatedPages = config.pages.map(p => ({
                  ...p,
                  buttons: p.buttons.filter(b => b.id !== editingBtn.id)
                }));
                const newCfg = { ...config, pages: updatedPages };
                setConfig(newCfg);
                setEditingBtn(null);
                handleSaveConfig(newCfg);
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginTop: 'auto', padding: '8px' }}
            >
              <Trash2 size={14} /> Hapus Card Ini
            </button>
          </aside>
        )}
      </div>

      {/* POPUP STEP 1: Pilih Tipe Card (Soundboard, Stream, Apps) */}
      {showAddChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowAddChoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Tambah Card Baru</h3>
              <button onClick={() => setShowAddChoiceModal(false)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>


            <p style={{ fontSize: '0.82rem', color: '#a3a3a3', marginBottom: '18px' }}>
              Pilih tipe fungsi kartu yang ingin kamu buat:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Choice 1: Soundboard */}
              <div className="choice-card" onClick={() => handleSelectCreationType('Soundboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Volume2 size={20} color="#f5f5f5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff' }}>1. Soundboard</div>
                    <div style={{ fontSize: '0.75rem', color: '#737373' }}>Putar efek audio, meme sound, atau sound effect MP3/WAV</div>
                  </div>
                </div>
              </div>

              {/* Choice 2: Stream */}
              <div className="choice-card" onClick={() => handleSelectCreationType('Stream')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={20} color="#f5f5f5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff' }}>2. Stream</div>
                    <div style={{ fontSize: '0.75rem', color: '#737373' }}>Kontrol OBS Studio (ganti scene, mic mute) & TikTok Live Studio</div>
                  </div>
                </div>
              </div>

              {/* Choice 3: Apps */}
              <div className="choice-card" onClick={() => handleSelectCreationType('Apps')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={20} color="#f5f5f5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff' }}>3. Apps</div>
                    <div style={{ fontSize: '0.75rem', color: '#737373' }}>Jalankan software PC, buka Discord/Spotify, atau shortcut sistem</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP STEP 2: Modal Konfigurasi Sesuai Pilihan */}
      {creationType && (
        <div className="modal-overlay" onClick={() => setCreationType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                Konfigurasi Card {creationType}
              </h3>
              <button onClick={() => setCreationType(null)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>


            {/* Nama Card */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Nama Card</label>
              <input 
                type="text" 
                className="input-field" 
                value={newCardData.label} 
                onChange={(e) => setNewCardData({ ...newCardData, label: e.target.value })} 
                placeholder="Masukkan nama kartu..."
              />
            </div>

            {/* Upload Image Section */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Gambar Card (PNG / JPG)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {newCardData.image ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                    <img src={newCardData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : null}
                <button 
                  className="btn-secondary" 
                  onClick={() => modalImgInputRef.current?.click()}
                  style={{ flex: 1, padding: '8px', fontSize: '0.78rem' }}
                >
                  <Upload size={14} />
                  <span>{newCardData.image ? 'Ganti File Gambar' : 'Pilih File Gambar'}</span>
                </button>
                <input 
                  type="file" 
                  ref={modalImgInputRef} 
                  onChange={(e) => handleUploadImageFile(e.target.files?.[0], (url) => setNewCardData(prev => ({ ...prev, image: url })))}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>

            {/* Custom Fields depending on Creation Type */}
            {creationType === 'Soundboard' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Upload File Audio (MP3 / WAV)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => modalSoundInputRef.current?.click()}
                      style={{ flex: 1, padding: '8px', fontSize: '0.78rem' }}
                    >
                      <Music size={14} />
                      <span>{newCardData.sound ? `File: ${newCardData.sound}` : 'Upload File Suara'}</span>
                    </button>
                    <input 
                      type="file" 
                      ref={modalSoundInputRef} 
                      onChange={(e) => handleUploadSoundFile(e.target.files?.[0], (fileName) => setNewCardData(prev => ({ ...prev, sound: fileName })))}
                      accept="audio/*" 
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3' }}>Volume Default</label>
                    <span style={{ fontSize: '0.75rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{newCardData.volume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newCardData.volume} 
                    onChange={(e) => setNewCardData({ ...newCardData, volume: parseInt(e.target.value) })}
                    className="custom-slider" 
                  />
                </div>
              </>
            )}

            {creationType === 'Stream' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Tipe Aksi Stream</label>
                  <select 
                    className="input-field" 
                    value={newCardData.obsType} 
                    onChange={(e) => setNewCardData({ ...newCardData, obsType: e.target.value })}
                  >
                    <option value="scene">OBS Studio: Ganti Scene</option>
                    <option value="mute">OBS Studio: Toggle Mute Audio</option>
                    <option value="record">OBS Studio: Toggle Record</option>
                    <option value="tiktok">TikTok Live Studio: Hotkey Trigger</option>
                  </select>
                </div>

                {newCardData.obsType === 'scene' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Nama Scene di OBS</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={newCardData.obsTarget} 
                      onChange={(e) => setNewCardData({ ...newCardData, obsTarget: e.target.value, sublabel: 'OBS Scene' })} 
                      placeholder="misal: Gameplay, Just Chatting, BRB"
                    />
                  </div>
                )}

                {newCardData.obsType === 'mute' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Nama Audio Source di OBS</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={newCardData.obsTarget} 
                      onChange={(e) => setNewCardData({ ...newCardData, obsTarget: e.target.value, sublabel: 'OBS Audio' })} 
                      placeholder="misal: Mic/Aux atau Desktop Audio"
                    />
                  </div>
                )}

                {newCardData.obsType === 'tiktok' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Hotkey Shortcut TikTok Studio</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={newCardData.hotkeys} 
                      onChange={(e) => setNewCardData({ ...newCardData, hotkeys: e.target.value, sublabel: e.target.value })} 
                      placeholder="misal: Ctrl+F1, Ctrl+F2, Ctrl+F3"
                    />
                  </div>
                )}
              </>
            )}

            {creationType === 'Apps' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Kombinasi Shortcut Keyboard</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newCardData.hotkeys} 
                  onChange={(e) => setNewCardData({ ...newCardData, hotkeys: e.target.value, sublabel: e.target.value })} 
                  placeholder="misal: Ctrl+Shift+M, Win+Shift+S, Alt+Tab"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button className="btn-secondary" onClick={() => setCreationType(null)}>Batal</button>
              <button className="btn-primary" onClick={handleFinishAddCard}>Tambahkan Card</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Phone Connection */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>Sambungkan Smartphone Kamu</h3>
            <p style={{ fontSize: '0.82rem', color: '#a3a3a3', marginBottom: '18px' }}>
              Buka kamera di smartphone kamu lalu scan QR Code di bawah untuk membuka controller:
            </p>

            {serverInfo?.qrDataUrl ? (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '14px', display: 'inline-block', marginBottom: '16px' }}>
                <img src={serverInfo.qrDataUrl} alt="QR Code" style={{ width: '210px', height: '210px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#737373' }}>Memuat QR Code...</div>
            )}

            <div style={{ fontSize: '0.82rem', color: '#f5f5f5', background: '#1c1c1c', padding: '8px 14px', borderRadius: '8px', display: 'inline-block', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
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
