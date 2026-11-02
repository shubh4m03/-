import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { STICKERS } from './stickers';
import { TensGlyph, UnitGlyph } from './CounterGlyphs';
import './StickerLoader.css';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const POOL = 14;              // reused sticker elements (no DOM churn while animating)
const MIN_MS = 2400;          // let the sequence breathe, but never hold the site longer than needed
const MAX_MS = 7000;          // hard cap if something never finishes loading
const REDUCED_MIN_MS = 700;

const rand = (a, b) => a + Math.random() * (b - a);

/** Resolves when the page's assets + web fonts are ready (or after MAX_MS). */
function whenPageReady() {
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(r => window.addEventListener('load', r, { once: true }));
  // Font CSS is loaded non-blocking (preload → stylesheet); wait for it, then for the faces the
  // first screens use, so nothing swaps fonts after the loader leaves.
  const fontCss = new Promise((resolve) => {
    const link = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
    if (!link || link.rel === 'stylesheet' || link.sheet) return resolve();
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
  });
  const fonts = fontCss.then(() => {
    if (!document.fonts?.load) return undefined;
    return Promise.all(['400 1em "Bebas Neue"', '700 1em "Outfit"', '800 1em "Outfit"', '400 1em "JetBrains Mono"', '700 1em "Syne"']
      .map(f => document.fonts.load(f).catch(() => null)))
      .then(() => document.fonts.ready);
  });
  return Promise.race([
    Promise.all([loaded, fonts]),
    new Promise(r => setTimeout(r, MAX_MS)),
  ]);
}

/**
 * Full-screen dark preloader with a sticker cursor-trail effect.
 * - onReveal(): called when the exit begins (mount whatever sits underneath)
 * - onDone():   called when the loader has fully left the screen (unmount it)
 */
