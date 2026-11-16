import type { Metadata, Viewport } from 'next';
import styles from './projects.module.css';

export const metadata: Metadata = {
  title: 'You could build this',
  description: 'Twelve small tools people made with AI for their own work and home, from a replaced $29-a-month subscription to a carb counter for a son.',
  alternates: { canonical: '/ai-beginner-projects' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'You could build this',
    description: 'Twelve small tools people made with AI for their own home and work.',
    url: '/ai-beginner-projects',
  },
};
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

type Tone = 'yellow' | 'purple' | 'orange';

type Project = {
  title: string;
  body: string[];
  tone: Tone;
  image?: { src: string; alt: string; fit: 'cover' | 'contain' };
  /** Shown in the tile when there is no screenshot. */
  stat?: { big: string; small: string };
  tags?: string[];
  quote?: { text: string; by: string };
  link?: { href: string; label: string };
};

const S3 = 'https://substack-post-media.s3.amazonaws.com/public/images/';

const work: Project[] = [
  {
    title: 'A $29-a-month tool, replaced in an hour',
    tone: 'yellow',
    tags: ['Built in 1 hour', 'Minimal coding experience'],
    stat: { big: '1 hour', small: 'instead of $29 a month' },
    body: [
      'Matt Ragland runs a newsletter. The tool he used for calendar invites hit a plan limit and asked for $29 a month. He built his own, and now he and his assistant create as many invites as they need.',
    ],
    quote: { text: 'Y’all, it literally took me an hour to build a replacement tool.', by: 'Matt Ragland' },
    link: { href: 'https://sendinviteto.me', label: 'sendinviteto.me' },
  },
  {
    title: 'A résumé rewritten for each job listing',
    tone: 'purple',
    tags: ['Under an hour', 'Not a programmer'],
    body: [
      'Kan Jones teaches digital literacy and says he is not a programmer. He had an automation that compared a résumé with a job listing and rewrote the résumé and cover letter when the match was good. It helped friends who were job hunting, but only he could run it.',
      'He turned it into a web page with upload buttons that anyone can use.',
    ],
    image: { src: 'https://miro.medium.com/v2/resize:fit:1400/1*wLAxqA7yrkVHm4t3jd_pIA.png', alt: 'Résumé matching web app', fit: 'cover' },
  },
  {
    title: 'Quoting software for one construction business',
    tone: 'orange',
    tags: ['No coding background'],
    stat: { big: '8 hours', small: 'half of them spent learning the tool' },
    body: [
      'A construction estimator needed quoting software that follows his own way of working, with his material calculations and labor estimates. Off-the-shelf options cost $100 to $500 a month and still didn’t fit.',
      'He had no coding background and no developer on staff. Eight hours later he had a working first version.',
    ],
  },
  {
    title: 'Meeting prep that is ready every morning',
    tone: 'purple',
    body: [
      'Marissa Goldberg has a helper that checks her calendar every morning and puts together what she needs to know before each meeting. She shows up prepared.',
    ],
    image: { src: `${S3}684d2aaf-9d45-4a50-817e-e5276673b17c_1200x734.jpeg`, alt: 'Meeting prep summary', fit: 'cover' },
  },
  {
    title: 'Email that arrives on a schedule',
    tone: 'yellow',
    tags: ['Used daily'],
    body: [
      'Ari Klein built a Gmail add-on that holds incoming mail and releases it at the times he sets. Mail from the people and domains on his VIP list comes through right away.',
    ],
    image: { src: `${S3}68d7b391-b68e-409d-bee8-371b17eae1a0_1280x1059.jpeg`, alt: 'Gmail add-on settings', fit: 'contain' },
  },
  {
    title: 'A planner that took an afternoon',
    tone: 'orange',
    tags: ['One afternoon'],
    stat: { big: '4th try', small: 'the first three got abandoned' },
    body: [
      'David Pierce is an editor at The Verge. He says he knows code about as well as he knew Spanish in high school. His first three planners failed: one filled up with features he didn’t want, one he can’t remember the purpose of, and one got too expensive to run.',
      'The fourth is a single screen, styled like a paper planner, with his bookmarks, tasks, notes and calendar from the services he already uses. He calls it the most useful thing he has built.',
    ],
  },
];

