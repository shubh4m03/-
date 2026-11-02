import { useCallback, useEffect, useRef, useState } from 'react';
import { peekCache } from '../api/http';

/**
 * Generic loader hook for a platform integration.
 * `platform` must expose: cacheKey, load({ force }) → Promise<{ data, fetchedAt, stale, error? }>.
 * Shows any cached data instantly, then refreshes in the background.
 */
export default function useProfileData(platform, { enabled = true } = {}) {
  const [state, setState] = useState(() => {
    const cachedEntry = peekCache(platform.cacheKey);
    return {
      status: cachedEntry ? 'success' : 'loading',
      data: cachedEntry?.data ?? null,
      fetchedAt: cachedEntry?.fetchedAt ?? null,
      stale: Boolean(cachedEntry),
      error: null,
      refreshing: true,
    };
  });
  const mounted = useRef(true);
  const requestId = useRef(0);

  const run = useCallback(async (force = false) => {
    const id = ++requestId.current;
    setState(s => ({ ...s, refreshing: true, status: s.data ? s.status : 'loading', error: null }));
    try {
      const res = await platform.load({ force });
      if (!mounted.current || id !== requestId.current) return;
      setState({
        status: 'success',
        data: res.data,
        fetchedAt: res.fetchedAt,
        stale: Boolean(res.stale),
        error: res.error || null,
        refreshing: false,
      });
    } catch (error) {
      if (!mounted.current || id !== requestId.current) return;
      setState(s => ({ ...s, status: s.data ? 'success' : 'error', error, refreshing: false, stale: Boolean(s.data) }));
    }
  }, [platform]);

  useEffect(() => {
    mounted.current = true;
    if (enabled) run(false);
    return () => {
      mounted.current = false;
    };
  }, [enabled, run]);

  const reload = useCallback(() => run(true), [run]);
  return { ...state, reload };
}
