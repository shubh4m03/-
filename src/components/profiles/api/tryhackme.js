// TryHackMe integration (independent module).
//
// TryHackMe's public profile API (tryhackme.com/api/v2/public-profile) is the only official source,
// but every tryhackme.com endpoint currently sits behind a bot-protection checkpoint and sends no
// CORS headers, so browsers on other sites cannot read it. We still try the official endpoint on
// each (cached) load — if TryHackMe ever allows cross-origin reads it starts working automatically.
// When it is blocked, a dated SNAPSHOT copied from the public profile is shown instead, always
// labelled as a snapshot with its date (see ../data/tryhackme-snapshot.js). Nothing is estimated.
import { ApiError, cached, fetchJSON } from './http';
import { TRYHACKME_SNAPSHOT } from '../data/tryhackme-snapshot';
// Daily activity exported from the user's own TryHackMe profile (scripts/import-thm-activity.mjs).
// Empty until imported — the graph is only drawn from real exported data, never estimated.
import THM_ACTIVITY from '../data/tryhackme-activity.json';

const activityCalendar = () => (THM_ACTIVITY?.counts && Object.keys(THM_ACTIVITY.counts).length
  ? { counts: THM_ACTIVITY.counts, asOf: THM_ACTIVITY.asOf }
  : null);

const TTL = 30 * 60 * 1000;

function normalize(res) {
  const d = res?.data;
  if (!d || res.status !== 'success') throw new ApiError('Unexpected TryHackMe response', { source: 'tryhackme.com' });
  return {
    profile: {
      username: d.username,
      avatar: d.avatar || null,
      country: d.country || null,
      level: d.level ?? null,
      role: d.userRole || null,
      joined: d.dateSignUp || null,
    },
    rank: d.rank ?? null,                      // e.g. 'Top 20%'
    topPercentage: d.topPercentage ?? null,
    points: d.totalPoints ?? null,
    rooms: d.completedRoomsNumber ?? null,
    badges: d.badgesNumber ?? null,
    streak: d.streak ?? null,
    longestStreak: d.largestStreak ?? null,
    league: d.leagueTier ?? null,
    capability: d.capabilityScore?.value ?? null,
    calendar: activityCalendar(),              // no CORS-readable daily-activity endpoint → exported copy
    meta: { sources: ['tryhackme.com'] },
  };
}

function fromSnapshot(reason) {
  const { asOf, ...stats } = TRYHACKME_SNAPSHOT;
  return {
    ...stats,
    calendar: activityCalendar(),
    meta: { sources: ['profile snapshot'], snapshot: true, asOf, reason },
  };
}

export function createTryHackMeClient(user) {
  return {
    cacheKey: `tryhackme:${user}`,
    load: ({ force } = {}) => cached(`tryhackme:${user}`, TTL, async () => {
      try {
        const res = await fetchJSON(`https://tryhackme.com/api/v2/public-profile?username=${encodeURIComponent(user)}`, { timeout: 10000, source: 'tryhackme.com' });
        return normalize(res);
      } catch (err) {
        const reason = err.status === 429 || err.message.includes('CORS')
          ? 'TryHackMe blocks cross-site requests (bot-protection checkpoint, no CORS), so live stats can’t be read from a browser.'
          : `TryHackMe API unavailable (${err.message}).`;
        // Fall back to the dated snapshot of this user's public profile (clearly labelled in the UI)
        if (TRYHACKME_SNAPSHOT?.profile?.username?.toLowerCase() === user.toLowerCase()) return fromSnapshot(reason);
        throw new ApiError(reason, { status: err.status, source: 'tryhackme.com' });
      }
    }, { force }),
  };
}
