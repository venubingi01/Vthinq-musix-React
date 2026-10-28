'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/car')) return null;

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-code-tag">&lt;/&gt;</span>
        <span className="footer-text">
          Crafted with <span className="footer-heart">❤️</span> by{' '}
          <a
            href="https://www.linkedin.com/in/venu-bingi-bbb9689a"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-author-link"
            title="Venu Bingi on LinkedIn"
          >
            Venu Bingi
          </a>
        </span>
      </div>
    </footer>
  );
};
