// Shared network helpers for the live coding-profile integrations.
// - fetchJSON: fetch with timeout + useful errors
// - firstSuccessful: try a chain of sources (primary → fallbacks)
// - cached: TTL cache in localStorage with stale-on-error + in-flight de-duplication

const DEFAULT_TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(message, { status, source } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.source = source;
  }
}

export async function fetchJSON(url, { timeout = DEFAULT_TIMEOUT, init = {}, source } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const rateLimited = res.status === 403 || res.status === 429;
      throw new ApiError(rateLimited ? 'Rate limited by the data source' : `HTTP ${res.status}`, { status: res.status, source });
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError('Unexpected (non-JSON) response', { status: res.status, source });
    }
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('Request timed out', { source });
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network / CORS error', { source });
  } finally {
    clearTimeout(timer);
  }
}

/** Runs loaders in order and returns the first successful { data, source }. */
export async function firstSuccessful(loaders) {
  const errors = [];
  for (const { name, load } of loaders) {
    try {
      const data = await load();
      return { data, source: name };
    } catch (err) {
      errors.push(`${name}: ${err.message}`);
    }
  }
  throw new ApiError(`All sources failed (${errors.join(' · ')})`);
}

/** Runs loaders in parallel; resolves with the settled values (null for failures). */
export async function settle(promises) {
  const results = await Promise.allSettled(promises);
  return results.map(r => (r.status === 'fulfilled' ? r.value : null));
}

const CACHE_PREFIX = 'sg-profile-cache:v3:';
const FAIL_PREFIX = 'sg-profile-fail:v3:';
const inFlight = new Map();

// Remember recent hard failures (per tab session) so a source that is known to be blocked
// isn't re-requested on every card mount / tab switch. "Retry" (force) always bypasses it.
function readFailure(key, ttl) {
  try {
    const raw = sessionStorage.getItem(FAIL_PREFIX + key);
    if (!raw) return null;
    const f = JSON.parse(raw);
    return Date.now() - f.at < ttl ? f : null;
  } catch {
    return null;
  }
}

function writeFailure(key, err) {
  try {
    sessionStorage.setItem(FAIL_PREFIX + key, JSON.stringify({ at: Date.now(), message: err.message, status: err.status }));
  } catch { /* best-effort */ }
}

function clearFailure(key) {
  try { sessionStorage.removeItem(FAIL_PREFIX + key); } catch { /* best-effort */ }
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — caching is best-effort */
  }
}

/**
 * Returns { data, fetchedAt, stale } using a TTL cache.
 * - fresh cache hit → returned immediately (unless force)
 * - fetch failure with an old cache entry → old entry returned with stale: true
 * - concurrent callers for the same key share one request
 */
export function cached(key, ttlMs, loader, { force = false, failureTtlMs = 5 * 60 * 1000 } = {}) {
  const hit = readCache(key);
  if (!force && hit && Date.now() - hit.fetchedAt < ttlMs) {
    return Promise.resolve({ data: hit.data, fetchedAt: hit.fetchedAt, stale: false });
  }
  if (inFlight.has(key)) return inFlight.get(key);

  const recentFailure = !force && !hit ? readFailure(key, failureTtlMs) : null;
  if (recentFailure) {
    return Promise.reject(new ApiError(recentFailure.message, { status: recentFailure.status }));
  }

  const p = (async () => {
    try {
      const data = await loader();
      const entry = { data, fetchedAt: Date.now() };
      writeCache(key, entry);
      clearFailure(key);
      return { ...entry, stale: false };
    } catch (err) {
      writeFailure(key, err);
      if (hit) return { data: hit.data, fetchedAt: hit.fetchedAt, stale: true, error: err };
      throw err;
    } finally {
      inFlight.delete(key);
    }
  })();
  inFlight.set(key, p);
  return p;
}

export function peekCache(key) {
  const hit = readCache(key);
  return hit ? { data: hit.data, fetchedAt: hit.fetchedAt, stale: true } : null;
}
