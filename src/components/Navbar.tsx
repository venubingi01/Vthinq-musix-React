'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { Sparkles, Sliders, Search, Music2, Quote, Car } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { setIsAiChatOpen } = useMusic();
  const pathname = usePathname();

  if (pathname?.startsWith('/car')) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo - Next.js Link to Home */}
        <Link href="/" className="brand-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon-wrapper">
            <Music2 className="logo-icon" size={24} />
          </div>
          <div className="logo-text">
            <span className="logo-title">Sangeetham</span>
            <span className="logo-badge">AI Music Player</span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Quick Search Link */}
          <Link
            href="/search"
            className={`action-btn ${pathname === '/search' ? 'active' : ''}`}
            title="Search Music"
            style={{ textDecoration: 'none' }}
          >
            <Search size={19} />
            <span className="btn-label-desktop">Search</span>
          </Link>

          {/* Dedicated Albums Link */}
          {/* <Link
            href="/search?tab=albums"
            className={`action-btn ${pathname.startsWith('/album') ? 'active' : ''}`}
            title="Browse Albums"
            style={{ textDecoration: 'none' }}
          >
            <Disc size={19} />
            <span className="btn-label-desktop">Albums</span>
          </Link> */}

          {/* Synced Lyrics & Visualizer Link */}
          <Link
            href="/player"
            className={`action-btn lyrics-nav-btn ${pathname === '/player' ? 'active' : ''}`}
            title="Synced Lyrics & Visualizer"
            style={{ textDecoration: 'none' }}
          >
            <Quote size={18} />
            <span className="btn-label-desktop">Lyrics</span>
          </Link>

          {/* Equalizer & Spatial Audio Link */}
          <Link
            href="/equalizer"
            className={`action-btn ${pathname === '/equalizer' ? 'active' : ''}`}
            title="Audio Equalizer & 3D"
            style={{ textDecoration: 'none' }}
          >
            <Sliders size={19} />
            <span className="btn-label-desktop">EQ & 3D</span>
          </Link>

          {/* Car Mode Link */}
          <Link
            href="/car"
            className="action-btn car-mode-nav-btn"
            title="Sangeetham Car Mode"
            style={{ textDecoration: 'none' }}
          >
            <Car size={19} />
            <span className="btn-label-desktop">Car Mode</span>
          </Link>

          {/* Ask AI Music Assistant Trigger */}
          <button
            className="action-btn ai-sparkle-btn"
            onClick={() => setIsAiChatOpen(true)}
            title="Ask AI Music Assistant"
            aria-label="AI Music Assistant"
          >
            <Sparkles size={18} className="sparkle-icon" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
