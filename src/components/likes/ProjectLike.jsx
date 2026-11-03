import { useEffect, useRef, useState } from 'react';
import PulseHeart from '../PulseHeart/PulseHeart';
import { getCounts, readLiked, record, total, writeLiked } from './likesApi';

/**
 * Like button + shared like count for one project card.
 * Count is real (from the shared counter); it is hidden until loaded rather than showing a made-up number.
 */
export default function ProjectLike({ slug, title }) {
  const [liked, setLiked] = useState(() => readLiked(slug));
  const [counts, setCounts] = useState(null); // { likes, unlikes } once loaded
  const [failed, setFailed] = useState(false);
  const pending = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const load = () => getCounts(slug)
      .then(c => { if (!cancelled) { setCounts(c); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    // Defer off the critical path (the loader/intro is running at mount)
    const useIdle = typeof window.requestIdleCallback === 'function';
    const id = useIdle ? window.requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 1200);
    return () => {
      cancelled = true;
      if (useIdle) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [slug]);

  const onChange = (nextLiked) => {
    setLiked(nextLiked);
    writeLiked(slug, nextLiked);
    // Optimistic update; requests are chained so rapid toggles stay in order
    setCounts(c => (c ? { ...c, [nextLiked ? 'likes' : 'unlikes']: c[nextLiked ? 'likes' : 'unlikes'] + 1 } : c));
    pending.current = pending.current.then(() => record(slug, nextLiked)
      .then(value => {
        // Reconcile with the server's value for the counter we just hit
        setCounts(c => (c ? { ...c, [nextLiked ? 'likes' : 'unlikes']: value } : c));
        setFailed(false);
      })
      .catch(() => {
        // Not recorded → roll back so the UI never shows a count the server doesn't have
        setLiked(!nextLiked);
        writeLiked(slug, !nextLiked);
        setCounts(c => (c ? { ...c, [nextLiked ? 'likes' : 'unlikes']: c[nextLiked ? 'likes' : 'unlikes'] - 1 } : c));
        setFailed(true);
      }));
  };

  const loaded = counts !== null;
  return (
    <div className="project-like" title={failed && !loaded ? 'Like count unavailable right now' : undefined}>
      <PulseHeart
        liked={liked}
        count={loaded ? total(counts) : 0}
        onChange={onChange}
        showCount={loaded}
        icon="heart"
        idleOutline
        size={22}
        corner={100}
        likedColor="#ff4d6d"
        idleColor="rgba(var(--fg-rgb), 0.55)"
        pillColor="rgba(var(--fg-rgb), 0.06)"
        textColor="var(--white)"
        duration={560}
        dotSize={0.3}
        overshoot={1.7}
        beat={3}
        rollDuration={350}
        disabled={!loaded && !failed}
        label={`Like ${title}`}
      />
    </div>
  );
}
