'use client';

import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  Disc,
  Music,
  Quote
} from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { shareModalData, closeShareModal, showToast } = useMusic();
  const [copied, setCopied] = useState<boolean>(false);

  if (!shareModalData) return null;

  const { title, subtitle, url, image, type = 'song' } = shareModalData;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('🔗 Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      showToast('Link: ' + url);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Sangeetham AI Music Player`,
          text: `Listen to "${title}" on Sangeetham AI Music Player!`,
          url: url
        });
        closeShareModal();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Social share intent URLs
  const shareText = `Listen to "${title}" ${subtitle ? `by ${subtitle}` : ''} on Sangeetham AI Music Player! 🎶`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`${title} on Sangeetham`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="share-modal-backdrop" onClick={closeShareModal}>
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-header-left">
            <Share2 size={20} className="text-pink" />
            <h2 id="share-modal-title">Share {type === 'album' ? 'Album' : type === 'lyrics' ? 'Lyrics' : 'Song'}</h2>
          </div>
          <button
            className="share-modal-close-btn"
            onClick={closeShareModal}
            aria-label="Close share dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Card */}
        <div className="share-preview-card">
          {image && (
            <div className="share-preview-thumb-wrap">
              <img src={image} alt={title} className="share-preview-thumb" />
            </div>
          )}
          <div className="share-preview-meta">
            <span className="share-type-badge">
              {type === 'album' ? (
                <>
                  <Disc size={12} /> ALBUM
                </>
              ) : type === 'lyrics' ? (
                <>
                  <Quote size={12} /> SYNCED LYRICS
                </>
              ) : (
                <>
                  <Music size={12} /> TRACK
                </>
              )}
            </span>
            <h3 className="share-preview-title" title={title}>{title}</h3>
            {subtitle && <p className="share-preview-subtitle" title={subtitle}>{subtitle}</p>}
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="share-link-box">
          <input
            type="text"
            readOnly
            value={url}
            className="share-link-input"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            className={`share-copy-btn ${copied ? 'copied-success' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Native Web Share Button (Mobile & Supported Desktops) */}
        {hasNativeShare && (
          <button className="share-native-btn" onClick={handleNativeShare}>
            <Share2 size={17} />
            <span>Share via Apps / AirDrop</span>
          </button>
        )}

        {/* Social Share Grid */}
        <div className="share-social-section">
          <span className="share-social-heading">Share directly to</span>
          <div className="share-social-grid">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn whatsapp-btn"
              title="Share on WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.676.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.494c-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.235-.244-.587-.492-.507-.677-.516-.175-.008-.376-.01-.576-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.228 3.109.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.58-.087 1.78-.727 2.03-1.43.251-.702.251-1.304.176-1.43-.076-.125-.276-.2-.577-.35zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.438 5.176L2 22l4.981-1.397A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn telegram-btn"
              title="Share on Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
              </svg>
              <span>Telegram</span>
            </a>

            {/* X (Twitter) */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn twitter-btn"
              title="Share on X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn facebook-btn"
              title="Share on Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              <span>Facebook</span>
            </a>

            {/* Email */}
            <a
              href={emailUrl}
              className="social-btn email-btn"
              title="Share via Email"
            >
              <Mail size={19} />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
