// LeetCode integration (independent module).
// The official GraphQL endpoint (leetcode.com/graphql) rejects cross-origin browser requests,
// so this uses public CORS-enabled proxies of that same GraphQL data:
//  - primary:  alfa-leetcode-api.onrender.com (free tier — may cold-start for 30–60 s)
//  - fallback: leetcode-api-faisalshohag.vercel.app (serverless, no cold start)
import { ApiError, cached, fetchJSON, settle } from './http';
import { fromUnixCalendar } from '../utils/calendar';

const TTL = 60 * 60 * 1000;
const ALFA = 'https://alfa-leetcode-api.onrender.com';
const FAISAL = 'https://leetcode-api-faisalshohag.vercel.app';

function normalizeProfile(p, source) {
  if (!p || p.errors || typeof p.totalSolved !== 'number') {
    throw new ApiError(p?.errors?.[0]?.message || 'Unexpected profile response', { source });
  }
  const recent = (p.recentSubmissions || []).map(s => ({
    title: s.title,
    slug: s.titleSlug,
    timestamp: Number(s.timestamp) * 1000,
    status: s.statusDisplay,
    lang: s.lang,
  }));
  const all = (p.totalSubmissions || []).find(t => t.difficulty === 'All');
  const acAll = (p.matchedUserStats?.acSubmissionNum || []).find(t => t.difficulty === 'All');
  return {
    source,
    solved: { all: p.totalSolved, easy: p.easySolved, medium: p.mediumSolved, hard: p.hardSolved },
    totals: { all: p.totalQuestions, easy: p.totalEasy, medium: p.totalMedium, hard: p.totalHard },
    ranking: p.ranking ?? null,
    contributionPoints: p.contributionPoint ?? null,
    reputation: p.reputation ?? null,
    // LeetCode's "acceptance" = accepted submissions / all submissions
    acceptance: acAll && all?.submissions ? Math.round((acAll.submissions / all.submissions) * 1000) / 10 : null,
    totalSubmissions: all?.submissions ?? null,
    recent,
    rollingCalendar: p.submissionCalendar || {},
  };
}

/** Race the primary against the fallback if the primary is slow (Render cold start). */
async function loadProfile(user) {
  const primary = fetchJSON(`${ALFA}/userProfile/${user}`, { timeout: 45000, source: ALFA }).then(p => normalizeProfile(p, 'alfa-leetcode-api'));
  const fallback = new Promise((resolve, reject) => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      fetchJSON(`${FAISAL}/${user}`, { timeout: 20000, source: FAISAL })
        .then(p => resolve(normalizeProfile(p, 'leetcode-api-faisalshohag')))
        .catch(reject);
    };
    const timer = setTimeout(start, 6000);                  // give the primary a head start
    primary.then(() => clearTimeout(timer), () => { clearTimeout(timer); start(); }); // failed → fallback now
  });
  try {
    return await Promise.any([primary, fallback]);
  } catch {
    throw new ApiError('LeetCode data sources unreachable');
  }
}

async function loadAllYears(user) {
  const rolling = await fetchJSON(`${ALFA}/${user}/calendar`, { timeout: 20000, source: ALFA });
  const years = (rolling.activeYears || []).filter(y => y !== new Date().getUTCFullYear());
  const yearly = await settle(years.map(y => fetchJSON(`${ALFA}/${user}/calendar?year=${y}`, { timeout: 20000, source: ALFA })));
  const merged = new Map(fromUnixCalendar(rolling.submissionCalendar));
  yearly.forEach(res => {
    if (!res) return;
    fromUnixCalendar(res.submissionCalendar).forEach((v, k) => merged.set(k, v));
  });
  return {
    counts: Object.fromEntries(merged),
    activeYears: rolling.activeYears || [],
    totalActiveDays: rolling.totalActiveDays ?? null,
    partial: yearly.some(r => !r),
  };
}

async function loadContest(user) {
  const res = await fetchJSON(`${ALFA}/userContestRankingInfo/${user}`, { timeout: 20000, source: ALFA });
  const r = res.userContestRanking;
  if (!r) return { attended: 0, rating: null };
  const history = (res.userContestRankingHistory || []).filter(h => h.attended).map(h => ({ rating: Math.round(h.rating), title: h.contest?.title, time: h.contest?.startTime }));
  return {
    attended: r.attendedContestsCount,
    rating: Math.round(r.rating),
    globalRanking: r.globalRanking,
    totalParticipants: r.totalParticipants,
    topPercentage: r.topPercentage,
    badge: r.badge?.name || null,
    history,
  };
}

async function loadBadges(user) {
  const res = await fetchJSON(`${ALFA}/${user}/badges`, { timeout: 20000, source: ALFA });
  return (res.badges || []).map(b => ({
    name: b.displayName || b.name,
    icon: b.icon?.startsWith('http') ? b.icon : `https://leetcode.com${b.icon || ''}`,
  }));
}

export function createLeetCodeClient(user) {
  return {
    cacheKey: `leetcode:${user}`,
    load: ({ force } = {}) => cached(`leetcode:${user}`, TTL, async () => {
      const [profile, calendar, contest, badges] = await settle([
        loadProfile(user),
        loadAllYears(user),
        loadContest(user),
        loadBadges(user),
      ]);
      if (!profile) throw new ApiError('LeetCode data sources unreachable');

      // If the multi-year calendar failed, fall back to the rolling 12-month calendar from the profile.
      const counts = calendar?.counts || Object.fromEntries(fromUnixCalendar(profile.rollingCalendar));
      const { source, ...rest } = profile;
      delete rest.rollingCalendar;
      return {
        ...rest,
        calendar: { counts, activeYears: calendar?.activeYears || [], totalActiveDays: calendar?.totalActiveDays ?? null },
        contest,          // null = unavailable, { attended: 0 } = no contests yet
        badges,           // null = unavailable
        meta: { sources: [source, calendar || contest || badges ? 'alfa-leetcode-api' : null].filter((v, i, a) => v && a.indexOf(v) === i) },
      };
    }, { force }),
  };
}
