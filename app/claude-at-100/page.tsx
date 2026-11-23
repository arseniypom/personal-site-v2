import type { CSSProperties } from 'react';
import type { Metadata, Viewport } from 'next';
import CopyPrompt from './CopyPrompt';
import styles from './guide.module.css';

export const metadata: Metadata = {
  title: 'Claude at 100%',
  description: '8 Claude features worth setting up, with where to turn each one on and a prompt to copy.',
  alternates: { canonical: '/claude-at-100' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Claude at 100%',
    description: '8 Claude features worth setting up, with a prompt to copy for each one.',
    url: '/claude-at-100',
  },
};
export const viewport: Viewport = { themeColor: '#0f0b0d', colorScheme: 'dark' };

type Path = {
  /** Small label before the path, e.g. "Cowork". */
  label?: string;
  steps: string[];
};

type Feature = {
  id: string;
  name: string;
  /** One sentence: why you need it. */
  subtitle: string;
  intro: string[];
  plan: string;
  paths: Path[];
  /** What to prepare before running the prompt. */
  tryNote?: string;
  prompt: string;
  after?: string[];
};

const features: Feature[] = [
  {
    id: 'instructions',
    name: 'Instructions',
    subtitle: 'Claude knows your role and how you like answers in every chat.',
    intro: [
      'A short note about you that Claude reads before every chat, like “I work in marketing, keep it short and straight to the point”.',
    ],
    plan: 'All plans',
    paths: [
      {
        steps: ['Your initials, bottom left', 'Settings', 'Your Claude', 'Instructions'],
      },
    ],
    prompt:
      'Ask me questions so you can write my Claude instructions. One question at a time, 8 at most. Ask what I do, who I work with, how I like answers to look, words I never use, and when I want you to disagree with me.\nThen write the instructions in under 150 words so I can paste them into Settings.',
    after: ['Only add things that are true in every chat. Anything about one area of work goes in a project.'],
  },
  {
    id: 'projects',
    name: 'Projects',
    subtitle: 'Upload your files once and use them in every chat about that work.',
    intro: [
      'A space with its own files and instructions. Make one per area of your work: a client, a product launch, your job search, your newsletter.',
    ],
    plan: 'All plans · up to 5 on Free',
    paths: [{ steps: ['Projects in the sidebar', '+ New Project', '+ to add files', 'Set project instructions'] }],
    tryNote: 'In a new project, after you upload [the brief and a few examples of past work]:',
    prompt:
      'Read all the files in this project. Then write instructions for this project: what it’s for, who it’s for, the facts you must never get wrong (names, dates, numbers) and the tone to use.\nKeep it under 200 words. List anything you need from me that you couldn’t find.',
    after: [
      'Facts about one area go in a project. How you do a type of work, like writing reports, goes in a skill (#7).',
    ],
  },
  {
    id: 'memory',
    name: 'Memory',
    subtitle: 'Claude remembers what you told it in earlier chats.',
    intro: [
      'It saves what it learns about you and your work, and uses it in new chats. On paid plans you can also ask it to search old chats: “What did we decide about the launch plan?”',
    ],
    plan: 'On by default · Free, Pro, Max, Ultra',
    paths: [
      {
        steps: ['Settings', 'Your Claude', 'Generate memory from chats'],
      },
    ],
    prompt:
      'What do you remember about me and my work? Give me a list. Mark anything that looks old or wrong so I can fix it.',
    after: [
      'When something changes, tell it: “Remember this: the deadline moved to March 3.” For a chat you don’t want remembered, click the ghost icon at the top right.',
    ],
  },
  {
    id: 'connectors',
    name: 'Connectors',
    subtitle: 'Ask questions about your email, meetings and documents.',
    intro: [
      'Let Claude read your Gmail, Calendar and Drive. Slack, Notion and many other apps work the same way.',
    ],
    plan: 'All plans for Google apps',
    paths: [
      {
        steps: ['+ in the message box', 'Connectors', 'Switch on and sign in'],
      },
    ],
    prompt:
      'Look at my calendar for next week and my emails from the last 7 days.\nTell me which meetings I’m not ready for and what I need for them, which emails still need a reply from me, and any deadlines I might have missed.\nDon’t send or change anything.',
  },
  {
    id: 'research',
    name: 'Research',
    subtitle: 'Get a detailed report with sources on any question.',
    intro: [
      'Claude runs many searches, reads the sources and writes a report with links. It takes longer than a normal answer. I use it to compare tools, look into competitors and learn a new topic quickly.',
    ],
    plan: 'Paid plans',
    paths: [{ steps: ['Turn on web search', '+ in the message box', 'Research'] }],
    prompt:
      'Research [3 tools for taking meeting notes / 3 competitors of my company]. For each one, tell me what it does, how much it costs, who it’s for, and what people complain about. Use reviews and Reddit, and add links.\nPut it in a table at the end. Then tell me which one fits [my situation in one line] and why.\nMark anything you found in only one source.',
  },
  {
    id: 'files',
    name: 'Files and artifacts',
    subtitle: 'Ask for a spreadsheet or a deck and get a file you can open.',
    intro: [
      'Claude makes real Excel, Word, PowerPoint and PDF files. It also makes artifacts: documents, dashboards or small tools that open next to the chat. You can edit and share them.',
    ],
    plan: 'All plans',
    paths: [
      {
        steps: ['Settings', 'Capabilities', 'Code execution and file creation'],
      },
    ],
    tryNote: 'Attach [any spreadsheet export, like last quarter’s numbers]:',
    prompt:
      'Turn this into an Excel file with 3 tabs: the clean data, a summary with working formulas, and one chart of the main trend.\nThen give me 5 short points on what changed and why, and tell me which numbers I should check myself.',
  },
  {
    id: 'skills',
    name: 'Skills',
    subtitle: 'Show Claude how you do a task once, and it does it your way every time.',
    intro: [
      'A skill is a saved set of steps for one type of work, like “how I write status updates”. Claude uses it when your request matches, so you don’t have to repeat corrections like “shorter” or “sign it Arsenii”.',
    ],
    plan: 'All plans, including Free',
    paths: [
      {
        steps: ['Customize', 'Skills'],
      },
    ],
    tryNote: 'At the end of a chat where you corrected Claude a few times:',
    prompt:
      'Look back at this chat. Each time I corrected you, that was a rule for how I want this work done.\nTurn those rules into a skill called [how-i-write-status-updates]: when to use it, the steps, and what to never do.\nShow it to me before you save it. Point out any rule you added that I didn’t say.',
    after: [
      'Read it before you save it. Claude sometimes turns one example into a rule for everything.',
    ],
  },
  {
    id: 'cowork',
    name: 'Cowork and scheduled tasks',
    subtitle: 'Claude does whole tasks for you, including ones that repeat every week.',
    intro: [
      'Give Claude a whole task, like “go through this week’s emails and draft replies to the ones that need an answer”. It plans the steps, uses your files, apps and browser, and keeps working in the cloud after you close your laptop.',
      'A scheduled task does the same on a timer, like “every Monday at 9am, write me a short brief for each meeting this week”.',
    ],
    plan: 'Paid plans',
    paths: [
      {
        label: 'Cowork',
        steps: ['Message box', 'Cowork', 'Describe the task'],
      },
      {
        label: 'Scheduled',
        steps: ['Scheduled in the sidebar', 'New task', 'Create with Claude'],
      },
    ],
    tryNote: 'Connect Gmail and Calendar first (#4):',
    prompt:
      'Create a scheduled task for every Friday at [4pm].\nIt looks at my sent emails and my calendar for this week and writes a short summary: what I finished, what’s still open, and who’s waiting for me.\nDon’t send anything. Run it once now so I can see what it looks like.',

    after: [
      'No Cowork option in your message box? You have the newer Claude: give the task in any chat and say how often it should run.',
    ],
  },
];