const home: Project[] = [
  {
    title: 'A carb counter for his son',
    tone: 'yellow',
    tags: ['Used daily'],
    body: [
      'Morgan Brown’s son has diabetes, so every meal starts with counting carbs. Morgan built an app that does the count faster than charts and a calculator. The family opens it every day.',
    ],
    image: { src: `${S3}d6282e81-3b18-46ca-918c-27036e3e3264_948x1242.png`, alt: 'Carb counting app screen', fit: 'contain' },
    link: { href: 'http://carbscan.ai', label: 'carbscan.ai' },
  },
  {
    title: 'The morning schedule on the whiteboard',
    tone: 'purple',
    tags: ['Built in 2 hours', 'No code written'],
    body: [
      'Mornings in Timm Suess’s family used to run on sticky notes for the bus, school start, swimming and sports. He built a planner that turns it all into a weekly timetable, which he prints and pins to the whiteboard.',
      'Timm says the slow part was describing their morning in plain words. The building went quickly after that.',
    ],
    image: { src: `${S3}b276e391-4315-49b2-ac29-c8ced32c10c0_1673x1077.png`, alt: 'Weekly morning timetable', fit: 'cover' },
    link: { href: 'https://claude.ai/public/artifacts/699b8718-ccf9-413a-8bd8-f1f1303e59b6', label: 'Open the planner' },
  },
  {
    title: 'Who owes whom in the family chat',
    tone: 'yellow',
    tags: ['One weekend', 'First program he shipped'],
    stat: { big: '6 people', small: 'in 4 cities, sharing expenses' },
    body: [
      'Shahid Saleem’s family shares some expenses across four cities. Over a weekend he built a page where everyone logs who paid for what and sees who owes whom. By the next morning four relatives had added six expenses.',
      'Shahid works in IT but had never shipped a program. When the page got the debts wrong, he asked the AI to walk through the math with real numbers, and the bug showed up.',
    ],
  },
  {
    title: 'How many layers to wear today',
    tone: 'orange',
    tags: ['85,000 users'],
    body: [
      'Vijith Quadros lives in Sweden and wanted one answer every morning: how many layers to put on. Weather apps buried it under everything else, so he made a page that says only that.',
      'He checks it daily. Nine months later 85,000 other people were using it too.',
    ],
    image: { src: `${S3}0b593729-f3df-491d-a1d3-ad1f26f6c403_1218x1206.png`, alt: 'Page that says how many layers to wear', fit: 'contain' },
    link: { href: 'https://howmanylayersidag.se/', label: 'howmanylayersidag.se' },
  },
  {
    title: 'A bedtime story made from the day',
    tone: 'purple',
    tags: ['Used every night'],
    body: [
      'Harshitha P. built an app that takes what her child felt during the day and turns it into a personal bedtime story.',
    ],
    image: { src: `${S3}1a234757-3dcf-42ca-ba49-05ef2da2109c_2394x1564.png`, alt: 'Bedtime story app', fit: 'cover' },
    link: { href: 'https://stories-of-life.vercel.app/', label: 'Open the app' },
  },
  {
    title: 'What to pack for school lunch',
    tone: 'orange',
    tags: ['10 minutes', 'Can’t code'],
    stat: { big: '10 minutes', small: 'from idea to a working app' },
    body: [
      'Kevin Roose writes about technology for The New York Times and can’t code. He asked for an app that looks at a photo of his fridge and suggests what to pack for his son’s lunch. About ten minutes later it worked.',
      'He went on to build a podcast summarizer, a search for his own bookmarks and a site that checks whether furniture fits in his trunk.',
    ],
  },
];

const extras = [
  'Rob Balderstone built a randomizer for the speaking order at standup. He uses it at work every day.',
  'Olena Vozna built a browser extension that drops her free slots into an email and books the meeting.',
  'Javier Evelyn, a new dad, spent two weekends on a log for feedings, sleep and diapers.',
  'Faraz Khan built a workout app around his own training program. He says nobody else would want it, and he loves it.',
  'There are 102 steps up to Brett’s house. His app records which one the courier left the package on.',
];

function Card({ project, index }: { project: Project; index: number }) {
  const { image, stat, quote, link, tags } = project;
  return (
    <article className={styles.card}>
      <div className={`${styles.media} ${styles[project.tone]}`}>
        <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={image.fit === 'cover' ? styles.shotCover : styles.shotContain}
            src={image.src}
            alt={image.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : stat ? (
          <div className={styles.stat}>
            <span className={styles.statBig}>{stat.big}</span>
            <span className={styles.statSmall}>{stat.small}</span>
          </div>
        ) : null}
      </div>
      <div className={styles.text}>
        <h3>{project.title}</h3>
        {tags && (
          <ul className={styles.tags}>
            {tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        )}
        {project.body.map((p) => <p key={p}>{p}</p>)}
        {quote && (
          <blockquote className={styles.quote}>
            <p>“{quote.text}”</p>
            <cite>{quote.by}</cite>
          </blockquote>
        )}
        {link && (
          <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function BeginnerProjectsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <span>Arsenii</span>, Software Engineer
        </a>
      </header>

      <main>
        <h1 className={styles.title}>
          You could <span>build this</span>
        </h1>
        <p className={styles.lead}>
          Twelve small tools people made with AI for their own home and work. Several of them had never written code.
        </p>

        <h2 className={styles.section}>For home and fun</h2>
        <div className={styles.grid}>
          {home.map((project, i) => <Card key={project.title} project={project} index={i} />)}
        </div>

        <h2 className={styles.section}>For work</h2>
        <div className={styles.grid}>
          {work.map((project, i) => <Card key={project.title} project={project} index={home.length + i} />)}
        </div>

        <section className={styles.extras}>
          <div className={styles.extrasText}>
            <h2>A few more</h2>
            <ul>
              {extras.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.extrasShot}
            src="https://platform.theverge.com/wp-content/uploads/sites/2/2026/05/Brett-R-stairs-app.jpg"
            alt="App that shows which step a package was left on"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </section>

        <section className={styles.closing}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <h2>What would you build?</h2>
          <p>
            Most of these started with something small and annoying, like a subscription that asked for more
            money or a week of mornings kept on sticky notes. The first version usually took an evening or a
            weekend.
          </p>
          <p>
            Is there a task you repeat every week? A tool you pay for and use one feature of? Either one is a
            good first project.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>Made by me &copy;2026</div>
        <a href="/">pomazkov.com</a>
      </footer>
    </div>
  );
}
