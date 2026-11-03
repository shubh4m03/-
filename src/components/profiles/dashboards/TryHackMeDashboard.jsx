import { ShieldAlert, RotateCw } from 'lucide-react';
import useProfileData from '../hooks/useProfileData';
import useDashboardSync from '../hooks/useDashboardSync';
import { Notice, Panel, Skeleton, StatTile } from '../ui';
import { fmt } from '../utils/format';
import ContributionSkyline from '../../ContributionSkyline/ContributionSkyline';
import { toSkylineData } from '../utils/calendar';
import { tryhackmeClient, HANDLES } from '../clients';
import thmLogo from '../../../assets/logos/tryhackme.svg';

const ACCENT = '#E8343B';

export default function TryHackMeDashboard({ reloadToken, onStatus }) {
  const state = useProfileData(tryhackmeClient);
  useDashboardSync(state, reloadToken, onStatus);
  const { status, data, error, reload, refreshing } = state;

  if (status === 'loading' && !data) return <Skeleton />;

  if (!data) {
    return (
      <div className="pd">
        <div className="pd-hero">
          <img className="pd-avatar" src={thmLogo} alt="" style={{ padding: 16 }} />
          <div className="pd-hero-text">
            <h2 className="font-display">{HANDLES.tryhackme}</h2>
            <p className="font-mono">TryHackMe · offensive security training</p>
          </div>
        </div>

        <Panel kicker="Live data" title="Blocked by TryHackMe">
          <div className="pd-blocked">
            <ShieldAlert size={34} color={ACCENT} />
            <div>
              <p className="font-mono">{error?.message}</p>
              <p className="font-mono pd-blocked-sub">
                TryHackMe&apos;s public profile API is protected by a bot-protection checkpoint and sends no CORS headers,
                so no website other than tryhackme.com can read it from a visitor&apos;s browser. Rather than show
                estimated or hardcoded numbers, this dashboard checks the official API on every visit and fills in
                rank, rooms, badges and streaks automatically if TryHackMe allows it.
              </p>
              <button type="button" className="pd-retry font-mono" onClick={reload} disabled={refreshing}>
                <RotateCw size={13} /> {refreshing ? 'Checking…' : 'Check again'}
              </button>
            </div>
          </div>
        </Panel>

        <div className="pd-grid">
          {['Global rank', 'Rooms completed', 'Badges', 'Points', 'Streak'].map(l => <StatTile key={l} label={l} value={null} sub="not publicly accessible" accent={ACCENT} />)}
        </div>
        <div className="pd-foot font-mono">Source: tryhackme.com/api/v2/public-profile (official) · no third-party scraping</div>
      </div>
    );
  }

  const p = data.profile;
  const snap = data.meta?.snapshot ? data.meta.asOf : null;
  const asOfLabel = snap ? new Date(snap + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;
  return (
    <div className="pd">
      <div className="pd-hero">
        <img className="pd-avatar" src={p.avatar || thmLogo} alt="" style={p.avatar ? undefined : { padding: 16 }} />
        <div className="pd-hero-text">
          <h2 className="font-display">{p.username}</h2>
          <p className="font-mono">TryHackMe{p.level !== null ? ` · level ${p.level}` : ''}{p.role ? ` · ${p.role}` : ''}{p.country === 'in' ? ' · India' : ''}</p>
          <div className="pd-chips font-mono">
            {data.rank && <span className="pd-chip pd-chip--accent">{data.rank}</span>}
            {data.league && <span className="pd-chip">{data.league} league</span>}
            {p.joined && <span className="pd-chip">Joined {new Date(p.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>}
            {snap && <span className="pd-chip">Snapshot · {asOfLabel}</span>}
          </div>
        </div>
      </div>
      <div className="pd-grid">
        <StatTile label="Global rank" value={data.rank} accent={ACCENT} />
        <StatTile label="Rooms completed" value={fmt(data.rooms)} accent={ACCENT} />
        <StatTile label="Badges" value={fmt(data.badges)} accent="#f59e0b" />
        <StatTile label="Points" value={fmt(data.points)} accent="#38bdf8" />
        {data.streak !== null && data.streak !== undefined
          ? <StatTile label="Streak" value={`${data.streak}d`} sub={data.longestStreak ? `best ${data.longestStreak}d` : null} accent="#22c55e" />
          : <StatTile label="Highest streak" value={data.longestStreak ? `${data.longestStreak}d` : null} accent="#22c55e" />}
        {data.capability !== null && data.capability !== undefined && <StatTile label="Capability score" value={fmt(Math.round(data.capability))} accent="#818cf8" />}
        {data.league && <StatTile label="Highest league" value={data.league} accent="#a3a3a3" />}
        {data.yearlyEvents ? <StatTile label="Activity · last year" value={fmt(data.yearlyEvents)} sub="events" accent="#22c55e" /> : null}
      </div>
      {snap && (
        <Notice>
          Snapshot of the public profile as of {asOfLabel}. TryHackMe blocks cross-site requests (bot-protection
          checkpoint, no CORS), so these numbers can’t be fetched live from a browser. The dashboard still checks the
          official API on every visit and switches to live data automatically if TryHackMe allows it.
        </Notice>
      )}
      <Panel kicker="Activity" title={data.calendar ? 'Last 12 months' : 'Daily activity'}>
        {data.calendar ? (
          <>
            <ContributionSkyline
              className="cs-embedded"
              data={toSkylineData(data.calendar.counts)}
              endDate={data.calendar.asOf || undefined}
              palette="tryhackme"
              unit="event"
              riseOnHover
            />
            {data.calendar.asOf && <div className="pd-foot font-mono" style={{ marginTop: 10 }}>Exported from the TryHackMe profile on {data.calendar.asOf}</div>}
          </>
        ) : (
          <Notice>TryHackMe does not expose its daily-activity calendar through a public API, so no heatmap is drawn here.</Notice>
        )}
      </Panel>
      <div className="pd-foot font-mono">Data: {snap ? `tryhackme.com/p/${p.username} · snapshot ${snap}` : 'tryhackme.com (official API)'}</div>
    </div>
  );
}
