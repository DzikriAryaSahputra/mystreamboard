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
  ExternalLink
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07090e' }}>
      {/* Top Bar Header */}
      <header className="glass-nav" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)' }}>
              <SlidersHorizontal size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MyStreamBoard
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.04em' }}>
                SMARTPHONE DECK CONTROLLER
              </div>
            </div>
          </div>

          {/* Connection Status Badge */}
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              background: connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '20px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: connected ? '#10b981' : '#ef4444',
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
            <div className="badge-live">
              <span className="dot-pulse"></span> LIVE
            </div>
          )}

          {obsStatus.recording && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
              <Circle size={8} fill="#ef4444" /> REC
            </div>
          )}

          <button 
            onClick={toggleFullscreen}
            title="Fullscreen Mode"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Maximize2 size={16} />
          </button>

          <button 
            onClick={() => onNavigate('studio')}
            title="Open PC Studio Editor"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </header>

      {/* Page Selector Tabs */}
      {config?.pages && config.pages.length > 0 && (
        <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(10, 13, 20, 0.5)' }}>
          {config.pages.map((p) => {
            const isActive = p.id === activePageId;
            return (
              <button
                key={p.id}
                onClick={() => setActivePageId(p.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none'
                }}
              >
                {p.name}
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

            return (
              <div
                key={btn.id}
                className={`deck-card ${isFullArtwork ? 'full-artwork' : 'thumb-artwork'} ${isPressed ? 'active-pressed' : ''}`}
                style={{
                  '--border-focus': btn.color || '#8b5cf6',
                  transform: isPressed ? 'scale(0.92)' : 'none',
                  borderColor: isPressed ? '#8b5cf6' : undefined,
                  boxShadow: isPressed ? '0 0 24px rgba(139, 92, 246, 0.6)' : undefined
                }}
                onClick={() => handleButtonPress(btn)}
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
                    <div className="thumb-img-wrapper" style={{ borderColor: isPressed ? '#8b5cf6' : 'rgba(255,255,255,0.08)' }}>
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
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
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
