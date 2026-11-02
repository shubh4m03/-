// Abstract geometric digits for the corner counter (original design).
// Tens are solid tiles with the digit knocked out; units are open stroked glyphs.

const STROKE = {
  0: <circle cx="20" cy="20" r="14" />,
  1: <path d="M12 12 L23 5 V36" />,
  2: <path d="M8 14 A12 12 0 1 1 29 22 L8 36 H34" />,
  3: <path d="M7 5 H32 L18 17 A10.5 10.5 0 1 1 7 31" />,
  4: <path d="M27 36 V4 L5 26 H36" />,
  5: <path d="M32 5 H11 L9 18 A11 11 0 1 1 8 33" />,
  6: <><circle cx="20" cy="25" r="10" /><path d="M29 6 L12 22" /></>,
  7: <path d="M6 5 H34 L16 36" />,
  8: <><circle cx="20" cy="11.5" r="7.5" /><circle cx="20" cy="27" r="9.5" /></>,
  9: <><circle cx="20" cy="15" r="10" /><path d="M28 20 L12 36" /></>,
};

export function UnitGlyph({ d }) {
  return (
    <svg viewBox="0 0 40 40" className="sl-glyph" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="butt" strokeLinejoin="miter">{STROKE[d]}</g>
    </svg>
  );
}

export function TensGlyph({ d }) {
  return (
    <svg viewBox="0 0 40 40" className="sl-glyph" aria-hidden="true">
      <defs>
        <mask id={`sl-knock-${d}`}>
          <rect width="40" height="40" fill="#fff" />
          <g fill="none" stroke="#000" strokeWidth="5.5">{STROKE[d]}</g>
        </mask>
      </defs>
      <rect width="40" height="40" fill="currentColor" mask={`url(#sl-knock-${d})`} />
    </svg>
  );
}
