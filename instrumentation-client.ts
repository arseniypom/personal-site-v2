import posthog from 'posthog-js';

// Project token is write-only and meant for the browser, so it lives in code (no Vercel env needed).
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_oBNm67uQXiweRusKfka7XrKN6r73P2JPDxaqsH7b6aR8';

posthog.init(POSTHOG_KEY, {
  // Proxied through next.config rewrites so ad blockers don't drop events.
  api_host: '/ingest',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-08-30',
  // Pageviews on client navigation, $pageleave with max scroll %, autocapture of clicks.
  capture_pageview: 'history_change',
  capture_pageleave: true,
  autocapture: true,
  // Heatmaps + scrollmaps in the toolbar.
  enable_heatmaps: true,
  // Anonymous visitors stay cheap; nobody is identified on this site.
  person_profiles: 'identified_only',
  session_recording: {
    maskAllInputs: true,
  },
});

// PostHog's $referrer is the session's entry referrer (e.g. instagram), not the previous page on this site.
// Internal links are full page loads, so document.referrer tells which page sent the visitor here.
function previousPage(): string {
  if (!document.referrer) return '$direct';
  try {
    const ref = new URL(document.referrer);
    return ref.origin === location.origin ? ref.pathname : ref.hostname;
  } catch {
    return '$direct';
  }
}

// Tag local traffic so it's easy to filter out in PostHog; set previous_page on every load so it never goes stale.
posthog.register({ env: process.env.NODE_ENV, previous_page: previousPage() });
