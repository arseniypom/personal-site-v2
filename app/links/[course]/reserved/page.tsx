import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { courses, getCourse, LAUNCH_BY } from '../../courses';
import { START_DATE } from '../../claude-7-days';
import styles from '../course.module.css';
import light from '../landing.module.css';

// Stripe Payment Link redirects here after payment (?session_id=cs_…).
// Static page: nothing is verified server-side, payments are counted in Stripe.
export const dynamicParams = false;
export const generateStaticParams = () => courses.map((c) => ({ course: c.slug }));

type Props = { params: Promise<{ course: string }> };

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const c = getCourse((await params).course);
  return c?.landing
    ? { themeColor: '#fbf7f1', colorScheme: 'light' }
    : { themeColor: '#0f0b0d', colorScheme: 'dark' };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCourse((await params).course);
  return c
    ? { title: `${c.landing ? 'You’re in' : 'Spot reserved'} · ${c.title}`, robots: { index: false, follow: false } }
    : {};
}

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export default async function ReservedPage({ params }: Props) {
  const c = getCourse((await params).course);
  if (!c) notFound();

  // Courses with the full landing use its light theme here too.
  if (c.landing) {
    return (
      <div className={light.page}>
        <main className={`${light.main} ${light.doneMain}`}>
          <section className={`${light.card} ${light.done}`}>
            <div className={light.doneIcon}>
              <CheckIcon />
            </div>
            <p className={light.doneCourse}>{c.title}</p>
            <h1 className={light.h2big}>You’re in</h1>
            <p className={light.text}>
              Payment received. On {START_DATE} you’ll get an email with access to the course.
            </p>
            <a className={`${light.cta} ${light.doneBack}`} href="/links">
              Back to links
            </a>
          </section>
        </main>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <header className={`${styles.hero} ${styles[c.tone]}`}>
        <h1 className={styles.title}>{c.title}</h1>
      </header>

      <section className={`${styles.card} ${styles.done}`}>
        <div className={styles.doneIcon}>
          <CheckIcon />
        </div>
        <h2 className={styles.h2}>Your spot is reserved</h2>
        <p className={styles.text}>
          The {c.price} founding price is yours. When the course launches, you’ll get an email with a link to pay
          the rest. If it’s not out by {LAUNCH_BY}, you get your $1 back.
        </p>
        <a className={styles.secondary} href="/links">
          Back to links
        </a>
      </section>
    </main>
  );
}