/** Quick wins for the Start here row: all work on the free plan. */
const startHere = ['instructions', 'projects', 'connectors', 'skills'];

/** One colour per feature, from the site's extra palette. Used for the number in the title and in the contents. */
const tones = ['#ffd94d', '#a78bfa', '#ff9a3d', '#5eead4', '#f472b6', '#93c5fd', '#bef264', '#fca5a5'];

/** Settings path as one quiet line: Settings › Your Claude › Instructions */
function PathLine({ steps }: { steps: string[] }) {
  return (
    <span className={styles.pathLine}>
      {steps.map((s, i) => (
        <span key={s}>
          {i > 0 && <span className={styles.sep} aria-hidden="true"> › </span>}
          {s}
        </span>
      ))}
    </span>
  );
}

/** Where to turn it on. Collapsed by default so the prompt stays the main thing. */
function TurnOn({ title = 'Turn it on', plan, paths }: { title?: string; plan?: string; paths: Path[] }) {
  return (
    <details className={styles.turnOn}>
      <summary>
        <span className={styles.turnOnTitle}>{title}</span>
        {plan && <span className={styles.plan}>{plan}</span>}
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <ul className={styles.paths}>
        {paths.map((p) => (
          <li key={p.steps.join()}>
            {p.label && <span className={styles.pathLabel}>{p.label}: </span>}
            <PathLine steps={p.steps} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith('[') ? <mark key={i}>{part.slice(1, -1)}</mark> : part,
      )}
    </>
  );
}

function FeatureBlock({ f, index }: { f: Feature; index: number }) {
  return (
    <section id={f.id} className={styles.feature} style={{ '--tone': tones[index] } as CSSProperties}>
      <header className={styles.featureHead}>
        <h2>
          <span className={styles.number}>{index + 1}.</span> {f.name}
        </h2>
        <p className={styles.subtitle}>{f.subtitle}</p>
      </header>

      <div className={styles.featureBody}>
        {f.intro.map((p) => <p key={p}>{p}</p>)}

        <div className={styles.actions}>
          <CopyPrompt text={f.prompt} note={f.tryNote ? <Highlight text={f.tryNote} /> : undefined} />
          <TurnOn plan={f.plan} paths={f.paths} />
        </div>

        {f.after && (
          <div className={styles.tip}>
            <p className={styles.tipTitle}>Tip</p>
            {f.after.map((p) => <p key={p}>{p}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ClaudeAt100Page() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <span>Arsenii</span>, Software Engineer
        </a>
      </header>

      <main>
        <h1 className={styles.title}>
          Claude at <span>100%</span>
        </h1>
        <p className={styles.lead}>
          8 Claude features worth setting up. For each one: where to turn it on and a prompt to copy.
        </p>

        <p className={styles.startHint}>
          <span>Short on time?</span> Start with the highlighted four.
        </p>
        <nav className={styles.toc} aria-label="Contents">
          {features.map((f, i) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className={startHere.includes(f.id) ? styles.start : undefined}
              style={{ '--tone': tones[i] } as CSSProperties}
            >
              <span>{i + 1}</span> {f.name}
            </a>
          ))}
        </nav>

        <div className={styles.features}>
          {features.map((f, i) => <FeatureBlock key={f.id} f={f} index={i} />)}
        </div>

        <section className={styles.closing}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <h2>Want to go further? I’m making two full courses.</h2>
          <p>Join the waitlist to get the early price.</p>
          <div className={styles.ctaRow}>
            <a className={styles.cta} href="/links/claude-7-days">Master Claude in 7 Days</a>
            <a className={styles.cta} href="/links/video-editing">Edit Videos with Claude</a>
          </div>
        </section>

      </main>

      <footer className={styles.footer}>
        <div>Made by me &copy;2026</div>
        <a href="/">pomazkov.com</a>
      </footer>
    </div>
  );
}
