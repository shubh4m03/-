// Original die-cut "sticker" illustrations for the loading screen (inline SVG → data URIs).
// Each sticker gets a white die-cut border + soft offset shadow from one shared SVG filter,
// so the artwork itself stays simple, flat and colourful.

const PAL = {
  ink: '#111318',
  coral: '#FF5A4E',
  cobalt: '#2F5BFF',
  sky: '#60A5FA',
  lemon: '#FFD43B',
  mint: '#3DDC97',
  lilac: '#B79CFF',
  pink: '#FF8FC7',
  red: '#FF2E3E',
};

const FILTER = `
  <filter id="die" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="outline"/>
    <feFlood flood-color="#ffffff"/>
    <feComposite in2="outline" operator="in" result="white"/>
    <feOffset in="outline" dx="3" dy="7" result="off"/>
    <feGaussianBlur in="off" stdDeviation="2.5" result="offb"/>
    <feFlood flood-color="#000000" flood-opacity="0.55"/>
    <feComposite in2="offb" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

const wrap = (body, w = 200, h = 200) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 ${w + 40} ${h + 40}" width="${w + 40}" height="${h + 40}"><defs>${FILTER}</defs><g filter="url(#die)">${body}</g></svg>`;

const RAW = [
  // 1. Terminal window ">_"
  wrap(`
    <rect x="10" y="30" width="180" height="140" rx="22" fill="${PAL.ink}"/>
    <rect x="10" y="30" width="180" height="34" rx="22" fill="#2a2f3a"/>
    <rect x="10" y="50" width="180" height="14" fill="#2a2f3a"/>
    <circle cx="34" cy="47" r="7" fill="${PAL.coral}"/><circle cx="56" cy="47" r="7" fill="${PAL.lemon}"/><circle cx="78" cy="47" r="7" fill="${PAL.mint}"/>
    <path d="M42 96 L74 118 L42 140" fill="none" stroke="${PAL.mint}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="88" y="132" width="52" height="13" rx="6.5" fill="${PAL.lemon}"/>`),

  // 2. Padlock
  wrap(`
    <path d="M58 92 V66 a42 42 0 0 1 84 0 V92" fill="none" stroke="${PAL.lemon}" stroke-width="20" stroke-linecap="round"/>
    <rect x="30" y="86" width="140" height="102" rx="26" fill="${PAL.cobalt}"/>
    <circle cx="100" cy="128" r="15" fill="${PAL.ink}"/>
    <rect x="93" y="132" width="14" height="30" rx="7" fill="${PAL.ink}"/>`),

  // 3. Bug (bug bounty)
  wrap(`
    <g stroke="${PAL.ink}" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M52 92 L20 78"/><path d="M48 124 L14 124"/><path d="M54 154 L24 172"/>
      <path d="M148 92 L180 78"/><path d="M152 124 L186 124"/><path d="M146 154 L176 172"/>
      <path d="M84 46 L70 20"/><path d="M116 46 L130 20"/>
    </g>
    <circle cx="100" cy="62" r="26" fill="${PAL.ink}"/>
    <ellipse cx="100" cy="124" rx="56" ry="66" fill="${PAL.mint}"/>
    <path d="M100 60 V190" stroke="${PAL.ink}" stroke-width="7"/>
    <circle cx="74" cy="108" r="11" fill="${PAL.ink}"/><circle cx="128" cy="104" r="9" fill="${PAL.ink}"/>
    <circle cx="80" cy="154" r="9" fill="${PAL.ink}"/><circle cx="124" cy="150" r="12" fill="${PAL.ink}"/>`),

  // 4. CTF flag
  wrap(`
    <rect x="34" y="14" width="14" height="178" rx="7" fill="${PAL.ink}"/>
    <path d="M48 24 C 90 6, 120 44, 170 26 L 170 108 C 120 126, 90 88, 48 106 Z" fill="${PAL.coral}"/>
    <path d="M70 48 h22 v22 h-22z M114 52 h22 v22 h-22z M92 70 h22 v22 h-22z" fill="#fff" opacity="0.9"/>`),

  // 5. Lightning bolt
  wrap(`<path d="M118 6 L36 116 H92 L74 194 L166 76 H108 Z" fill="${PAL.lemon}" stroke="${PAL.ink}" stroke-width="7" stroke-linejoin="round"/>`),

  // 6. Shield + check
  wrap(`
    <path d="M100 8 L174 36 V96 C174 146 140 178 100 194 C60 178 26 146 26 96 V36 Z" fill="${PAL.lilac}"/>
    <path d="M100 8 L174 36 V96 C174 146 140 178 100 194 Z" fill="#9b7cf7"/>
    <path d="M64 102 L90 128 L140 74" fill="none" stroke="${PAL.ink}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`),

  // 7. Eye (recon)
  wrap(`
    <path d="M6 100 C 50 30, 150 30, 194 100 C 150 170, 50 170, 6 100 Z" fill="#fff"/>
    <circle cx="100" cy="100" r="44" fill="${PAL.cobalt}"/>
    <circle cx="100" cy="100" r="20" fill="${PAL.ink}"/>
    <circle cx="112" cy="88" r="8" fill="#fff"/>
    <path d="M6 100 C 50 30, 150 30, 194 100 C 150 170, 50 170, 6 100 Z" fill="none" stroke="${PAL.ink}" stroke-width="8"/>`),

  // 8. Key
  wrap(`
    <circle cx="62" cy="70" r="48" fill="${PAL.pink}"/>
    <circle cx="62" cy="70" r="16" fill="${PAL.ink}"/>
    <path d="M94 104 L176 186" stroke="${PAL.pink}" stroke-width="26" stroke-linecap="round"/>
    <path d="M140 150 l22 -22 M160 170 l18 -18" stroke="${PAL.pink}" stroke-width="20" stroke-linecap="round"/>`),

  // 9. Raven badge
  wrap(`
    <circle cx="100" cy="100" r="92" fill="${PAL.sky}"/>
    <path d="M30 104 C 56 70, 80 70, 96 86 C 104 60, 130 52, 150 64 L 178 58 L 160 78 C 168 102, 150 132, 116 138 L 128 166 L 104 146 L 80 166 L 86 136 C 60 130, 40 122, 30 104 Z" fill="${PAL.ink}"/>
    <circle cx="140" cy="76" r="6" fill="${PAL.red}"/>`),

  // 10. Starburst
  wrap(`
    <path d="${(() => {
      const pts = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 ? 66 : 96;
        pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
      }
      return `M${pts.join(' L')} Z`;
    })()}" fill="${PAL.coral}"/>
    <circle cx="100" cy="100" r="44" fill="${PAL.lemon}"/>
    <path d="M78 90 v12 M122 90 v12" stroke="${PAL.ink}" stroke-width="9" stroke-linecap="round"/>
    <path d="M78 118 C 90 132, 110 132, 122 118" fill="none" stroke="${PAL.ink}" stroke-width="8" stroke-linecap="round"/>`),

  // 11. Blob / squiggle
  wrap(`
    <path d="M40 60 C 60 0, 150 10, 160 60 C 200 80, 190 160, 130 168 C 100 200, 30 190, 30 140 C -4 120, 10 70, 40 60 Z" fill="${PAL.mint}"/>
    <path d="M52 110 C 72 86, 92 134, 112 110 C 132 86, 152 134, 168 110" fill="none" stroke="${PAL.ink}" stroke-width="10" stroke-linecap="round"/>`),

  // 12. Wi-Fi / signal
  wrap(`
    <rect x="8" y="8" width="184" height="184" rx="46" fill="${PAL.ink}"/>
    <path d="M40 92 a84 84 0 0 1 120 0" fill="none" stroke="${PAL.lemon}" stroke-width="16" stroke-linecap="round"/>
    <path d="M62 116 a52 52 0 0 1 76 0" fill="none" stroke="${PAL.coral}" stroke-width="16" stroke-linecap="round"/>
    <circle cx="100" cy="146" r="13" fill="${PAL.sky}"/>`),
];

export const STICKERS = RAW.map(svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`);
