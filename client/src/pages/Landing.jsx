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
  ExternalLink
} from 'lucide-react';

export default function Landing({ onNavigate }) {
  const [demoPressed, setDemoPressed] = useState(null);

  const demoButtons = [
    { id: 'd1', label: 'Gameplay', sub: 'OBS Scene', icon: 'Gamepad2', color: '#3b82f6' },
    { id: 'd2', label: 'Chatting', sub: 'OBS Scene', icon: 'MessageSquare', color: '#8b5cf6' },
    { id: 'd3', label: 'Mic Mute', sub: 'OBS Audio', icon: 'Mic', color: '#ef4444' },
    { id: 'd4', label: 'TikTok S1', sub: 'Ctrl+F1', icon: 'Video', color: '#06b6d4' },
    { id: 'd5', label: 'Airhorn', sub: 'Soundboard', icon: 'Megaphone', color: '#f97316' },
    { id: 'd6', label: 'Ba-Dum-Tss', sub: 'Soundboard', icon: 'Drum', color: '#eab308' },
    { id: 'd7', label: 'Vine Boom', sub: 'Soundboard', icon: 'Bomb', color: '#ef4444' },
    { id: 'd8', label: 'Victory', sub: 'Soundboard', icon: 'Trophy', color: '#10b981' }
  ];

  const handleDemoClick = (id) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    setDemoPressed(id);
    setTimeout(() => setDemoPressed(null), 250);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07090e', color: '#f8fafc', overflowX: 'hidden' }}>
      <div className="ambient-bg"></div>

      {/* Navbar */}
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)' }}>
            <SlidersHorizontal size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#38bdf8', fontSize: '0.82rem', fontWeight: '700', marginBottom: '24px' }}>
          <Zap size={14} color="#38bdf8" /> 100% GRATIS & ZERO-LATENCY SMARTPHONE STREAM DECK
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '20px' }}>
          Ubah HP Kamu Menjadi <br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Stream Deck & Soundboard
          </span> Profesional
        </h1>

        <p style={{ maxWidth: '680px', margin: '0 auto 32px', fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6 }}>
          Kendalikan OBS Studio, TikTok Live Studio, Discord, dan Soundboard langsung dari layar smartphone kamu via Wi-Fi lokal tanpa kabel dan tanpa batasan jumlah tombol.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button className="btn-primary" onClick={() => onNavigate('deck')} style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '14px' }}>
            <Smartphone size={20} />
            <span>Jadikan HP Sebagai Controller</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('studio')} style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '14px' }}>
            <SlidersHorizontal size={20} />
            <span>Kustomisasi di PC Studio</span>
          </button>
        </div>

        {/* Live Interactive Deck Showcase */}
        <div style={{ maxWidth: '780px', margin: '0 auto', background: 'rgba(15, 19, 30, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '6px' }}>Interactive Live Preview — Coba Klik Tombol di Bawah</span>
            </div>
            <div className="badge-live">
              <span className="dot-pulse"></span> DEMO ACTIVE
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {demoButtons.map(btn => {
              const isPressed = demoPressed === btn.id;
              return (
                <div 
                  key={btn.id}
                  className="deck-key"
                  style={{
                    '--key-color': btn.color,
                    transform: isPressed ? 'scale(0.92)' : 'none'
                  }}
                  onClick={() => handleDemoClick(btn.id)}
                >
                  <div 
                    className="key-icon-wrapper"
                    style={{
                      background: `${btn.color}20`,
                      color: btn.color,
                      boxShadow: isPressed ? `0 0 20px ${btn.color}` : 'none'
                    }}
                  >
                    <DynamicIcon name={btn.icon} size={22} />
                  </div>
                  <div className="key-label">{btn.label}</div>
                  <div className="key-sublabel">{btn.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '36px' }}>
          Dibuat Khusus Untuk Streamer & Content Creator
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '18px' }}>
              <Radio size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>OBS Studio 2-Way Feedback</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Ganti scene, mute mic, dan toggle live stream dengan sinkronisasi status 2 arah secara realtime melalui protokol resmi OBS WebSocket.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '18px' }}>
              <Tv size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>TikTok Live Studio Ready</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Dukungan Virtual Global Hotkey Windows untuk mengontrol TikTok Live Studio, Discord (mute/deafen), game, dan software lainnya tanpa ribet.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', marginBottom: '18px' }}>
              <Volume2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>Dual Soundboard Engine</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Mainkan efek suara meme & audio FX (Airhorn, Rimshot, Vine Boom) langsung ke stream audio Windows atau virtual audio cable agar penonton bisa mendengarnya.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Setup */}
      <section style={{ maxWidth: '850px', margin: '40px auto 80px', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px' }}>
          Mulai Hanya Dalam 3 Langkah
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', textAlign: 'left' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>01</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Jalankan Server di PC</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Jalankan aplikasi MyStreamBoard di laptop atau PC Windows kamu.</p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8b5cf6', marginBottom: '8px' }}>02</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Scan QR Code dari HP</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Buka kamera smartphone kamu dan scan QR code yang muncul di layar PC.</p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>03</div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Langsung Pakai!</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Nikmati Stream Deck & Soundboard gratis dengan responsivitas instan.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '32px 24px', textAlign: 'center', background: 'rgba(5, 7, 12, 0.95)' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px', color: '#fff' }}>
          MyStreamBoard
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
          Copyright © 2026 <strong>Dzikri Arya Sahputra</strong>. All rights reserved.
        </p>
        <p style={{ fontSize: '0.72rem', color: '#475569' }}>
          Commercial Proprietary Software • Contact: tomoriid62@gmail.com • mystreamboard.pages.dev
        </p>
      </footer>
    </div>
  );
}
