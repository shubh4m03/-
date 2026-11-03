// GitHub integration (independent module).
// Sources (all browser-callable with CORS):
//  - api.github.com REST: profile, repos, public events (60 req/h per visitor IP)
//  - github-contributions-api.jogruber.de: daily contribution calendar (scraped from github.com)
//  - ungh.cc: fallback for name/avatar/repos when the REST quota is exhausted
import { cached, fetchJSON, settle } from './http';

const TTL = 30 * 60 * 1000;

const ghHeaders = { Accept: 'application/vnd.github+json' };

async function loadProfile(user) {
  try {
    const p = await fetchJSON(`https://api.github.com/users/${user}`, { init: { headers: ghHeaders }, source: 'api.github.com' });
    return {
      source: 'api.github.com',
      profile: {
        login: p.login,
        name: p.name || p.login,
        avatar: p.avatar_url,
        bio: p.bio,
        location: p.location,
        followers: p.followers,
        following: p.following,
        publicRepos: p.public_repos,
        createdAt: p.created_at,
      },
    };
  } catch {
    const u = await fetchJSON(`https://ungh.cc/users/${user}`, { source: 'ungh.cc' });
    return {
      source: 'ungh.cc',
      profile: {
        login: u.user?.username || user,
        name: u.user?.name || user,
        avatar: u.user?.avatar,
        bio: null,
        location: null,
        followers: null,           // not provided by the fallback — shown as "—"
        following: null,
        publicRepos: null,
        createdAt: null,
      },
    };
  }
}

async function loadRepos(user) {
  try {
    const list = await fetchJSON(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, { init: { headers: ghHeaders }, source: 'api.github.com' });
    return {
      source: 'api.github.com',
      hasLanguages: true,
      repos: list.map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        pushedAt: r.pushed_at,
        fork: r.fork,
      })),
    };
  } catch {
    const res = await fetchJSON(`https://ungh.cc/users/${user}/repos`, { source: 'ungh.cc' });
    return {
      source: 'ungh.cc',
      hasLanguages: false,
      repos: (res.repos || []).map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stars,
        forks: r.forks,
        language: null,
        pushedAt: r.pushedAt,
        fork: false,
      })),
    };
  }
}

const EVENT_LABEL = {
  PushEvent: (e) => {
    const n = e.payload?.size ?? e.payload?.commits?.length;
    return Number.isFinite(n) ? `Pushed ${n} commit${n === 1 ? '' : 's'}` : 'Pushed commits';
  },
  CreateEvent: (e) => `Created ${e.payload?.ref_type || 'repository'}${e.payload?.ref ? ` ${e.payload.ref}` : ''}`,
  DeleteEvent: (e) => `Deleted ${e.payload?.ref_type || ''} ${e.payload?.ref || ''}`.trim(),
  WatchEvent: () => 'Starred',
  ForkEvent: () => 'Forked',
  IssuesEvent: (e) => `${cap(e.payload?.action)} an issue`,
  IssueCommentEvent: () => 'Commented on an issue',
  PullRequestEvent: (e) => `${cap(e.payload?.action)} a pull request`,
  PullRequestReviewEvent: () => 'Reviewed a pull request',
  ReleaseEvent: () => 'Published a release',
  PublicEvent: () => 'Made public',
  MemberEvent: () => 'Added a collaborator',
};
const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

async function loadEvents(user) {
  const list = await fetchJSON(`https://api.github.com/users/${user}/events/public?per_page=40`, { init: { headers: ghHeaders }, source: 'api.github.com' });
  return list.slice(0, 25).map(e => ({
    id: e.id,
    type: e.type,
    label: (EVENT_LABEL[e.type] || (() => e.type.replace(/Event$/, '')))(e),
    repo: e.repo?.name,
    createdAt: e.created_at,
  }));
}

// Fallback copies of github.com's contribution calendar, regenerated every 6 h by
// .github/workflows/contributions.yml (scripts/fetch-github-contributions.mjs). Used when the live
// calendar API is unreachable (some ISPs reset connections to it).
const SYNCED_CALENDAR = {
  shubh4m03: [
    // Same-origin copy first: always reachable (raw.githubusercontent.com is blocked by some ISPs too)
    { name: 'synced (site)', url: `${import.meta.env.BASE_URL}data/github-contributions.json` },
    { name: 'synced (github raw)', url: 'https://raw.githubusercontent.com/shubh4m03/-/main/public/data/github-contributions.json' },
  ],
};

async function loadCalendarRaw(user) {
  const sources = [
    { name: 'jogruber', url: `https://github-contributions-api.jogruber.de/v4/${user}`, timeout: 6000 },
    ...(SYNCED_CALENDAR[user] || []),
  ];
  const errors = [];
  for (const s of sources) {
    try {
      const res = await fetchJSON(s.url, { source: s.name, timeout: s.timeout ?? 10000 });
      if (!Array.isArray(res?.contributions) || !res.contributions.length) throw new Error('empty calendar');
      return { res, source: s.name, generatedAt: res.generatedAt || null };
    } catch (err) {
      errors.push(`${s.name}: ${err.message}`);
    }
  }
  throw new Error(`Calendar unavailable (${errors.join(' · ')})`);
}

async function loadCalendar(user) {
  // All years in one call: gives last-year window, per-year totals and lifetime streaks.
  const { res, source, generatedAt } = await loadCalendarRaw(user);
  const today = new Date().toISOString().slice(0, 10);
  const counts = {};
  for (const d of res.contributions || []) {
    if (d.date <= today && d.count > 0) counts[d.date] = d.count;   // drop future placeholders
  }
  const byYear = Object.entries(res.total || {})
    .map(([year, total]) => ({ year: Number(year), total }))
    .filter(y => Number.isFinite(y.year))
    .sort((a, b) => b.year - a.year);
  return { counts, byYear, source, generatedAt };
}

export function createGitHubClient(user) {
  return {
    cacheKey: `github:${user}`,
    load: ({ force } = {}) => cached(`github:${user}`, TTL, async () => {
      const [profileRes, reposRes, events, calendar] = await settle([
        loadProfile(user),
        loadRepos(user),
        loadEvents(user),
        loadCalendar(user),
      ]);
      if (!profileRes && !reposRes && !calendar) throw new Error('GitHub data sources unreachable');

      const repos = reposRes?.repos || [];
      const own = repos.filter(r => !r.fork);
      let languages = null;
      if (reposRes?.hasLanguages) {
        const counts = {};
        own.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
        languages = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
      }

      return {
        profile: profileRes?.profile || { login: user, name: user },
        repos,
        repoCount: profileRes?.profile?.publicRepos ?? (reposRes ? repos.length : null),
        stars: reposRes ? own.reduce((s, r) => s + (r.stars || 0), 0) : null,
        forks: reposRes ? own.reduce((s, r) => s + (r.forks || 0), 0) : null,
        languages,
        events,                      // null when the events API is unavailable
        calendar,                    // null when the calendar source is unavailable
        meta: {
          sources: [...new Set([profileRes?.source, reposRes?.source, events ? 'api.github.com' : null, calendar?.source].filter(Boolean))],
        },
      };
    }, { force }),
  };
}