export default function StickerLoader({ onReveal, onDone }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const counterRef = useRef(null);
  const tensRef = useRef(null);
  const unitsRef = useRef(null);
  const statusRef = useRef(null);

  useLayoutEffect(() => {
    // Hand over from the static boot screen in index.html (prevents a dark flash before React mounts)
    document.getElementById('boot-loader')?.remove();

    const root = rootRef.current;
    const stage = stageRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    const imgs = [...stage.querySelectorAll('.sl-sticker')];
    let alive = true;
    let raf = 0;
    let z = 1;
    let next = 0;
    const active = new Set();
    const stickerSize = imgs[0]?.offsetWidth || 140;   // measured once (all stickers share a size)

    const ctx = gsap.context(() => {}, root);

    // ── Counter (bottom-right) ──
    let shownTens = -1;
    let shownUnits = -1;
    const setDigits = (value) => {
      const v = Math.max(0, Math.min(99, Math.floor(value)));
      const t = Math.floor(v / 10);
      const u = v % 10;
      if (t !== shownTens) {
        shownTens = t;
        ctx.add(() => gsap.to(tensRef.current, { yPercent: -t * 10, duration: reduced ? 0 : 0.45, ease: 'expo.out', overwrite: true }));
      }
      if (u !== shownUnits) {
        shownUnits = u;
        ctx.add(() => gsap.to(unitsRef.current, { yPercent: -u * 10, duration: reduced ? 0 : 0.16, ease: 'power2.out', overwrite: true }));
      }
      if (statusRef.current && v % 25 === 0) statusRef.current.textContent = `Loading portfolio… ${v}%`;
    };

    // ── Sticker spawning ──
    const spawnAlong = (from, to) => {
      const img = imgs[next];
      next = (next + 1) % imgs.length;
      const w = stickerSize;
      const rot = rand(10, 22) * (Math.random() < 0.5 ? -1 : 1);
      active.add(img);
      ctx.add(() => {
        gsap.killTweensOf(img);
        gsap.timeline({ onComplete: () => active.delete(img) })
          .set(img, { zIndex: ++z, rotation: rot, x: from.x - w / 2, y: from.y - w / 2, opacity: 1, scale: 0.55 })
          .to(img, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 0)
          .to(img, { x: to.x - w / 2, y: to.y - w / 2, rotation: rot + rand(-14, 14), duration: 0.9, ease: 'power1.inOut' }, 0)
          .to(img, { opacity: 0, scale: 0.2, rotation: `+=${rand(-30, 30)}`, duration: 0.8, ease: 'power3.inOut' }, 0.45);
      });
    };

    // ── Cursor trail ──
    // Stickers only appear behind the real pointer (mouse, pen or a touch drag), like a cursor trail:
    // each one spawns at a lagging (lerped) position and glides to where the pointer is now.
    const pointer = { x: 0, y: 0, has: false };
    let cache = null;
    let last = null;
    const threshold = isSmall ? 56 : 84;   // px of pointer travel between stickers

    const onPointer = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (!p) return;
      pointer.x = p.clientX;
      pointer.y = p.clientY;
      if (!pointer.has) {
        pointer.has = true;
        cache = { x: p.clientX, y: p.clientY };
        last = { x: p.clientX, y: p.clientY };
      }
    };

    const tick = () => {
      if (!alive) return;
      if (pointer.has) {
        cache = { x: cache.x + (pointer.x - cache.x) * 0.1, y: cache.y + (pointer.y - cache.y) * 0.1 };
        if (Math.hypot(pointer.x - last.x, pointer.y - last.y) > threshold) {
          const now = { x: pointer.x, y: pointer.y };
          spawnAlong(cache, now);
          last = now;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    if (!reduced) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('touchmove', onPointer, { passive: true });
      raf = requestAnimationFrame(tick);
    }

    // ── Progress: time-driven, held below 100 until the page is actually ready ──
    const counter = { v: 0 };
    let ready = false;
    let minReached = false;
    let exiting = false;

    const exit = () => {
      if (exiting || !alive) return;
      exiting = true;
      onReveal?.();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onPointer);
      ctx.add(() => {
        const tl = gsap.timeline({ onComplete: () => onDone?.() });
        if (reduced) {
          tl.to(root, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' });
          return;
        }
        if (active.size) tl.to([...active], { scale: 0, duration: 0.22, ease: 'power2.in', stagger: 0.035 }, 0);
        tl
          .to(counterRef.current, { yPercent: -60, autoAlpha: 0, duration: 0.35, ease: 'power3.in' }, 0.05)
          .to(root, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, 0.25);
      });
    };

    const maybeFinish = () => {
      if (!alive || !ready || !minReached || exiting) return;
      ctx.add(() => gsap.to(counter, {
        v: 99,
        duration: 0.35,
        ease: 'power1.out',
        overwrite: true,
        onUpdate: () => setDigits(counter.v),
        onComplete: () => window.setTimeout(exit, reduced ? 0 : 180),
      }));
    };

    ctx.add(() => gsap.fromTo(counter, { v: 0 }, {
      v: 92,
      duration: (reduced ? REDUCED_MIN_MS : MIN_MS) / 1000,
      ease: 'power1.inOut',
      onUpdate: () => setDigits(counter.v),
      onComplete: () => { minReached = true; maybeFinish(); },
    }));

    whenPageReady().then(() => { ready = true; maybeFinish(); });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onPointer);
      ctx.revert();
    };
    // mount-once lifecycle; callbacks are read at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sl-root" ref={rootRef}>
      <div className="sl-stage" ref={stageRef} aria-hidden="true">
        {Array.from({ length: POOL }).map((_, i) => (
          <img key={i} className="sl-sticker" src={STICKERS[(i * 5) % STICKERS.length]} alt="" draggable="false" />
        ))}
      </div>

      <div className="sl-counter" ref={counterRef} aria-hidden="true">
        <div className="sl-win">
          <div className="sl-col" ref={tensRef}>
            {DIGITS.map(d => <TensGlyph key={d} d={d} />)}
          </div>
        </div>
        <div className="sl-win">
          <div className="sl-col" ref={unitsRef}>
            {DIGITS.map(d => <UnitGlyph key={d} d={d} />)}
          </div>
        </div>
      </div>

      <span className="sl-sr" role="status" aria-live="polite" ref={statusRef}>Loading portfolio…</span>
    </div>
  );
}
