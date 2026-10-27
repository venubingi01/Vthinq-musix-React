'use client';

import React from 'react';

export const Footer: React.FC = () => {
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
