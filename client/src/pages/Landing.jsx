import React, { useState } from 'react';
import DynamicIcon from '../components/DynamicIcon';
import { 
  SlidersHorizontal, 
  Smartphone, 
  Radio, 
  Volume2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  ArrowRight, 
  CheckCircle2,
  Tv,
  Layers,
  ExternalLink
} from 'lucide-react';

export default function Landing({ onNavigate }) {
  const [demoPressed, setDemoPressed] = useState(null);

  const demoButtons = [
    { id: 'd1', label: 'minispong... have fun', sub: '', image: '/uploads/spongebob.jpg', imageMode: 'full' },
    { id: 'd2', label: 'Speed Hype', sub: '', image: '/uploads/speed.jpg', imageMode: 'full' },
    { id: 'd3', label: 'Stay With Me', sub: '', image: '/uploads/synthwave.jpg', imageMode: 'full' },
    { id: 'd4', label: 'Vine Boom', sub: '', image: '/uploads/boom.svg', imageMode: 'thumbnail' },
    { id: 'd5', label: 'Gameplay', sub: 'OBS Scene', image: '/uploads/obs.svg', imageMode: 'thumbnail' },
    { id: 'd6', label: 'TikTok S1', sub: 'Ctrl+F1', image: '/uploads/tiktok.svg', imageMode: 'thumbnail' },
    { id: 'd7', label: 'Discord Mute', sub: 'Ctrl+Shift+M', image: '/uploads/discord.svg', imageMode: 'thumbnail' },
    { id: 'd8', label: 'Screenshot', sub: 'Win+Shift+S', icon: 'Camera' }
  ];

  const handleDemoClick = (id) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setDemoPressed(id);
    setTimeout(() => setDemoPressed(null), 250);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f5f5f5', overflowX: 'hidden' }}>
      <div className="ambient-bg"></div>

      {/* Navbar */}
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#141414', border: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px' }}>
            <img src="/app-icon.png" alt="MyStreamBoard" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f5f5f5' }}>
            MyStreamBoard
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => onNavigate('studio')}>
            <SlidersHorizontal size={16} />
            <span>PC Studio</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigate('deck')}>
            <Smartphone size={16} />
            <span>Buka Controller</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: '#141414', border: '1px solid #262626', color: '#e5e5e5', fontSize: '0.8rem', fontWeight: '700', marginBottom: '24px' }}>
          <Zap size={14} color="#f5f5f5" /> ZERO-LATENCY SMARTPHONE STREAM DECK & SOUNDBOARD
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '20px', color: '#ffffff' }}>
          Ubah Smartphone Menjadi <br />
          <span style={{ color: '#a3a3a3' }}>
            Stream Deck & Soundboard
          </span> Profesional
        </h1>

        <p style={{ maxWidth: '660px', margin: '0 auto 32px', fontSize: '1.05rem', color: '#888888', lineHeight: 1.6 }}>
          Kendalikan OBS Studio, TikTok Live Studio, Discord, dan Soundboard langsung dari layar smartphone via jaringan Wi-Fi lokal dengan latensi instan.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button className="btn-primary" onClick={() => onNavigate('deck')} style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '12px' }}>
            <Smartphone size={18} />
            <span>Jadikan HP Sebagai Controller</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('studio')} style={{ padding: '12px 20px', fontSize: '0.95rem', borderRadius: '12px' }}>
            <SlidersHorizontal size={18} />
            <span>Kustomisasi di PC Studio</span>
          </button>
        </div>

        {/* Live Interactive Deck Showcase */}
        <div style={{ maxWidth: '780px', margin: '0 auto', background: '#111111', border: '1px solid #222222', borderRadius: '20px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #1c1c1c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#444' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#444' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#444' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '6px' }}>Interactive Live Preview</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a3a3a3', background: '#1a1a1a', padding: '4px 10px', borderRadius: '12px', border: '1px solid #2c2c2c' }}>
              ONLINE DEMO
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {demoButtons.map(btn => {
              const isPressed = demoPressed === btn.id;
              const isFullArtwork = btn.imageMode === 'full' && btn.image;

              return (
                <div 
                  key={btn.id}
                  className={`deck-card ${isFullArtwork ? 'full-artwork' : 'thumb-artwork'}`}
                  style={{
                    transform: isPressed ? 'scale(0.92)' : 'none',
                    borderColor: isPressed ? '#888' : undefined
                  }}
                  onClick={() => handleDemoClick(btn.id)}
                >
                  {isFullArtwork ? (
                    <>
                      <img src={btn.image} alt={btn.label} className="card-bg-image" />
                      <div className="card-content-overlay">
                        <div className="card-title">{btn.label}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="thumb-img-wrapper">
                        {btn.image ? (
                          <img src={btn.image} alt={btn.label} />
                        ) : (
                          <DynamicIcon name={btn.icon || 'CircleDot'} size={24} color="#a3a3a3" />
                        )}
                      </div>
                      <div className="card-title" style={{ textAlign: 'center' }}>{btn.label}</div>
                      {btn.sub && <div className="card-keybind" style={{ textAlign: 'center' }}>{btn.sub}</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '40px auto 60px', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px', color: '#fff' }}>
          Dibuat Untuk Streamer & Content Creator
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '14px', border: '1px solid #2c2c2c' }}>
              <Radio size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>OBS Studio 2-Way Feedback</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Ganti scene, mute mic, dan toggle live stream dengan sinkronisasi status 2 arah secara realtime melalui protokol resmi OBS WebSocket.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '14px', border: '1px solid #2c2c2c' }}>
              <Tv size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>TikTok Live Studio Ready</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Dukungan Virtual Global Hotkey Windows untuk mengontrol TikTok Live Studio, Discord (mute/deafen), game, dan software lainnya tanpa batasan.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '14px', border: '1px solid #2c2c2c' }}>
              <Volume2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>Dual Soundboard Engine</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Mainkan efek suara meme & audio FX (Airhorn, Rimshot, Vine Boom) langsung ke stream audio Windows atau virtual audio cable agar penonton bisa mendengarnya.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Setup */}
      <section style={{ maxWidth: '850px', margin: '20px auto 60px', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '28px', color: '#fff' }}>
          Mulai Dalam 3 Langkah
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', textAlign: 'left' }}>
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#737373', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>01</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px', color: '#fff' }}>Jalankan Server PC</h4>
            <p style={{ fontSize: '0.82rem', color: '#888' }}>Jalankan aplikasi MyStreamBoard di laptop atau PC Windows kamu.</p>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#737373', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>02</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px', color: '#fff' }}>Scan QR Code</h4>
            <p style={{ fontSize: '0.82rem', color: '#888' }}>Buka kamera smartphone kamu dan scan QR code yang muncul di layar PC.</p>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#737373', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>03</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px', color: '#fff' }}>Langsung Pakai</h4>
            <p style={{ fontSize: '0.82rem', color: '#888' }}>Nikmati Stream Deck & Soundboard gratis dengan responsivitas instan.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '28px 24px', textAlign: 'center', background: '#0a0a0a' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: '#fff' }}>
          MyStreamBoard
        </div>
        <p style={{ fontSize: '0.78rem', color: '#737373', marginBottom: '6px' }}>
          Copyright (c) 2026 <strong>Dzikri Arya Sahputra</strong>. All rights reserved.
        </p>
        <p style={{ fontSize: '0.7rem', color: '#555' }}>
          Commercial Proprietary Software • Contact: tomoriid62@gmail.com • mystreamboard.pages.dev
        </p>
      </footer>
    </div>
  );
}
