import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Deck from './pages/Deck';
import Studio from './pages/Studio';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'deck') return 'deck';
    if (mode === 'studio') return 'studio';

    // If opened on smartphone or standalone PWA, default directly to deck
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isMobile || isStandalone) {
      return 'deck';
    }

    return 'landing';
  });

  const handleNavigate = (page) => {
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
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || 'landing';
      setCurrentPage(mode);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (currentPage === 'deck') {
    return <Deck onNavigate={handleNavigate} />;
  }

  if (currentPage === 'studio') {
    return <Studio onNavigate={handleNavigate} />;
  }

  return <Landing onNavigate={handleNavigate} />;
}
