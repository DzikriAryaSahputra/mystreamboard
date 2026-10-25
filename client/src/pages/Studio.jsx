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
  FolderOpen,
  BookOpen,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const FILTER_CATEGORIES = ['All', 'Soundboard', 'Stream', 'Apps'];

export default function Studio({ onNavigate }) {
  const [config, setConfig] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBtn, setEditingBtn] = useState(null); // When not null, Right Sidebar is open!
  const [serverInfo, setServerInfo] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState('apps'); // 'apps' | 'stream' | 'hotkeys'
  const [saveSidebarSuccess, setSaveSidebarSuccess] = useState(false);
  const [availableSounds, setAvailableSounds] = useState([
    { name: 'airhorn.wav', displayName: 'Airhorn' },
    { name: 'rimshot.wav', displayName: 'Ba-Dum-Tss (Rimshot)' },
    { name: 'victory.wav', displayName: 'Victory Fanfare' },
    { name: 'boom.wav', displayName: 'Vine Boom' },
    { name: 'applause.wav', displayName: 'Applause' }
  ]);

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
  const sidebarSoundInputRef = useRef(null);
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

    fetch(`${baseUrl}/api/sounds`)
      .then(r => r.json())
      .then(sounds => {
        if (Array.isArray(sounds) && sounds.length > 0) {
          setAvailableSounds(sounds);
        }
      })
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
      label: type === 'Soundboard' ? 'Sound FX' : type === 'Stream' ? 'Stream Scene' : 'Buka Steam',
      sublabel: type === 'Soundboard' ? '' : type === 'Stream' ? 'OBS Scene' : 'steam://',
      image: '',
      imageMode: 'full',
      actionType: type === 'Soundboard' ? 'sound' : type === 'Stream' ? 'obs_scene' : 'app',
      appSubtype: 'app',
      appTarget: 'steam://',
      sound: 'airhorn.wav',
      hotkeys: 'Ctrl+Shift+M',
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
      if (newCardData.appSubtype === 'app') {
        action = { type: 'app', target: newCardData.appTarget || 'steam://' };
      } else {
        action = { type: 'hotkey', keys: newCardData.hotkeys || 'Ctrl+Shift+M' };
      }
    }

    const newBtn = {
      id: `card_${Date.now()}`,
      label: newCardData.label || 'Card Baru',
      sublabel: creationType === 'Soundboard' ? '' : (newCardData.sublabel || (newCardData.appSubtype === 'app' ? newCardData.appTarget : newCardData.hotkeys) || ''),
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#141414', border: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px' }}>
            <img src="/app-icon.png" alt="MyStreamBoard" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

        {/* Upgraded Premium Search Capsule */}
        <div className="nav-search-capsule">
          <Search size={15} color="#8a8a8a" />
          <input 
            type="text" 
            placeholder="Search sounds, hotkeys, stream actions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="search-shortcut-badge">/</span>
          )}
        </div>

        {/* Right Nav Action Buttons (Upgraded Luxury Styles) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="nav-btn-connect" 
            onClick={() => setShowGuideModal(true)}
            title="Buka petunjuk lengkap shortcut & integrasi"
            style={{ background: '#141414', borderColor: '#2b2b2b' }}
          >
            <BookOpen size={15} color="#a3a3a3" />
            <span>Panduan</span>
          </button>

          <button 
            className="nav-btn-connect" 
            onClick={() => setShowQrModal(true)}
            title="Scan QR Code untuk membuka deck controller di smartphone"
          >
            <span className="pulse-dot" title="Server Online"></span>
            <QrCode size={15} />
            <span>Sambungkan HP</span>
          </button>

          <button 
            className="nav-btn-controller" 
            onClick={() => onNavigate('deck')}
            title="Buka deck controller mode smartphone"
          >
            <Smartphone size={15} />
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
        {editingBtn && (() => {
          const currentCategory = editingBtn.category || (
            editingBtn.action?.type === 'sound' || editingBtn.action?.type === 'stop_sounds' ? 'Soundboard' :
            editingBtn.action?.type?.startsWith('obs') || editingBtn.sublabel?.toLowerCase().includes('obs') || editingBtn.label?.toLowerCase().includes('tiktok') ? 'Stream' :
            'Apps'
          );

          const isSoundboard = currentCategory === 'Soundboard';
          const isStream = currentCategory === 'Stream';
          const isApps = currentCategory === 'Apps';

          const handleSaveEditingBtn = () => {
            const cleanBtn = {
              ...editingBtn,
              category: currentCategory,
              sublabel: isSoundboard ? '' : (editingBtn.sublabel || '')
            };
            updateButtonInConfig(cleanBtn);
            setSaveSidebarSuccess(true);
            setTimeout(() => {
              setSaveSidebarSuccess(false);
              setEditingBtn(null);
            }, 300);
          };

          const handleDeleteEditingBtn = () => {
            if (!confirm(`Hapus card "${editingBtn.label}"?`)) return;
            const updatedPages = config.pages.map(p => ({
              ...p,
              buttons: p.buttons.filter(b => b.id !== editingBtn.id)
            }));
            const newCfg = { ...config, pages: updatedPages };
            setConfig(newCfg);
            setEditingBtn(null);
            handleSaveConfig(newCfg);
          };

          return (
            <aside style={{ width: '330px', background: '#0d0d0d', borderLeft: '1px solid #1f1f1f', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', position: 'relative' }}>
              
              {/* Top Header: Title, Prominent Save Button, Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f1f1f', paddingBottom: '12px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSoundboard && <Volume2 size={16} color="#a3a3a3" />}
                  {isStream && <Radio size={16} color="#a3a3a3" />}
                  {isApps && <Layers size={16} color="#a3a3a3" />}
                  <span>{isSoundboard ? 'Edit Soundboard' : isStream ? 'Edit Stream' : 'Edit Apps'}</span>
                </div>
                <button 
                  onClick={() => setEditingBtn(null)}
                  style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title="Tutup Panel Edit"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tipe Card Switcher (Soundboard / Stream / Apps) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: '#121212', padding: '4px', borderRadius: '10px', border: '1px solid #222' }}>
                {['Soundboard', 'Stream', 'Apps'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      let action = editingBtn.action;
                      let sublabel = editingBtn.sublabel;
                      if (cat === 'Soundboard') {
                        action = { type: 'sound', sound: editingBtn.action?.sound || 'airhorn.wav', volume: 0.8 };
                        sublabel = '';
                      } else if (cat === 'Stream') {
                        action = { type: 'obs_scene', scene: 'Gameplay' };
                        sublabel = 'OBS Scene';
                      } else {
                        action = { type: 'hotkey', keys: 'Ctrl+Shift+M' };
                        sublabel = 'Shortcut';
                      }
                      setEditingBtn({
                        ...editingBtn,
                        category: cat,
                        sublabel,
                        action
                      });
                    }}
                    style={{
                      padding: '6px 0',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      borderRadius: '7px',
                      border: 'none',
                      background: currentCategory === cat ? '#2a2a2a' : 'transparent',
                      color: currentCategory === cat ? '#fff' : '#737373',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {cat === 'Soundboard' && <Volume2 size={12} />}
                    {cat === 'Stream' && <Radio size={12} />}
                    {cat === 'Apps' && <Layers size={12} />}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>

              {/* Big Avatar / Full Card Preview & Title */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '92px', height: '92px', margin: '0 auto 12px', borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid #333333', position: 'relative' }}>
                  {editingBtn.image ? (
                    <img src={editingBtn.image} alt={editingBtn.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DynamicIcon name={editingBtn.icon || (isSoundboard ? 'Volume2' : isStream ? 'Radio' : 'Layers')} size={36} color="#f5f5f5" />
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'left', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '4px', fontWeight: '700' }}>Nama Card</label>
                  <input 
                    type="text" 
                    value={editingBtn.label || ''} 
                    onChange={(e) => setEditingBtn({ ...editingBtn, label: e.target.value })}
                    className="input-field"
                    style={{ fontWeight: '700', fontSize: '0.88rem' }}
                    placeholder="Nama Card"
                  />
                </div>

                {/* Sublabel / Shortcut ONLY for Stream & Apps */}
                {!isSoundboard && (
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '4px', fontWeight: '700' }}>Info Shortcut / Sublabel</label>
                    <input 
                      type="text" 
                      value={editingBtn.sublabel || ''} 
                      onChange={(e) => setEditingBtn({ ...editingBtn, sublabel: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.8rem', color: '#a3a3a3' }}
                      placeholder="misal: Ctrl+F1 atau OBS Scene"
                    />
                  </div>
                )}
              </div>

              {/* Image & Appearance Settings (All Cards) */}
              <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#f5f5f5' }}>Full 1 Card Image</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={editingBtn.imageMode === 'full'} 
                      onChange={(e) => setEditingBtn({ ...editingBtn, imageMode: e.target.checked ? 'full' : 'thumbnail' })}
                    />
                    <span className="slider-switch"></span>
                  </label>
                </div>

                <button 
                  className="btn-secondary" 
                  onClick={() => sidebarImgInputRef.current?.click()}
                  style={{ width: '100%', justifyContent: 'center', padding: '7px', fontSize: '0.76rem' }}
                >
                  <ImageIcon size={14} />
                  <span>Upload / Ganti Gambar PNG</span>
                </button>
                <input 
                  type="file" 
                  ref={sidebarImgInputRef} 
                  onChange={(e) => handleUploadImageFile(e.target.files?.[0], (url) => setEditingBtn({ ...editingBtn, image: url, imageMode: 'full' }))}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              {/* 1. KHUSUS MENU SOUNDBOARD */}
              {isSoundboard && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Ganti File Suara Section */}
                  <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Music size={14} color="#a3a3a3" />
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f5f5f5' }}>Ganti File Suara (Audio)</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#737373', marginBottom: '4px', fontWeight: '600' }}>
                        Pilih dari Koleksi Suara:
                      </label>
                      <select 
                        className="input-field"
                        value={editingBtn.action?.sound || ''}
                        onChange={(e) => setEditingBtn({
                          ...editingBtn,
                          action: { ...editingBtn.action, type: 'sound', sound: e.target.value }
                        })}
                        style={{ fontSize: '0.82rem', padding: '7px 10px', width: '100%' }}
                      >
                        {availableSounds.map(s => (
                          <option key={s.name} value={s.name}>{s.displayName || s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
                      <span style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase' }}>atau</span>
                      <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
                    </div>

                    <button 
                      className="btn-secondary" 
                      onClick={() => sidebarSoundInputRef.current?.click()}
                      style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.76rem' }}
                    >
                      <Upload size={14} />
                      <span>Upload File Suara Baru (.mp3 / .wav)</span>
                    </button>
                    <input 
                      type="file" 
                      ref={sidebarSoundInputRef} 
                      onChange={(e) => handleUploadSoundFile(e.target.files?.[0], (filename) => {
                        setAvailableSounds(prev => [{ name: filename, displayName: filename }, ...prev]);
                        setEditingBtn({
                          ...editingBtn,
                          action: { ...editingBtn.action, type: 'sound', sound: filename }
                        });
                      })}
                      accept="audio/*" 
                      style={{ display: 'none' }} 
                    />
                  </div>

                  {/* Volume Slider */}
                  <div className="glass-panel" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#a3a3a3' }}>Volume Suara</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>{editingBtn.volume || 80}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={editingBtn.volume || 80} 
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        setEditingBtn({
                          ...editingBtn,
                          volume: v,
                          action: { ...editingBtn.action, volume: v / 100 }
                        });
                      }}
                      className="custom-slider" 
                    />
                  </div>

                  {/* Tes Audio Soundboard */}
                  <div className="glass-panel" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '8px' }}>Tes Suara</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleTrigger(editingBtn)} 
                        style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: '0.78rem' }}
                      >
                        <Play size={14} /> Play Suara
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={handleStopAll} 
                        style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: '0.78rem' }}
                      >
                        <Square size={14} /> Stop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. KHUSUS MENU STREAM (OBS & TIKTOK) */}
              {isStream && (
                <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Radio size={14} color="#a3a3a3" />
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f5f5f5' }}>Konfigurasi Live Streaming</span>
                  </div>

                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#a3a3a3' }}>Tipe Aksi Stream</label>
                  <select 
                    className="input-field"
                    value={editingBtn.action?.type || 'obs_scene'}
                    onChange={(e) => {
                      const type = e.target.value;
                      let action = { type };
                      let sublabel = '';
                      if (type === 'obs_scene') { action.scene = 'Gameplay'; sublabel = 'OBS Scene'; }
                      else if (type === 'obs_mute') { action.input = 'Mic/Aux'; sublabel = 'OBS Mic'; }
                      else if (type === 'obs_record') { sublabel = 'OBS Rec'; }
                      else if (type === 'obs_stream') { sublabel = 'OBS Live'; }
                      else if (type === 'hotkey') { action.keys = 'Ctrl+F1'; sublabel = 'Ctrl+F1'; }
                      setEditingBtn({ ...editingBtn, sublabel, action });
                    }}
                    style={{ fontSize: '0.8rem', padding: '7px 10px' }}
                  >
                    <option value="obs_scene">OBS Studio: Ganti Scene</option>
                    <option value="obs_mute">OBS Studio: Toggle Mute Audio</option>
                    <option value="obs_record">OBS Studio: Toggle Record</option>
                    <option value="obs_stream">OBS Studio: Toggle Stream</option>
                    <option value="hotkey">TikTok Live Studio: Hotkey Trigger</option>
                  </select>

                  {editingBtn.action?.type === 'obs_scene' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '2px', fontWeight: '700' }}>Nama Scene OBS</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={editingBtn.action.scene || ''} 
                        onChange={(e) => setEditingBtn({
                          ...editingBtn,
                          action: { ...editingBtn.action, scene: e.target.value }
                        })}
                        placeholder="misal: Gameplay, Just Chatting, BRB"
                      />
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '700', color: '#e5e5e5', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={12} color="#3b82f6" /> Petunjuk OBS Scene:
                        </div>
                        Pastikan OBS Studio sudah terbuka dan WebSocket aktif (di menu <em>Tools &gt; WebSocket Server Settings</em>, port 4455). Nama scene harus sama persis huruf besar/kecilnya dengan di OBS.
                      </div>
                    </div>
                  )}

                  {editingBtn.action?.type === 'obs_mute' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '2px', fontWeight: '700' }}>Nama Audio Source di OBS</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={editingBtn.action.input || ''} 
                        onChange={(e) => setEditingBtn({
                          ...editingBtn,
                          action: { ...editingBtn.action, input: e.target.value }
                        })}
                        placeholder="misal: Mic/Aux atau Desktop Audio"
                      />
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '700', color: '#e5e5e5', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={12} color="#3b82f6" /> Petunjuk Mute Audio:
                        </div>
                        Ketik nama sumber suara di Audio Mixer OBS (contoh: <code>Mic/Aux</code>, <code>Desktop Audio</code>, atau nama mikrofon USB Anda).
                      </div>
                    </div>
                  )}

                  {editingBtn.action?.type === 'hotkey' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '2px', fontWeight: '700' }}>Kombinasi Hotkey TikTok Studio</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={editingBtn.action.keys || ''} 
                        onChange={(e) => setEditingBtn({
                          ...editingBtn,
                          sublabel: e.target.value,
                          action: { ...editingBtn.action, keys: e.target.value }
                        })}
                        placeholder="misal: Ctrl+F1, Ctrl+F2, Ctrl+F3"
                      />
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '700', color: '#e5e5e5', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={12} color="#3b82f6" /> Petunjuk TikTok Live Studio:
                        </div>
                        Buka TikTok Live Studio &gt; Setelan &gt; Hotkey. Atur tombol shortcut untuk ganti scene/kamera, lalu masukkan kombinasi yang sama di sini.
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn-secondary" 
                    onClick={() => handleTrigger(editingBtn)} 
                    style={{ width: '100%', justifyContent: 'center', padding: '7px', fontSize: '0.78rem', marginTop: '4px' }}
                  >
                    <Play size={13} /> Tes Eksekusi Stream
                  </button>
                </div>
              )}

              {/* 3. KHUSUS MENU APPS & SHORTCUTS */}
              {isApps && (
                <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Layers size={14} color="#a3a3a3" />
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f5f5f5' }}>Konfigurasi Aplikasi & Shortcut</span>
                  </div>

                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#a3a3a3' }}>Tipe Aksi Apps</label>
                  <select 
                    className="input-field"
                    value={editingBtn.action?.type || 'hotkey'}
                    onChange={(e) => {
                      const type = e.target.value;
                      let action = { type };
                      let sublabel = '';
                      if (type === 'hotkey') { action.keys = 'Ctrl+Shift+M'; sublabel = 'Ctrl+Shift+M'; }
                      else { action.target = 'steam://'; sublabel = 'App'; }
                      setEditingBtn({ ...editingBtn, sublabel, action });
                    }}
                    style={{ fontSize: '0.8rem', padding: '7px 10px' }}
                  >
                    <option value="hotkey">Shortcut Keyboard Global</option>
                    <option value="app">Buka Program (.exe) / Protocol URI / Website</option>
                  </select>

                  {editingBtn.action?.type === 'hotkey' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '4px', fontWeight: '700' }}>Kombinasi Shortcut Keyboard</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={editingBtn.action.keys || ''} 
                          onChange={(e) => setEditingBtn({
                            ...editingBtn,
                            sublabel: e.target.value,
                            action: { ...editingBtn.action, keys: e.target.value }
                          })}
                          placeholder="misal: Ctrl+Shift+M, Win+Shift+S, Alt+Tab"
                        />
                      </div>

                      {/* Quick Presets for Hotkeys */}
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '4px', fontWeight: '600' }}>Preset Cepat (Klik untuk isi):</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {[
                            { label: 'Discord Mute', val: 'Ctrl+Shift+M' },
                            { label: 'Screenshot', val: 'Win+Shift+S' },
                            { label: 'Play/Pause', val: 'MEDIA_PLAY_PAUSE' },
                            { label: 'Task Manager', val: 'Ctrl+Shift+Esc' }
                          ].map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setEditingBtn({
                                ...editingBtn,
                                sublabel: preset.val,
                                action: { ...editingBtn.action, keys: preset.val }
                              })}
                              style={{
                                background: '#1c1c1c',
                                border: '1px solid #333',
                                color: '#a3a3a3',
                                fontSize: '0.68rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Petunjuk / Hint Box */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '700', color: '#e5e5e5', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={12} color="#3b82f6" /> Petunjuk Format:
                        </div>
                        • Gabungkan tombol dengan tanda <code>+</code>: <code>Ctrl</code>, <code>Alt</code>, <code>Shift</code>, <code>Win</code>.<br/>
                        • Tombol Media: <code>VOLUME_UP</code>, <code>VOLUME_DOWN</code>, <code>VOLUME_MUTE</code>, <code>MEDIA_PLAY_PAUSE</code>, <code>MEDIA_NEXT</code>.
                      </div>
                    </div>
                  )}

                  {editingBtn.action?.type === 'app' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#737373', marginBottom: '4px', fontWeight: '700' }}>Target Program (.exe), Protocol URI, atau URL Web</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={editingBtn.action.target || ''} 
                          onChange={(e) => setEditingBtn({
                            ...editingBtn,
                            action: { ...editingBtn.action, target: e.target.value }
                          })}
                          placeholder="misal: steam:// atau spotify: atau https://..."
                        />
                      </div>

                      {/* Quick Presets for Apps */}
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '4px', fontWeight: '600' }}>Preset Cepat (Klik untuk isi):</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {[
                            { label: 'Steam', val: 'steam://' },
                            { label: 'Spotify', val: 'spotify:' },
                            { label: 'Discord', val: 'discord:' },
                            { label: 'YouTube', val: 'https://youtube.com' }
                          ].map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setEditingBtn({
                                ...editingBtn,
                                label: editingBtn.label || preset.label,
                                action: { ...editingBtn.action, target: preset.val }
                              })}
                              style={{
                                background: '#1c1c1c',
                                border: '1px solid #333',
                                color: '#a3a3a3',
                                fontSize: '0.68rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Petunjuk / Hint Box */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                        <div style={{ fontWeight: '700', color: '#e5e5e5', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={12} color="#3b82f6" /> Petunjuk Target:
                        </div>
                        • <strong>Protocol URI (Direkomendasikan):</strong> Cukup ketik <code>steam://</code>, <code>spotify:</code>, atau <code>discord:</code> (otomatis membuka di mana pun letak folder instalasinya).<br/>
                        • <strong>Website:</strong> Awali dengan <code>https://</code> (misal: <code>https://youtube.com</code>).<br/>
                        • <strong>Path .exe:</strong> Masukkan path lengkap, misal <code>C:\Program Files\App\app.exe</code>.
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn-secondary" 
                    onClick={() => handleTrigger(editingBtn)} 
                    style={{ width: '100%', justifyContent: 'center', padding: '7px', fontSize: '0.78rem', marginTop: '4px' }}
                  >
                    <Play size={13} /> Tes Jalankan Shortcut
                  </button>
                </div>
              )}

              {/* STICKY BOTTOM FOOTER: Prominent Simpan Perubahan Button & Delete */}
              <div style={{ 
                position: 'sticky', 
                bottom: '-22px', 
                margin: '16px -22px -22px', 
                background: '#0d0d0d', 
                borderTop: '1px solid #222222', 
                padding: '14px 22px', 
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.7)'
              }}>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveEditingBtn}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
                >
                  <Check size={16} />
                  <span>{saveSidebarSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
                </button>

                <button 
                  onClick={handleDeleteEditingBtn}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={13} /> Hapus Card Ini
                </button>
              </div>

            </aside>
          );
        })()}
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
                    <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={11} color="#3b82f6" /> Pastikan nama scene persis sama dengan yang ada di OBS Studio Anda.
                    </div>
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
                    <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={11} color="#3b82f6" /> Nama source audio di OBS Studio (misal: Mic/Aux).
                    </div>
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
                    <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={11} color="#3b82f6" /> Samakan dengan hotkey yang diset di TikTok Live Studio {'>'} Settings {'>'} Hotkeys.
                    </div>
                  </div>
                )}
              </>
            )}

            {creationType === 'Apps' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Tipe Aksi Apps</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setNewCardData({ ...newCardData, appSubtype: 'app', sublabel: newCardData.appTarget || 'steam://' })}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: newCardData.appSubtype === 'app' ? '1px solid #ffffff' : '1px solid #2a2a2a',
                        background: newCardData.appSubtype === 'app' ? '#222' : '#141414',
                        color: newCardData.appSubtype === 'app' ? '#fff' : '#888',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Buka App / Game / URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCardData({ ...newCardData, appSubtype: 'hotkey', sublabel: newCardData.hotkeys || 'Ctrl+Shift+M' })}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: newCardData.appSubtype === 'hotkey' ? '1px solid #ffffff' : '1px solid #2a2a2a',
                        background: newCardData.appSubtype === 'hotkey' ? '#222' : '#141414',
                        color: newCardData.appSubtype === 'hotkey' ? '#fff' : '#888',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Shortcut Keyboard
                    </button>
                  </div>
                </div>

                {newCardData.appSubtype === 'app' ? (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Target Program / URI / URL</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={newCardData.appTarget || ''} 
                      onChange={(e) => setNewCardData({ ...newCardData, appTarget: e.target.value, sublabel: e.target.value })} 
                      placeholder="misal: steam:// atau spotify: atau https://youtube.com"
                    />

                    {/* Quick Presets for Apps */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '5px', fontWeight: '600' }}>Pilihan Cepat (Klik untuk isi):</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {[
                          { label: 'Steam', target: 'steam://' },
                          { label: 'Spotify', target: 'spotify:' },
                          { label: 'Discord', target: 'discord:' },
                          { label: 'YouTube', target: 'https://youtube.com' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setNewCardData({ 
                              ...newCardData, 
                              label: newCardData.label === 'Buka Steam' || !newCardData.label ? `Buka ${p.label}` : newCardData.label,
                              appTarget: p.target, 
                              sublabel: p.target 
                            })}
                            style={{
                              background: '#1c1c1c',
                              border: '1px solid #333',
                              color: '#d4d4d4',
                              fontSize: '0.68rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            + {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px', fontSize: '0.68rem', color: '#888', lineHeight: '1.4' }}>
                      <strong style={{ color: '#e5e5e5' }}>Tips:</strong> Gunakan <code>steam://</code>, <code>spotify:</code>, atau <code>discord:</code> agar otomatis terbuka di Windows tanpa perlu mencari lokasi folder instalasi.
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#a3a3a3', marginBottom: '6px' }}>Kombinasi Shortcut Keyboard</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={newCardData.hotkeys || ''} 
                      onChange={(e) => setNewCardData({ ...newCardData, hotkeys: e.target.value, sublabel: e.target.value })} 
                      placeholder="misal: Ctrl+Shift+M, Win+Shift+S, Alt+Tab"
                    />

                    {/* Quick Presets for Hotkeys */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#888', marginBottom: '5px', fontWeight: '600' }}>Preset Shortcut Populer:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {[
                          { label: 'Discord Mute', keys: 'Ctrl+Shift+M' },
                          { label: 'Screenshot', keys: 'Win+Shift+S' },
                          { label: 'Play/Pause', keys: 'MEDIA_PLAY_PAUSE' },
                          { label: 'Task Manager', keys: 'Ctrl+Shift+Esc' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setNewCardData({ 
                              ...newCardData, 
                              label: newCardData.label || p.label,
                              hotkeys: p.keys, 
                              sublabel: p.keys 
                            })}
                            style={{
                              background: '#1c1c1c',
                              border: '1px solid #333',
                              color: '#d4d4d4',
                              fontSize: '0.68rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            + {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
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

      {/* COMPREHENSIVE GUIDE MODAL (Petunjuk Shortcut Apps & Streaming) */}
      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', textAlign: 'left', padding: '28px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: 0 }}>Panduan Shortcut & Streaming</h3>
                  <div style={{ fontSize: '0.74rem', color: '#888' }}>Petunjuk lengkap membuka aplikasi, game, OBS Studio & TikTok Live</div>
                </div>
              </div>
              <button onClick={() => setShowGuideModal(false)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #222', paddingBottom: '12px', marginBottom: '18px' }}>
              {[
                { id: 'apps', label: 'Buka Apps & Game', icon: Layers },
                { id: 'stream', label: 'OBS & TikTok Live', icon: Radio },
                { id: 'hotkeys', label: 'Shortcut Keyboard & Media', icon: HelpCircle }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = guideTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGuideTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      background: isActive ? '#222' : 'transparent',
                      border: isActive ? '1px solid #444' : '1px solid transparent',
                      color: isActive ? '#fff' : '#888',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: BUKA APPS & GAME */}
            {guideTab === 'apps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem', color: '#cccccc' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>1. Cara Terbaik: Gunakan Protocol URI (100% Berhasil)</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    Di sistem operasi Windows, aplikasi modern mendaftarkan tautan protokol khusus. Dengan protokol ini, Anda <strong>tidak perlu mencari lokasi folder .exe</strong> (seperti C:\Program Files...). Cukup masukkan kodenya ke kolom target:
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Steam & Games</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8', marginBottom: '6px' }}>steam://</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>
                      Membuka aplikasi Steam langsung.<br/>
                      <span style={{ color: '#aaa' }}>Tips Game:</span> <code>steam://run/730</code> langsung menjalankan CS:GO!
                    </div>
                  </div>

                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Spotify Desktop</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#4ade80', marginBottom: '6px' }}>spotify:</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>
                      Otomatis membuka dan fokus ke jendela Spotify di PC Anda.
                    </div>
                  </div>

                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Discord</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8', marginBottom: '6px' }}>discord:</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>
                      Membuka aplikasi Discord desktop tanpa perlu mencari file exe di AppData.
                    </div>
                  </div>

                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Aplikasi Windows Bawaan</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fbbf24', marginBottom: '6px' }}>calc: atau ms-settings:</div>
                    <div style={{ fontSize: '0.72rem', color: '#888' }}>
                      <code>calc:</code> untuk Kalkulator, <code>ms-settings:</code> untuk Windows Settings.
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #222', paddingTop: '14px' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>2. Membuka Website / Tautan Browser</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    Untuk membuka situs web di browser default Anda, cukup ketikkan alamat lengkap berawalan <code>https://</code>:
                  </p>
                  <div style={{ marginTop: '8px', background: '#161616', border: '1px solid #262626', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e5e5e5' }}>
                    https://youtube.com &nbsp;|&nbsp; https://twitch.tv &nbsp;|&nbsp; https://chatgpt.com
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #222', paddingTop: '14px' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>3. Menjalankan File Executable (.exe)</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    Jika aplikasi Anda tidak memiliki protokol URI, Anda dapat memasukkan path lengkap file <code>.exe</code>-nya:
                  </p>
                  <div style={{ marginTop: '8px', background: '#161616', border: '1px solid #262626', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#e5e5e5' }}>
                    C:\Program Files\Notepad++\notepad++.exe
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: OBS & TIKTOK LIVE */}
            {guideTab === 'stream' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem', color: '#cccccc' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>Integrasi OBS Studio (WebSocket)</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    MyStreamBoard dapat mengontrol OBS Studio secara real-time via koneksi WebSocket lokal (Port 4455):
                  </p>
                </div>

                <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Langkah Pengaturan OBS Studio:</div>
                  <ol style={{ margin: 0, paddingLeft: '18px', color: '#a3a3a3', lineHeight: '1.6', fontSize: '0.78rem' }}>
                    <li>Buka <strong>OBS Studio</strong> di PC Anda.</li>
                    <li>Buka menu atas: <strong>Tools</strong> {'>'} <strong>WebSocket Server Settings</strong>.</li>
                    <li>Centang opsi <strong>"Enable WebSocket server"</strong>.</li>
                    <li>Pastikan Server Port bernilai <strong>4455</strong>.</li>
                    <li>Klik <strong>Apply</strong> dan <strong>OK</strong>. Selesai! MyStreamBoard akan otomatis terhubung.</li>
                  </ol>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Ganti Scene (obs_scene)</div>
                    <div style={{ fontSize: '0.74rem', color: '#888', lineHeight: '1.4' }}>
                      Ketikkan nama Scene persis seperti yang tertulis di daftar Scene OBS Anda (misal: <code>Gameplay</code>, <code>Just Chatting</code>, <code>BRB</code>).
                    </div>
                  </div>

                  <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Toggle Mute Mic (obs_mute)</div>
                    <div style={{ fontSize: '0.74rem', color: '#888', lineHeight: '1.4' }}>
                      Ketikkan nama sumber audio yang ada di Audio Mixer OBS (misal: <code>Mic/Aux</code> atau <code>Desktop Audio</code>).
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #222', paddingTop: '14px' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>Integrasi TikTok Live Studio (Global Hotkeys)</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    Karena TikTok Live Studio belum menyediakan API WebSocket publik, kontrol dilakukan dengan sangat stabil menggunakan <strong>Global Hotkey</strong>:
                  </p>
                  <ol style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: '#a3a3a3', lineHeight: '1.6', fontSize: '0.78rem' }}>
                    <li>Buka <strong>TikTok Live Studio</strong> {'>'} klik icon gear <strong>Settings</strong> di kanan atas {'>'} pilih tab <strong>Hotkeys</strong>.</li>
                    <li>Atur shortcut untuk Scene atau Mute (contoh: Scene Game = <code>Ctrl+F1</code>, Scene Cam = <code>Ctrl+F2</code>).</li>
                    <li>Di MyStreamBoard, buat Card tipe <strong>Stream {'>'} TikTok Studio</strong> dan masukkan hotkey yang sama (<code>Ctrl+F1</code>). Saat ditekan di HP, scene TikTok langsung berubah!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SHORTCUT KEYBOARD & MEDIA */}
            {guideTab === 'hotkeys' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem', color: '#cccccc' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', fontWeight: '700' }}>Shortcut Keyboard & Tombol Media Windows</h4>
                  <p style={{ margin: 0, lineHeight: '1.5', color: '#999' }}>
                    MyStreamBoard dapat menyimulasikan penekanan tombol fisik keyboard hingga tombol kontrol multimedia Windows tanpa delay:
                  </p>
                </div>

                <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Kombinasi Populer untuk Streamer & Gamer:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                      <span style={{ color: '#a3a3a3' }}>Mute / Unmute Mic Discord</span>
                      <code style={{ background: '#222', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontFamily: 'var(--font-mono)' }}>Ctrl+Shift+M</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                      <span style={{ color: '#a3a3a3' }}>Deafen / Mute Suara Teman Discord</span>
                      <code style={{ background: '#222', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontFamily: 'var(--font-mono)' }}>Ctrl+Shift+D</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                      <span style={{ color: '#a3a3a3' }}>Snipping Tool / Screenshot Cepat</span>
                      <code style={{ background: '#222', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontFamily: 'var(--font-mono)' }}>Win+Shift+S</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#a3a3a3' }}>Buka Task Manager</span>
                      <code style={{ background: '#222', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontFamily: 'var(--font-mono)' }}>Ctrl+Shift+Esc</code>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Tombol Multimedia Windows:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#111', padding: '8px 10px', borderRadius: '6px', border: '1px solid #222' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#38bdf8' }}>MEDIA_PLAY_PAUSE</div>
                      <div style={{ fontSize: '0.7rem', color: '#777' }}>Play/Pause Spotify / YouTube</div>
                    </div>
                    <div style={{ background: '#111', padding: '8px 10px', borderRadius: '6px', border: '1px solid #222' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#38bdf8' }}>MEDIA_NEXT</div>
                      <div style={{ fontSize: '0.7rem', color: '#777' }}>Lagu Berikutnya</div>
                    </div>
                    <div style={{ background: '#111', padding: '8px 10px', borderRadius: '6px', border: '1px solid #222' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#38bdf8' }}>VOLUME_UP / DOWN</div>
                      <div style={{ fontSize: '0.7rem', color: '#777' }}>Naikkan / Turunkan Volume PC</div>
                    </div>
                    <div style={{ background: '#111', padding: '8px 10px', borderRadius: '6px', border: '1px solid #222' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#38bdf8' }}>VOLUME_MUTE</div>
                      <div style={{ fontSize: '0.7rem', color: '#777' }}>Mute Suara Speaker Master</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #222', paddingTop: '16px' }}>
              <button className="btn-primary" onClick={() => setShowGuideModal(false)}>
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
