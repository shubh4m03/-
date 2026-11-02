// Calendar helpers shared by every platform's activity graph.
// All dates are handled as UTC calendar days ('YYYY-MM-DD').

const DAY_MS = 86400000;

export const toKey = (d) => d.toISOString().slice(0, 10);

export function todayKeyUTC() {
  return toKey(new Date());
}

/**
 * Builds a dense list of the last `days` days ending today (UTC), filling gaps with 0.
 * `counts` is a Map/object of 'YYYY-MM-DD' → number.
 */
export function buildDays(counts, days = 365) {
  const map = counts instanceof Map ? counts : new Map(Object.entries(counts || {}));
  const end = new Date(todayKeyUTC() + 'T00:00:00Z').getTime();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = toKey(new Date(end - i * DAY_MS));
    out.push({ date: key, count: Number(map.get(key) || 0) });
  }
  return out;
}

/** Dense day list for an inclusive range of day keys (clamped to today). */
export function buildDaysRange(counts, startKey, endKey) {
  const map = counts instanceof Map ? counts : new Map(Object.entries(counts || {}));
  const today = todayKeyUTC();
  const end = new Date((endKey > today ? today : endKey) + 'T00:00:00Z').getTime();
  const out = [];
  for (let t = new Date(startKey + 'T00:00:00Z').getTime(); t <= end; t += DAY_MS) {
    const key = toKey(new Date(t));
    out.push({ date: key, count: Number(map.get(key) || 0) });
  }
  return out;
}

/** Days for a given view: 'last' (rolling 365 days) or a calendar year number. */
export function daysForView(counts, view) {
  if (view === 'last') return buildDays(counts, 365);
  return buildDaysRange(counts, `${view}-01-01`, `${view}-12-31`);
}

/** All-time dense list from the earliest active day to today (for lifetime streaks). */
export function allTimeDays(counts) {
  const keys = Object.keys(counts || {}).sort();
  if (!keys.length) return [];
  return buildDaysRange(counts, keys[0], todayKeyUTC());
}

/** LeetCode-style calendar: { "<unix seconds>": count } → Map of day keys. */
export function fromUnixCalendar(cal) {
  const map = new Map();
  if (!cal) return map;
  const obj = typeof cal === 'string' ? safeParse(cal) : cal;
  for (const [ts, count] of Object.entries(obj || {})) {
    const key = toKey(new Date(Number(ts) * 1000));
    map.set(key, (map.get(key) || 0) + Number(count || 0));
  }
  return map;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

/**
 * Streak stats over a dense day list (oldest → newest).
 * Current streak counts back from today; if today has no activity yet it starts from yesterday.
 */
export function computeStreaks(days) {
  let longest = 0;
  let run = 0;
  let longestEnd = -1;
  let total = 0;
  let activeDays = 0;
  days.forEach((d, i) => {
    total += d.count;
    if (d.count > 0) {
      activeDays += 1;
      run += 1;
      if (run > longest) {
        longest = run;
        longestEnd = i;
      }
    } else {
      run = 0;
    }
  });

  let current = 0;
  let idx = days.length - 1;
  if (idx >= 0 && days[idx].count === 0) idx -= 1; // today not active yet → start yesterday
  const currentEnd = idx;
  while (idx >= 0 && days[idx].count > 0) {
    current += 1;
    idx -= 1;
  }

  const currentSet = new Set();
  for (let i = currentEnd; i > currentEnd - current; i--) currentSet.add(days[i].date);
  const longestSet = new Set();
  for (let i = longestEnd; i > longestEnd - longest && i >= 0; i--) longestSet.add(days[i].date);

  const best = days.reduce((m, d) => (d.count > m.count ? d : m), { count: 0, date: null });
  return { total, activeDays, current, longest, currentSet, longestSet, bestDay: best.count > 0 ? best : null };
}

/** Intensity level 0–4 using quartiles of the non-zero counts (robust to outliers). */
export function levelScale(days) {
  const nz = days.map(d => d.count).filter(c => c > 0).sort((a, b) => a - b);
  if (!nz.length) return () => 0;
  const q = (p) => nz[Math.min(nz.length - 1, Math.floor(p * (nz.length - 1)))];
  const t1 = q(0.25), t2 = q(0.5), t3 = q(0.75);
  return (c) => (c <= 0 ? 0 : c <= t1 ? 1 : c <= t2 ? 2 : c <= t3 ? 3 : 4);
}

/** Groups a dense day list into week columns (Sun → Sat) for the dot matrix. */
export function toWeeks(days) {
  if (!days.length) return [];
  const first = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
  const padded = [...Array(first).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  const last = weeks[weeks.length - 1];
  while (last.length < 7) last.push(null);
  return weeks;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Month labels positioned at the first week column where a new month starts. */
export function monthLabels(weeks) {
  const labels = [];
  let prev = -1;
  weeks.forEach((week, col) => {
    const firstDay = week.find(Boolean);
    if (!firstDay) return;
    const m = new Date(firstDay.date + 'T00:00:00Z').getUTCMonth();
    if (m !== prev) {
      if (!labels.length || col - labels[labels.length - 1].col >= 3) labels.push({ col, label: MONTHS[m] });
      prev = m;
    }
  });
  return labels;
}

export function formatDay(key) {
  const d = new Date(key + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Sum of the most recent N days. */
export function sumLast(days, n) {
  return days.slice(-n).reduce((s, d) => s + d.count, 0);
}
