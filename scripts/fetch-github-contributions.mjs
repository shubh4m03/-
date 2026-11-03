// Builds public/data/github-contributions.json from GitHub's own public contribution calendar
// (https://github.com/users/<user>/contributions). Run every 6 h by .github/workflows/contributions.yml.
//
// Why: the live third-party calendar API used by the site (github-contributions-api.jogruber.de) is
// unreachable on some networks (connections reset by certain ISPs), which left the GitHub dot-matrix
// empty. This file is a real, dated copy served from GitHub/raw and from the site itself as a fallback.
//
// Output shape matches the jogruber v4 API: { total: { [year]: n }, contributions: [{ date, count }] }.
// Usage: node scripts/fetch-github-contributions.mjs [username]
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = process.argv[2] || 'shubh4m03';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/data/github-contributions.json');
const UA = { 'User-Agent': 'sg-portfolio-contributions-sync' };

async function get(url, init = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { ...init, headers: { ...UA, ...(init.headers || {}) } });
    if (res.ok) return res;
    if (attempt === 3) throw new Error(`${url} → HTTP ${res.status}`);
    await new Promise(r => setTimeout(r, 1500 * attempt));
  }
}

function parseYear(html) {
  // Day cells: <td ... data-date="YYYY-MM-DD" id="contribution-day-component-R-C" ...>
  const idToDate = new Map();
  for (const m of html.matchAll(/<td\b[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?\bid="([^"]+)"/g)) idToDate.set(m[2], m[1]);
  for (const m of html.matchAll(/<td\b[^>]*?\bid="([^"]+)"[^>]*?data-date="(\d{4}-\d{2}-\d{2})"/g)) idToDate.set(m[1], m[2]);
  // Counts live in the matching tooltips: "6 contributions on November 2nd." / "No contributions on …"
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*?\bfor="([^"]+)"[^>]*>\s*(No|\d[\d,]*) contributions?\b/g)) {
    const date = idToDate.get(m[1]);
    if (date) counts.set(date, m[2] === 'No' ? 0 : Number(m[2].replace(/,/g, '')));
  }
  if (idToDate.size === 0) throw new Error('No calendar cells found — GitHub markup may have changed');
  if (counts.size < idToDate.size * 0.9) throw new Error(`Only ${counts.size}/${idToDate.size} day counts parsed`);
  return counts;
}

// Account creation year (REST API; a token only raises the rate limit). If the API is unavailable,
// walk back year by year until two consecutive empty years.
async function accountFirstYear() {
  try {
    const headers = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const profile = await (await get(`https://api.github.com/users/${USER}`, { headers })).json();
    return new Date(profile.created_at).getUTCFullYear();
  } catch (err) {
    console.warn(`GitHub REST API unavailable (${err.message}); discovering years from the calendar instead.`);
    return null;
  }
}

const thisYear = new Date().getUTCFullYear();
const today = new Date().toISOString().slice(0, 10);
const firstYear = await accountFirstYear();

const all = new Map();
const total = {};
let emptyRun = 0;
for (let y = thisYear; y >= (firstYear ?? thisYear - 15); y--) {
  const html = await (await get(`https://github.com/users/${USER}/contributions?from=${y}-01-01&to=${y}-12-31`)).text();
  const counts = parseYear(html);
  let sum = 0;
  for (const [date, count] of counts) {
    if (!date.startsWith(`${y}-`) || date > today) continue;
    all.set(date, count);
    sum += count;
  }
  if (firstYear === null) {
    emptyRun = sum === 0 ? emptyRun + 1 : 0;
    if (emptyRun === 2) { for (const d of [...all.keys()]) if (d < `${y + 2}-`) all.delete(d); delete total[y + 1]; break; }
  }
  total[y] = sum;
}

const contributions = [...all.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
const out = { user: USER, generatedAt: new Date().toISOString(), source: `github.com/users/${USER}/contributions`, total, contributions };
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out) + '\n');
console.log(`Wrote ${contributions.length} days (${Object.entries(total).map(([y, n]) => `${y}: ${n}`).join(', ')}) → ${OUT}`);
