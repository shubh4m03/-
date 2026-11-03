import { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { scrambleText } from './utils/scrambleText';
import GallerySection from './components/GallerySection';
import BackgroundMusic from './components/BackgroundMusic';
import CodingProfiles from './components/profiles/CodingProfiles';
import StickerLoader from './components/loader/StickerLoader';
import ContactForm from './components/ContactForm';
import HoldButton from './components/HoldButton/HoldButton';
import ProjectLike from './components/likes/ProjectLike';
import RepoStar from './components/likes/RepoStar';
// DEMO: hero background (loaded lazily so it never delays first paint)
const GhostFibers = lazy(() => import('./components/GhostFibers/GhostFibers'));
import { Github, Linkedin, Mail, Phone, ExternalLink, Zap, Home, User, Code, Trophy, Briefcase, Play, FileText, Sun, Moon, Lock, Check } from 'lucide-react';
import shiftpinSnap from './assets/projects/shiftpin.svg';
import prepgenieSnap from './assets/projects/prepgenie.svg';
import airlineSnap from './assets/projects/airline.svg';
import raven1 from './assets/RAVEN/raven-1.webp';
import raven2 from './assets/RAVEN/raven-2.webp';
import resumeFile from './assets/RESUME/Shubham_Gupta_CV.pdf';
import cert1 from './assets/Certificates/ec-council-android-bug-bounty.pdf';
import cert2 from './assets/Certificates/cisco-ethical-hacker.pdf';
import cert3 from './assets/Certificates/infosys-intro-cybersecurity.pdf';

gsap.registerPlugin(ScrollTrigger);

const TUBES_CURSOR_URL = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';

/* ================================================
   SHUBHAM GUPTA — ULTRA CINEMATIC PORTFOLIO
   7 Scenes · GSAP · Lenis · Blue/Black + Light theme
   ================================================ */

// ─── Data ────────────────────────────────────────
const PERSONAL = {
  name: 'Shubham Gupta',
  role: 'Offensive Security Intern',
  email: 'shubhamg0116@gmail.com',
  phone: '+91-9122522364',
  github: 'https://github.com/shubh4m03',
  linkedin: 'https://www.linkedin.com/in/shubham-gupta18090304',
  tryhackme: 'https://tryhackme.com/p/shubh4m03',
  leetcode: 'https://leetcode.com/u/shubh4m0304/',
  uni: 'Lovely Professional University, Punjab',
  cgpa: '8.33',
  location: 'Punjab, India',
};

const RESUME_DOWNLOAD_NAME = 'Shubham_Gupta_CV.pdf';

// Triggers the CV download (used by the hold-to-download button in the footer)
function downloadResume() {
  const a = document.createElement('a');
  a.href = resumeFile;
  a.download = RESUME_DOWNLOAD_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const EXPERIENCE = [
  {
    num: '01',
    company: 'Macbease Pvt. Ltd.',
    subtitle: 'Offensive Security Internship',
    role: 'Offensive Security Intern',
    when: 'Present',
    stack: ['Offensive Security', 'Pentesting', 'Recon'],
    impact: 'Currently working in offensive security · Pentesting & security research',
    url: 'https://macbease.com',
    linkLabel: 'VISIT SITE →',
  },
  {
    num: '02',
    company: 'Indian Cyber Security Solutions (ICSS)',
    subtitle: 'Campus Ambassador · Lovely Professional University',
    role: 'Campus Ambassador',
    when: 'Mar 2026 – Present',
    stack: ['Community', 'Outreach', 'Cyber Awareness'],
    impact: 'Representing ICSS at LPU · Building the Punjab student cybersecurity network',
    url: 'https://www.indiancybersecuritysolutions.com',
    linkLabel: 'VISIT SITE →',
  },
  {
    num: '03',
    company: 'Raj Laxmi Enterprises',
    subtitle: 'Multi-brand FMCG Distribution · Client Engagement',
    role: 'Web & App Developer (Part-time)',
    when: 'Jun 2026 – Jul 2026',
    stack: ['PHP', 'MySQL', 'JavaScript', 'PWA', 'Marg ERP'],
    impact: '₹32,000 revenue in one month · Built & shipped Shift Pin',
    url: '',
    snap: shiftpinSnap,
  },
  {
    num: '04',
    company: "RAVEN'34 Collective",
    subtitle: 'Cybersecurity Team · Freelance Pentesting, CTFs & Hackathons',
    role: 'Co-founder & Operator',
    when: '2025 – Present',
    stack: ['CTF', 'Pentesting', 'Hackathons'],
    impact: 'Freelance pentesting, CTFs & hackathons · Built Prep Genie at HACK AI',
    url: '',
  },
];

const PROJECTS = [
  {
    num: '01', title: 'Shift Pin', sub: 'Geofenced Staff-Attendance PWA', when: 'Jul 2026 – Aug 2026',
    desc: 'Real-time attendance and shift tracking for Raj Laxmi Enterprises. Automatic check-in/out, device binding and a live admin dashboard, with WebSocket sync under 1 second.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'WebSocket', 'Ratchet'], color: '#60A5FA',
    url: '', repo: '', note: 'CLIENT PROJECT · IN PRODUCTION', snap: shiftpinSnap,
  },
  {
    num: '02', title: 'Prep Genie', sub: 'Agentic AI Career Coach', when: 'Jan 2026',
    desc: 'Built in under 24 hours at the HACK AI hackathon. AI CV analysis checks a résumé against company requirements and gives detailed feedback. Used regularly by 20+ people.',
    stack: ['Python', 'Hugging Face', 'MySQL', 'HTML & CSS', 'Git'], color: '#818CF8',
    url: '', repo: 'https://github.com/shubh4m03/HackAI', snap: prepgenieSnap,
  },
  {
    num: '03', title: 'Airline Reservation', sub: 'Real-time Booking System', when: 'Jan 2025 – Feb 2025',
    desc: 'Python Tkinter app for real-time airline reservations, with seat management, flight tracking and a MySQL backend for concurrent sessions.',
    stack: ['Python', 'Tkinter', 'MySQL'], color: '#38BDF8',
    url: '', repo: 'https://github.com/shubh4m03/airline_reservation_system', snap: airlineSnap,
  },
];

const SKILLS = {
  Languages: ['Python', 'JavaScript', 'C', 'C++', 'Bash'],
  Technologies: ['HTML', 'CSS', 'Node.js', 'React', 'Tailwind CSS', 'Linux'],
  Security: ['Nmap', 'Wireshark', 'Burp Suite', 'Dirb', 'Netcat', 'OSINT'],
  'Databases & Tools': ['MySQL', 'Git', 'GitHub', 'Figma'],
  'Soft Skills': ['Problem Solving', 'Team Management', 'Time Management'],
};

const STATS = [
  { value: 50, suffix: '+', label: 'Problems Solved' },
  { value: 25, suffix: '+', label: 'TryHackMe Rooms' },
  { value: 5, prefix: 'TOP ', suffix: '', label: 'NITJ CTF · 80+ Teams' },
  { value: 20, prefix: 'TOP ', suffix: '', label: 'College Hackathon · 800+' },
];

const CERTS_DATA = [
  { issuer: 'EC-Council', title: 'Android Bug Bounty', date: '2025', color: '#60A5FA', credentialId: 'EC-COUNCIL · CERTIFICATE', pdf: cert1 },
  { issuer: 'Cisco', title: 'Ethical Hacker', date: '2026', color: '#38BDF8', credentialId: 'CISCO NETWORKING ACADEMY', pdf: cert2 },
  { issuer: 'Infosys Springboard', title: 'Introduction to Cybersecurity', date: 'MAR 2026', color: '#818CF8', credentialId: 'VERIFY · VERIFY.ONWINGSPAN.COM', pdf: cert3 },
];

const TECH_MARQUEE = ['PYTHON', 'BASH', 'NMAP', 'WIRESHARK', 'BURP SUITE', 'NETCAT', 'DIRB', 'LINUX', 'OSINT', 'MYSQL', 'REACT', 'CTF'];

const SECTIONS = ['hero', 'statement', 'about', 'experience', 'projects', 'gallery', 'skills', 'coding-arena', 'certifications', 'contact'];

// Darker text versions of the item colours for the light (white) theme — keeps small text AA-readable
const LIGHT_TEXT_TONES = {
  '#60A5FA': '#1D4ED8',
  '#38BDF8': '#0369A1',
  '#818CF8': '#4F46E5',
  '#E8343B': '#B91C1C',
  '#FFA116': '#B45309',
};
const textTone = (color, theme) => (theme === 'light' ? LIGHT_TEXT_TONES[color.toUpperCase()] || color : color);

// Activity corner grid colors (blue scale) — weighted toward empty
const LC_ACTIVITY_COLORS = [
  'transparent', 'transparent', 'transparent', 'transparent',  // 40% empty
  'var(--grid-1)', 'var(--grid-1)',                           // 15% very low
  'var(--grid-2)', 'var(--grid-2)',                           // 15% low
  'var(--grid-3)', 'var(--grid-3)',                           // 15% medium
  'var(--grid-4)',                                            // 10% high
  'var(--grid-5)',                                            // 5% max (accent)
];

// Corner positions for LeetCode grids
const CORNER_POSITIONS = [
  { top: 0, left: 0 },
  { top: 0, right: 0 },
  { bottom: 0, left: 0 },
  { bottom: 0, right: 0 },
];

const CORNER_MASKS = [
  'radial-gradient(ellipse at top left, black 0%, transparent 75%)',
  'radial-gradient(ellipse at top right, black 0%, transparent 75%)',
  'radial-gradient(ellipse at bottom left, black 0%, transparent 75%)',
  'radial-gradient(ellipse at bottom right, black 0%, transparent 75%)',
];

// ─── Performance Optimized Sub-Components — Prevents App from re-rendering every second ───
const FooterClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</>;
};

// Perf: both raven frames are decoded ahead of time (idle, after load) and stacked; the swap is an
// opacity flip, so it never triggers an image decode mid-scroll (previously two ~30 ms decodes stalled
// the GPU when the footer scrolled in). The 2 s glitch loop only runs while the footer is on screen.
const FooterPortrait = ({ face1, face2 }) => {
  const [index, setIndex] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const decode = () => [face1, face2].forEach((src) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = src;
      im.decode?.().catch(() => { /* decoded on demand instead */ });
    });
    const useIdle = typeof window.requestIdleCallback === 'function';
    const id = useIdle ? window.requestIdleCallback(decode, { timeout: 4000 }) : setTimeout(decode, 2500);
    return () => (useIdle ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, [face1, face2]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !('IntersectionObserver' in window)) { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const timeouts = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timeouts.delete(id); fn(); }, ms);
      timeouts.add(id);
    };
    const inter = setInterval(() => {
      setGlitch(true);
      later(() => {
        setIndex(p => p === 0 ? 1 : 0);
        later(() => setGlitch(false), 80);
      }, 100);
    }, 2000);
    return () => {
      clearInterval(inter);
      timeouts.forEach(clearTimeout);
      setGlitch(false);
    };
  }, [visible]);

  const imgStyle = {
    height: 'auto',
    maxHeight: '82vh',
    width: '100%',
    objectFit: 'contain',
    verticalAlign: 'bottom',
    display: 'block',
  };
  return (
    <div
      ref={wrapRef}
      className={glitch ? 'footer-glitch-active' : ''}
      style={{ position: 'relative', width: '140%', display: 'grid', willChange: 'transform, filter' }}
    >
      {/* soft shadow under the raven — a gradient instead of a 40px drop-shadow blur over the whole image */}
      <div aria-hidden="true" className="raven-shadow" />
      {[face1, face2].map((src, i) => (
        <img
          key={i}
          src={src}
          alt={i === 0 ? "Raven — Shubham Gupta's emblem" : ''}
          aria-hidden={i === 1 ? 'true' : undefined}
          draggable={false}
          decoding="async"
          style={{ ...imgStyle, gridArea: '1 / 1', position: 'relative', zIndex: 1, opacity: index === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
};

const splitChars = (text) =>
  text.split('').map((c, i) => (
    <span key={i} className="char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
      {c}
    </span>
  ));

const marqueeText = TECH_MARQUEE.map(t => t).join(' · ') + ' · ';

// Tubes random color helper - Hoisted to top level
// Random colors stay inside the blue family (cyan → indigo) so clicks never break the theme
const randomColorsArr = (count) => {
  return new Array(count)
    .fill(0)
    .map(() => {
      const hue = 190 + Math.floor(Math.random() * 60);        // 190°–250°
      const sat = 70 + Math.floor(Math.random() * 30);         // 70%–100%
      const light = 45 + Math.floor(Math.random() * 25);       // 45%–70%
      // HSL → hex (the tubes library expects hex strings)
      const l = light / 100, a = (sat * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + hue / 30) % 12;
        const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    });
};

// ─── App Component ───────────────────────────────
export default function App() {
  const appRef = useRef(null);

  const progressRef = useRef(null);
  const lenisRef = useRef(null);
  const heroRef = useRef(null);
  const cornerGridRefs = useRef([]);
  const flashRef = useRef(null);

  const projectSectionRef = useRef(null);
  const projectHorizontalRef = useRef(null);
  const tubesAppRef = useRef(null); // Ref to store Tubes instance
  const tubesInited = useRef(false); // Flag to prevent double init
  const tubesControlRef = useRef(null); // park/unpark the WebGL layer when it is not visible
  const animationsInitiated = useRef(false); // scroll scenes built (reset on cleanup so remounts rebuild)
  const sceneMediaRef = useRef(null);        // gsap.matchMedia instance owning the breakpoint scenes
  const sceneCtxRef = useRef(null);          // gsap.context owning all other scroll scenes
  const scrollResetDone = useRef(false);     // only force scroll-to-top on the very first mount
  const revealedRef = useRef(false);         // site revealed → scenes should exist
  const initScenesRef = useRef(null);        // latest initSceneAnimations (for rebuilds from the master effect)

  // Set when the initial sticker loader starts leaving → kicks off the site's own reveal sequence
  const [introDone, setIntroDone] = useState(false);
  const [bootDone, setBootDone] = useState(false);         // initial sticker loader fully gone
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);



  // ─── Memoized Splits (Prevents animation disruption on re-render) ───
  const [firstName, ...restName] = PERSONAL.name.toUpperCase().split(' ');
  const lastName = restName.join(' ');
  const heroFirstChars = useMemo(() => splitChars(firstName), [firstName]);
  const heroLastChars = useMemo(() => splitChars(lastName), [lastName]);
  const statementWordsMarkup = useMemo(() => {
    const words = 'I BREAK THINGS TO MAKE THEM SECURE'.split(' ');
    return words.map((word, i) => (
      <span
        key={i}
        className={`statement-word${i === words.length - 1 ? ' statement-word--accent' : ''}`}
        style={{ display: 'inline-block', margin: '0 0.15em', whiteSpace: 'nowrap' }}
      >
        {word}
      </span>
    ));
  }, []);

  // ─── Theme (dark = blue/black, light = white/blue) ───
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sg-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage unavailable */ }
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F7FD' : '#05070D');
    try { localStorage.setItem('sg-theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), []);

  // Re-render on resize so the inline responsive layout values stay correct
  const [, setViewportWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    let raf = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setViewportWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const activeSectionRef = useRef(0);   // nav dots are toggled directly (no App re-render on scroll)
  const navDotsRef = useRef(null);
  const setActiveSection = useCallback((i) => {
    activeSectionRef.current = i;
    const dots = navDotsRef.current?.children;
    if (!dots) return;
    for (let k = 0; k < dots.length; k++) dots[k].classList.toggle('active', k === i);
  }, []);


  // ─── Generate corner LeetCode grid boxes (memoized, reduced count) ───
  const cornerBoxes = useMemo(() =>
    Array.from({ length: 4 }, () =>
      Array.from({ length: 10 * 8 }, () =>
        LC_ACTIVITY_COLORS[Math.floor(Math.random() * LC_ACTIVITY_COLORS.length)]
      )
    ), []
  );

  // Cursor helpers removed



  // ─── Page transition flash (Change 5A) ─────────
  const triggerFlash = useCallback(() => {
    if (flashRef.current) {
      gsap.fromTo(flashRef.current, { opacity: 0 }, {
        keyframes: [
          { opacity: 0.15, duration: 0.1 },
          { opacity: 0, duration: 0.2 },
        ],
      });
    }
  }, []);

  // Navigate to section (with flash)
  const scrollToSection = useCallback((id) => {
    triggerFlash();
    const target = document.querySelector(`#${id}`);
    if (lenisRef.current && target) {
      lenisRef.current.scrollTo(`#${id}`, { duration: 1.6 });
    }
  }, [triggerFlash]);

  // Mini-browser open → pause page smooth-scrolling so wheel/touch scroll the overlay instead
  const onProfilesLock = useCallback((locked) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.classList.toggle('mb-open', locked);
  }, []);

  // In-page links: smooth scroll through Lenis instead of a hard jump
  const onAnchorClick = useCallback((id) => (e) => {
    if (!document.getElementById(id)) return;
    e.preventDefault();
    scrollToSection(id);
  }, [scrollToSection]);

  // Combined throttle helper
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function (...args) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  // ─── Master useEffect: Lenis + Cursor ──
  useEffect(() => {
    const stBefore = new Set(ScrollTrigger.getAll()); // to clean up only the triggers this effect creates
    // Lenis — smoother, silkier scroll
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    // Always start at the top: the intro screens cover the page, so it must not scroll underneath them
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (!scrollResetDone.current) {
      scrollResetDone.current = true;
      window.scrollTo(0, 0);
    }

    // Drive Lenis from GSAP's ticker and push every Lenis scroll straight into ScrollTrigger,
    // so pins/scrubs update in the same frame as the smooth scroll (no 1-frame lag / pin jitter).
    const lenisTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    // Cursor logic removed

    // ─── Custom Cursor Logic ───
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    // quickTo reuses one tween per axis instead of allocating two new tweens on every mousemove
    const dotX = gsap.quickTo(cursorDot, 'x', { duration: 0.1, ease: 'power2.out' });
    const dotY = gsap.quickTo(cursorDot, 'y', { duration: 0.1, ease: 'power2.out' });
    const ringX = gsap.quickTo(cursorRing, 'x', { duration: 0.4, ease: 'power3.out' });
    const ringY = gsap.quickTo(cursorRing, 'y', { duration: 0.4, ease: 'power3.out' });
    const onMouseMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onMouseDown = () => {
      gsap.to([cursorDot, cursorRing], { scale: 0.7, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to([cursorDot, cursorRing], { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Hover states for interactive elements
    // Colors are handled by the .cursor-ring--hover class so they follow the active theme
    const handleMouseEnter = () => {
      cursorRing?.classList.add('cursor-ring--hover');
      gsap.to(cursorRing, { scale: 2.5, duration: 0.3 });
      gsap.to(cursorDot, { scale: 0, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      cursorRing?.classList.remove('cursor-ring--hover');
      gsap.to(cursorRing, { scale: 1, duration: 0.3 });
      gsap.to(cursorDot, { scale: 1, duration: 0.3 });
    };

    const interactives = document.querySelectorAll('a, button, .nav-dot, .nav-monogram, .magnetic-btn, .skill-pill, .gallery-pill');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Active section tracker removed from here, moving Scroll Progress to initSceneAnimations for accurate calculation

    // Active section tracker
    SECTIONS.forEach((id, i) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        // Created before the pinned scenes exist — refresh after them so pin spacing is accounted for
        refreshPriority: -1,
        onEnter: () => setActiveSection(i),
        onEnterBack: () => setActiveSection(i),
      });
    });

    // Scroll to Top visibility
    ScrollTrigger.create({
      start: 'top -800',
      onUpdate: (self) => {
        setShowScrollTop(self.scroll() > 800);
      }
    });
    // ─── Corner LeetCode Torch (Throttled update) ──
    const heroEl = heroRef.current;
    const corners = cornerGridRefs.current.filter(Boolean);
    let heroMoveRaf = null;

    const updateTorch = (e) => {
      if (!heroEl || corners.length === 0) return;
      const rect = heroEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width, h = rect.height;
      const distances = [
        Math.hypot(x, y),
        Math.hypot(w - x, y),
        Math.hypot(x, h - y),
        Math.hypot(w - x, h - y),
      ];
      const maxDist = 500;
      corners.forEach((corner, i) => {
        if (!corner) return;
        const proximity = Math.max(0, 1 - distances[i] / maxDist);
        corner.style.opacity = String(proximity * 0.85);
      });
    };

    const throttledHeroMove = throttle(updateTorch, 16); // ~60fps but steady

    const onHeroLeave = () => {
      corners.forEach(c => { if (c) gsap.to(c, { opacity: 0, duration: 0.5 }); });
    };

    if (heroEl) {
      heroEl.addEventListener('mousemove', throttledHeroMove);
      heroEl.addEventListener('mouseleave', onHeroLeave);
    }

    // Tubes Cursor Integration (Optimized for One-Time Init + Cleanup)
    const initTubesEffect = () => {
      if (tubesInited.current) return;
      tubesInited.current = true;

      // 1.5× is visually identical for the soft, bloomed tubes and draws ~44% fewer pixels than 2×
      const targetPr = Math.min(window.devicePixelRatio || 1, 1.5);
      // Lazy-load the WebGL library (previously a static import that blocked the whole app bundle)
      let tubesLoadFailed = false;
      if (!window.TubesCursor) {
        window.__tubesCursorPromise ||= import(/* @vite-ignore */ TUBES_CURSOR_URL)
          .then((m) => { window.TubesCursor = m.default; return m.default; });
        window.__tubesCursorPromise.catch((err) => { tubesLoadFailed = true; console.warn('Tubes cursor unavailable:', err?.message || err); });
      }
      const start = () => {
        if (tubesCancelled) return;             // effect was cleaned up (StrictMode remount / unmount)
        const TubesCursorManager = window.TubesCursor;
        const canvas = document.getElementById('hero-tubes-canvas');

        if (!TubesCursorManager || !canvas) {
          if (tubesLoadFailed) return;            // offline / blocked CDN → stop polling
          heroMoveRaf = requestAnimationFrame(start);
          return;
        }

        console.log('Initializing Tubes Cursor...');
        try {
          const instance = TubesCursorManager(canvas, {
            tubes: {
              colors: ["#3b82f6", "#1d4ed8", "#0ea5e9"],
              lights: {
                intensity: 150,
                colors: ["#60a5fa", "#2563eb", "#38bdf8", "#818cf8"]
              }
            }
          });
          tubesAppRef.current = instance;

          // Perf: the library re-renders the whole tube scene on every display frame (~5 ms of JS per
          // frame; 120×/s on high-refresh screens). Its loop goes through renderer.setAnimationLoop, so
          // wrap that: cap at 60 fps, and 30 fps once the pointer has been still for 3 s (it resumes
          // instantly on the next move). Motion is delta-time based, so speed is unchanged.
          if (instance?.three?.renderer?.setAnimationLoop) {
            const r = instance.three.renderer;
            const originalLoop = r.setAnimationLoop.bind(r);
            let lastFrame = 0;
            r.setAnimationLoop = (cb) => originalLoop(cb ? (time, ...rest) => {
              const now = performance.now();
              const idle = now - lastPointerMove > 3000;
              const minGap = idle ? 32 : 15.5;
              if (now - lastFrame < minGap) return;
              lastFrame = now;
              cb(time, ...rest);
            } : null);
          }

          if (instance && instance.three) {
            const { renderer } = instance.three;
            const getSafeSize = () => {
              const w = Math.min(canvas.clientWidth || window.innerWidth, 4096);
              const h = Math.min(canvas.clientHeight || window.innerHeight, 4096);
              return { w, h, pw: Math.floor(w * targetPr), ph: Math.floor(h * targetPr) };
            };

            const originalSetSize = renderer.setSize.bind(renderer);
            const originalSetPixelRatio = renderer.setPixelRatio.bind(renderer);

            renderer.setPixelRatio = () => originalSetPixelRatio(targetPr);
            renderer.setPixelRatio(targetPr);

            renderer.setSize = (width, height, updateStyle) => {
              const { w, h, pw, ph } = getSafeSize();
              if (instance.bloomPass && typeof instance.bloomPass.setSize === 'function') {
                try {
                  if (instance.bloomPass.renderTargetsHorizontal?.length > 0) {
                    instance.bloomPass.setSize(pw, ph);
                  }
                } catch (e) { console.error('Error in bloomPass setSize:', e); }
              }
              return originalSetSize(w, h, updateStyle);
            };

            instance.three.resize();
          }

          const handleGlobalClick = () => {
            if (tubesAppRef.current?.tubes) {
              const colors = randomColorsArr(3);
              const lightsColors = randomColorsArr(4);
              tubesAppRef.current.tubes.setColors(colors);
              tubesAppRef.current.tubes.setLightsColors(lightsColors);
            }
          };

          window.addEventListener('click', handleGlobalClick);
          // stored here because start() may run later from the polling rAF (its return value is lost)
          tubesClickCleanup = () => window.removeEventListener('click', handleGlobalClick);
        } catch (err) {
          console.error('Error during Tubes Cursor init:', err);
        }
      };

      start();
    };

    let tubesCancelled = false;
    // Read by the tubes frame limiter (declared with `let` above its first use at render time)
    let lastPointerMove = performance.now();
    const onAnyPointerMove = () => { lastPointerMove = performance.now(); };
    window.addEventListener('pointermove', onAnyPointerMove, { passive: true });
    let tubesClickCleanup = null;
    initTubesEffect();

    // Toggle tubes cursor visibility
    // The tubes library pauses its WebGL loop via an IntersectionObserver on the canvas. Fading to
    // opacity 0 alone kept it rendering every frame (~60% of main-thread frame time), so once the
    // fade-out finishes the layer is parked off-screen; it is un-parked before fading back in.
    const tubesWrap = document.querySelector('.tubes-canvas-wrapper');
    const parkTubes = () => { if (tubesWrap) tubesWrap.style.transform = 'translate3d(0, -200vh, 0)'; };
    const unparkTubes = () => { if (tubesWrap) tubesWrap.style.transform = ''; };
    const hideTubes = () => gsap.to(tubesWrap, { opacity: 0, duration: 0.5, pointerEvents: 'none', overwrite: 'auto', onComplete: parkTubes });
    const showTubes = () => { unparkTubes(); return gsap.to(tubesWrap, { opacity: 1, duration: 0.8, pointerEvents: 'none', overwrite: 'auto' }); };
    tubesControlRef.current = { parkTubes, unparkTubes };
    ScrollTrigger.create({
      trigger: '#experience',
      start: 'top bottom',
      refreshPriority: -1,
      onEnter: () => hideTubes(),
      onLeaveBack: () => showTubes(),
    });

    ScrollTrigger.create({
      trigger: '#coding-arena',
      start: 'top bottom',
      refreshPriority: -1,
      onEnter: () => showTubes(),
      onLeaveBack: () => hideTubes(),
    });

    ScrollTrigger.create({
      trigger: '#certifications',
      start: 'top bottom',
      refreshPriority: -1,
      onEnter: () => hideTubes(),
      onLeaveBack: () => showTubes(),
    });

    const ownTriggers = ScrollTrigger.getAll().filter(t => !stBefore.has(t));

    // This effect's cleanup tears the scroll scenes down, so its setup must rebuild them when the site
    // is already revealed (remount / hot reload). On first load the reveal effect builds them instead.
    let rebuildRaf = 0;
    if (revealedRef.current) {
      rebuildRaf = requestAnimationFrame(() => {
        initScenesRef.current?.();
        ScrollTrigger.refresh();
      });
    }

    return () => {
      if (heroEl) {
        heroEl.removeEventListener('mousemove', throttledHeroMove);
        heroEl.removeEventListener('mouseleave', onHeroLeave);
      }
      // Stop any pending init poll and ALWAYS allow a re-init (StrictMode remounts the effect while the
      // library may still be loading — previously the flag stayed set and the tubes never started).
      tubesCancelled = true;
      window.removeEventListener('pointermove', onAnyPointerMove);
      if (heroMoveRaf) cancelAnimationFrame(heroMoveRaf);
      tubesClickCleanup?.();
      if (tubesAppRef.current) {
        try {
          const inst = tubesAppRef.current;
          if (typeof inst.dispose === 'function') inst.dispose();
          else if (typeof inst.three?.dispose === 'function') inst.three.dispose();
        } catch (e) { console.error('Error destroying tubes instance:', e); }
        tubesAppRef.current = null;
      }
      tubesInited.current = false;
      cancelAnimationFrame(rebuildRaf);

      // Only kill what this component owns (other components, e.g. the gallery pin, manage their own).
      ownTriggers.forEach((t) => t.kill());
      // Revert the scroll scenes and clear the guard so the reveal effect rebuilds them on remount
      // (previously a hot reload killed every trigger and left all scroll animations frozen).
      sceneMediaRef.current?.revert();
      sceneMediaRef.current = null;
      sceneCtxRef.current?.revert();
      sceneCtxRef.current = null;
      animationsInitiated.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      gsap.ticker.remove(lenisTick);
      lenis.off?.('scroll', ScrollTrigger.update);
      lenis.destroy();
    };
  }, [setActiveSection]); // stable callback — effect still runs once

  // Tubes random color helper moved to top level

  // Keep the WebGL tubes parked (paused) behind the loader, wake them on reveal
  useEffect(() => {
    if (preloaderDone) tubesControlRef.current?.unparkTubes();
    else tubesControlRef.current?.parkTubes();
    // Scroll stays locked behind the loader, unlocked on reveal
    const lenis = lenisRef.current;
    if (preloaderDone) {
      lenis?.start();
      document.documentElement.style.overflow = '';
    } else {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
    }
  }, [preloaderDone]);

  // ─── Reveal ─────────────────────────────────────
  // The sticker loader is the only loading screen: as soon as it starts sliding away, mark the site
  // as revealed and play the hero entrance + build the scroll scenes (hero is still covered here).
  useEffect(() => {
    if (!introDone) return undefined;
    revealedRef.current = true;
    setPreloaderDone(true);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => initSceneAnimations()); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    // initSceneAnimations is guarded (runs once per mount), so it is intentionally not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introDone]);

  // ─── Scene Animations ──────────────────────────
  const initSceneAnimations = () => {
    if (animationsInitiated.current) return;
    animationsInitiated.current = true;
    // Everything created here is owned by one context so it can be reverted as a unit
    sceneCtxRef.current = gsap.context(() => buildScenes());
  };

  // keep a handle on the latest scene builder for the master effect's rebuild path
  useEffect(() => { initScenesRef.current = initSceneAnimations; });

  const buildScenes = () => {
    // === HERO entry sequence ===
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-label', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo('.hero-first .char', { y: -100, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-last .char', { y: 100, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.4')
      .fromTo('.hero-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 }, '-=0.3')
      .fromTo('.hero-stat-pill', { x: 60, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, '-=0.4')
      .fromTo('.hero-bottom', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');

    // === Change 5B — Hero glitch after entry ===
    gsap.to('.hero-first', {
      keyframes: [
        { x: -4, duration: 0.05 },
        { x: 4, duration: 0.05 },
        { x: -2, duration: 0.05 },
        { x: 2, duration: 0.05 },
        { x: -1, duration: 0.05 },
        { x: 0, duration: 0.05 },
      ],
      delay: 3.2,
    });

    // === STATEMENT — word-by-word opacity scrub (Consolidated into one ScrollTrigger) ===
    const stWords = document.querySelectorAll('.statement-word');
    if (stWords.length > 0) {
      // Word colors come from CSS (.statement-word / --accent) so they follow the theme
      gsap.fromTo(stWords,
        { opacity: 0.06 },
        {
          opacity: 1,
          stagger: 0.5,
          scrollTrigger: {
            trigger: '#statement',
            start: 'top 80%',
            end: 'bottom 60%',
            scrub: true,
          }
        }
      );
    }

    gsap.fromTo('.statement-sub',
      { opacity: 0 },
      { opacity: 1, scrollTrigger: { trigger: '#statement', start: 'center 60%' }, duration: 1.2 }
    );

    // Breakpoint-aware scenes: gsap.matchMedia rebuilds them automatically when the
    // viewport crosses 1024px (resize / tablet rotation). Queries match the CSS (max-width: 1023px).
    const BREAKPOINTS = { isDesktop: '(min-width: 1024px)', isMobile: '(max-width: 1023px)' };
    const mm = gsap.matchMedia();
    sceneMediaRef.current = mm;
    let scenesBuilt = 0;
    const resortAfterRebuild = () => {
      // On a rebuild (not the first run) the re-created pins are appended last — re-sort so
      // later sections account for their pin spacing again.
      scenesBuilt += 1;
      if (scenesBuilt > 2) {
        requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
      }
    };

    // === ABOUT — horizontal scroll (Change 02) ===
    mm.add(BREAKPOINTS, (mmCtx) => {
      const isSmallMobile = !mmCtx.conditions.isDesktop;

      // Each line is one long nowrap sentence, centred and wider than the viewport. Travel is measured
      // from the real text width so every line scrolls from its first word to its last word (a fixed
      // ±60vw left both ends of the sentence permanently off-screen).
      const lineTravel = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return 0;
        const margin = window.innerWidth * 0.06;
        return Math.max(40, (el.offsetWidth - window.innerWidth) / 2 + margin);
      };
      const maxTravel = () => Math.max(lineTravel('.about-line-1'), lineTravel('.about-line-2'));

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: isSmallMobile ? 'top 85%' : 'top top',
          // Desktop: pin long enough to read the full sentences (~1px of scroll per px of travel)
          end: isSmallMobile ? 'bottom 15%' : () => `+=${Math.round(Math.max(window.innerHeight * 0.5, maxTravel() * 1.6))}`,
          scrub: isSmallMobile ? 1 : 1.5,
          pin: !isSmallMobile, // Disable pinning on mobile for better scroll feel
          pinSpacing: !isSmallMobile,
          invalidateOnRefresh: true,
        },
      });

      aboutTl
        .fromTo('.about-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0)
        .fromTo('.about-line-1',
          { x: () => lineTravel('.about-line-1') },   // first word in view
          { x: () => -lineTravel('.about-line-1'), ease: 'none' }, // last word in view
          0)
        .fromTo('.about-line-2',
          { x: () => -lineTravel('.about-line-2') },  // moves the opposite way (original design)
          { x: () => lineTravel('.about-line-2'), ease: 'none' },
          0);
      resortAfterRebuild();
    });

    // Watermark parallax
    gsap.utils.toArray('.section-watermark').forEach((el) => {
      gsap.to(el, {
        y: -150,
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        ease: 'none',
      });
    });

    // === EXPERIENCE — Change 5F clip wipe title + timeline ===
    gsap.fromTo('.exp-title',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        scrollTrigger: { trigger: '#experience', start: 'top 70%' },
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    gsap.fromTo('.timeline-line-fill',
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: 'top',
        scrollTrigger: { trigger: '#experience', start: 'top center', end: 'bottom center', scrub: true },
        ease: 'none',
      }
    );

    document.querySelectorAll('.exp-card').forEach((card) => {
      gsap.fromTo(card,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, scrollTrigger: { trigger: card, start: 'top 85%' }, duration: 0.7, ease: 'power2.out' }
      );
    });

    // === PROJECTS — Cinematic Horizontal Story Layout ===


    mm.add(BREAKPOINTS, (mmCtx) => {
      const isDesktop = mmCtx.conditions.isDesktop;

      const projectScroll = isDesktop ? gsap.to(projectHorizontalRef.current, {
        x: () => -(projectHorizontalRef.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: projectSectionRef.current,
          pin: true,
          scrub: 0.5, // Faster, more tactile scrub
          start: 'top top',
          end: () => `+=${projectHorizontalRef.current.scrollWidth * 0.8}`, // Reduced scroll distance for faster speed
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      }) : null;

      // Individual project card effects (parallax + highlight + entrance)
      const projectCards = document.querySelectorAll('.project-card-v2');
      projectCards.forEach((card) => {
        const content = card.querySelector('.project-content-v2');

        // Phones/tablets: cards are stacked vertically. A simple fade-up that completes before the card
        // reaches mid-screen — no blur and no fade-out while it is being read (the shared desktop
        // timeline left cards blurred while they were already in view on a phone).
        if (!isDesktop) {
          card.style.filter = '';
          gsap.fromTo(card,
            { opacity: 0.25, y: 48, scale: 0.97 },
            {
              opacity: 1, y: 0, scale: 1, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 60%', scrub: 0.6 },
            }
          );
          return;
        }

        // ONE TIMELINE TO RULE THEM ALL (Fixes scroll-up glitch + ensures perfect smoothness)
        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            containerAnimation: projectScroll || undefined,
            start: isDesktop ? 'left right' : 'top 80%',
            end: isDesktop ? 'right left' : 'bottom 20%',
            // Desktop: light smoothing so cards stay in step with the horizontal track (which already
            // has scrub 0.5 + Lenis); stacking 1.5 on top made cards trail the scroll. Mobile unchanged.
            scrub: isDesktop ? 0.4 : 1.5,
          }
        });

        // Desktop: fade in → fade out across the horizontal journey (original feel).
        // Mobile: hold the card fully readable through the middle of the scroll.
        const fadeDur = isDesktop ? 0.5 : 0.3;
        const fadeOutAt = isDesktop ? 0.5 : 0.7;

        // Blur is tweened as a number and written only when it changes; near 0px the filter is
        // removed entirely, so a fully visible card has no filter cost (same look as before).
        const blur = { v: 15 };
        let lastBlur = '';
        const applyBlur = () => {
          const css = blur.v < 0.5 ? 'none' : `blur(${blur.v.toFixed(1)}px)`;
          if (css !== lastBlur) {
            card.style.filter = css;
            lastBlur = css;
          }
        };
        applyBlur();
        cardTl
          .fromTo(card,
            { opacity: 0.05, scale: 0.88 },
            { opacity: 1, scale: 1, ease: 'power2.inOut', duration: fadeDur },
            0
          )
          .fromTo(blur, { v: 15 }, { v: 0, ease: 'power2.inOut', duration: fadeDur, onUpdate: applyBlur }, 0)
          .to(card,
            { opacity: 0.05, scale: 0.88, ease: 'power2.inOut', duration: fadeDur },
            fadeOutAt
          )
          .to(blur, { v: 15, ease: 'power2.inOut', duration: fadeDur, onUpdate: applyBlur }, fadeOutAt);

        // Content parallax (desktop horizontal story only)
        if (content && projectScroll) {
          gsap.to(content, {
            y: -30,
            scrollTrigger: {
              trigger: card,
              containerAnimation: projectScroll,
              start: 'left center',
              end: 'center center',
              scrub: 0.4, // matched to the card scrub so content and card settle together
            }
          });
        }
      });
      resortAfterRebuild();
      // The blur is written straight to style.filter (not via GSAP), so clear it when the breakpoint
      // changes — otherwise a desktop → phone resize could leave a card stuck blurred.
      return () => projectCards.forEach(card => { card.style.filter = ''; });
    });

    // Toggle gallery visibility with discrete events for better performance
    ScrollTrigger.create({
      trigger: projectSectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => gsap.set('#gallery', { autoAlpha: 0 }),
      onLeave: () => gsap.set('#gallery', { autoAlpha: 1 }),
      onEnterBack: () => gsap.set('#gallery', { autoAlpha: 0 }),
      onLeaveBack: () => gsap.set('#gallery', { autoAlpha: 1 }),
    });

    // === SKILLS — 4C Scale + Fade on skill pills + staggered category reveal + clip wipe title ===
    gsap.fromTo('.skills-title',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        scrollTrigger: { trigger: '#skills', start: 'top 70%' },
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    document.querySelectorAll('.skill-category').forEach((cat, i) => {
      gsap.fromTo(cat,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: { trigger: '#skills', start: 'top 65%' },
          delay: i * 0.15,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    });

    // 4C — Scale + Fade on skill pills
    const skillPills = document.querySelectorAll('.skill-pill');
    gsap.set(skillPills, { transition: 'none' }); // CSS transitions off while GSAP drives transform/opacity
    gsap.fromTo(skillPills,
      { scale: 0.85, opacity: 0, y: 20 },
      {
        scale: 1, opacity: 1, y: 0,
        duration: 0.5,
        stagger: { amount: 0.6, from: 'start' },
        ease: 'back.out(1.2)',
        // hand transform back to CSS so the pill hover lift works after the reveal
        clearProps: 'transform,transition',
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 75%',
        },
      }
    );

    // Removed clip-path curtain wipe — too GPU intensive on large sections

    // 4D — Letter scramble on section titles
    const scrambleTitles = document.querySelectorAll('[data-scramble]');
    scrambleTitles.forEach(title => {
      const finalText = title.dataset.scramble;
      ScrollTrigger.create({
        trigger: title,
        start: 'top 80%',
        onEnter: () => scrambleText(title, finalText),
        once: true,
      });
    });

    // === STATS — count up ===
    document.querySelectorAll('.stat-counter').forEach((el) => {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0');
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
        onUpdate: () => {
          el.textContent = prefix + (decimals > 0 ? obj.val.toFixed(decimals) : Math.floor(obj.val)) + suffix;
        },
      });
    });

    // Contact animations removed (Missing elements)

    // ─── Certification Hover Effects ──────────────────────────
    // Lift on hover; border color is handled in CSS (.cert-card-premium:hover) so it follows the theme
    document.querySelectorAll('.cert-card-premium').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -10, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
      });
    });

    ScrollTrigger.refresh();

    // ─── Post-Refesh: Global Progress Bar ───
    // Using end: "max" + refreshPriority: -1 ensures it accounts for the TOTAL length after pinning is added
    ScrollTrigger.create({
      start: 0,
      end: "max",
      refreshPriority: -1,
      onUpdate: (self) => {
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
      },
    });
  };

  // ─── Render ─────────────────────────────────────
  return (
    <>
      <BackgroundMusic revealed={preloaderDone} />
      {/* Scroll Progress — Outside app wrapper for fixed position stability */}
      <div ref={progressRef} className="scroll-progress" />

      {!bootDone && <StickerLoader onReveal={() => setIntroDone(true)} onDone={() => setBootDone(true)} />}

      <div ref={appRef} className="app">
        {/* Custom Cursor */}
        <div className="cursor-dot" />
        <div className="cursor-ring" />

        {/* Page Flash (Change 5A) */}
        <div ref={flashRef} className="page-flash" />


        {/* Nav */}
        <nav className="nav-fixed">
          <div
            className="nav-monogram"
            onClick={() => scrollToSection('hero')}
            onMouseEnter={() => { }}
            onMouseLeave={() => { }}
          >
            SG
          </div>
          <div className="nav-right">
            <div className="nav-dots" ref={navDotsRef}>
              {SECTIONS.map((id, i) => (
                <div
                  key={id}
                  className={`nav-dot ${activeSectionRef.current === i ? 'active' : ''}`}
                  onClick={() => scrollToSection(id)}
                  onMouseEnter={() => { }}
                  onMouseLeave={() => { }}
                  title={id.replace('-', ' ')}
                />
              ))}
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </nav>

        {/* ═══════════ SCENE 01 — HERO ═══════════ */}
        <section ref={heroRef} id="hero" className="hero-with-fibers" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 48px 48px' }}>
          {/* DEMO — GhostFibers background (React Bits) */}
          <div className="hero-fibers" aria-hidden="true">
            <Suspense fallback={null}>
              <GhostFibers
                glowColor="#3b82f6"
                layers={3}
                twist={1.2}
                threads={72}
                fiberStyle="dots"
                depthOfField={0.85}
                hoverEffect="focus"
                intro={true}
                mouseInteraction={true}
                lineColor="#3b82f6"
                secondaryColor="#3b82f6"
                lightMode={theme === 'light'}
              />
            </Suspense>
          </div>
          <div className="section-watermark" style={{ top: '10%', right: '-5%' }}>01</div>

          {/* Corner LeetCode Grids (lightweight) */}
          {CORNER_POSITIONS.map((pos, ci) => (
            <div
              key={ci}
              ref={(el) => (cornerGridRefs.current[ci] = el)}
              className="corner-grid-lite"
              style={{
                position: 'absolute',
                ...pos,
                width: 200, height: 128,
                opacity: 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: 2,
                padding: 6,
                WebkitMaskImage: CORNER_MASKS[ci],
                maskImage: CORNER_MASKS[ci],
              }}
            >
              {cornerBoxes[ci].map((color, j) => (
                <div key={j} style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
              ))}
            </div>
          ))}

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr',
            gap: window.innerWidth < 768 ? '32px' : '48px',
            width: '100%',
            maxWidth: 1400,
            margin: '0 auto',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Left Side */}
            <div style={{
              textAlign: window.innerWidth < 1024 ? 'center' : 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: window.innerWidth < 1024 ? 'center' : 'flex-start',
              width: '100%'
            }}>
              <div className="hero-label font-mono" style={{
                fontSize: window.innerWidth < 768 ? 10 : 12,
                color: 'var(--accent)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 24,
                width: '100%'
              }}>
                Offensive Security Intern @ Macbease · 2026
              </div>
              <h1 className="hero-first font-display" style={{
                fontSize: 'clamp(48px, 15vw, 200px)',
                lineHeight: 0.85,
                color: 'var(--white)',
                letterSpacing: '-0.01em',
                display: 'flex',
                justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start',
                flexWrap: 'nowrap',
                width: '100%'
              }}>
                {heroFirstChars}
              </h1>
              <h1 className="hero-last font-display" style={{
                fontSize: 'clamp(48px, 15vw, 200px)',
                lineHeight: 0.85,
                color: 'var(--accent)',
                letterSpacing: '-0.01em',
                display: 'flex',
                justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start',
                flexWrap: 'nowrap',
                width: '100%'
              }}>
                {heroLastChars}
              </h1>
              <div style={{
                marginTop: 32,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: window.innerWidth < 1024 ? 'center' : 'flex-start',
              }}>
                <p className="hero-sub font-body" style={{
                  fontSize: 'clamp(14px, 1.4vw, 22px)',
                  fontWeight: 700,
                  color: 'rgba(var(--fg-rgb),0.7)'
                }}>
                  {PERSONAL.role}
                </p>
                <p className="hero-sub font-mono" style={{
                  fontSize: 10,
                  color: 'var(--accent)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginTop: 8
                }}>
                  Pentesting · CTF · ICSS Campus Ambassador
                </p>
              </div>
            </div>



            {/* Right Side */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: window.innerWidth < 1024 ? 'center' : 'flex-end',
              gap: 16
            }}>
              {/* Stat pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                {[
                  'Top 5 · NITJ CTF (80+ Teams)',
                  'TryHackMe Top 15%',
                ].map((t, i) => (
                  <div
                    key={i}
                    className="hero-stat-pill font-mono"
                    style={{
                      fontSize: 11,
                      padding: '10px 20px',
                      border: '1px solid var(--border)',
                      color: 'var(--white)',
                      letterSpacing: '0.1em',
                      background: 'var(--dim)',
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="hero-bottom"
            style={{ zIndex: 2 }}
          >
            <a
              href={`mailto:${PERSONAL.email}`}
              className="hover-line font-mono hero-bottom-email"
              style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}
              onMouseEnter={() => { }}
              onMouseLeave={() => { }}
            >
              {PERSONAL.email}
            </a>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em' }}>
              ↓ SCROLL
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'GitHub', url: PERSONAL.github },
                { label: 'LinkedIn', url: PERSONAL.linkedin },
              ].map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover-line font-mono"
                  style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  onMouseEnter={() => { }}
                  onMouseLeave={() => { }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </section >

        {/* ═══════════ SCENE 02 — STATEMENT ═══════════ */}
        < section
          id="statement"
          style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '120px 48px',
            textAlign: 'center', position: 'relative',
          }
          }
        >
          <div className="section-watermark" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>02</div>

          {/* Subtle accent glow */}
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          }} />

          <h2 className="font-display" style={{ fontSize: 'clamp(50px, 8vw, 130px)', lineHeight: 1, maxWidth: 1000, position: 'relative', zIndex: 1 }}>
            {statementWordsMarkup}
          </h2>
          <p className="statement-sub font-mono" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 40, maxWidth: 500, letterSpacing: '0.05em', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
            — recon, exploit, report, harden. hack things your way.
          </p>
        </section >

        {/* ═══════════ SCENE 03 — ABOUT (Change 02 — Horizontal Scroll) ═══════════ */}
        <section id="about" style={{ minHeight: '150vh', position: 'relative' }}>
          <div className="about-scroll-container">
            <div className="section-watermark" style={{ top: '10%', left: '-5%' }}>03</div>

            {/* Label */}
            <div className="about-label font-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 48, position: 'relative', zIndex: 2 }}>
            // ABOUT ME
            </div>

            {/* Line 1 — moves LEFT */}
            <div className="about-line about-line-1" style={{ color: 'var(--white)', position: 'relative', zIndex: 2 }}>
              I hunt vulnerabilities — offensive security is my craft, Python is my weapon, and breaking things safely is my obsession.
            </div>

            {/* Separator */}
            <div style={{ width: '60%', maxWidth: 500, height: 1, background: 'var(--border)', margin: '24px 0', position: 'relative', zIndex: 2 }} />

            {/* Line 2 — moves RIGHT */}
            <div className="about-line about-line-2 text-outline-accent" style={{ position: 'relative', zIndex: 2 }}>
              Top 5 at NITJ CTF. TryHackMe Top 15%. B.Tech CSE @ LPU (CGPA 8.33). Always hacking.
            </div>

            {/* Moved Marquee inside pinned container for always-on visibility */}
            <div style={{ position: 'absolute', bottom: '10vh', left: 0, width: '100%', zIndex: 1 }}>
              {/* Track 1 — LEFT */}
              <div className="marquee-wrapper" style={{ background: 'transparent', padding: '14px 0', opacity: 0.3 }}>
                <div className="marquee-track marquee-track-left">
                  {[0, 1, 2, 3].map(k => (
                    <span key={k} className="font-display" style={{ fontSize: 24, color: 'var(--accent)', whiteSpace: 'nowrap', paddingRight: 60 }}>{marqueeText}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* ═══════════ SCENE 04 — EXPERIENCE ═══════════ */}
        < section id="experience" style={{ padding: '160px 48px', background: 'var(--dim)', position: 'relative' }}>
          <div className="section-watermark" style={{ top: '5%', right: '-3%' }}>04</div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Change 5F — clip wipe title */}
            <h2 className="exp-title clip-wipe-title font-display" data-scramble="EXPERIENCE LOG" style={{ fontSize: 'clamp(60px, 8vw, 120px)', marginBottom: 80 }}>
              EXPERIENCE LOG
            </h2>

            <div style={{ position: 'relative', paddingLeft: 40 }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--border)' }}>
                <div className="timeline-line-fill" style={{ width: '100%', height: '100%', background: 'var(--accent)' }} />
              </div>

              {EXPERIENCE.map((exp, i) => (
                <div
                  key={i}
                  className="exp-card"
                  onMouseEnter={() => { }}
                  onMouseLeave={() => { }}
                  style={{ position: 'relative' }}
                >
                  <div className="font-display text-outline" style={{ fontSize: 48, lineHeight: 1 }}>{exp.num}</div>
                  <div>
                    <h3 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1 }}>
                      {exp.company}
                    </h3>
                    <p className="font-body" style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{exp.subtitle}</p>
                    <p className="font-mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 12 }}>
                      {exp.role} · {exp.when}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      {exp.stack.map((s, j) => (
                        <span key={j} className="font-mono" style={{ fontSize: 10, padding: '4px 10px', border: '1px solid var(--border)', color: 'var(--white)' }}>{s}</span>
                      ))}
                    </div>
                    <p className="font-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>{exp.impact}</p>
                  </div>
                  {exp.url ? (
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover-line font-mono"
                      style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', alignSelf: 'center', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
                      onMouseEnter={() => { }}
                      onMouseLeave={() => { }}
                    >
                      {exp.linkLabel || 'VIEW LIVE →'}
                    </a>
                  ) : (
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
                    >
                      {exp.when.includes('Present') ? '● ACTIVE' : '✓ COMPLETED'}
                    </span>
                  )}
                  {/* Website snap preview on hover */}
                  {exp.snap && (
                    <div className="exp-snap-preview">
                      <img src={exp.snap} alt={exp.company} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* ═══════════ SCENE 05 — PROJECTS (HORIZONTAL STORY) ═══════════ */}
        < section ref={projectSectionRef} id="projects" style={{ background: 'var(--black)', overflow: 'hidden', position: 'relative', zIndex: 20 }}>
          <div className="section-watermark" style={{ top: '10%', left: '5%' }}>05</div>

          <div className="project-sticky-header" style={{ position: 'absolute', top: '8vh', left: '48px', zIndex: 10 }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: 'var(--white)' }}>
              MY <span style={{ color: 'var(--accent)' }}>PROJECTS</span>
            </h2>
            <p className="font-mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.2em' }}>
            // SLIDE TO DISCOVER THE STORY
            </p>
          </div>

          <div ref={projectHorizontalRef} className="project-horizontal-container">
            {PROJECTS.map((p, i) => (
              <div key={i} className="project-card-v2"
                onMouseMove={(e) => {
                  // Read layout in the input event (layout is clean here), write only inside rAF,
                  // and only on the small torch layer instead of the whole card subtree.
                  const el = e.currentTarget;
                  const rect = el.getBoundingClientRect();
                  el._torch = [((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100];
                  if (el._raf) return;
                  el._reveal ||= el.querySelector('.project-torch-reveal');
                  el._raf = requestAnimationFrame(() => {
                    el._raf = null;
                    if (!el._reveal) return;
                    el._reveal.style.setProperty('--torch-x-bg', `${el._torch[0]}%`);
                    el._reveal.style.setProperty('--torch-y-bg', `${el._torch[1]}%`);
                  });
                }}
              >
                {/* Background Torch */}
                <div className="project-torch-bg">
                  <img
                    src={p.snap}
                    alt=""
                    className="torch-img torch-img--bg"
                  />
                </div>

                {/* Torch Reveal */}
                <div className="project-torch-reveal">
                  <img
                    src={p.snap}
                    alt=""
                    className="torch-img torch-img--reveal"
                  />
                </div>

                {/* Content Side */}
                <div className="project-content-v2">
                  <div className="project-date">— {p.when}</div>
                  <h3 className="project-title font-display">{p.title}</h3>
                  <p className="project-description font-body">
                    <strong style={{ color: textTone(p.color, theme) }}>{p.sub}.</strong> {p.desc}
                  </p>

                  <div className="project-tags">
                    {p.stack.map((s, j) => (
                      <span key={j} className="project-tag font-mono">{s}</span>
                    ))}
                  </div>

                  <div className="project-actions">
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="magnetic-btn project-btn">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          View Live <ExternalLink size={16} />
                        </span>
                      </a>
                    )}
                    {p.repo && (
                      <a href={p.repo} target="_blank" rel="noreferrer" className={`magnetic-btn ${p.url ? 'project-btn-alt' : 'project-btn'}`}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Github size={18} /> {p.url ? 'Source' : 'View Code'}
                        </span>
                      </a>
                    )}
                    {!p.url && !p.repo && (
                      <span className="project-btn-alt project-note font-mono">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Lock size={14} /> {p.note || 'PRIVATE PROJECT'}
                        </span>
                      </span>
                    )}
                    <div className="project-social">
                      {p.repo && <RepoStar repoUrl={p.repo} title={p.title} />}
                      <ProjectLike slug={p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} title={p.title} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Transition Slide */}
            <div className="project-final-slide">
              <div className="font-display" style={{ fontSize: '10vw', opacity: 0.05, whiteSpace: 'nowrap' }}>NEXT STAGE</div>
            </div>
          </div>
        </section >

        {/* ═══════════ GALLERY — Horizontal Parallax (Effect 03) ═══════════ */}
        < GallerySection />

        {/* ═══════════ SCENE 06 — SKILLS + ACHIEVEMENTS ═══════════ */}
        < section id="skills" style={{ padding: '160px 48px', background: 'var(--dim)', position: 'relative' }}>
          <div className="section-watermark" style={{ top: '10%', right: '0' }}>06</div>

          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Change 5F — clip wipe title */}
            <h2 className="skills-title clip-wipe-title font-display" style={{ fontSize: 'clamp(60px, 8vw, 120px)', marginBottom: 80 }}>
              {/* Scramble only the plain-text part so the accent span is never wiped out */}
              <span data-scramble="SKILLS &">SKILLS &</span> <span data-scramble="STATS" style={{ color: 'var(--accent)' }}>STATS</span>
            </h2>

            {/* Stack Roller (Tech Marquee) for Skills section */}
            <div className="marquee-wrapper" style={{ marginBottom: 80, opacity: 0.5, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
              <div className="marquee-track marquee-track-left">
                {[0, 1, 2, 3].map(k => (
                  <span key={k} className="font-display" style={{ fontSize: 32, color: 'var(--white)', opacity: 0.8, whiteSpace: 'nowrap', paddingRight: 60 }}>{marqueeText}</span>
                ))}
              </div>
            </div>

            <div className="skills-stats-grid">
              {/* Skills Grid — Change 5D staggered category */}
              <div className="skills-column">
                {Object.entries(SKILLS).map(([cat, items], i) => (
                  <div key={i} className="skill-category">
                    <h4 className="skill-cat-title font-mono">
                      {cat}
                    </h4>
                    <div className="skill-pills-row">
                      {items.map((s, j) => (
                        <div
                          key={j}
                          className="skill-pill"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="stats-column">
                <div className="stats-grid">
                  {STATS.map((s, i) => (
                    <div key={i} className="stat-item">
                      <div
                        className="stat-counter stat-number"
                        data-target={s.value}
                        data-suffix={s.suffix}
                        data-prefix={s.prefix || ''}
                        data-decimals={s.decimals || 0}
                      >
                        {s.prefix || ''}0{s.suffix}
                      </div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* ═══════════ SCENE 06B — CODING ARENA (Electric Border) ═══════════ */}
        < section id="coding-arena" style={{ padding: '160px 48px', background: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
          <div className="section-watermark" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>HACK</div>

          <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              03 / COMPETITIVE ARENA
            </span>
            <h2 className="font-display" style={{ fontSize: 'clamp(60px, 10vw, 140px)', color: 'var(--white)', lineHeight: 0.8, marginTop: 20, marginBottom: 100 }}>
              HACKING<br />
              <span className="text-outline-accent">PROFILES</span>
            </h2>

            <CodingProfiles onLockChange={onProfilesLock} warmUp={preloaderDone} />
          </div>
        </section >

        {/* ═══════════ CERTIFICATIONS — Responsive Grid ═══════════ */}
        <section id="certifications" style={{ position: 'relative', background: 'var(--black)', padding: '120px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),0.3)' }}>
              PROFESSIONAL CERTIFICATIONS
            </span>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 64px)', color: 'var(--white)', marginTop: 12, textTransform: 'uppercase' }}>
              MY CERTIFICATIONS
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '24px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {CERTS_DATA.map((cert, i) => (
              <a key={i} href={cert.pdf} target="_blank" rel="noopener noreferrer" className="cert-card-premium" aria-label={`Open ${cert.title} certificate (PDF)`} style={{
                position: 'relative',
                display: 'block',
                textDecoration: 'none',
                background: 'var(--card-2)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(var(--fg-rgb),0.06)',
                overflow: 'hidden',
                transition: 'border-color 0.4s ease, background-color 0.4s ease',
                cursor: 'none'
              }}>
                {/* Vertical Accent Line — the glow is a gradient strip: a blurred box-shadow inside these
                    rounded, clipped cards cost ~60 ms of GPU raster as the section scrolled into view */}
                <div aria-hidden="true" style={{
                  position: 'absolute',
                  left: 0,
                  top: '22%',
                  height: '56%',
                  width: 22,
                  background: `linear-gradient(90deg, ${cert.color}40, ${cert.color}00)`,
                  borderRadius: '0 100px 100px 0'
                }} />
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  height: '50%',
                  width: 4,
                  background: cert.color,
                  borderRadius: '0 100px 100px 0'
                }} />

                {/* Background Number Watermark */}
                <div className="font-display" style={{
                  position: 'absolute',
                  bottom: -20,
                  right: 20,
                  fontSize: 160,
                  color: cert.color,
                  opacity: 0.04,
                  pointerEvents: 'none',
                  lineHeight: 1
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Header: Org + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'rgba(var(--fg-rgb),0.3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {cert.issuer}
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: textTone(cert.color, theme), fontWeight: 600 }}>
                    {cert.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display" style={{
                  fontSize: 'clamp(24px, 2.5vw, 36px)',
                  lineHeight: 1.1,
                  color: 'var(--white)',
                  textTransform: 'uppercase',
                  marginBottom: 32,
                  position: 'relative',
                  zIndex: 1,
                  maxWidth: '90%'
                }}>
                  {cert.title}
                </h3>

                {/* Separator */}
                <div style={{ height: 1, background: 'rgba(var(--fg-rgb),0.05)', marginBottom: 24, position: 'relative', zIndex: 1 }} />

                {/* Footer: ID + Verified Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <span className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--fg-rgb),0.2)', letterSpacing: '0.1em' }}>
                    {cert.credentialId}
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: '1px solid rgba(var(--fg-rgb),0.1)',
                    background: 'rgba(var(--fg-rgb),0.02)'
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cert.color }} />
                    <span className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--fg-rgb),0.6)', letterSpacing: '0.15em' }}>VERIFIED</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <a
              href={resumeFile}
              target="_blank"
              rel="noreferrer"
              className="magnetic-btn"
              style={{ pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 32px', border: '1px solid rgba(var(--fg-rgb),0.1)', borderRadius: 100, color: 'var(--white)', textDecoration: 'none' }}
            >
              <span className="font-mono" style={{ fontSize: 11 }}>VIEW FULL CV</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </section >

        {/* ═══════════ CONTACT — message form ═══════════ */}
        <section id="contact" className="contact-section">
          <div className="section-watermark" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>PING</div>
          <div className="contact-inner">
            <div className="contact-intro">
              <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                05 / GET IN TOUCH
              </span>
              <h2 className="font-display contact-title">
                SEND A<br />
                <span className="text-outline-accent">MESSAGE</span>
              </h2>
              <p className="font-mono contact-copy">
                Pentest work, internships, CTF teams or just a hello — drop a message and it lands straight in my inbox.
              </p>
              <a href={`mailto:${PERSONAL.email}`} className="hover-line font-mono contact-mail">{PERSONAL.email}</a>
            </div>
            <ContactForm fallbackEmail={PERSONAL.email} />
          </div>
        </section>

        {/* ═══════════ THE GRAND FINALE — FLOATING SCREEN FOOTER ═══════════ */}
        < section id="grand-finale-outer" style={{ background: 'var(--black)', padding: '40px 20px 20px', position: 'relative', zIndex: 100 }
        }>
          <div id="grand-finale-screen" style={{
            background: 'var(--accent)',
            minHeight: '85vh',
            padding: '60px 40px 0', // Remove bottom padding so image touches edge
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '40px'
          }}>
            {/* Notched Top (Aesthetic only since we are using border radius) */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '40%', height: '35px', background: 'var(--black)', zIndex: 10,
              clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)'
            }} />

            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 20 }}>
              <div>
                <h2 className="font-display" style={{ color: 'var(--black)', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.9, fontWeight: 900 }}>
                  {firstName}<br />
                  {lastName}
                </h2>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                <span className="font-mono" style={{ color: 'var(--black)', opacity: 0.4, fontSize: 9, letterSpacing: '0.2em' }}>OFFENSIVE SECURITY</span>
                <HoldButton
                  className="resume-hold font-mono"
                  ariaLabel="Download CV (press and hold)"
                  icon={<FileText size={14} />}
                  doneIcon={<Check size={14} />}
                  doneLabel="DOWNLOADING"
                  backgroundColor="var(--black)"
                  fillColor="var(--white)"
                  textColor="var(--white)"
                  fillTextColor="var(--black)"
                  size="sm"
                  radius={100}
                  fillDirection="right"
                  holdTime={1200}
                  releaseTime={200}
                  pressScale={0.97}
                  wave
                  waveAmplitude={6}
                  glow
                  resetAfter={1600}
                  onHold={downloadResume}
                >
                  HOLD TO DOWNLOAD CV
                </HoldButton>
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.2fr 1.6fr 1.2fr',
              gap: window.innerWidth < 1024 ? '40px' : '0',
              alignItems: 'center',
              position: 'relative',
              marginTop: 20
            }}>

              {/* Role Watermark */}
              <div className="font-display" style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '14vw', color: 'var(--black)', opacity: 0.05, pointerEvents: 'none', fontWeight: 900,
                textAlign: 'center', lineHeight: 0.8, zIndex: 0,
                overflow: 'hidden' // clip line-box overflow (prevents a faint tinted band under the raven)
              }}>
                ETHICAL<br />HACKER<br />OFFSEC
              </div>

              {/* Menu Links */}
              <div style={{ zIndex: 5, textAlign: window.innerWidth < 1024 ? 'center' : 'left' }}>
                <span className="font-mono" style={{ color: 'var(--black)', opacity: 0.3, fontSize: 9, letterSpacing: '0.4em' }}>LINKS / MENU</span>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 30 }}>
                  {[
                    { label: 'HOME', id: 'hero' },
                    { label: 'ABOUT', id: 'about' },
                    { label: 'SKILLS', id: 'skills' },
                    { label: 'PROJECTS', id: 'projects' },
                  ].map((item, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <a href={`#${item.id}`} onClick={onAnchorClick(item.id)} className="font-display mega-link" style={{ fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 800 }}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portrait Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 4 }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                  <FooterPortrait face1={raven1} face2={raven2} />
                </div>
              </div>

              {/* Social Links */}
              <div style={{ textAlign: window.innerWidth < 1024 ? 'center' : 'right', zIndex: 5 }}>
                <span className="font-mono" style={{ color: 'var(--black)', opacity: 0.3, fontSize: 9, letterSpacing: '0.4em' }}>CONNECT / SOCIAL</span>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 30 }}>
                  {[
                    { label: 'LINKEDIN', url: PERSONAL.linkedin },
                    { label: 'GITHUB', url: PERSONAL.github },
                    { label: 'TRYHACKME', url: PERSONAL.tryhackme },
                    { label: 'LEETCODE', url: PERSONAL.leetcode },
                  ].map((item, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <a href={item.url} target="_blank" rel="noreferrer" className="font-display mega-link" style={{ fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 800 }}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Metadata Bar (In the black frame) */}
          <div className="finale-meta-bar" style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1.2fr 2fr 1.2fr',
            gap: '20px',
            alignItems: 'center'
          }}>

            <div className="font-mono" style={{ fontSize: 9, color: 'var(--white)', opacity: 0.4, textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
              © {new Date().getFullYear()} {PERSONAL.name.toUpperCase()}. HACK THINGS YOUR WAY. <br />
              {PERSONAL.location.toUpperCase()} / <FooterClock />
            </div>

            {/* Floating Nav Bar - Exact Icon Set */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="finale-nav-bar" style={{
                background: 'var(--card-2)', borderRadius: '100px', padding: '8px 24px',
                display: 'flex', gap: 20, alignItems: 'center', border: '1px solid rgba(var(--fg-rgb),0.05)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', color: 'rgba(var(--fg-rgb),0.3)'
              }}>
                <a href="#hero" onClick={onAnchorClick('hero')} aria-label="Home" title="Home" style={{ color: 'inherit' }}><Home size={16} /></a>
                <a href="#about" onClick={onAnchorClick('about')} aria-label="About" title="About" style={{ color: 'inherit' }}><User size={16} /></a>
                <a href="#skills" onClick={onAnchorClick('skills')} aria-label="Skills" title="Skills" style={{ color: 'inherit' }}><Code size={16} /></a>
                <a href="#certifications" onClick={onAnchorClick('certifications')} aria-label="Certifications" title="Certifications" style={{ color: 'inherit' }}><Trophy size={16} /></a>
                <a href="#experience" onClick={onAnchorClick('experience')} aria-label="Experience" title="Experience" style={{ color: 'inherit' }}><Briefcase size={16} /></a>
                <a href="#projects" onClick={onAnchorClick('projects')} aria-label="Projects" title="Projects" style={{ color: 'inherit' }}><Play size={16} /></a>
                <a href="#contact" onClick={onAnchorClick('contact')} aria-label="Contact" title="Contact" style={{ color: 'inherit' }}><Mail size={16} /></a>
                <a href="#coding-arena" onClick={onAnchorClick('coding-arena')} aria-label="Hacking profiles" title="Hacking profiles" className="nav-circle" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(var(--accent-rgb), 0.3)', textDecoration: 'none' }}>
                  <Zap size={18} color="currentColor" fill="currentColor" />
                </a>
                <a href={resumeFile} download={RESUME_DOWNLOAD_NAME} aria-label="Download CV" title="Download CV" style={{ color: 'inherit' }}><FileText size={16} /></a>
              </div>
            </div>

            <div className="font-mono" style={{ textAlign: window.innerWidth < 768 ? 'center' : 'right', display: 'flex', justifyContent: window.innerWidth < 768 ? 'center' : 'flex-end', gap: 30, fontSize: 9, color: 'var(--white)', opacity: 0.4 }}>
              <span>MADE IN INDIA</span>
            </div>
          </div>

        </section >

        {/* Scroll to Top Button */}
        <button
          className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
          onClick={() => lenisRef.current?.scrollTo('#hero', { duration: 2 })}
        >
          <Zap size={20} fill="currentColor" />
        </button>

        {/* Tubes Cursor Canvas — Moved to bottom to ensure it overlays while staying out of the way of layout */}
        <div className="tubes-canvas-wrapper" >
          <canvas id="hero-tubes-canvas" />
        </div>
      </div>
    </>
  );
}
