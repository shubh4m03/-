import { useMemo, useState } from 'react';
import { GitBranch, Star, GitFork } from 'lucide-react';
import ContributionSkyline from '../../ContributionSkyline/ContributionSkyline';
import YearTabs from '../YearTabs';
import useProfileData from '../hooks/useProfileData';
import useDashboardSync from '../hooks/useDashboardSync';
import { ErrorState, Notice, Panel, Skeleton, StatTile } from '../ui';
import { allTimeDays, computeStreaks, daysForView, todayKeyUTC } from '../utils/calendar';
import { fmt, LANG_COLORS, timeAgo } from '../utils/format';
import { githubClient } from '../clients';

const ACCENT = '#60A5FA';

export default function GitHubDashboard({ reloadToken, onStatus }) {
  const state = useProfileData(githubClient);
  useDashboardSync(state, reloadToken, onStatus);
  const { status, data, error, reload } = state;
  const [view, setView] = useState('last');

  const counts = data?.calendar?.counts;
  // Real contribution days for the skyline (never the component's generated demo year)
  const skylineData = useMemo(
    () => (counts ? Object.entries(counts).map(([date, count]) => ({ date, count })) : null),
    [counts],
  );
  const today = todayKeyUTC();
  const skylineEnd = view === 'last' ? today : (`${view}-12-31` > today ? today : `${view}-12-31`);
  const lastYear = useMemo(() => (counts ? computeStreaks(daysForView(counts, 'last')) : null), [counts]);
  const lifetime = useMemo(() => (counts ? computeStreaks(allTimeDays(counts)) : null), [counts]);

  if (status === 'loading' && !data) return <Skeleton />;
  if (status === 'error' && !data) return <ErrorState error={error} onRetry={reload} />;

  const { profile, repos, languages, events, calendar } = data;
  const views = ['last', ...(calendar?.byYear || []).filter(y => y.total > 0).map(y => y.year)];
  const lifetimeTotal = calendar?.byYear?.reduce((s, y) => s + y.total, 0) ?? null;
  const recentRepos = [...repos].filter(r => !r.fork).sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt)).slice(0, 6);
  const langTotal = languages?.reduce((s, l) => s + l.count, 0) || 0;

  return (
    <div className="pd">
      <div className="pd-hero">
        {profile.avatar && <img className="pd-avatar" src={profile.avatar} alt="" />}
        <div className="pd-hero-text">
          <h2 className="font-display">{profile.name}</h2>
          <p className="font-mono">@{profile.login}{profile.bio ? ` — ${profile.bio}` : ''}</p>
          <div className="pd-chips font-mono">
            {profile.location && <span className="pd-chip">{profile.location}</span>}
            {profile.createdAt && <span className="pd-chip">Joined {new Date(profile.createdAt).getFullYear()}</span>}
            {lastYear?.current > 0 && <span className="pd-chip pd-chip--accent">{lastYear.current}-day streak active</span>}
          </div>
        </div>
      </div>

      <div className="pd-grid">
        <StatTile label="Contributions · 12 mo" value={fmt(lastYear?.total)} sub={lifetimeTotal !== null ? `${fmt(lifetimeTotal)} all-time` : null} accent={ACCENT} />
        <StatTile label="Current streak" value={lastYear ? `${lastYear.current}d` : null} sub={lastYear?.activeDays !== undefined ? `${lastYear.activeDays} active days` : null} accent="#22c55e" />
        <StatTile label="Longest streak" value={lifetime ? `${lifetime.longest}d` : null} sub={lastYear ? `${lastYear.longest}d in last 12 mo` : null} accent="#f59e0b" />
        <StatTile label="Repositories" value={fmt(data.repoCount)} sub={data.stars !== null ? `${fmt(data.stars)} stars · ${fmt(data.forks)} forks` : null} accent="#818cf8" />
        <StatTile label="Followers" value={fmt(profile.followers)} sub={profile.following !== null && profile.following !== undefined ? `${fmt(profile.following)} following` : 'unavailable (API limit)'} accent="#38bdf8" />
      </div>

      <Panel
        kicker="Contribution graph"
        title={view === 'last' ? 'Last 12 months' : `${view}`}
        aside={views.length > 1 && <YearTabs views={views} value={view} onChange={setView} />}
      >
        {skylineData ? (
          <ContributionSkyline
            className="cs-embedded"
            data={skylineData}
            endDate={skylineEnd}
            palette="portfolio"
            title={view === 'last' ? undefined : (
              <><span className="cs-strong">{fmt(calendar?.byYear?.find(y => y.year === view)?.total ?? 0)}</span> contributions in {view}</>
            )}
          />
        ) : <Notice>The contribution calendar source is unavailable right now. Try reloading.</Notice>}
      </Panel>

      <div className="pd-two">
        <Panel kicker="Stack" title="Languages">
          {languages && languages.length ? (
            <>
              <div className="pd-langs">
                {languages.map(l => (
                  <span key={l.name} title={`${l.name}: ${l.count} repos`} style={{ width: `${(l.count / langTotal) * 100}%`, background: LANG_COLORS[l.name] || '#64748b' }} />
                ))}
              </div>
              <div className="pd-legend font-mono">
                {languages.slice(0, 8).map(l => (
                  <span key={l.name}><i style={{ background: LANG_COLORS[l.name] || '#64748b' }} />{l.name} · {l.count}</span>
                ))}
              </div>
            </>
          ) : <Notice>Language data needs the GitHub REST API, which is rate-limited for this visitor right now (60 requests/hour per IP).</Notice>}
        </Panel>

        <Panel kicker="Repositories" title="Recently pushed">
          <ul className="pd-list">
            {recentRepos.map(r => (
              <li key={r.name}>
                <GitBranch size={14} color={ACCENT} />
                <div className="pd-list-main">
                  <div className="pd-list-title font-mono">{r.name}</div>
                  <div className="pd-list-sub font-mono">{r.description || (r.language ? r.language : 'No description')}</div>
                </div>
                <div className="pd-list-aside font-mono">
                  <Star size={11} /> {r.stars ?? 0} &nbsp;<GitFork size={11} /> {r.forks ?? 0}
                  <div>{timeAgo(r.pushedAt)}</div>
                </div>
              </li>
            ))}
            {!recentRepos.length && <Notice>No public repositories returned.</Notice>}
          </ul>
        </Panel>
      </div>

      <Panel kicker="Live feed" title="Recent activity">
        {events && events.length ? (
          <ul className="pd-list">
            {events.slice(0, 10).map(e => (
              <li key={e.id}>
                <span className="pd-dot" />
                <div className="pd-list-main">
                  <div className="pd-list-title font-mono">{e.label}</div>
                  <div className="pd-list-sub font-mono">{e.repo}</div>
                </div>
                <div className="pd-list-aside font-mono">{timeAgo(e.createdAt)}</div>
              </li>
            ))}
          </ul>
        ) : events ? (
          <Notice>No public events in the last 90 days.</Notice>
        ) : (
          <Notice>The public events feed is rate-limited for this visitor right now (GitHub allows 60 requests/hour per IP). It refreshes automatically once the limit resets.</Notice>
        )}
      </Panel>

      <div className="pd-foot font-mono">Data: {data.meta.sources.join(' · ')} · public activity only</div>
    </div>
  );
}
