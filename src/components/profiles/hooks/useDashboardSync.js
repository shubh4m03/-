import { useEffect, useRef } from 'react';

/**
 * Wires a dashboard's data state to the mini-browser chrome:
 * - reports { refreshing, fetchedAt, stale, source } so the toolbar can show LIVE / CACHED / SYNCING
 * - re-fetches when the browser's reload button bumps `reloadToken`
 */
export default function useDashboardSync(state, reloadToken, onStatus) {
  const { refreshing, fetchedAt, stale, data, reload, error } = state;
  const source = data?.meta?.sources?.join(' + ');
  const offline = Boolean(error) && !data;
  const snapshot = data?.meta?.snapshot ? data.meta.asOf : null;

  useEffect(() => {
    onStatus?.({ refreshing, fetchedAt, stale, source, offline, snapshot });
  }, [refreshing, fetchedAt, stale, source, offline, snapshot, onStatus]);

  const firstToken = useRef(reloadToken);
  useEffect(() => {
    if (reloadToken !== firstToken.current) reload();
  }, [reloadToken, reload]);
}
