// One stable client per platform, shared by the card and the dashboard (same cache + request).
import { createGitHubClient } from './api/github';
import { createLeetCodeClient } from './api/leetcode';
import { createTryHackMeClient } from './api/tryhackme';

export const HANDLES = {
  github: 'shubh4m03',
  leetcode: 'shubh4m0304',
  tryhackme: 'shubh4m03',
};

export const githubClient = createGitHubClient(HANDLES.github);
export const leetcodeClient = createLeetCodeClient(HANDLES.leetcode);
export const tryhackmeClient = createTryHackMeClient(HANDLES.tryhackme);
