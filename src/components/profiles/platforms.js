// Platform registry: each entry is self-contained (client, card summary, dashboard).
import githubLogo from '../../assets/logos/github.svg';
import leetcodeLogo from '../../assets/logos/leetcode.svg';
import tryhackmeLogo from '../../assets/logos/tryhackme.svg';
import GitHubDashboard from './dashboards/GitHubDashboard';
import LeetCodeDashboard from './dashboards/LeetCodeDashboard';
import TryHackMeDashboard from './dashboards/TryHackMeDashboard';
import { githubClient, leetcodeClient, tryhackmeClient, HANDLES } from './clients';
import { buildDays, computeStreaks } from './utils/calendar';
import { fmt } from './utils/format';

const lastYearStreaks = (counts) => (counts ? computeStreaks(buildDays(counts, 365)) : null);

export const PLATFORMS = [
  {
    id: 'github',
    name: 'GitHub',
    handle: HANDLES.github,
    url: `https://github.com/${HANDLES.github}`,
    logo: githubLogo,
    color: '#60A5FA',
    client: githubClient,
    Dashboard: GitHubDashboard,
    card: {
      unit: 'contribution',
      days: (d) => (d.calendar ? buildDays(d.calendar.counts, 365) : null),
      stats: (d) => {
        const s = lastYearStreaks(d.calendar?.counts);
        return [
          { label: 'Contribs · 12mo', value: fmt(s?.total) },
          { label: 'Repos', value: fmt(d.repoCount) },
          { label: 'Best streak', value: s ? `${s.longest}d` : null },
        ];
      },
    },
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    handle: HANDLES.leetcode,
    url: `https://leetcode.com/u/${HANDLES.leetcode}/`,
    logo: leetcodeLogo,
    color: '#FFA116',
    client: leetcodeClient,
    Dashboard: LeetCodeDashboard,
    card: {
      unit: 'submission',
      days: (d) => buildDays(d.calendar.counts, 365),
      stats: (d) => [
        { label: 'Solved', value: fmt(d.solved.all) },
        { label: 'E · M · H', value: `${d.solved.easy}·${d.solved.medium}·${d.solved.hard}` },
        { label: 'Ranking', value: d.ranking ? `#${fmt(d.ranking)}` : null },
      ],
    },
  },
  {
    id: 'tryhackme',
    name: 'TryHackMe',
    handle: HANDLES.tryhackme,
    url: `https://tryhackme.com/p/${HANDLES.tryhackme}`,
    logo: tryhackmeLogo,
    color: '#E8343B',
    client: tryhackmeClient,
    Dashboard: TryHackMeDashboard,
    card: {
      unit: 'room',
      days: () => null,
      noGraphText: (d) => (d.yearlyEvents
        ? `${fmt(d.yearlyEvents)} events in the last year${d.meta?.snapshot ? ` · snapshot ${d.meta.asOf}` : ''}`
        : 'TryHackMe has no public activity calendar'),
      stats: (d) => [
        { label: 'Rank', value: d.rank },
        { label: 'Rooms', value: fmt(d.rooms) },
        { label: 'Badges', value: fmt(d.badges) },
      ],
    },
  },
];
