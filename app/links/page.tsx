import type { Metadata, Viewport } from 'next';
import styles from './links.module.css';
import { courses } from './courses';

// Course order is shuffled per request so button position doesn't skew the fake-door test.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Arsenii · Links',
  description: 'Big Tech engineer. Your shortcut to using AI like a pro.',
  alternates: { canonical: '/links' },
};
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

type Tone = 'newsletter' | 'blue';

type LinkItem = {
  title: string;
  sub: string;
  href: string;
  tone: Tone;
  icon: React.ReactNode;
};

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

// Newsletter goes first (main goal of the funnel), then the course fake doors, then the rest.
const newsletter: LinkItem = {
  title: 'My no-slop newsletter',
  sub: 'Weekly pro AI workflows, click by click',
  href: 'https://askarsenii.kit.com/',
  tone: 'newsletter',
  icon: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </svg>
  ),
};

const links: LinkItem[] = [
  {
    title: '1:1 session with me',
    sub: 'Bring an unclear problem → leave with a plan and AI workflows',
    href: 'https://tally.so/r/PR17EV',
    tone: 'blue',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="6" width="13" height="12" rx="3" />
        <path d="m16 10.5 5-3v9l-5-3" />
      </svg>
    ),
  },
];

const renderLink = (l: LinkItem) => (
  <li key={l.href}>
    <a className={styles.link} href={l.href} target="_blank" rel="noopener noreferrer">
      <span className={`${styles.icon} ${styles[l.tone]}`}>{l.icon}</span>
      <span className={styles.text}>
        <span className={styles.title}>{l.title}</span>
        <span className={styles.sub}>{l.sub}</span>
      </span>
      <svg className={styles.arrow} {...iconProps} width={18} height={18}>
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </a>
  </li>
);

export default function LinksPage() {
  const ordered = Math.random() < 0.5 ? courses : [...courses].reverse();
  return (
    <main className={styles.page}>
      <header className={styles.profile}>
        <div className={styles.avatar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/portrait.png" alt="Arsenii" />
        </div>
        <h1 className={styles.name}>Arsenii Pomazkov</h1>
        <p className={styles.handle}>@ask.arsenii</p>
        <p className={styles.bio}>Big Tech engineer. Your shortcut to using AI like a pro</p>
      </header>

      <ul className={styles.list}>
        {ordered.map((c) => (
          <li key={c.slug}>
            <a className={`${styles.link} ${styles.course} ${styles[c.tone]}`} href={`/links/${c.slug}`}>
              <span className={styles.text}>
                <span className={styles.title}>{c.title}</span>
                <span className={styles.courseSub}>{c.buttonSub}</span>
              </span>
              <svg className={styles.arrow} {...iconProps} width={18} height={18}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </li>
        ))}
        {[newsletter, ...links].map(renderLink)}
      </ul>
    </main>
  );
}
