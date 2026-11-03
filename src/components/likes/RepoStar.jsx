import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { githubClient } from '../profiles/clients';
import { fmt } from '../profiles/utils/format';

/**
 * "★ Star" pill for a project's GitHub repo: opens the repo so visitors can star it with their own
 * account, and shows the repo's live star count. The count comes from the shared GitHub client
 * (same cached request as the Hacking Profiles section — no extra API calls) and stays hidden
 * until it is known, so no number is ever made up.
 */
export default function RepoStar({ repoUrl, title }) {
  const match = repoUrl?.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  const repoName = match?.[2]?.replace(/\.git$/, '');
  const [stars, setStars] = useState(null);

  useEffect(() => {
    if (!repoName) return undefined;
    let cancelled = false;
    const load = () => githubClient.load()
      .then(({ data }) => {
        const repo = data?.repos?.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        if (!cancelled && repo && Number.isFinite(repo.stars)) setStars(repo.stars);
      })
      .catch(() => { /* count stays hidden */ });
    // Off the critical path, like the like-counts
    const useIdle = typeof window.requestIdleCallback === 'function';
    const id = useIdle ? window.requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 1200);
    return () => {
      cancelled = true;
      if (useIdle) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [repoName]);

  if (!repoName) return null;
  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noreferrer"
      className="repo-star font-mono"
      aria-label={`Star ${title} on GitHub${stars !== null ? ` (${stars} star${stars === 1 ? '' : 's'})` : ''}`}
      title="Opens the repo on GitHub — star it with your account"
    >
      <Star size={15} className="repo-star__icon" />
      <span>Star</span>
      {stars !== null && <span className="repo-star__count">{fmt(stars)}</span>}
    </a>
  );
}
