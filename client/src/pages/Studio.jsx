import React, { useState, useEffect } from 'react';
import DynamicIcon from '../components/DynamicIcon';
import { 
  SlidersHorizontal, 
  Smartphone, 
  Plus, 
  Trash2, 
  Save, 
  Radio, 
  Volume2, 
  Keyboard, 
  Sparkles, 
  QrCode, 
  ExternalLink,
  Check,
  RefreshCw
} from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', 
  '#ef4444', '#f59e0b', '#10b981', '#64748b'
];

const PRESET_ICONS = [
  'Gamepad2', 'MessageSquare', 'Coffee', 'CircleDot',
  'Mic', 'MicOff', 'Volume2', 'VolumeX', 'Headphones',
  'Video', 'Tv', 'Camera', 'Megaphone', 'Drum',
  'Trophy', 'Bomb', 'Sparkles', 'Play', 'SkipForward',
  'SkipBack', 'Music', 'Activity', 'Lock', 'Radio', 'Globe'
];

export default function Studio({ onNavigate }) {
  const [config, setConfig] = useState(null);
  const [activePageId, setActivePageId] = useState('');
  const [serverInfo, setServerInfo] = useState(null);
  const [editingBtn, setEditingBtn] = useState(null);
  const [obsAddress, setObsAddress] = useState('ws://127.0.0.1:4455');
  const [obsPassword, setObsPassword] = useState('');
  const [obsStatus, setObsStatus] = useState({ connected: false });
  const [showQrModal, setShowQrModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const serverHost = localStorage.getItem('mystreamboard_host') || window.location.hostname || '127.0.0.1';
  const serverPort = localStorage.getItem('mystreamboard_port') || window.location.port || '4829';
  const baseUrl = `http://${serverHost}:${serverPort}`;

  // Fetch server info and config
  useEffect(() => {
    fetch(`${baseUrl}/api/info`)
      .then(r => r.json())
      .then(info => {
        setServerInfo(info);
        setObsStatus({ connected: info.obsConnected });
      })
      .catch(() => {});

    fetch(`${baseUrl}/api/config`)
      .then(r => r.json())
      .then(cfg => {
        setConfig(cfg);
        setActivePageId(cfg.activePageId || cfg.pages?.[0]?.id);
        if (cfg.obsSettings) {
          setObsAddress(cfg.obsSettings.address || 'ws://127.0.0.1:4455');
          setObsPassword(cfg.obsSettings.password || '');
        }
      })
      .catch(() => {});
  }, [baseUrl]);

  const activePage = config?.pages?.find(p => p.id === activePageId) || config?.pages?.[0];

  // Save Config to Server
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

  // Connect to OBS
  const handleConnectObs = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/obs/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: obsAddress, password: obsPassword })
      });
      const data = await res.json();
      setObsStatus({ connected: data.success });
      if (data.success) {
        // update config obs settings
        const updated = {
          ...config,
          obsSettings: { address: obsAddress, password: obsPassword, autoConnect: true }
        };
        setConfig(updated);
        handleSaveConfig(updated);
      }
    } catch (e) {
      console.error('OBS Connect Error:', e);
    }
  };

  // Add a button to current page
  const handleAddButton = () => {
    if (!activePage) return;
    const newBtn = {
      id: `btn_${Date.now()}`,
      label: 'New Button',
      sublabel: 'Action',
      icon: 'Sparkles',
      color: '#3b82f6',
      action: { type: 'hotkey', keys: 'F13' }
    };

    const updatedPages = config.pages.map(p => {
      if (p.id === activePage.id) {
        return { ...p, buttons: [...(p.buttons || []), newBtn] };
      }
      return p;
    });

    const updated = { ...config, pages: updatedPages };
    setConfig(updated);
    handleSaveConfig(updated);
    setEditingBtn(newBtn);
  };

  // Update button in config
  const handleSaveButtonModal = () => {
    if (!editingBtn || !activePage) return;

    const updatedPages = config.pages.map(p => {
      if (p.id === activePage.id) {
        const updatedButtons = p.buttons.map(b => b.id === editingBtn.id ? editingBtn : b);
        return { ...p, buttons: updatedButtons };
      }
      return p;
    });

    const updated = { ...config, pages: updatedPages };
    setConfig(updated);
    handleSaveConfig(updated);
    setEditingBtn(null);
  };

  // Delete button
  const handleDeleteButton = (btnId) => {
    if (!confirm('Hapus tombol ini?')) return;
    const updatedPages = config.pages.map(p => {
      if (p.id === activePage.id) {
        return { ...p, buttons: p.buttons.filter(b => b.id !== btnId) };
      }
      return p;
    });

    const updated = { ...config, pages: updatedPages };
    setConfig(updated);
    handleSaveConfig(updated);
    setEditingBtn(null);
  };

  // Add Page
  const handleAddPage = () => {
    const name = prompt('Nama Halaman Baru:');
    if (!name) return;
    const newPage = {
      id: `page_${Date.now()}`,
      name: name,
      gridCols: 4,
      gridRows: 3,
      buttons: []
    };
    const updated = { ...config, pages: [...config.pages, newPage] };
    setConfig(updated);
    setActivePageId(newPage.id);
    handleSaveConfig(updated);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07090e' }}>
      {/* Studio Navigation Bar */}
      <header className="glass-nav" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)' }}>
            <SlidersHorizontal size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MyStreamBoard Studio
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>
              PC DECK CONFIGURATOR & DASHBOARD
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* QR Code Quick Connect for Phone */}
          <button 
            className="btn-secondary" 
            onClick={() => setShowQrModal(true)}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <QrCode size={16} color="#06b6d4" />
            <span>Sambungkan HP</span>
          </button>

          {/* Test Deck on this screen */}
          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('deck')}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <Smartphone size={16} color="#3b82f6" />
            <span>Buka Deck Controller</span>
          </button>

          {/* Save Status */}
          <button 
            className="btn-primary" 
            onClick={() => handleSaveConfig()}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{saveSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar: Pages & Integrations */}
        <aside style={{ width: '320px', borderRight: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(11, 14, 22, 0.6)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Pages Manager */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Halaman Deck</span>
              <button 
                onClick={handleAddPage}
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700' }}
              >
                <Plus size={14} /> Tambah
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {config?.pages?.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setActivePageId(p.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: p.id === activePageId ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${p.id === activePageId ? 'rgba(59, 130, 246, 0.4)' : 'transparent'}`,
                    color: p.id === activePageId ? '#fff' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{p.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.buttons?.length || 0} tombol</span>
                </div>
              ))}
            </div>
          </div>

          {/* OBS Studio Integration Settings */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Radio size={16} color="#ef4444" />
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OBS Studio WebSocket</span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Server Address</label>
              <input 
                type="text" 
                className="input-field" 
                value={obsAddress} 
                onChange={(e) => setObsAddress(e.target.value)} 
                placeholder="ws://127.0.0.1:4455"
                style={{ fontSize: '0.8rem', padding: '8px 10px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Password (kosong jika tanpa password)</label>
              <input 
                type="password" 
                className="input-field" 
                value={obsPassword} 
                onChange={(e) => setObsPassword(e.target.value)} 
                placeholder="Optional"
                style={{ fontSize: '0.8rem', padding: '8px 10px' }}
              />
            </div>

            <button 
              className={obsStatus.connected ? 'btn-secondary' : 'btn-primary'}
              onClick={handleConnectObs}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: obsStatus.connected ? '#10b981' : '#ef4444', display: 'inline-block', marginRight: '6px' }}></span>
              {obsStatus.connected ? 'OBS Terhubung' : 'Sambungkan ke OBS'}
            </button>
          </div>

          {/* Info Card */}
          <div style={{ marginTop: 'auto', padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.72rem', color: '#64748b' }}>
            <div>MyStreamBoard v1.0.0</div>
            <div>© 2026 Dzikri Arya Sahputra</div>
            <div>Proprietary Commercial Software</div>
          </div>
        </aside>

        {/* Center: Interactive Grid Layout Editor */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{activePage?.name || 'Pilih Halaman'}</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Klik tombol apa saja di bawah untuk mengedit fungsi shortcut, audio, atau tampilannya.</p>
            </div>

            <button className="btn-primary" onClick={handleAddButton} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Tambah Tombol
            </button>
          </div>

          {/* Interactive Button Grid */}
          <div 
            className="deck-grid" 
            style={{ 
              gridTemplateColumns: `repeat(${activePage?.gridCols || 4}, 1fr)`,
              maxWidth: '900px',
              margin: '0 auto',
              width: '100%'
            }}
          >
            {activePage?.buttons?.map((btn) => (
              <div 
                key={btn.id}
                className="deck-key"
                style={{ '--key-color': btn.color || '#3b82f6' }}
                onClick={() => setEditingBtn({ ...btn })}
              >
                <div 
                  className="key-icon-wrapper"
                  style={{
                    background: `${btn.color || '#3b82f6'}15`,
                    color: btn.color || '#3b82f6'
                  }}
                >
                  <DynamicIcon name={btn.icon || 'CircleDot'} size={24} />
                </div>
                <div className="key-label">{btn.label}</div>
                {btn.sublabel && <div className="key-sublabel">{btn.sublabel}</div>}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Button Edit Modal */}
      {editingBtn && (
        <div className="modal-overlay" onClick={() => setEditingBtn(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Edit Tombol Stream Deck</h3>
              <button onClick={() => setEditingBtn(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Label & Sublabel */}
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

            {/* Color Swatches */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Warna Aksen</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {PRESET_COLORS.map(c => (
                  <div 
                    key={c}
                    onClick={() => setEditingBtn({ ...editingBtn, color: c })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: c,
                      cursor: 'pointer',
                      border: editingBtn.color === c ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: editingBtn.color === c ? `0 0 10px ${c}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Pilih Ikon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', maxHeight: '110px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                {PRESET_ICONS.map(iconName => (
                  <div 
                    key={iconName}
                    onClick={() => setEditingBtn({ ...editingBtn, icon: iconName })}
                    style={{
                      aspectRatio: '1/1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: editingBtn.icon === iconName ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      color: editingBtn.icon === iconName ? '#3b82f6' : '#94a3b8'
                    }}
                  >
                    <DynamicIcon name={iconName} size={18} />
                  </div>
                ))}
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
                <option value="hotkey">Keyboard Hotkey / Shortcut (TikTok Studio, Discord, Game)</option>
                <option value="sound">Soundboard (Putar Suara Efek)</option>
                <option value="stop_sounds">Stop Semua Audio Soundboard</option>
                <option value="obs_scene">OBS Studio: Ganti Scene</option>
                <option value="obs_mute">OBS Studio: Toggle Mute Audio</option>
                <option value="obs_record">OBS Studio: Toggle Recording</option>
                <option value="obs_stream">OBS Studio: Toggle Streaming</option>
                <option value="app">Buka Program / Aplikasi / URL</option>
              </select>

              {/* Dynamic Action Fields */}
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

              {editingBtn.action?.type === 'obs_scene' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Nama Scene OBS</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editingBtn.action.scene || ''} 
                    onChange={(e) => setEditingBtn({ ...editingBtn, action: { ...editingBtn.action, scene: e.target.value } })}
                  />
                </div>
              )}

              {editingBtn.action?.type === 'obs_mute' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Nama Audio Source di OBS</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editingBtn.action.input || 'Mic/Aux'} 
                    onChange={(e) => setEditingBtn({ ...editingBtn, action: { ...editingBtn.action, input: e.target.value } })}
                  />
                </div>
              )}

              {editingBtn.action?.type === 'app' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>Path Aplikasi / File / URL Website</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editingBtn.action.target || ''} 
                    onChange={(e) => setEditingBtn({ ...editingBtn, action: { ...editingBtn.action, target: e.target.value } })}
                    placeholder="misal: obs64.exe atau https://twitch.tv"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <button 
                onClick={() => handleDeleteButton(editingBtn.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Trash2 size={16} /> Hapus
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setEditingBtn(null)}>Batal</button>
                <button className="btn-primary" onClick={handleSaveButtonModal}>Simpan Tombol</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect QR Code Modal */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Sambungkan Smartphone Kamu</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '18px' }}>
              Pastikan HP dan PC berada dalam jaringan Wi-Fi yang sama, lalu scan QR Code di bawah dengan kamera HP:
            </p>

            {serverInfo?.qrDataUrl ? (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                <img src={serverInfo.qrDataUrl} alt="QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#64748b' }}>Memuat QR Code...</div>
            )}

            <div style={{ fontSize: '0.85rem', color: '#f8fafc', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px', display: 'inline-block', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
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
