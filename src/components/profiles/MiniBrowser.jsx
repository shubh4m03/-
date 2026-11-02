import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Copy, Check, Lock, Maximize2, Minimize2, RotateCw, X } from 'lucide-react';

/**
 * In-site, browser-styled overlay (no iframe, no navigation, no new tab).
 *
 * props:
 *  - tabs: [{ id, title, address, favicon, color, Dashboard }]
 *  - activeId, onTabChange(id)
 *  - originRect: DOMRect of the card that opened it (for the zoom-from-card animation)
 *  - onClose()
 *  - onLockChange(locked): lets the page pause its smooth-scroller while open
 */
export default function MiniBrowser({ tabs, activeId, onTabChange, originRect, onClose, onLockChange }) {
  const rootRef = useRef(null);
  const windowRef = useRef(null);
  const backdropRef = useRef(null);
  const closingRef = useRef(false);
  const lastFocus = useRef(null);
  const [maximized, setMaximized] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [status, setStatus] = useState({ refreshing: true });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState({ stack: [activeId], index: 0 });

  const active = tabs.find(t => t.id === activeId) || tabs[0];
  const Dashboard = active.Dashboard;

  // ── open animation (zoom from the originating card) ──
  useLayoutEffect(() => {
    lastFocus.current = document.activeElement;
    onLockChange?.(true);
    const win = windowRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      if (originRect) {
        const box = win.getBoundingClientRect();
        const dx = originRect.left + originRect.width / 2 - (box.left + box.width / 2);
        const dy = originRect.top + originRect.height / 2 - (box.top + box.height / 2);
        const s = Math.max(0.2, Math.min(originRect.width / box.width, originRect.height / box.height));
        gsap.fromTo(win, { x: dx, y: dy, scale: s, opacity: 0.2 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'expo.out', clearProps: 'transform' });
      } else {
        gsap.fromTo(win, { y: 40, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out', clearProps: 'transform' });
      }
    }, rootRef);
    win.focus({ preventScroll: true });
    return () => {
      ctx.revert();
      onLockChange?.(false);
      lastFocus.current?.focus?.({ preventScroll: true });
    };
    // run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const win = windowRef.current;
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(win, { y: 30, scale: 0.94, opacity: 0, duration: 0.28, ease: 'power2.in' }, 0)
      .to(backdropRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
  }, [onClose]);

  // ── keyboard: Esc closes, Tab is trapped inside the window ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = windowRef.current?.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // ── tab switching with in-browser back/forward history ──
  const goTo = useCallback((id) => {
    if (id === activeId) return;
    setHistory(h => {
      const stack = [...h.stack.slice(0, h.index + 1), id];
      return { stack, index: stack.length - 1 };
    });
    setStatus({ refreshing: true });
    onTabChange(id);
  }, [activeId, onTabChange]);

  const step = (dir) => {
    const index = history.index + dir;
    if (index < 0 || index >= history.stack.length) return;
    setHistory(h => ({ ...h, index }));
    setStatus({ refreshing: true });
    onTabChange(history.stack[index]);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(active.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  const updated = status.fetchedAt ? new Date(status.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return createPortal(
    <div className="mb-root" ref={rootRef}>
      <div className="mb-backdrop" ref={backdropRef} onClick={close} />
      <div
        ref={windowRef}
        className={`mb-window ${maximized ? 'is-max' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${active.title} — live profile dashboard`}
        tabIndex={-1}
        style={{ '--mb-accent': active.color }}
      >
        {/* Title bar + tabs */}
        <div className="mb-titlebar">
          <div className="mb-lights">
            <button type="button" className="mb-light mb-light--close" onClick={close} aria-label="Close browser"><X size={8} /></button>
            <button type="button" className="mb-light mb-light--min" onClick={close} aria-label="Minimize browser"><span /></button>
            <button type="button" className="mb-light mb-light--max" onClick={() => setMaximized(m => !m)} aria-label={maximized ? 'Restore window' : 'Maximize window'}>
              {maximized ? <Minimize2 size={7} /> : <Maximize2 size={7} />}
            </button>
          </div>
          <div className="mb-tabs" role="tablist" aria-label="Profiles">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === active.id}
                className={`mb-tab ${t.id === active.id ? 'is-active' : ''}`}
                onClick={() => goTo(t.id)}
                style={{ '--tab-accent': t.color }}
              >
                <img src={t.favicon} alt="" width="14" height="14" />
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-toolbar">
          <button type="button" className="mb-icon" onClick={() => step(-1)} disabled={history.index === 0} aria-label="Back"><ArrowLeft size={15} /></button>
          <button type="button" className="mb-icon" onClick={() => step(1)} disabled={history.index >= history.stack.length - 1} aria-label="Forward"><ArrowRight size={15} /></button>
          <button type="button" className={`mb-icon ${status.refreshing ? 'is-spinning' : ''}`} onClick={() => { setStatus(s => ({ ...s, refreshing: true })); setReloadToken(t => t + 1); }} aria-label="Reload live data"><RotateCw size={14} /></button>
          <div className="mb-address font-mono" title={active.address}>
            <Lock size={11} className="mb-lock" />
            <span className="mb-scheme">https://</span>
            <span className="mb-host">{active.address.replace(/^https?:\/\//, '')}</span>
            <button type="button" className="mb-copy" onClick={copyAddress} aria-label="Copy profile address">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <div className={`mb-live font-mono ${status.offline ? 'is-down' : status.snapshot || status.stale ? 'is-stale' : ''}`} title={status.source ? `Source: ${status.source}` : undefined}>
            <i />{status.refreshing ? 'SYNCING' : status.offline ? 'OFFLINE' : status.snapshot ? 'SNAPSHOT' : status.stale ? 'CACHED' : 'LIVE'}
            {status.snapshot && !status.refreshing ? <span> · {status.snapshot}</span> : updated && !status.refreshing && <span> · {updated}</span>}
          </div>
          <div className={`mb-progress ${status.refreshing ? 'is-on' : ''}`} />
        </div>

        {/* Page */}
        <div className="mb-page" data-lenis-prevent>
          <Dashboard key={active.id} reloadToken={reloadToken} onStatus={setStatus} />
        </div>
      </div>
    </div>,
    document.body
  );
}
