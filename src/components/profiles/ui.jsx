import { AlertTriangle, RotateCw } from 'lucide-react';

/* Small presentational building blocks shared by the three dashboards. */

export function Panel({ title, kicker, children, className = '', aside }) {
  return (
    <section className={`pd-panel ${className}`}>
      {(title || kicker) && (
        <header className="pd-panel-head">
          <div>
            {kicker && <div className="pd-kicker font-mono">{kicker}</div>}
            {title && <h3 className="pd-panel-title font-display">{title}</h3>}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatTile({ label, value, sub, accent }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className="pd-stat" style={accent ? { '--stat-accent': accent } : undefined}>
      <div className="pd-stat-label font-mono">{label}</div>
      <div className={`pd-stat-value font-display ${empty ? 'is-empty' : ''}`}>{empty ? '—' : value}</div>
      {sub && <div className="pd-stat-sub font-mono">{sub}</div>}
    </div>
  );
}

export function Ring({ value, max, size = 132, stroke = 10, color = 'var(--mb-accent)', label, sub }) {
  const pct = max ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="pd-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="pd-ring-track" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="pd-ring-bar"
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="pd-ring-center">
        <div className="font-display pd-ring-value">{label}</div>
        {sub && <div className="font-mono pd-ring-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function Bar({ label, value, max, color, right }) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="pd-bar" style={{ '--bar-color': color }}>
      <div className="pd-bar-row font-mono">
        <span>{label}</span>
        <span>{right ?? `${value}${max ? ` / ${max}` : ''}`}</span>
      </div>
      <div className="pd-bar-track"><div className="pd-bar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function Skeleton({ rows = 3 }) {
  return (
    <div className="pd-skeleton" aria-busy="true" aria-label="Loading live data">
      <div className="pd-sk pd-sk--head" />
      <div className="pd-sk-grid">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="pd-sk pd-sk--tile" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="pd-sk pd-sk--row" />)}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Live data unavailable' }) {
  return (
    <div className="pd-error" role="alert">
      <AlertTriangle size={28} />
      <h4 className="font-display">{title}</h4>
      <p className="font-mono">{error?.message || 'The data source did not respond.'}</p>
      {onRetry && (
        <button type="button" className="pd-retry font-mono" onClick={onRetry}>
          <RotateCw size={13} /> Try again
        </button>
      )}
    </div>
  );
}

export function Notice({ children }) {
  return <div className="pd-notice font-mono">{children}</div>;
}
