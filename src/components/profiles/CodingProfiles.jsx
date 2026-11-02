import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import MiniBrowser from './MiniBrowser';
import { PLATFORMS } from './platforms';
import './profiles.css';

/**
 * Coding-profiles grid + in-site mini-browser.
 * onLockChange(locked) lets the host page pause smooth scrolling while the browser is open.
 */
export default function CodingProfiles({ onLockChange, warmUp = true }) {
  const [openId, setOpenId] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const gridRef = useRef(null);
  // Defer the live API calls until the section is about to scroll into view (keeps startup lean)
  const [nearView, setNearView] = useState(false);
  useEffect(() => {
    const el = gridRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setNearView(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { setNearView(true); io.disconnect(); }
    }, { rootMargin: '1200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Warm the data in browser idle time once the site is revealed (not during the loader and not
  // mid-scroll), so the cards are already rendered when the visitor reaches this section.
  useEffect(() => {
    if (!warmUp || nearView) return undefined;
    const ric = window.requestIdleCallback;
    const id = ric ? ric(() => setNearView(true), { timeout: 4000 }) : window.setTimeout(() => setNearView(true), 2500);
    return () => (ric ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, [warmUp, nearView]);

  const handleOpen = useCallback((id, rect) => {
    setOriginRect(rect || null);
    setOpenId(id);
  }, []);

  const tabs = useMemo(() => PLATFORMS.map(p => ({
    id: p.id,
    title: p.name,
    address: p.url,
    favicon: p.logo,
    color: p.color,
    Dashboard: p.Dashboard,
  })), []);

  return (
    <>
      <div className="pc-grid" ref={gridRef}>
        {PLATFORMS.map(p => (
          <ProfileCard key={p.id} platform={p} onOpen={handleOpen} active={nearView || Boolean(openId)} />
        ))}
      </div>
      <p className="pc-hint font-mono">CLICK A CARD TO OPEN ITS LIVE DASHBOARD</p>

      {openId && (
        <MiniBrowser
          tabs={tabs}
          activeId={openId}
          onTabChange={setOpenId}
          originRect={originRect}
          onClose={() => setOpenId(null)}
          onLockChange={onLockChange}
        />
      )}
    </>
  );
}
