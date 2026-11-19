import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { courses, getCourse, TALLY_FORM_ID } from '../courses';
import styles from './course.module.css';

export const dynamicParams = false;
export const generateStaticParams = () => courses.map((c) => ({ course: c.slug }));
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

type Props = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCourse((await params).course);
  return c ? { title: c.title, description: c.subtitle, robots: { index: false, follow: false } } : {};
}

export default async function CoursePage({ params }: Props) {
  const c = getCourse((await params).course);
  if (!c) notFound();

  const tallySrc = `https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&course=${c.slug}`;

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

      {c.forYou && (
        <section className={styles.card}>
          <h2 className={styles.h2}>This is for you if</h2>
          <p className={styles.text}>{c.forYou}</p>
        </section>
      )}

      <section className={`${styles.card} ${styles.join}`}>
        <div className={styles.price}>
          <span className={styles.priceBig}>{c.price}</span>
          <span className={styles.priceSmall}>Founding price · goes up after launch</span>
        </div>
        <h2 className={styles.h2}>Join the waitlist</h2>
        <p className={styles.text}>Not launched yet. Leave your email and you’ll be first to know.</p>
        {TALLY_FORM_ID ? (
          <>
            <iframe data-tally-src={tallySrc} loading="lazy" width="100%" height="160" title="Waitlist" className={styles.form} />
            <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
          </>
        ) : (
          <div className={styles.placeholder}>Tally form goes here</div>
        )}
      </section>
    </main>
  );
}
