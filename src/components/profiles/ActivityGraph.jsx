import { memo, useMemo, useRef, useState } from 'react';
import { computeStreaks, formatDay, levelScale, monthLabels, toWeeks } from './utils/calendar';

/**
 * Dot-matrix activity heatmap (GitHub-style).
 * - days: dense [{ date: 'YYYY-MM-DD', count }] oldest → newest
 * - color: platform accent (hex)
 * - unit: e.g. 'contribution' / 'submission'
 * - variant: 'card' (compact) | 'full' (dashboard, with month + weekday labels)
 */
function ActivityGraph({ days, color = '#60A5FA', unit = 'contribution', variant = 'card', showLegend = variant === 'full' }) {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null);

  const { weeks, level, streaks, months } = useMemo(() => {
    const w = toWeeks(days || []);
    return { weeks: w, level: levelScale(days || []), streaks: computeStreaks(days || []), months: monthLabels(w) };
  }, [days]);

  const full = variant === 'full';
  const cell = full ? 13 : 7;           // grid pitch (px)
  const r = full ? 4.6 : 2.6;           // dot radius
  const left = full ? 28 : 0;
  const top = full ? 18 : 0;
  const width = left + weeks.length * cell;
  const height = top + 7 * cell;

  if (!days || !days.length) {
    return <div className="ag-empty font-mono">No public activity data</div>;
  }

  const opacityFor = (lvl) => [0, 0.32, 0.55, 0.78, 1][lvl];

  const onMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (e.clientX - rect.left) * scaleX - left;
    const y = (e.clientY - rect.top) * scaleY - top;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    const day = weeks[col]?.[row];
    if (!day || x < 0 || y < 0) {
      setTip(null);
      return;
    }
    const wrap = wrapRef.current.getBoundingClientRect();
    setTip({
      day,
      x: rect.left - wrap.left + (left + col * cell + cell / 2) / scaleX,
      y: rect.top - wrap.top + (top + row * cell) / scaleY,
    });
  };

  const plural = (n) => `${n} ${unit}${n === 1 ? '' : 's'}`;

  return (
    <div className={`ag ag--${variant}`} ref={wrapRef} style={{ '--ag-color': color }}>
      <div className="ag-scroll" data-lenis-prevent>
        <svg
          className="ag-svg"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={full ? { minWidth: width * 0.85 } : undefined}
          role="img"
          aria-label={`${plural(streaks.total)} in the last year. Current streak ${streaks.current} days, longest ${streaks.longest} days.`}
          onMouseMove={onMove}
          onMouseLeave={() => setTip(null)}
        >
          {full && months.map(m => (
            <text key={`${m.col}-${m.label}`} x={left + m.col * cell} y={11} className="ag-label">{m.label}</text>
          ))}
          {full && ['Mon', 'Wed', 'Fri'].map((d, i) => (
            <text key={d} x={0} y={top + (i * 2 + 1) * cell + cell * 0.72} className="ag-label">{d}</text>
          ))}
          {weeks.map((week, col) => week.map((day, row) => {
            if (!day) return null;
            const lvl = level(day.count);
            const cx = left + col * cell + cell / 2;
            const cy = top + row * cell + cell / 2;
            const inStreak = streaks.currentSet.has(day.date);
            return (
              <circle
                key={day.date}
                cx={cx}
                cy={cy}
                r={lvl ? r : r * 0.62}
                className={`ag-dot ${lvl ? 'is-active' : ''} ${inStreak ? 'is-streak' : ''}`}
                style={lvl ? { fillOpacity: opacityFor(lvl) } : undefined}
              />
            );
          }))}
        </svg>
      </div>

      {tip && (
        <div className="ag-tip font-mono" style={{ left: tip.x, top: tip.y }}>
          <strong>{plural(tip.day.count)}</strong>
          <span>{formatDay(tip.day.date)}</span>
          {streaks.currentSet.has(tip.day.date) && <em>part of current streak</em>}
        </div>
      )}

      <div className="ag-meta font-mono">
        <span><b>{streaks.total.toLocaleString('en-US')}</b> {unit}s · last year</span>
        <span className={streaks.current ? 'ag-streak is-on' : 'ag-streak'}>
          <i aria-hidden="true" />
          {streaks.current}d streak
          {full && <> · best {streaks.longest}d</>}
        </span>
      </div>

      {showLegend && (
        <div className="ag-legend font-mono" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map(l => (
            <svg key={l} width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r={l ? 4.6 : 2.9} className={`ag-dot ${l ? 'is-active' : ''}`} style={l ? { fillOpacity: opacityFor(l) } : undefined} />
            </svg>
          ))}
          More
        </div>
      )}
    </div>
  );
}

export default memo(ActivityGraph);
