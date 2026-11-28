import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { courses, getCourse, LAUNCH_BY } from '../courses';
import styles from './course.module.css';
import CourseLanding from './CourseLanding';

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
  return c ? { title: c.title, description: c.subtitle, robots: { index: false, follow: false } } : {};
}

export default async function CoursePage({ params }: Props) {
  const c = getCourse((await params).course);
  if (!c) notFound();
  if (c.landing) return <CourseLanding course={c} l={c.landing} />;

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/links" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </a>

      <header className={`${styles.hero} ${styles[c.tone]}`}>
        <h1 className={styles.title}>{c.title}</h1>
        <p className={styles.subtitle}>{c.subtitle}</p>
      </header>

      {c.forYou && (
        <section className={`${styles.card} ${styles.forYou}`}>
          <h2 className={styles.h2}>This is for you if</h2>
          <ul className={styles.forYouList}>
            {c.forYou.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.h2}>{c.listTitle}</h2>
        <ul className={styles.list}>
          {c.items.map((it) => (
            <li key={it.lead}>
              {it.rest ? (
                <>
                  <b>{it.lead}</b>: {it.rest}
                </>
              ) : (
                <span className={styles.plain}>{it.lead}</span>
              )}
            </li>
          ))}
        </ul>
        {c.extra && <p className={styles.extra}>{c.extra}</p>}
      </section>

      <section className={`${styles.card} ${styles.join}`}>
        <div className={styles.price}>
          <span className={styles.priceBig}>{c.price}</span>
          <span className={styles.priceSmall}>Founding price · goes up after launch</span>
        </div>
        <h2 className={styles.h2}>Reserve your spot for $1</h2>
        <ul className={styles.terms}>
          <li>$1 today locks the {c.price} founding price</li>
          <li>Pay the rest only when the course launches. Nothing is charged automatically</li>
          <li>Not out by {LAUNCH_BY}? You get your $1 back</li>
        </ul>
        <a className={styles.cta} href={c.checkoutUrl}>
          Reserve for $1
        </a>
        <p className={styles.secure}>Secure checkout by Stripe</p>
      </section>
    </main>
  );
}
