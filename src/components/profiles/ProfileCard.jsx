import { useRef } from 'react';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import ActivityGraph from './ActivityGraph';
import useProfileData from './hooks/useProfileData';

/**
 * Live profile card: platform header, three headline stats, dot-matrix activity graph.
 * Clicking (or Enter/Space) opens the platform's dashboard in the in-site mini-browser.
 */
export default function ProfileCard({ platform, onOpen, active = true }) {
  const ref = useRef(null);
  const state = useProfileData(platform.client, { enabled: active });
  const { status, data, error, reload, refreshing, stale } = state;

  const open = () => onOpen(platform.id, ref.current?.getBoundingClientRect());
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const stats = data ? platform.card.stats(data) : [];
  const days = data ? platform.card.days(data) : null;
  const snapshot = data?.meta?.snapshot ? data.meta.asOf : null;

  return (
    <div
      ref={ref}
      className="pc-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${platform.name} dashboard`}
      onClick={open}
      onKeyDown={onKeyDown}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      style={{ '--pc-accent': platform.color }}
    >
      <div className="pc-glow" aria-hidden="true" />

      <header className="pc-head">
        <div className="pc-logo"><img src={platform.logo} alt="" /></div>
        <div className="pc-id">
          <h3 className="font-display">{platform.name}</h3>
          <span className="font-mono">@{platform.handle}</span>
        </div>
        <span className={`pc-live font-mono ${status === 'error' ? 'is-down' : (snapshot || stale) && !refreshing ? 'is-stale' : ''}`} title={snapshot ? `Snapshot of the public profile as of ${snapshot}` : undefined}>
          <i />{status === 'error' ? 'OFFLINE' : refreshing ? 'SYNC' : snapshot ? 'SNAPSHOT' : stale ? 'CACHED' : 'LIVE'}
        </span>
      </header>

      <div className="pc-stats">
        {status === 'loading' && !data
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="pc-stat pc-stat--sk" />)
          : stats.map(s => (
            <div key={s.label} className="pc-stat">
              <div className={`font-display pc-stat-value ${s.value === null || s.value === undefined ? 'is-empty' : ''}`}>{s.value ?? '—'}</div>
              <div className="font-mono pc-stat-label">{s.label}</div>
            </div>
          ))}
      </div>

      <div className="pc-graph">
        {status === 'loading' && !data && <div className="pc-graph-sk" />}
        {status === 'error' && !data && (
          <div className="pc-error font-mono">
            <span>{error?.message || 'Live data unavailable'}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); reload(); }} aria-label={`Retry ${platform.name}`}>
              <RotateCw size={12} /> Retry
            </button>
          </div>
        )}
        {data && (days
          ? <ActivityGraph days={days} color={platform.color} unit={platform.card.unit} variant="card" />
          : <div className="ag-empty font-mono">{typeof platform.card.noGraphText === 'function' ? platform.card.noGraphText(data) : platform.card.noGraphText || 'No public activity calendar'}</div>)}
      </div>

      <footer className="pc-foot font-mono">
        <span>OPEN DASHBOARD</span>
        <ArrowUpRight size={14} />
      </footer>
    </div>
  );
}
