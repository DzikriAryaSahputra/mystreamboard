import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Deck from './pages/Deck';
import Studio from './pages/Studio';

// Helper to reliably detect smartphones and mobile screens
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchScreen = window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth <= 820;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isMobileUA || (isTouchScreen && isSmallScreen) || isStandalone;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const isMobile = isMobileDevice();

    // Mobile phones are ALWAYS locked to deck mode
    if (isMobile) {
      return 'deck';
    }

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'deck') return 'deck';
    if (mode === 'studio') return 'studio';

    return 'landing';
  });

  const handleNavigate = (page) => {
    // Prevent mobile devices from entering PC Studio desktop view
    if (isMobileDevice() && page === 'studio') {
      page = 'deck';
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location);
    if (page === 'landing') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', page);
    }
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    const isMobile = isMobileDevice();

    // If on mobile device, enforce deck controller mode
    if (isMobile && currentPage !== 'deck') {
      setCurrentPage('deck');
      const url = new URL(window.location);
      url.searchParams.set('mode', 'deck');
      window.history.replaceState({}, '', url);
    }

    const onPopState = () => {
      if (isMobileDevice()) {
        setCurrentPage('deck');
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || 'landing';
      setCurrentPage(mode);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentPage]);

  if (currentPage === 'deck') {
    return <Deck onNavigate={handleNavigate} />;
  }

  if (currentPage === 'studio') {
    return <Studio onNavigate={handleNavigate} />;
  }

  return <Landing onNavigate={handleNavigate} />;
}
