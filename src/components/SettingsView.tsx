'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { AudioQuality } from '../types/music';
import {
  Settings,
  X,
  ExternalLink,
  MessageSquare,
  Coffee,
  QrCode,
  Copy,
  Check,
  Sliders,
  Sparkles,
  Volume2,
  Info,
  Star,
  Send,
  Loader2,
  Heart,
  ChevronRight,
  ShieldCheck,
  Radio,
  Download,
  CheckCircle2
} from 'lucide-react';

interface FeedbackData {
  name: string;
  email: string;
  category: string;
  rating: number;
  message: string;
}

export const SettingsView: React.FC = () => {
  const router = useRouter();
  const { showToast, currentSong, streamQuality, setStreamQuality } = useMusic();

  // Settings State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // PWA Install State
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    if (window.__deferredPwaPrompt) {
      setIsInstallable(true);
    }

    const handlePrompt = () => setIsInstallable(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      showToast('Sangeetham app installed successfully! 🎉');
    };

    window.addEventListener('pwa-prompt-available', handlePrompt);
    window.addEventListener('pwa-app-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePrompt);
      window.removeEventListener('pwa-app-installed', handleInstalled);
    };
  }, [showToast]);

  const handleInstallApp = async () => {
    if (isInstalled) {
      showToast('Sangeetham is already installed as a standalone app! 🚀');
      return;
    }

    const promptEvent = window.__deferredPwaPrompt;
    if (promptEvent) {
      try {
        setIsInstalling(true);
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          showToast('Installing Sangeetham App... 🎉');
          window.__deferredPwaPrompt = null;
          setIsInstalled(true);
          setIsInstallable(false);
        } else {
          showToast('App installation was dismissed.');
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
      return;
    }

    if (isIos) {
      showToast('To install on iOS: tap Share (⎋/📤) in Safari, then tap "Add to Home Screen" ➕');
      return;
    }

    showToast('To install: click the Install icon (⊕) in your browser address bar or menu (⋮) -> "Install Sangeetham" 🎵');
  };

  const handleQualityChange = (newQ: string) => {
    setStreamQuality(newQ as AudioQuality);
  };

  const handleCopyUpi = () => {
    const upiId = 'bgvenugopal2010@ybl';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(upiId).then(() => {
        setCopiedUpi(true);
        showToast('✅ UPI ID copied: bgvenugopal2010@ybl');
        setTimeout(() => setCopiedUpi(false), 2500);
      }).catch(() => {
        showToast('UPI: bgvenugopal2010@ybl');
      });
    } else {
      showToast('UPI: bgvenugopal2010@ybl');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Please enter your name and message.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      email: email.trim() || 'anonymous@sangeetham.web',
      category,
      rating: `${rating} / 5 Stars ⭐`,
      message: message.trim(),
      current_track: currentSong ? `${currentSong.name} - ${currentSong.artist}` : 'No track playing',
      stream_quality: `${streamQuality}kbps`,
      platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screen_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
      submitted_at: new Date().toLocaleString(),
      _subject: `✨ Sangeetham Feedback: [${category}] from ${name.trim()}`
    };

    // 1. Save local backup to localStorage
    try {
      const existingFb = JSON.parse(localStorage.getItem('sangeetham_feedback') || '[]');
      existingFb.push(payload);
      localStorage.setItem('sangeetham_feedback', JSON.stringify(existingFb));
    } catch (err) {
      console.warn('Could not save feedback to localStorage:', err);
    }

    // 2. Dispatch via FormSubmit endpoint
    try {
      await fetch('https://formsubmit.co/ajax/venubingi01@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Feedback network delivery note:', err);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    showToast(`Thank you, ${name}! Your feedback has been received. ❤️`);

    setTimeout(() => {
      setShowFeedbackModal(false);
      setSubmitSuccess(false);
      setName('');
      setEmail('');
      setMessage('');
      setRating(5);
    }, 1200);
  };

  return (
    <div className="settings-page-container">
      <div className="settings-card-wrapper">
        {/* Settings Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <h1 className="settings-main-title">About App</h1>
            <p className="settings-sub-title">Sangeetham AI Player 1.0.1</p>
          </div>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="settings-close-btn"
            title="Close Settings"
            aria-label="Close Settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="settings-body">
          {/* 1. Developer Profile Card */}
          <a
            href="https://www.linkedin.com/in/venu-bingi-bbb9689a"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-card dev-profile-link-card"
            title="View Venu Bingi on LinkedIn"
          >
            <div className="dev-avatar-wrapper">
              <img
                src="https://media.licdn.com/dms/image/v2/D4D03AQHb40mXB1FOkA/profile-displayphoto-crop_800_800/B4DaBDjoxxJoAI-/0/1787839811993?e=1789603200&v=beta&t=0HH3gvowNMxnl8JZHbqYThp0StBl1Qc2A5TOdQ7TrT0"
                alt="Venu Bingi Avatar"
                className="dev-avatar-img"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="dev-avatar-fallback">VB</div>
            </div>
            <div className="dev-info-content">
              <h4 className="dev-author-heading">
                Crafted with <Heart size={14} className="heart-inline-icon" /> by{' '}
                <strong className="dev-author-name">Venu Bingi</strong>{' '}
                <ExternalLink size={13} className="dev-ext-link-icon" />
              </h4>
              <p className="dev-author-bio">
                Building open-source audio experiences and AI developer tools for the web and mobile.
              </p>
            </div>
          </a>

          {/* 2. PWA App Install Card */}
          <div
            className={`settings-card install-pwa-theme-card ${isInstalled ? 'is-installed' : ''}`}
            onClick={handleInstallApp}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInstallApp();
              }
            }}
          >
            <div className="install-pwa-icon-box">
              {isInstalled ? (
                <CheckCircle2 size={24} className="install-icon-installed" />
              ) : (
                <Download size={24} className="install-icon-download" />
              )}
            </div>
            <div className="card-text-details">
              <div className="install-title-row">
                <h5 className="card-heading">
                  {isInstalled ? 'Sangeetham App Installed' : 'Install Sangeetham App'}
                </h5>
                <span className={`install-pill-tag ${isInstalled ? 'installed' : 'ready'}`}>
                  {isInstalled ? 'Installed ✓' : 'PWA App'}
                </span>
              </div>
              <p className="card-subheading">
                {isInstalled
                  ? 'Running as standalone application with offline support & instant launch.'
                  : 'Install on mobile or desktop for instant launch, offline listening & full-screen UI.'}
              </p>
            </div>
            <button
              type="button"
              className={`install-cta-btn ${isInstalled ? 'installed' : ''}`}
              disabled={isInstalling}
              onClick={(e) => {
                e.stopPropagation();
                handleInstallApp();
              }}
            >
              {isInstalling ? (
                <>
                  <Loader2 size={14} className="spinner-rotate" />
                  <span>Installing...</span>
                </>
              ) : isInstalled ? (
                <>
                  <Check size={14} />
                  <span>Installed</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Install App</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Send Feedback & Suggestions Button */}
          <button
            type="button"
            className="settings-card feedback-theme-btn"
            onClick={() => setShowFeedbackModal(true)}
          >
            <span className="card-emoji-icon">💬</span>
            <div className="card-text-details">
              <h5 className="card-heading">Send Feedback & Suggestions</h5>
              <p className="card-subheading">Rate the player, report bugs or request features</p>
            </div>
            <ChevronRight size={18} className="card-chevron-icon" />
          </button>

          {/* 3. Studio Equalizer & 3D Spatial Audio Quick Link */}
          <Link
            href="/equalizer"
            className="settings-card eq-theme-card"
            style={{ textDecoration: 'none' }}
          >
            <span className="card-emoji-icon">🎛️</span>
            <div className="card-text-details">
              <h5 className="card-heading">Studio Equalizer & 3D Spatial Audio</h5>
              <p className="card-subheading">Fine-tune acoustic frequencies, presets & 360° surround</p>
            </div>
            <ChevronRight size={18} className="card-chevron-icon" />
          </Link>

          {/* 5. Support & Funding Group */}
          <div className="funding-options-list">
            {/* Buy Me a Coffee */}
            <div className="settings-card coffee-theme-card">
              <span className="card-emoji-icon">☕</span>
              <div className="card-text-details">
                <h5 className="card-heading">Buy Me a Coffee</h5>
                <p className="card-subheading">Support the project with a 1 coffee contribution</p>
              </div>
            </div>

            {/* UPI QR & Copy Card */}
            <div className="upi-card-container">
              <div className="upi-title-row">
                <QrCode size={16} className="upi-title-icon" />
                <span>Scan & Pay via PhonePe / Any UPI App</span>
              </div>

              <div className="upi-qr-wrapper">
                <img
                  src="/images/phonepe_qr_square.png"
                  alt="PhonePe QR Code - B Venu"
                  className="upi-qr-image"
                  title="Scan & Pay using PhonePe, Google Pay, Paytm or any UPI App"
                />
                <div className="upi-qr-badge">
                  <Sparkles size={12} />
                  <span>Instant UPI Support (B VENU)</span>
                </div>
              </div>

              <div className="upi-input-group">
                <input
                  type="text"
                  value="bgvenugopal2010@ybl"
                  readOnly
                  className="upi-text-input"
                  aria-label="UPI ID"
                />
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="copy-upi-btn"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Details */}
          <div className="settings-info-footer">
            <p>
              Sangeetham AI Music • Built with React, Next.js & Web Audio API
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Feedback Modal Overlay */}
      {showFeedbackModal && (
        <div className="settings-modal-overlay active" onClick={() => setShowFeedbackModal(false)}>
          <div
            className="settings-modal-card feedback-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-box">
                <MessageSquare size={22} className="modal-header-icon" />
                <div>
                  <h3>Send Feedback</h3>
                  <p>Share your ideas or report issues to Venu Bingi</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowFeedbackModal(false)}
                title="Close Feedback"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="modal-form">
              {/* Star Rating */}
              <div className="form-group">
                <label>Overall Experience</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-btn ${starVal <= rating ? 'active' : ''}`}
                      onClick={() => setRating(starVal)}
                      title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star size={24} fill={starVal <= rating ? '#ffd00f' : 'transparent'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="form-row">
                <div className="form-group col-half">
                  <label htmlFor="fb_name">Name *</label>
                  <input
                    type="text"
                    id="fb_name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group col-half">
                  <label htmlFor="fb_email">
                    Email / Contact <span className="optional-label">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="fb_email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="fb_category">Category</label>
                <select
                  id="fb_category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">💬 General Feedback & Compliment</option>
                  <option value="Bug">🐛 Bug Report / Issue</option>
                  <option value="Feature">✨ Feature Request & Idea</option>
                  <option value="Audio">🎵 Music Playback & Audio FX</option>
                  <option value="UI">🎨 Design & User Experience</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="fb_message">Message *</label>
                <textarea
                  id="fb_message"
                  rows={4}
                  placeholder="Share your experience, suggest an idea, or report an issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="submit-modal-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin-loader" />
                    <span>Sending Feedback...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
