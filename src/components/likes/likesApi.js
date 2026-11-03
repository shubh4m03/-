// Shared project like counts — stored in Abacus (https://abacus.jasoncameron.dev), a free CORS-enabled
// counter service that needs no account. The site is static (no backend), so this is the shared store.
//
// Abacus can only *increment* without a secret admin key (which must never ship in a public bundle),
// so each project has two increment-only counters:
//   like-<slug>    +1 whenever someone likes
//   unlike-<slug>  +1 whenever someone removes their like
// The displayed count is likes − unlikes, so unliking really lowers the shared number.
// Each browser remembers its own liked state (localStorage), allowing one like per project per browser.
const BASE = 'https://abacus.jasoncameron.dev';
const NS = 'shubh4m-portfolio';
const TIMEOUT = 8000;
const STATE_KEY = 'sg-liked:';

async function call(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
    if (res.status === 404) return 0; // counter not created yet → nobody has liked it
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const v = Number(data.value);
    if (!Number.isFinite(v)) throw new Error('Unexpected response');
    return v;
  } finally {
    clearTimeout(timer);
  }
}

const key = (kind, slug) => `${encodeURIComponent(NS)}/${kind}-${encodeURIComponent(slug)}`;

/** Returns { likes, unlikes } for a project. Throws if the service is unreachable. */
export async function getCounts(slug) {
  const [likes, unlikes] = await Promise.all([call(`/get/${key('like', slug)}`), call(`/get/${key('unlike', slug)}`)]);
  return { likes, unlikes };
}

/** Records a like (or an unlike) and returns the new value of that counter. */
export function record(slug, liked) {
  return call(`/hit/${key(liked ? 'like' : 'unlike', slug)}`);
}

export const total = ({ likes, unlikes }) => Math.max(0, likes - unlikes);

export function readLiked(slug) {
  try { return localStorage.getItem(STATE_KEY + slug) === '1'; } catch { return false; }
}

export function writeLiked(slug, liked) {
  try {
    if (liked) localStorage.setItem(STATE_KEY + slug, '1');
    else localStorage.removeItem(STATE_KEY + slug);
  } catch { /* storage unavailable — state lasts for this visit only */ }
}
