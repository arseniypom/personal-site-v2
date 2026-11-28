'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * Behaviour events for the course landing. Markup opts in via data attributes:
 * - data-section="name" on each section → course_section_viewed (once, when it reaches mid-screen)
 * - data-cta="place" on links/buttons    → course_cta_clicked (+ data-tier/data-price on plan buttons)
 * - <details> inside [data-section="faq"] → course_faq_opened
 * Plus scroll-depth milestones and visible-time milestones.
 */
const SCROLL_STEPS = [25, 50, 75, 90, 100];
const TIME_STEPS = [15, 30, 60, 120, 300];

export default function CourseTracking({ course }: { course: string }) {
  useEffect(() => {
    const start = performance.now();
    const base = () => ({ course, seconds_on_page: Math.round((performance.now() - start) / 1000) });
    const cleanups: Array<() => void> = [];

    // Sections
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = (e.target as HTMLElement).dataset.section!;
          if (!e.isIntersecting || seen.has(name)) continue;
          seen.add(name);
          io.unobserve(e.target);
          posthog.capture('course_section_viewed', {
            ...base(),
            section: name,
            section_index: sections.indexOf(e.target as HTMLElement) + 1,
            sections_total: sections.length,
          });
        }
      },
      // Fires once the section reaches the middle of the screen — works for short and very tall sections alike.
      { threshold: 0, rootMargin: '0px 0px -50% 0px' },
    );
    sections.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // Scroll depth
    let maxPct = 0;
    const reached = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (pct <= maxPct) return;
      maxPct = pct;
      for (const step of SCROLL_STEPS) {
        if (pct >= step && !reached.has(step)) {
          reached.add(step);
          posthog.capture('course_scroll_depth', { ...base(), percent: step });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    // CTA clicks
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-cta]');
      if (!el) return;
      const { cta, tier, price } = el.dataset;
      const props = { ...base(), cta, tier, price, max_scroll_percent: maxPct };
      posthog.capture('course_cta_clicked', props);
      if (tier) posthog.capture('course_checkout_started', props);
    };
    document.addEventListener('click', onClick);
    cleanups.push(() => document.removeEventListener('click', onClick));

    // FAQ (toggle doesn't bubble → capture phase)
    const onToggle = (ev: Event) => {
      const d = ev.target as HTMLDetailsElement;
      if (d.tagName !== 'DETAILS' || !d.open || !d.closest('[data-section="faq"]')) return;
      posthog.capture('course_faq_opened', { ...base(), question: d.querySelector('summary')?.textContent ?? '' });
    };
    document.addEventListener('toggle', onToggle, true);
    cleanups.push(() => document.removeEventListener('toggle', onToggle, true));

    // Time actually spent with the tab visible
    let visibleMs = 0;
    let visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
    let nextStep = 0;
    const tick = () => {
      const now = performance.now();
      const total = visibleMs + (visibleSince !== null ? now - visibleSince : 0);
      while (nextStep < TIME_STEPS.length && total >= TIME_STEPS[nextStep] * 1000) {
        posthog.capture('course_time_on_page', { ...base(), visible_seconds: TIME_STEPS[nextStep], max_scroll_percent: maxPct });
        nextStep++;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') visibleSince = performance.now();
      else if (visibleSince !== null) {
        visibleMs += performance.now() - visibleSince;
        visibleSince = null;
      }
    };
    const timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', onVisibility);
    cleanups.push(() => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [course]);

  return null;
}
