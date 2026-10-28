'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { Home, Search, Heart, PlayCircle, Sliders } from 'lucide-react';

interface NavRouteItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ROUTES: NavRouteItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/player', label: 'Player', icon: PlayCircle },
  { href: '/equalizer', label: 'EQ & 3D', icon: Sliders }
];

export const BottomNav: React.FC = () => {
  const { favorites } = useMusic();
  const pathname = usePathname();

  if (pathname?.startsWith('/car')) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ROUTES.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-tab-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
              style={{ textDecoration: 'none' }}
            >
              <div className="nav-icon-container">
                <Icon size={20} className="nav-tab-icon" />
                {item.href === '/favorites' && favorites.length > 0 && (
                  <span className="nav-badge">{favorites.length}</span>
                )}
              </div>
              <span className="nav-tab-label">{item.label}</span>
              {isActive && <div className="nav-active-pill" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
