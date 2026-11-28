import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { courses, getCourse, LAUNCH_BY } from '../../courses';
import { START_DATE } from '../../claude-7-days';
import styles from '../course.module.css';

// Stripe Payment Link redirects here after a paid $1 spot (?session_id=cs_…).
// Static page: nothing is verified server-side, payments are counted in Stripe.
export const dynamicParams = false;
export const generateStaticParams = () => courses.map((c) => ({ course: c.slug }));
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

type Props = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCourse((await params).course);
  return c
    ? { title: `${c.landing ? 'You’re in' : 'Spot reserved'} · ${c.title}`, robots: { index: false, follow: false } }
    : {};
}

export default async function ReservedPage({ params }: Props) {
  const c = getCourse((await params).course);
  if (!c) notFound();

  return (
    <main className={styles.page}>
      <header className={`${styles.hero} ${styles[c.tone]}`}>
        <h1 className={styles.title}>{c.title}</h1>
      </header>

      <section className={`${styles.card} ${styles.done}`}>
        <div className={styles.doneIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 className={styles.h2}>{c.landing ? 'You’re in' : 'Your spot is reserved'}</h2>
        {c.landing ? (
          <p className={styles.text}>
            Payment received. On {START_DATE} you’ll get an email with access to the course.
          </p>
        ) : (
        <p className={styles.text}>
          The {c.price} founding price is yours. When the course launches, you’ll get an email with a link to pay
          the rest. If it’s not out by {LAUNCH_BY}, you get your $1 back.
        </p>
        )}
        <a className={styles.secondary} href="/links">
          Back to links
        </a>
      </section>
    </main>
  );
}
