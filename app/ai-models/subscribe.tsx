'use client';

import { useState, type FormEvent } from 'react';
import styles from './models.module.css';

// Kit form «AI models tier list» (app.kit.com/forms/designers/10235797).
// Double opt-in: after confirming, Kit redirects to /claude-at-100 and the
// «Welcome new subscribers» automation sends the welcome email.
const KIT_FORM_URL = 'https://app.kit.com/forms/10235797/subscriptions';

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function Subscribe() {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // Kit keeps the referrer on the subscriber, so UTM tags from bio/post links show up there.
    data.append('referrer', window.location.href);
    setStatus('sending');
    try {
      const res = await fetch(KIT_FORM_URL, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== 'success') throw new Error('Kit error');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className={styles.subscribe} aria-labelledby="subscribe-title">
      <p className={styles.subscribeEyebrow}>Free guide</p>
      <h2 id="subscribe-title" className={styles.subscribeTitle}>You picked a model, now here’s how to get 100% out of it</h2>
      <p className={styles.subscribeText}>
        <strong>Claude at 100%</strong> is the setup, prompts and workflows I use every day at work. Leave your email and I’ll send it over.
      </p>
      {status === 'done' ? (
        <p className={styles.subscribeDone} role="status">Almost there. Check your inbox and confirm your email to get the guide.</p>
      ) : (
        <form className={styles.subscribeForm} onSubmit={onSubmit}>
          <label htmlFor="subscribe-email" className={styles.srOnly}>Email</label>
          <input id="subscribe-email" name="email_address" type="email" required autoComplete="email" placeholder="you@email.com" />
          <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send me the guide'}</button>
        </form>
      )}
      {status === 'error' && <p className={styles.subscribeError} role="alert">Something went wrong. Try again in a minute.</p>}
      <p className={styles.subscribeNote}>Plus my emails on using AI at work. Unsubscribe anytime.</p>
    </section>
  );
}
