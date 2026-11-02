import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import ActivityGraph from '../ActivityGraph';
import YearTabs from '../YearTabs';
import useProfileData from '../hooks/useProfileData';
import useDashboardSync from '../hooks/useDashboardSync';
import { Bar, ErrorState, Notice, Panel, Ring, Skeleton, StatTile } from '../ui';
import { allTimeDays, computeStreaks, daysForView } from '../utils/calendar';
import { fmt, timeAgo } from '../utils/format';
import { leetcodeClient, HANDLES } from '../clients';
import leetcodeLogo from '../../../assets/logos/leetcode.svg';

const ACCENT = '#FFA116';
const DIFF = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function LeetCodeDashboard({ reloadToken, onStatus }) {
  const state = useProfileData(leetcodeClient);
  useDashboardSync(state, reloadToken, onStatus);
  const { status, data, error, reload } = state;
  const [view, setView] = useState('last');

  const counts = data?.calendar?.counts;
  const days = useMemo(() => (counts ? daysForView(counts, view) : null), [counts, view]);
  const lastYear = useMemo(() => (counts ? computeStreaks(daysForView(counts, 'last')) : null), [counts]);
  const lifetime = useMemo(() => (counts ? computeStreaks(allTimeDays(counts)) : null), [counts]);

  if (status === 'loading' && !data) {
    return (
      <>
        <Skeleton />
        <div className="pd-foot font-mono" style={{ padding: '0 32px' }}>The LeetCode data proxy may take up to a minute to wake up on first load…</div>
      </>
    );
  }
  if (status === 'error' && !data) return <ErrorState error={error} onRetry={reload} />;

  const { solved, totals, contest, badges, recent } = data;
  const years = [...(data.calendar.activeYears || [])].sort((a, b) => b - a);
  const views = ['last', ...years];

  return (
    <div className="pd">
      <div className="pd-hero">
        <img className="pd-avatar" src={leetcodeLogo} alt="" style={{ padding: 16 }} />
        <div className="pd-hero-text">
          <h2 className="font-display">{HANDLES.leetcode}</h2>
          <p className="font-mono">LeetCode · global ranking {data.ranking ? `#${fmt(data.ranking)}` : '—'}</p>
          <div className="pd-chips font-mono">
            {data.acceptance !== null && <span className="pd-chip">{data.acceptance}% acceptance</span>}
            {contest && contest.attended > 0 && contest.badge && <span className="pd-chip pd-chip--accent">{contest.badge}</span>}
            {lastYear?.current > 0 && <span className="pd-chip pd-chip--accent">{lastYear.current}-day streak active</span>}
          </div>
        </div>
      </div>

      <div className="pd-two">
        <Panel kicker="Progress" title="Problems solved">
          <div className="pd-flex">
            <Ring value={solved.all} max={totals.all} label={fmt(solved.all)} sub={`OF ${fmt(totals.all)}`} color={ACCENT} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <Bar label="EASY" value={solved.easy} max={totals.easy} color={DIFF.easy} />
              <Bar label="MEDIUM" value={solved.medium} max={totals.medium} color={DIFF.medium} />
              <Bar label="HARD" value={solved.hard} max={totals.hard} color={DIFF.hard} />
            </div>
          </div>
        </Panel>

        <Panel kicker="Competitive" title="Contest rating">
          {contest === null ? (
            <Notice>Contest data is temporarily unavailable from the data source.</Notice>
          ) : contest.attended === 0 ? (
            <div className="pd-grid">
              <StatTile label="Rating" value="Unrated" sub="No contests attended yet" accent={ACCENT} />
              <StatTile label="Contests" value="0" accent={ACCENT} />
            </div>
          ) : (
            <div className="pd-grid">
              <StatTile label="Rating" value={fmt(contest.rating)} accent={ACCENT} />
              <StatTile label="Attended" value={fmt(contest.attended)} accent={ACCENT} />
              <StatTile label="Global rank" value={contest.globalRanking ? `#${fmt(contest.globalRanking)}` : null} sub={contest.totalParticipants ? `of ${fmt(contest.totalParticipants)}` : null} accent={ACCENT} />
              <StatTile label="Top" value={contest.topPercentage !== null && contest.topPercentage !== undefined ? `${contest.topPercentage}%` : null} accent={ACCENT} />
            </div>
          )}
        </Panel>
      </div>

      <div className="pd-grid">
        <StatTile label="Global ranking" value={data.ranking ? `#${fmt(data.ranking)}` : null} accent={ACCENT} />
        <StatTile label="Submissions" value={fmt(data.totalSubmissions)} sub={data.acceptance !== null ? `${data.acceptance}% accepted` : null} accent="#38bdf8" />
        <StatTile label="Current streak" value={lastYear ? `${lastYear.current}d` : null} accent="#22c55e" />
        <StatTile label="Longest streak" value={lifetime ? `${lifetime.longest}d` : null} sub={lifetime ? `${lifetime.activeDays} active days all-time` : null} accent="#f59e0b" />
        <StatTile label="Contribution pts" value={fmt(data.contributionPoints)} accent="#818cf8" />
      </div>

      <Panel kicker="Submission activity" title={view === 'last' ? 'Last 12 months' : `${view}`} aside={views.length > 1 && <YearTabs views={views} value={view} onChange={setView} />}>
        {days && <ActivityGraph days={days} color={ACCENT} unit="submission" variant="full" />}
      </Panel>

      <div className="pd-two">
        <Panel kicker="Recent" title="Submissions">
          {recent.length ? (
            <ul className="pd-list">
              {recent.slice(0, 8).map(s => (
                <li key={`${s.slug}-${s.timestamp}`}>
                  {s.status === 'Accepted' ? <CheckCircle2 size={15} color={DIFF.easy} /> : <XCircle size={15} color={DIFF.hard} />}
                  <div className="pd-list-main">
                    <div className="pd-list-title font-mono">{s.title}</div>
                    <div className="pd-list-sub font-mono">{s.status} · {s.lang}</div>
                  </div>
                  <div className="pd-list-aside font-mono">{timeAgo(s.timestamp)}</div>
                </li>
              ))}
            </ul>
          ) : <Notice>No recent public submissions.</Notice>}
        </Panel>

        <Panel kicker="Achievements" title="Badges">
          {badges === null ? <Notice>Badge data is temporarily unavailable.</Notice>
            : badges.length ? (
              <div className="pd-badges">
                {badges.map(b => (
                  <div key={b.name} className="pd-badge font-mono"><img src={b.icon} alt="" loading="lazy" />{b.name}</div>
                ))}
              </div>
            ) : <Notice>No LeetCode badges earned yet.</Notice>}
        </Panel>
      </div>

      <div className="pd-foot font-mono">Data: {data.meta.sources.join(' · ')} (public proxies of LeetCode&apos;s GraphQL API)</div>
    </div>
  );
}
