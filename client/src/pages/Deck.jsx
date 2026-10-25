import React, { useState, useEffect, useRef } from 'react';
import DynamicIcon from '../components/DynamicIcon';
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  Maximize2, 
  Radio, 
  Volume2, 
  VolumeX, 
  Circle, 
  SlidersHorizontal,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';


export default function Deck({ onNavigate }) {
  const [serverHost, setServerHost] = useState(() => {
    return localStorage.getItem('mystreamboard_host') || window.location.hostname || '127.0.0.1';
  });
  const [serverPort, setServerPort] = useState(() => {
    return localStorage.getItem('mystreamboard_port') || window.location.port || '4829';
  });

  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState(null);
  const [activePageId, setActivePageId] = useState('');
  const [obsStatus, setObsStatus] = useState({ connected: false, recording: false, streaming: false, currentScene: '' });
  const [pressedBtnId, setPressedBtnId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempHost, setTempHost] = useState(serverHost);
  const [tempPort, setTempPort] = useState(serverPort);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    let isMounted = true;

    function connectWs() {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const wsUrl = `ws://${serverHost}:${serverPort}`;
      console.log(`[Deck] Connecting to ${wsUrl}...`);

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('[Deck] Connected to MyStreamBoard server!');
          setConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'INIT') {
              setConfig(msg.data.config);
              setActivePageId(msg.data.config.activePageId || msg.data.config.pages[0]?.id);
              if (msg.data.obsConnected !== undefined) {
                setObsStatus(prev => ({ ...prev, connected: msg.data.obsConnected }));
              }
            } else if (msg.type === 'CONFIG_UPDATED') {
              setConfig(msg.data);
            } else if (msg.type === 'OBS_EVENT') {
              const ev = msg.data;
              if (ev.connected !== undefined) {
                setObsStatus(prev => ({ ...prev, ...ev }));
              }
              if (ev.event === 'sceneChanged') {
                setObsStatus(prev => ({ ...prev, currentScene: ev.currentScene }));
              }
              if (ev.event === 'recordChanged') {
                setObsStatus(prev => ({ ...prev, recording: ev.recording }));
              }
              if (ev.event === 'streamChanged') {
                setObsStatus(prev => ({ ...prev, streaming: ev.streaming }));
              }
            }
          } catch (e) {
            console.error('[Deck] Error parsing message:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setConnected(false);
          // Try reconnecting in 2.5s
          reconnectTimeoutRef.current = setTimeout(connectWs, 2500);
        };

        ws.onerror = (err) => {
          if (!isMounted) return;
          setConnected(false);
          ws.close();
        };

        wsRef.current = ws;
      } catch (err) {
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWs, 2500);
      }
    }

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [serverHost, serverPort]);

  // Handle Button Press
  const handleButtonPress = (btn) => {
    // 1. Haptic Feedback for physical Stream Deck tactile feel
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(28);
    }

    // 2. Visual pressed state animation
    setPressedBtnId(btn.id);
    setTimeout(() => setPressedBtnId(null), 200);

    // 3. Send trigger to server via WebSocket or Fallback HTTP
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'TRIGGER',
        buttonId: btn.id,
        action: btn.action
      }));
    } else {
      // Fallback REST API
      fetch(`http://${serverHost}:${serverPort}/api/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(btn.action)
      }).catch(err => console.error('[Deck] Fallback HTTP error:', err));
    }
  };

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Save server settings
  const handleSaveSettings = () => {
    setServerHost(tempHost);
    setServerPort(tempPort);
    localStorage.setItem('mystreamboard_host', tempHost);
    localStorage.setItem('mystreamboard_port', tempPort);
    setShowSettings(false);
  };

  const activePage = config?.pages?.find(p => p.id === activePageId) || config?.pages?.[0];
  const gridCols = activePage?.gridCols || 4;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080808' }}>
      <div className="ambient-bg"></div>

      {/* Top Bar Header */}
      <header className="glass-nav" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#141414', border: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
              <img src="/app-icon.png" alt="MyStreamBoard" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f5f5f5' }}>
                MyStreamBoard
              </div>
              <div style={{ fontSize: '0.62rem', color: '#737373', fontWeight: '600' }}>
                SMARTPHONE CONTROLLER
              </div>
            </div>
          </div>

          {/* Connection Status Badge */}
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              background: connected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${connected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: connected ? '#f5f5f5' : '#ef4444',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}
          >
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{connected ? 'ONLINE' : 'CONNECT'}</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {obsStatus.streaming && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', borderRadius: '16px', background: '#222', border: '1px solid #555', color: '#fff', fontSize: '0.7rem', fontWeight: '700' }}>
              <Radio size={12} /> LIVE
            </div>
          )}

          {obsStatus.recording && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', borderRadius: '16px', background: '#222', border: '1px solid #555', color: '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
              <Circle size={8} fill="#ef4444" /> REC
            </div>
          )}

          <button 
            onClick={toggleFullscreen}
            title="Fullscreen Mode"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#141414', border: '1px solid #222', color: '#a3a3a3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </header>

      {/* Page Selector Tabs */}
      {config?.pages && config.pages.length > 0 && (
        <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #1c1c1c', background: '#0a0a0a' }}>
          {config.pages.map((p) => {
            const isActive = p.id === activePageId;
            let TabIcon = SlidersHorizontal;
            let tabTitle = 'Page';
            const lower = (p.name + ' ' + (p.category || '')).toLowerCase();
            if (lower.includes('sound')) {
              TabIcon = Volume2;
              tabTitle = 'Soundboard';
            } else if (lower.includes('stream') || lower.includes('live') || lower.includes('obs')) {
              TabIcon = Radio;
              tabTitle = 'Stream';
            } else if (lower.includes('app') || lower.includes('media')) {
              TabIcon = Layers;
              tabTitle = 'Apps';
            } else {
              tabTitle = p.name.replace(/\p{Extended_Pictographic}|\p{Emoji}/gu, '').trim();
            }

            return (
              <button
                key={p.id}
                onClick={() => setActivePageId(p.id)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '20px',
                  background: isActive ? '#f5f5f5' : '#141414',
                  border: isActive ? '1px solid #ffffff' : '1px solid #222222',
                  color: isActive ? '#080808' : '#a3a3a3',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                <TabIcon size={14} color={isActive ? '#080808' : '#737373'} />
                <span>{tabTitle}</span>
              </button>
            );

          })}
        </div>
      )}


      {/* Main Stream Deck Grid */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: '14px',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto'
          }}
        >
          {activePage?.buttons?.map((btn) => {
            const isPressed = pressedBtnId === btn.id;
            const isFullArtwork = btn.imageMode === 'full' && btn.image;
            const isSoundboard = btn.category === 'Soundboard' || btn.action?.type === 'sound' || activePage.category === 'Soundboard';

            return (
              <div
                key={btn.id}
                className={`deck-card ${isFullArtwork ? 'full-artwork' : 'thumb-artwork'} ${isPressed ? 'active-pressed' : ''}`}
                style={{
                  transform: isPressed ? 'scale(0.92)' : 'none',
                  borderColor: isPressed ? '#888' : undefined,
                  boxShadow: isPressed ? '0 0 20px rgba(255, 255, 255, 0.3)' : undefined
                }}
                onClick={() => handleButtonPress(btn)}
              >
                {isFullArtwork ? (
                  <>
                    <img src={btn.image} alt={btn.label} className="card-bg-image" />
                    <div className="card-content-overlay">
                      <div className="card-title">{btn.label}</div>
                      {!isSoundboard && btn.sublabel && (
                        <div className="card-keybind">{btn.sublabel}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="thumb-img-wrapper">
                      {btn.image ? (
                        <img src={btn.image} alt={btn.label} />
                      ) : (
                        <DynamicIcon name={btn.icon || 'CircleDot'} size={28} color="#a3a3a3" />
                      )}
                    </div>
                    <div className="card-title" style={{ textAlign: 'center' }}>{btn.label}</div>
                    {!isSoundboard && btn.sublabel && (
                      <div className="card-keybind" style={{ textAlign: 'center' }}>{btn.sublabel}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>



      {/* Footer Branding */}
      <footer style={{ padding: '8px 16px', textAlign: 'center', fontSize: '0.72rem', color: '#475569', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
        MyStreamBoard © 2026 Dzikri Arya Sahputra. All rights reserved.
      </footer>

      {/* Connection & IP Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Pengaturan Server HP</h3>
              </div>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>

            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
              Masukkan Alamat IP Lokal PC kamu yang menjalankan server MyStreamBoard (misal: <code>192.168.1.15</code>).
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>IP Host PC</label>
              <input 
                type="text" 
                className="input-field" 
                value={tempHost} 
                onChange={(e) => setTempHost(e.target.value)} 
                placeholder="192.168.1.xxx atau 127.0.0.1"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Port Server</label>
              <input 
                type="text" 
                className="input-field" 
                value={tempPort} 
                onChange={(e) => setTempPort(e.target.value)} 
                placeholder="4829"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSaveSettings}>Simpan & Sambungkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
