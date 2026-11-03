// Imports a TryHackMe yearly-activity export into src/components/profiles/data/tryhackme-activity.json,
// which drives the TryHackMe dot-matrix graph (TryHackMe's API can't be read cross-site).
//
// How to export (your own profile, in your own logged-in browser):
//   1. Open https://tryhackme.com/p/shubh4m03 → DevTools (F12) → Network tab → filter "activity".
//   2. Reload, click the "yearly-activity" request → Response → copy it into a file, e.g. thm.json.
//   3. node scripts/import-thm-activity.mjs thm.json
//
// Accepts the common shapes: [{ date|day, count|events|value }], { data: [...] }, { data: { activity: [...] } },
// or an object map { "YYYY-MM-DD": n }. Unix timestamps (s or ms) are converted to UTC days.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) { console.error('Usage: node scripts/import-thm-activity.mjs <export.json>'); process.exit(1); }
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/components/profiles/data/tryhackme-activity.json');

const raw = JSON.parse(await readFile(input, 'utf8'));
const toDay = (v) => {
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v).toISOString().slice(0, 10);
  const s = String(v);
  if (/^\d+$/.test(s)) return toDay(Number(s));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : (/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : d.toISOString().slice(0, 10));
};

function findArray(o, depth = 0) {
  if (Array.isArray(o)) return o;
  if (!o || typeof o !== 'object' || depth > 3) return null;
  for (const v of Object.values(o)) { const a = findArray(v, depth + 1); if (a) return a; }
  return null;
}

const counts = {};
const arr = findArray(raw);
if (arr) {
  for (const e of arr) {
    const day = toDay(e.date ?? e.day ?? e._id ?? e.timestamp ?? e.time);
    const n = Number(e.count ?? e.events ?? e.value ?? e.total ?? e.activity ?? 0);
    if (day && n > 0) counts[day] = (counts[day] || 0) + n;
  }
} else {
  for (const [k, v] of Object.entries(raw)) { const day = toDay(k); if (day && Number(v) > 0) counts[day] = Number(v); }
}

const days = Object.keys(counts).sort();
if (!days.length) { console.error('No activity entries recognised — send the raw export so the importer can be adapted.'); process.exit(1); }
const sorted = Object.fromEntries(days.map(d => [d, counts[d]]));
await writeFile(OUT, JSON.stringify({ asOf: new Date().toISOString().slice(0, 10), counts: sorted }, null, 2) + '\n');
console.log(`Imported ${days.length} active days (${days[0]} → ${days.at(-1)}, ${Object.values(counts).reduce((a, b) => a + b, 0)} events) → ${OUT}`);
