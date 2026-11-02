// International grouping (1,234,567) — matches how the platforms themselves display ranks/counts
export const fmt = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? null : Number(n).toLocaleString('en-US'));

export function timeAgo(dateLike) {
  const t = new Date(dateLike).getTime();
  if (!t) return '';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  return mo < 12 ? `${mo}mo ago` : `${Math.round(mo / 12)}y ago`;
}

export const LANG_COLORS = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399',
  'C++': '#f34b7d', C: '#555555', Java: '#b07219', PHP: '#4F5D95', Shell: '#89e051', Go: '#00ADD8',
  Rust: '#dea584', 'Jupyter Notebook': '#DA5B0B', Dart: '#00B4AB', Kotlin: '#A97BFF', Ruby: '#701516',
};
